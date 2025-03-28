'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import MarkdownPostEditor from '@/app/components/MarkdownPostEditor';

// Example function to generate initial MDX content with frontmatter
const generateInitialContent = (metadata: { title: string; date: string; lang: 'en' | 'pl', published: boolean }) => {
    return `---
title: "${metadata.title.replace(/"/g, '\\"')}"
date: "${metadata.date}"
lang: "${metadata.lang}"
published: ${metadata.published}
---

Write your blog post content here using Markdown and the <Term> component.

**Example:**

This is a <Term id="example-term" definition="This is the definition shown in the side panel.">sample term</Term>. Remember to give each term a unique \`id\`.
`;
};

export default function NewPostPage() {
    const router = useRouter();
    const [title, setTitle] = useState('New Post');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
    const [lang, setLang] = useState<'en' | 'pl'>('en');
    const [published, setPublished] = useState(false);
    const [mdxContent, setMdxContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);

    // Generate slug from title (basic example)
    const generateSlug = (titleStr: string) => {
       return titleStr
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove non-word chars
        .replace(/[\s_-]+/g, '-') // Replace space/underscore with single dash
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
    }

    // Set initial content for a new post
    useEffect(() => {
        const initialMeta = { title: 'New Post', date, lang, published };
        setMdxContent(generateInitialContent(initialMeta));
    }, [date, lang, published]);

    // Update MDX content when metadata changes
    useEffect(() => {
        // Only update the frontmatter part
        const contentBody = mdxContent.split('---').slice(2).join('---').trim();
        const initialBody = generateInitialContent({title:'', date:'', lang:'en', published: false}).split('---').slice(2).join('---').trim();

        const newFullMdx = `---
title: "${title.replace(/"/g, '\\"')}"
date: "${date}"
lang: "${lang}"
published: ${published}
---

${contentBody || initialBody}`; // Re-add body
        setMdxContent(newFullMdx);
    }, [title, date, lang, published, mdxContent]);

    const handleSave = async (newPublishedState: boolean | null = null) => {
        setIsSaving(true);
        setSaveError(null);
        
        try {
            // Determine the published state to use
            const effectivePublishState = newPublishedState !== null ? newPublishedState : published;
            
            // Generate the slug from title
            const postSlug = generateSlug(title);
            
            // Construct MDX content with updated frontmatter
            const fullMdxContent = `---
title: "${title.replace(/"/g, '\\"')}"
date: "${date}"
lang: "${lang}"
published: ${effectivePublishState}
---

${mdxContent}`;
            
            // Call the API to create the post
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    slug: postSlug,
                    lang,
                    mdx: fullMdxContent,
                }),
            });
            
            if (!response.ok) {
                throw new Error(`Failed to create post: ${response.statusText}`);
            }
            
            // Redirect to the edit page after successful creation
            router.push(`/admin/edit/${postSlug}`);
            
        } catch (error: any) {
            console.error('Error creating post:', error);
            setSaveError(`Failed to create post: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handlePublish = useCallback(() => {
        handleSave(true);
    }, [handleSave]);

    return (
        <div className="max-w-5xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-6">Create New Post</h1>

            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">{error}</div>}
            {saveError && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">{saveError}</div>}

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
                        value={lang}
                        onChange={(e) => setLang(e.target.value as 'en' | 'pl')}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        disabled={isSaving}
                    >
                        <option value="en">English</option>
                        <option value="pl">Polski</option>
                    </select>
                </div>
            </div>

            <div className="mb-6 flex items-center">
                <span className="mr-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status:
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${published 
                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'}`}
                >
                    {published ? 'Will publish immediately' : 'Will save as draft'}
                </span>
                
                <div className="ml-auto space-x-2">
                    <button
                        onClick={() => setPublished(!published)}
                        className={`px-3 py-1 ${published 
                            ? 'bg-yellow-500 hover:bg-yellow-600' 
                            : 'bg-green-600 hover:bg-green-700'} 
                            text-white rounded focus:outline-none focus:ring-2 transition-colors disabled:opacity-50`}
                        disabled={isSaving}
                    >
                        {published ? 'Save as Draft Instead' : 'Publish Immediately'}
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

            <div className="mt-6 flex justify-between">
                <button
                    onClick={() => router.push('/admin')}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                    disabled={isSaving}
                >
                    Cancel
                </button>
                <div className="space-x-2">
                    <button
                        onClick={() => handleSave(null)}
                        className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Save Post'}
                    </button>
                    {!published && (
                        <button
                            onClick={handlePublish}
                            className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                            disabled={isSaving || isPublishing}
                        >
                            {isPublishing ? 'Publishing...' : 'Save & Publish'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
} 