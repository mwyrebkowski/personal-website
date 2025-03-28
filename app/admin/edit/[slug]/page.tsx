'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MarkdownPostEditor from '@/app/components/MarkdownPostEditor';

interface EditPostPageParams {
  slug: string;
  lang?: string;
}

export default function EditPostPage() {
    const router = useRouter();
    const params = useParams();
    const slug = params?.slug as string;
    const lang = (params?.lang as 'en' | 'pl') || 'en';

    const [title, setTitle] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [postLang, setPostLang] = useState<'en' | 'pl'>(lang);
    const [published, setPublished] = useState(false);
    const [mdxContent, setMdxContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    // Get post data on page load
    useEffect(() => {
        async function fetchPost() {
            setIsLoading(true);
            try {
                // Fetch the post data
                const response = await fetch(`/api/posts/${params.slug}?lang=${postLang}`);
                
                if (!response.ok) {
                    throw new Error(`Failed to load post: ${response.statusText}`);
                }
                
                const data = await response.json();
                
                // Extract frontmatter and content
                const { content: mdxContent, metadata } = data;
                
                // Set state
                setTitle(metadata.title || 'Untitled');
                setDate(metadata.date || new Date().toISOString().split('T')[0]);
                setPostLang(metadata.lang || 'en');
                setPublished(metadata.published || false);
                setMdxContent(mdxContent);
                setError(null);
            } catch (err: any) {
                console.error('Error loading post:', err);
                setError(`Failed to load post: ${err.message}`);
            } finally {
                setIsLoading(false);
            }
        }
        
        if (params.slug) {
            fetchPost();
        }
    }, [params.slug, postLang]);

    // Save post
    const handleSave = async (newPublishedState: boolean | null = null) => {
        setIsSaving(true);
        if (newPublishedState !== null) {
            setIsPublishing(true);
            setPublished(newPublishedState);
        }
        setError(null);
        
        // Determine if this is a publish operation or just a save
        const saveAsPublished = newPublishedState !== null ? newPublishedState : published;
        
        // Construct MDX content with updated frontmatter
        const fullMdx = `---
title: "${title.replace(/"/g, '\\"')}"
date: "${date}"
lang: "${postLang}"
published: ${saveAsPublished}
---

${mdxContent.split('---').slice(2).join('---').trim()}`; // Rebuild content after frontmatter

        try {
            const response = await fetch(`/api/posts/${params.slug}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slug: params.slug,
                    lang: postLang,
                    mdxContent: fullMdx
                }),
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Save failed with status ' + response.status }));
                throw new Error(errorData.message || 'Save failed');
            }
            
            setError(null);
            setSaved(true);
            
            // Hide the saved message after a delay
            setTimeout(() => {
                setSaved(false);
            }, 3000);
            
        } catch (err: any) {
            console.error(err);
            setError(`${newPublishedState !== null ? 'Publish' : 'Save'} failed: ${err.message}`);
        } finally {
            setIsSaving(false);
            if (newPublishedState !== null) {
                setIsPublishing(false);
            }
        }
    };

    // Helper functions for publish/unpublish
    const handlePublish = () => handleSave(true);
    const handleUnpublish = () => handleSave(false);

    // Function to handle switching languages
    const handleLanguageSwitch = async (newLang: 'en' | 'pl') => {
        if (newLang === postLang) return;
        
        if (!window.confirm(`Do you want to switch this post to ${newLang === 'en' ? 'English' : 'Polish'}? This will update the post's language.`)) {
            return;
        }

        setPostLang(newLang);
        // The save function will handle updating the content with the new language
    };

    if (isLoading) {
        return <div className="p-10 text-center">Loading editor...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-6">Editing Post: {title}</h1>

            {error && <div className="mb-6 p-4 bg-red-100 text-red-700 border border-red-300 rounded">{error}</div>}

            {saved && (
                <div className="mb-6 p-4 bg-green-100 text-green-700 border border-green-300 rounded">
                    Post saved successfully!
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        disabled={isSaving}
                    />
                </div>
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                    <input
                        type="date"
                        id="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        disabled={isSaving}
                    />
                </div>
                <div>
                    <label htmlFor="lang" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
                    <select
                        id="lang"
                        value={postLang}
                        onChange={(e) => handleLanguageSwitch(e.target.value as 'en' | 'pl')}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        disabled={isSaving}
                    >
                        <option value="en">English</option>
                        <option value="pl">Polski</option>
                    </select>
                </div>
            </div>

            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <span className="mr-2">Status:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        published ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}>
                        {published ? 'Published' : 'Draft'}
                    </span>
                </div>
                
                <div className="flex items-center gap-2">
                    {published ? (
                        <button
                            onClick={handleUnpublish}
                            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors disabled:opacity-50"
                            disabled={isPublishing || isSaving}
                        >
                            {isPublishing ? 'Unpublishing...' : 'Unpublish'}
                        </button>
                    ) : (
                        <button
                            onClick={handlePublish}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors disabled:opacity-50"
                            disabled={isPublishing || isSaving}
                        >
                            {isPublishing ? 'Publishing...' : 'Publish'}
                        </button>
                    )}
                    
                    <button
                        onClick={() => handleSave()}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            <div className='mb-4 p-3 bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded text-sm text-blue-800 dark:text-slate-300'>
                Use Markdown for formatting. To add a side panel definition, use the `&lt;Term&gt;` component like this:
                <code className='block bg-blue-100 dark:bg-slate-700 p-2 rounded mt-1 text-xs'>
                    &lt;Term id="unique-id" definition="Your definition text here." source="Optional source"&gt;Highlighted Term&lt;/Term&gt;
                </code>
                Ensure each `id` is unique within the post.
            </div>

            <MarkdownPostEditor
                initialValue={mdxContent}
                onChange={(value) => setMdxContent(value)}
                onSave={() => handleSave(null)}
                height={700}
                readOnly={isSaving}
            />
        </div>
    );
} 