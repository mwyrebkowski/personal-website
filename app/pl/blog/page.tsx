import { promises as fs } from 'fs';
import path from 'path';
import Link from 'next/link';
import matter from 'gray-matter';

// Define the post type
interface Post {
  slug: string;
  title: string;
  date: string; // Keep as string (ISO format) for reliable sorting
  published: boolean;
  excerpt?: string;
  category?: string; // Optional: If you add categories to frontmatter
}

// Function to get all Polish posts
async function getPosts(): Promise<Post[]> {
  const postsDirectory = path.join(process.cwd(), 'content/posts');

  try {
    await fs.access(postsDirectory);
  } catch (error: any) {
    // If directory doesn't exist, create it and return empty
    if (error.code === 'ENOENT') {
      console.warn(`Katalog postów nie znaleziony w ${postsDirectory}. Tworzenie.`);
      try {
        await fs.mkdir(postsDirectory, { recursive: true });
      } catch (mkdirError) {
        console.error(`Nie udało się utworzyć katalogu postów: ${postsDirectory}`, mkdirError);
      }
    } else {
      // Log other errors accessing the directory
      console.error(`Błąd dostępu do katalogu postów: ${postsDirectory}`, error);
    }
    return []; // Return empty array if directory doesn't exist or error occurred
  }

  let files;
  try {
    files = await fs.readdir(postsDirectory);
  } catch (readDirError) {
    console.error(`Błąd odczytu katalogu postów: ${postsDirectory}`, readDirError);
    return []; // Return empty if cannot read directory
  }

  const mdxFiles = files.filter(file => file.endsWith('.pl.mdx'));

  if (mdxFiles.length === 0) {
    console.log("Nie znaleziono polskich plików postów (.pl.mdx).");
    return [];
  }

  const posts = await Promise.all(
    mdxFiles.map(async (filename): Promise<Post | null> => { // Explicit return type
      const slug = filename.replace('.pl.mdx', '');
      const filePath = path.join(postsDirectory, filename);

      try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        const { data: metadata, content } = matter(fileContent);

        // Validate required metadata
        if (!metadata.title || !metadata.date) {
          console.warn(`Pominięto post ${filename}: brak 'title' lub 'date'.`);
          return null;
        }

        // Create excerpt - improved version
        const plainTextContent = content
          .replace(/---[\s\S]*?---/, '') // Remove frontmatter block
          .replace(/<[^>]+>/g, ' ')      // Replace HTML/JSX tags with space
          .replace(/\{[^}]+\}/g, '')     // Remove JS expressions {}
          .replace(/[#*`>|_-]/g, '')     // Remove common markdown symbols - moved hyphen to end
          .replace(/\s\s+/g, ' ')        // Collapse multiple spaces
          .trim();
        const excerpt = plainTextContent.substring(0, 160) + (plainTextContent.length > 160 ? '...' : '');

        // Ensure date is valid and in ISO format for sorting
        let isoDate;
        try {
            isoDate = new Date(metadata.date).toISOString();
        } catch (dateError) {
            console.warn(`Pominięto post ${filename}: nieprawidłowy format daty '${metadata.date}'. Użyto bieżącej daty.`);
            isoDate = new Date().toISOString();
        }

        return {
          slug,
          title: metadata.title,
          date: isoDate, // Store as ISO string for sorting
          published: metadata.published === true, // Explicitly check for true boolean
          excerpt,
          category: metadata.category || null, // Get category if present
        };
      } catch (readError) {
        console.error(`Błąd odczytu lub parsowania pliku ${filePath}:`, readError);
        return null; // Skip this post on error
      }
    })
  );

  // Filter out null values (from errors)
  const validPosts = posts.filter((post): post is Post => post !== null);

  // Filter out unpublished posts (but show them in development)
  const filteredPosts = process.env.NODE_ENV === 'development'
    ? validPosts // Show all valid posts in dev
    : validPosts.filter(post => post.published); // Show only published in prod

  // Sort posts by date, newest first (use ISO string for reliable sorting)
  return filteredPosts.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}


// Generate metadata for the page
export async function generateMetadata() {
  return {
    title: 'Artykuły | Twoje Imię', // Update with your name/site title
    description: 'Lista artykułów na różne tematy.', // Add a description
  };
}

// The Polish Blog Page Component
export default async function BlogPagePl() {
  const posts = await getPosts();

  const labels = {
    title: 'Artykuły',
    category: 'Kategoria:',
    all: 'Wszystkie',
    noPostsFound: 'Nie znaleziono artykułów.',
    draft: 'Szkic',
    // Add more labels if needed
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-5">
        {/* Header remains the same as before */}
        <header className="flex justify-between items-center py-10 px-4 relative">
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight md:tracking-tighter leading-tight">
            <Link href="/pl" className="hover:underline transition-all duration-300">Twoje Imię</Link>
          </h2>
          {/* Mobile Menu Button */}
          <button className="block md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1.5" aria-label="Przełącz Menu">
            <span className="block w-6 h-0.5 bg-slate-800 dark:bg-white transition-transform duration-300 ease-in-out"></span>
            <span className="block w-6 h-0.5 bg-slate-800 dark:bg-white transition-opacity duration-300 ease-in-out opacity-100"></span>
            <span className="block w-6 h-0.5 bg-slate-800 dark:bg-white transition-transform duration-300 ease-in-out"></span>
          </button>
          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex space-x-8">
               <li><Link className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300" href="/pl/newsletter">Newsletter</Link></li>
               <li><Link className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300" href="/pl/books">Książki</Link></li>
               <li><Link className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300" href="/pl/blog">Artykuły</Link></li>
               <li><Link className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300" href="/pl/notes">Notatki</Link></li>
               <li><Link className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300" href="/pl/courses">Kursy</Link></li>
            </ul>
          </nav>
          {/* Mobile Navigation Placeholder (Functionality not shown) */}
          <div className="absolute top-full right-0 left-0 mt-2 bg-white dark:bg-slate-800 shadow-md z-10 md:hidden transition-all duration-300 ease-in-out opacity-0 -translate-y-2 pointer-events-none group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto">
            <ul className="flex flex-col py-4">
               <li className="py-2 text-center"><Link className="hover:text-blue-600 dark:hover:text-blue-400" href="/pl/newsletter">Newsletter</Link></li>
               <li className="py-2 text-center"><Link className="hover:text-blue-600 dark:hover:text-blue-400" href="/pl/books">Książki</Link></li>
               <li className="py-2 text-center"><Link className="hover:text-blue-600 dark:hover:text-blue-400" href="/pl/blog">Artykuły</Link></li>
               <li className="py-2 text-center"><Link className="hover:text-blue-600 dark:hover:text-blue-400" href="/pl/notes">Notatki</Link></li>
               <li className="py-2 text-center"><Link className="hover:text-blue-600 dark:hover:text-blue-400" href="/pl/courses">Kursy</Link></li>
            </ul>
          </div>
        </header>

        <div className="max-w-3xl mx-auto pb-20 pt-8"> {/* Added pt-8 */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight md:leading-none mb-12 text-center md:text-left text-slate-900 dark:text-white">{labels.title}</h1>

          {/* Category Filter Placeholder (UI only) */}
          <div className="mb-10">
            <label htmlFor="category-filter" className="text-md mb-2 text-gray-500 dark:text-gray-400 italic block">{labels.category}</label>
            <select id="category-filter" className="px-4 py-2 rounded bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 w-full md:w-auto focus:ring-blue-500 focus:border-blue-500 dark:text-white">
              <option value="All">{labels.all}</option>
              {/* Add more categories dynamically if needed */}
              <option value="technology">Technologia</option>
              <option value="philosophy">Filozofia</option>
              <option value="programming">Programowanie</option>
              <option value="productivity">Produktywność</option>
              <option value="learning">Nauka</option>
            </select>
          </div>

          <section>
            {posts.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                <p className="text-slate-500 dark:text-slate-400">{labels.noPostsFound}</p>
              </div>
            ) : (
              <div className="space-y-10"> {/* Use space-y for consistent spacing */}
                {posts.map((post) => (
                  <article key={post.slug} className="border-b border-slate-200 dark:border-slate-700 pb-8 last:border-b-0">
                    <Link href={`/pl/blog/${post.slug}`} className="group block">
                      <header className="mb-3">
                        <h2 className="text-2xl font-bold leading-snug text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                          {post.title}
                        </h2>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 dark:text-slate-400"> {/* Flex wrap for tags */}
                           <time dateTime={post.date}>
                              {new Date(post.date).toLocaleDateString('pl-PL', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                           </time>
                           <span className="text-slate-300 dark:text-slate-600">•</span> {/* Separator */}
                           {/* Show Draft indicator only in development */}
                           {process.env.NODE_ENV === 'development' && !post.published && (
                             <span className="inline-flex items-center bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 text-xs px-2 py-0.5 rounded-full font-medium">
                               <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M17.293 3.293a1 1 0 0 1 1.414 1.414l-13 13A1 1 0 0 1 .293 16.293L3.293 17.707a1 1 0 0 1 1.414-1.414L17.707 3.293a1 1 0 0 1 1.414 0z" clipRule="evenodd"></path></svg>
                               {labels.draft}
                             </span>
                           )}
                           {post.category && (
                             <span className="inline-block bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300 text-xs px-2 py-0.5 rounded-full font-medium">
                               {post.category}
                             </span>
                           )}
                        </div>
                      </header>
                      {post.excerpt && (
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                          {post.excerpt}
                        </p>
                      )}
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}