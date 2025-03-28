import { promises as fs } from 'fs';
import path from 'path';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote } from 'next-mdx-remote/rsc';
import matter from 'gray-matter';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MDXComponents } from 'mdx/types';

// Import necessary components
import BlogPostWithAlignedSidePanel from '@/app/components/BlogPostWithAlignedSidePanel';
import { DefinitionData } from '@/app/components/SidePanelDefinition';

interface BlogPostPageProps {
  params: {
    slug: string;
    lang: 'en' | 'pl';
  };
}

// Type for the definitions structure expected in frontmatter
interface PostDefinitionMap {
  [id: string]: {
    term: string;
    definition: string;
    source?: string;
  };
}

// --- Server-Side Data Fetching ---
async function getPostData(lang: 'en' | 'pl', slug: string): Promise<{ source: any; metadata: any; postDefinitions: DefinitionData[] } | null> {
  const postsDirectory = path.join(process.cwd(), 'content/posts');
  const filePath = path.join(postsDirectory, `${slug}.${lang}.mdx`);
  console.log(`[getPostData] Attempting to load post: ${filePath}`);

  try {
    // Ensure directory exists (simplified check)
    try { await fs.access(postsDirectory); } catch { return null; } // Assume dir exists or fail silently

    // Read file
    let fileContents;
    try { fileContents = await fs.readFile(filePath, 'utf8'); } catch (error: any) {
        if (error.code === 'ENOENT') { console.error(`[getPostData] Post file not found: ${filePath}`); return null; }
        console.error(`[getPostData] Error reading file ${filePath}:`, error); throw error;
    }

    // Parse frontmatter
    const { content, data: frontmatter } = matter(fileContents);

    // Validate frontmatter
    if (!frontmatter.title || !frontmatter.date) { console.warn(`[getPostData] Post ${filePath} missing 'title' or 'date'.`); }
    if (process.env.NODE_ENV === 'production' && frontmatter.published !== true) {
        console.log(`[getPostData] Post ${filePath} is not published. Skipping in production.`);
        return null;
    }

    // --- Extract Definitions from Frontmatter ---
    const postDefinitions: DefinitionData[] = [];
    const frontmatterDefs = frontmatter.definitions as PostDefinitionMap | undefined;
    if (frontmatterDefs && typeof frontmatterDefs === 'object') {
        Object.entries(frontmatterDefs).forEach(([id, data]) => {
            if (id && data.definition && data.term) {
                postDefinitions.push({
                    id: id,
                    term: data.term,
                    definition: data.definition,
                    source: data.source,
                });
            } else {
                console.warn(`[getPostData] Invalid definition entry for ID "${id}" in ${filePath}`);
            }
        });
    }
    // --- End Definition Extraction ---

    let mdxSource;
    // Serialize MDX (Simpler: No custom remark plugin needed here)
    try {
      mdxSource = await serialize(content, {
        mdxOptions: {
          format: 'mdx',
          development: process.env.NODE_ENV === 'development',
        },
        parseFrontmatter: false,
      });
      console.log(`[getPostData] Successfully serialized MDX for ${filePath}. Found ${postDefinitions.length} definitions in frontmatter.`);
    } catch (error: any) {
      // Keep the detailed error logging for syntax errors in MDX content
      console.error(`\n❌❌❌ [getPostData] MDX Compilation Error in ${filePath} ❌❌❌`);
      console.error("Error Type:", error.name);
      console.error("Reason:", error.reason || error.message);
      if (error.position?.start?.line) {
        const { line, column } = error.position.start;
        console.error("Location:", `Line ${line}, Column ${column}`);
        const lines = content.split('\n');
        const startLine = Math.max(0, line - 3); const endLine = Math.min(lines.length, line + 2);
        console.error('\n--- Code Snippet Around Error ---');
        lines.slice(startLine, endLine).forEach((l, i) => {
            const currentLine = startLine + i + 1; const prefix = currentLine === line ? `>> ${currentLine}: ` : `   ${currentLine}: `;
            console.error(prefix + l);
            if(currentLine === line && column) { console.error(' '.repeat(prefix.length + column - 1) + '^'); }
        });
        console.error('--- End Snippet ---');
      } else { console.error('\n--- Full Failing MDX Content ---', content, '--- End Content ---'); }
      console.error('-----------------------------------\n');
      throw new Error(`Failed to compile MDX for post "${slug}.${lang}". Check server console. Original: ${error.message}`);
    }

    return {
      source: mdxSource,
      metadata: frontmatter,
      postDefinitions,
    };

  } catch (error: any) {
    console.error(`[getPostData] Unexpected error processing post ${lang}/${slug}:`, error);
    throw error; // Re-throw
  }
}

// --- Generate Metadata ---
export async function generateMetadata({ params }: BlogPostPageProps): Promise<{ title: string, description?: string }> {
    try {
        const postData = await getPostData(params.lang, params.slug);
        if (!postData?.metadata) return { title: 'Post Not Found' };
        return {
            title: postData.metadata.title || 'Untitled Post',
            description: postData.metadata.excerpt || `Blog post about ${postData.metadata.title || 'a topic'}.`,
        };
    } catch (error) {
         console.error(`[generateMetadata] Error for ${params.lang}/${params.slug}:`, error);
         return { title: 'Error Loading Post' };
    }
}

// --- MDX Components ---
const components: MDXComponents = {
  // Use basic span styling for definition markers
  span: (props: any) => {
    if (props['data-def-id']) {
      return (
        <span
          {...props}
          className="term-anchor text-blue-600 dark:text-blue-400 border-b border-dotted border-blue-500 hover:border-solid hover:border-blue-600 dark:hover:border-blue-400 cursor-pointer transition-colors duration-150"
        />
      );
    }
    return <span {...props} />;
  },
  // Basic styling for default elements
  h1: (props) => <h1 className="text-3xl lg:text-4xl font-bold mt-8 mb-4" {...props} />,
  h2: (props) => <h2 className="text-2xl lg:text-3xl font-bold mt-6 mb-3" {...props} />,
  p: (props) => <p className="mb-4 leading-relaxed" {...props} />,
  a: (props) => <a className="text-blue-600 dark:text-blue-400 hover:underline" {...props} />,
  ul: (props) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
  li: (props) => <li className="mb-1" {...props} />,
  code: (props) => <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono" {...props} />,
  pre: (props) => <pre className="p-4 bg-slate-100 dark:bg-slate-800 rounded overflow-x-auto text-sm mb-4" {...props} />,
};

// --- The Page Component ---
export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { lang, slug } = params;

  try {
    // Get post data (no definitions extracted here)
    const postData = await getPostData(lang, slug);

    if (!postData) {
      console.log(`[Page] Post data not found or post unpublished for ${lang}/${slug}. Triggering 404.`);
      notFound();
    }

    const { source, metadata, postDefinitions } = postData;

    if (!metadata || !source) { notFound(); }

    // Format date safely
    let formattedDate = 'Date unavailable';
    try {
        formattedDate = new Date(metadata.date).toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-US', {
            year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
        });
    } catch (e) { console.error(`[Page] Invalid date format for ${lang}/${slug}: ${metadata.date}`); }

    // BlogPostWithAlignedSidePanel will use the definitions extracted from frontmatter
    return (
      <BlogPostWithAlignedSidePanel
        title={metadata.title || 'Untitled Post'}
        date={formattedDate}
        lang={lang}
        mainContent={
          <MDXRemote
            source={source}
            components={components}
          />
        }
        definitions={postDefinitions}
      />
    );
  } catch (error: any) {
      console.error(`❌ [Page] Error rendering page ${lang}/${slug}:`, error);
       return ( // Render user-friendly error page
           <div className="text-center py-20 px-4 max-w-2xl mx-auto">
               <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-4">Error Loading Post</h1>
               <Link href={`/${lang}/blog`} className="mt-8 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                  Back to Blog List
               </Link>
           </div>
       );
  }
} 