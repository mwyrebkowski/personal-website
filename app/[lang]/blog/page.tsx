import { promises as fs } from 'fs';
import path from 'path';
import Link from 'next/link';
import matter from 'gray-matter';

// Define the page props
interface BlogIndexProps {
  params: {
    lang: 'en' | 'pl';
  };
}

// Define the post type
interface Post {
  slug: string;
  title: string;
  date: string;
  published: boolean;
  lang: 'en' | 'pl';
  excerpt?: string;
}

// Function to get all posts for the given language
async function getPosts(lang: 'en' | 'pl'): Promise<Post[]> {
  const postsDirectory = path.join(process.cwd(), 'content/posts');
  
  try {
    // Ensure posts directory exists
    try {
      await fs.access(postsDirectory);
    } catch (error) {
      await fs.mkdir(postsDirectory, { recursive: true });
      return []; // Return empty array if directory was just created
    }

    // Get all .mdx files
    const files = await fs.readdir(postsDirectory);
    const mdxFiles = files.filter(file => file.endsWith(`.${lang}.mdx`));

    // Parse each file to extract metadata
    const posts = await Promise.all(
      mdxFiles.map(async (filename) => {
        // Extract slug from filename pattern: slug.lang.mdx
        const slug = filename.replace(`.${lang}.mdx`, '');

        const filePath = path.join(postsDirectory, filename);
        const fileContent = await fs.readFile(filePath, 'utf8');
        const { data: metadata, content } = matter(fileContent);

        // Create excerpt from content (first 150 characters)
        const plainTextContent = content
          .replace(/<[^>]*>?/gm, '') // Remove HTML tags
          .replace(/\n/g, ' ') // Replace newlines with spaces
          .trim();
        const excerpt = plainTextContent.substring(0, 150) + (plainTextContent.length > 150 ? '...' : '');

        return {
          slug,
          title: metadata.title || 'Untitled',
          date: metadata.date || new Date().toISOString().split('T')[0],
          published: metadata.published === true,
          lang: lang,
          excerpt,
        };
      })
    );

    // Filter out unpublished posts (except in development)
    const filteredPosts = process.env.NODE_ENV === 'development' 
      ? posts 
      : posts.filter(post => post.published);

    // Sort posts by date, newest first
    return filteredPosts.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  } catch (error) {
    console.error(`Error getting posts: ${error}`);
    return [];
  }
}

// Generate metadata for the page
export async function generateMetadata({ params }: BlogIndexProps) {
  const { lang } = params;
  const title = lang === 'en' ? 'Blog' : 'Blog';
  return {
    title,
  };
}

// The Blog Index Page Component
export default async function BlogPage({ params }: BlogIndexProps) {
  const { lang } = params;
  const posts = await getPosts(lang);

  // Translate UI elements based on language
  const labels = {
    title: lang === 'en' ? 'Articles' : 'Artykuły',
    category: lang === 'en' ? 'Category:' : 'Kategoria:',
    all: lang === 'en' ? 'All' : 'Wszystkie',
    technology: lang === 'en' ? 'Technology' : 'Technologia',
    programming: lang === 'en' ? 'Programming' : 'Programowanie',
    philosophy: lang === 'en' ? 'Philosophy' : 'Filozofia',
    productivity: lang === 'en' ? 'Productivity' : 'Produktywność',
    learning: lang === 'en' ? 'Learning' : 'Nauka',
    noPostsFound: lang === 'en' ? 'No articles found.' : 'Nie znaleziono artykułów.',
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-5">
        <header className="flex justify-between items-center py-10 px-4 relative">
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight md:tracking-tighter leading-tight">
            <a className="hover:underline transition-all duration-300" href={`/${lang}`}>Your Name</a>
          </h2>
          <button className="block md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1.5" aria-label="Toggle Menu">
            <span className="block w-6 h-0.5 bg-slate-800 dark:bg-white transition-transform duration-300 ease-in-out"></span>
            <span className="block w-6 h-0.5 bg-slate-800 dark:bg-white transition-opacity duration-300 ease-in-out opacity-100"></span>
            <span className="block w-6 h-0.5 bg-slate-800 dark:bg-white transition-transform duration-300 ease-in-out"></span>
          </button>
          <nav className="hidden md:block">
            <ul className="flex space-x-8">
              <li><a className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300" href={`/${lang}/newsletter`}>Newsletter</a></li>
              <li><a className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300" href={`/${lang}/books`}>Books</a></li>
              <li><a className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300" href={`/${lang}/blog`}>Articles</a></li>
              <li><a className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300" href={`/${lang}/notes`}>Notes</a></li>
              <li><a className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300" href={`/${lang}/courses`}>Courses</a></li>
            </ul>
          </nav>
        </header>

        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight md:leading-none mb-12 text-center md:text-left text-slate-900 dark:text-white">{labels.title}</h1>
          
          <div className="mb-8">
            <p className="text-md mb-2 text-gray-500 italic">{labels.category}</p>
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                <select className="px-4 py-2 rounded bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 w-full">
                  <option value="All">{labels.all}</option>
                  <option value="technology">{labels.technology}</option>
                  <option value="programming">{labels.programming}</option>
                  <option value="philosophy">{labels.philosophy}</option>
                  <option value="productivity">{labels.productivity}</option>
                  <option value="learning">{labels.learning}</option>
                </select>
              </div>
            </div>
          </div>

          <section>
            {posts.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">{labels.noPostsFound}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-1 md:gap-x-8 lg:gap-x-8 gap-y-8 md:gap-y-8 mb-32">
                {posts.map((post) => (
                  <div key={post.slug} className="border-b border-slate-200 dark:border-slate-700 pb-8">
                    <Link href={`/${lang}/blog/${post.slug}`} className="group">
                      <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {post.title}
                      </h2>
                      <time className="text-sm text-slate-500 dark:text-slate-400 mb-3 block">
                        {new Date(post.date).toLocaleDateString(lang === 'en' ? 'en-US' : 'pl-PL', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </time>
                      {post.published === false && (
                        <span className="inline-block bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 text-xs px-2 py-1 rounded-full mb-3 mr-2">
                          Draft
                        </span>
                      )}
                      <p className="text-slate-600 dark:text-slate-400 mb-4">
                        {post.excerpt}
                      </p>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
} 