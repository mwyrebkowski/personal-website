// REMOVED 'use client'; - This is now a Server Component

import { promises as fs } from 'fs';
import path from 'path';
import { serialize } from 'next-mdx-remote/serialize';
// Keep MDXRemoteSerializeResult type if needed, but MDXRemote itself isn't used directly here anymore
import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import matter from 'gray-matter';
import { notFound } from 'next/navigation';
import Link from 'next/link';
// REMOVED React and client-side hooks imports
// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// REMOVED MDXComponents type import if not used directly
// import { MDXComponents } from 'mdx/types';

// Import the new Client Component
import BlogPostClientView from '@/app/components/BlogPostClientView';
// REMOVED direct imports of Term, Marginalia, MarginaliaSidePanel, BlogPostWithAlignedSidePanel
// These are now handled within BlogPostClientView

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

// --- Server-Side Data Fetching (Remains largely the same, fetches data for the client component) ---
// Return type now includes the raw content for client-side processing if needed,
// but we'll primarily rely on component injection via MDXRemote props.
// The source is now MDXRemoteSerializeResult<Record<string, unknown>, Record<string, unknown>>
async function getPostData(lang: 'en' | 'pl', slug: string): Promise<{ source: MDXRemoteSerializeResult; metadata: any } | null> {
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

    // --- REMOVED Frontmatter Definition Extraction ---

    let mdxSource;
    // Serialize MDX - Pass our custom components so MDXRemote knows about them
    // Although we override them later in the client component, serializing with them
    // might help catch certain errors earlier.
    try {
      mdxSource = await serialize(content, {
        // Pass component names so serializer is aware they might exist
        // The actual implementation/props are handled client-side
        scope: {}, // No server-side scope needed here
        mdxOptions: {
          format: 'mdx',
          development: process.env.NODE_ENV === 'development',
        },
        parseFrontmatter: false,
      });
      console.log(`[getPostData] Successfully serialized MDX for ${filePath}.`);
    } catch (error: any) {
      // Keep the detailed error logging
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

    // Return without postDefinitions
    return {
      source: mdxSource,
      metadata: frontmatter,
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

// --- REMOVED Client Component Definition ---
// The logic is now in app/components/BlogPostClientView.tsx


// --- The Page Component (Server Component) ---
// Fetches data and renders the Client Component (`BlogPostClientView`).
export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { lang, slug } = params;

  try {
    const postData = await getPostData(lang, slug);

    if (!postData) {
      console.log(`[Page] Post data not found or post unpublished for ${lang}/${slug}. Triggering 404.`);
      notFound();
    }

    const { source, metadata } = postData;

    // Render the client component, passing the fetched data
    return <BlogPostClientView source={source} metadata={metadata} lang={lang} />;

  } catch (error: any) {
      console.error(`❌ [Page] Error fetching or rendering page ${lang}/${slug}:`, error);
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
