'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Post {
  slug: string;
  lang: 'en' | 'pl';
  title: string;
  date: string;
  published: boolean;
}

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    lang: 'all' as 'all' | 'en' | 'pl',
    status: 'published' as 'all' | 'published' | 'draft',
    search: '',
  });
  const router = useRouter();

  // Function to load posts
  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      // Fetch posts from our API
      const response = await fetch('/api/posts');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.statusText}`);
      }
      
      const data = await response.json();
      setPosts(data.posts || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load posts on mount
  useEffect(() => {
    fetchPosts();
  }, []);

  // Apply filters when posts or filters change
  useEffect(() => {
    let result = [...posts];
    
    // Apply language filter
    if (filters.lang !== 'all') {
      result = result.filter(post => post.lang === filters.lang);
    }
    
    // Apply status filter
    if (filters.status !== 'all') {
      result = result.filter(post => 
        filters.status === 'published' ? post.published : !post.published
      );
    }
    
    // Apply search filter (case-insensitive)
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      result = result.filter(post => 
        post.title.toLowerCase().includes(searchTerm) || 
        post.slug.toLowerCase().includes(searchTerm)
      );
    }
    
    setFilteredPosts(result);
  }, [posts, filters]);

  const handleNewPost = () => {
    router.push('/admin/new');
  };

  const handleEditPost = (slug: string, lang: string) => {
    router.push(`/admin/edit/${slug}`);
  };

  const handlePublishToggle = async (slug: string, lang: string, currentPublishState: boolean) => {
    try {
      // First fetch the post to get its content
      const getResponse = await fetch(`/api/posts/${slug}?lang=${lang}`);
      if (!getResponse.ok) {
        throw new Error(`Failed to fetch post: ${getResponse.statusText}`);
      }
      
      const postData = await getResponse.json();
      const { content } = postData;
      
      // Parse frontmatter and update the published state
      let mdxContent = content;
      if (content.includes('published:')) {
        mdxContent = content.replace(
          /published:\s*(true|false)/i, 
          `published: ${!currentPublishState}`
        );
      } else {
        // If there is no published field, add it before the end of the frontmatter
        mdxContent = content.replace(
          /---/, 
          `---\npublished: ${!currentPublishState}`
        );
      }
      
      // Update the post
      const updateResponse = await fetch(`/api/posts/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          slug, 
          lang, 
          mdxContent
        }),
      });
      
      if (!updateResponse.ok) {
        throw new Error(`Failed to update post: ${updateResponse.statusText}`);
      }
      
      // Refresh the post list
      await fetchPosts();
      
    } catch (err: any) {
      console.error('Error toggling publish state:', err);
      setError(`Failed to ${currentPublishState ? 'unpublish' : 'publish'} post: ${err.message}`);
    }
  };

  const handleDeletePost = async (slug: string, lang: string) => {
    if (!window.confirm(`Are you sure you want to delete this post: ${slug}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${slug}?lang=${lang}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete post: ${response.statusText}`);
      }

      // Refresh the post list
      await fetchPosts();
    } catch (err: any) {
      console.error('Error deleting post:', err);
      setError(`Failed to delete post: ${err.message}`);
    }
  };

  return (
    <> {/* Use a fragment */}
      {/* Moved button outside the main container */}
      <div className="max-w-6xl mx-auto px-4 pt-4 flex justify-end"> {/* Adjust styling */}
        <button
          onClick={handleNewPost}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          data-testid="create-post-button-main"
          style={{ display: 'block', visibility: 'visible' }}
        >
          Create New Post
        </button>
      </div>

      <div className="max-w-6xl mx-auto py-10 px-4"> {/* Original container */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Blog Post Admin</h1>
          {/* Button removed from here */}
        </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 border border-red-300 rounded">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="lang-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Language
            </label>
            <select
              id="lang-filter"
              value={filters.lang}
              onChange={(e) => setFilters({...filters, lang: e.target.value as 'all' | 'en' | 'pl'})}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Languages</option>
              <option value="en">English</option>
              <option value="pl">Polish</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              id="status-filter"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value as 'all' | 'published' | 'draft'})}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="search-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              id="search-filter"
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              placeholder="Search by title or slug"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-pulse text-gray-500">Loading posts...</div>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-4">
            {posts.length === 0 
              ? "No posts found." 
              : filters.status === 'published' 
                ? "No published posts found. Try viewing drafts to see unpublished content."
                : "No posts match your filters."}
          </p>
          {posts.length === 0 && (
            <button
              onClick={handleNewPost}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Create Your First Post
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Slug
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Language
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPosts.map((post) => (
                <tr key={`${post.slug}-${post.lang}`} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {post.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {post.slug}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {new Date(post.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      post.lang === 'en' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                    }`}>
                      {post.lang === 'en' ? 'English' : 'Polish'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      post.published ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        href={`/${post.lang}/blog/${post.slug}`}
                        target="_blank"
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleEditPost(post.slug, post.lang)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handlePublishToggle(post.slug, post.lang, post.published)}
                        className={`${post.published ? 'text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300' : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'}`}
                      >
                        {post.published ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.slug, post.lang)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </> // Add closing fragment tag
  );
}
