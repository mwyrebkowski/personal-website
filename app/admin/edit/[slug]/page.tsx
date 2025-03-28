'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import TipTapEditor from '@/app/components/TipTapEditor'; // Import the new editor
import { DefinitionData } from '@/app/components/SidePanelDefinition';

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
    const [initialMarkdown, setInitialMarkdown] = useState(''); // Renamed state for initial content
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);
    const [definitions, setDefinitions] = useState<DefinitionData[]>([]);

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
                setInitialMarkdown(mdxContent); // Set initial markdown content
                setDefinitions(metadata.definitions || []);
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
    }, [params.slug, postLang]); // Keep dependency array as is

    // Save post - Updated signature
    const handleSave = async (markdownContent: string, updatedDefinitions?: DefinitionData[], newPublishedState: boolean | null = null) => {
        setIsSaving(true);
        if (newPublishedState !== null) {
            setIsPublishing(true);
            setPublished(newPublishedState);
        }
        setError(null);
        
        // Determine if this is a publish operation or just a save
        const saveAsPublished = newPublishedState !== null ? newPublishedState : published;
        // Use the definitions passed from the editor's onSave callback
        const definitionsToSave = updatedDefinitions || definitions;

        // Construct MDX content with updated frontmatter and new markdown content
        const frontmatter = `---
title: "${title.replace(/"/g, '\\"')}"
date: "${date}"
lang: "${postLang}"
published: ${saveAsPublished}
definitions: ${JSON.stringify(definitionsToSave, null, 2)}
---

`; // Ensure a newline after frontmatter
        // Use the markdownContent passed from the editor
        const fullMdx = frontmatter + markdownContent;

        try {
            const response = await fetch(`/api/posts/${params.slug}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slug: params.slug,
                    lang: postLang,
                    mdxContent: fullMdx,
                }),
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Save failed with status ' + response.status }));
                throw new Error(errorData.message || 'Save failed');
            }
            
            setError(null);
            setSaved(true);

            // Update the published state locally if it was changed *after* successful save
            if (newPublishedState !== null) {
                setPublished(newPublishedState);
            }

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
            // Removed duplicated blocks and misplaced state update
        }
    };

    // Note: handlePublish/handleUnpublish now need the content and definitions.
    // This suggests the save button within the editor should handle saving,
    // and these buttons might just trigger a save with the publish state change.
    // Let's adjust this: The editor's save button calls handleSave directly.
    // The Publish/Unpublish buttons will need access to the latest content/definitions,
    // which is tricky without lifting state or using refs.
    // Simplification: Remove Publish/Unpublish buttons for now, rely on editor's save.
    // We can revisit adding dedicated publish buttons later if needed.

    // Function to handle switching languages (Keep as is for now)
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
                {/* Removed Publish/Unpublish/Save buttons - Handled by editor component now */}
            </div>

            {/* Removed instruction block for <Term> */}

            <TipTapEditor
                initialValue={initialMarkdown} // Pass initial markdown
                // No onChange needed here for now
                onSave={handleSave} // Pass the updated handleSave function
                height={700}
                readOnly={isSaving}
                initialDefinitions={definitions}
                // onRequestNewDefinition could be added later if needed for panel interaction
            />
        </div>
    );
}
