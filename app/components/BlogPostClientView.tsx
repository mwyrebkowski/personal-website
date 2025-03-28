'use client'; // This component handles client-side state and interactions

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { MDXComponents } from 'mdx/types';

// Import necessary components
import BlogPostWithAlignedSidePanel from '@/app/components/BlogPostWithAlignedSidePanel';
import Term from '@/app/components/Term';
// Removed unused Marginalia and MarginaliaSidePanel imports
import SidePanelDefinition, { DefinitionData } from '@/app/components/SidePanelDefinition'; // Import DefinitionData type

// --- Client Component for Rendering ---
interface BlogPostClientViewProps {
  source: MDXRemoteSerializeResult;
  metadata: any;
  lang: 'en' | 'pl';
}

export default function BlogPostClientView({ source, metadata, lang }: BlogPostClientViewProps) {
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  // Removed marginaliaNotes state and useEffect

  // Callback for Term component to activate a note (or definition)
  const handleActivateNote = useCallback((id: string) => {
    console.log('Activating note:', id);
    // Toggle behavior directly here or rely on BlogPostWithAlignedSidePanel's handler?
    // Let's keep it simple: just set the ID. The panel component handles toggling display.
    // If the same term is clicked, BlogPostWithAlignedSidePanel will receive the same ID again.
    // We might want toggle logic here eventually, but let's sync with the panel first.
    // For now, just pass the activated ID down.
    setActiveNoteId(id);
    // console.log('Activating note/definition:', id); // Keep for debugging if needed
  }, []);

  // Ensure definitions is always an array
  const definitions = (metadata.definitions || []) as DefinitionData[];

  // Define MDX components dynamically, injecting state handlers
  const mdxComponents: MDXComponents = useMemo(() => ({
    Term: (props: any) => <Term {...props} onActivate={handleActivateNote} />,
    // Remove Marginalia component definition as it's not used
    // Basic styling components (ensure these match what's needed)
    h1: (props: any) => <h1 className="text-3xl lg:text-4xl font-bold mt-8 mb-4" {...props} />,
    h2: (props: any) => <h2 className="text-2xl lg:text-3xl font-bold mt-6 mb-3" {...props} />,
    p: (props: any) => <p className="mb-4 leading-relaxed" {...props} />,
    a: (props: any) => <a className="text-blue-600 dark:text-blue-400 hover:underline" {...props} />,
    ul: (props: any) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
    li: (props: any) => <li className="mb-1" {...props} />,
    code: (props: any) => <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono" {...props} />,
    pre: (props: any) => <pre className="p-4 bg-slate-100 dark:bg-slate-800 rounded overflow-x-auto text-sm mb-4" {...props} />,
  }), [handleActivateNote]); // Removed registerNote dependency

  // Format date safely
  let formattedDate = 'Date unavailable';
  try {
    formattedDate = new Date(metadata.date).toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
    });
  } catch (e) { console.error(`[ClientView] Invalid date format: ${metadata.date}`); }

  return (
    <BlogPostWithAlignedSidePanel
      title={metadata.title || 'Untitled Post'}
      date={formattedDate}
      lang={lang}
      mainContent={
        <MDXRemote {...source} components={mdxComponents} />
      }
      // Pass raw definitions data instead of pre-rendered notes
      definitions={definitions}
      activeDefinitionId={activeNoteId} // Rename prop for clarity
      onDefinitionActivate={setActiveNoteId} // Rename prop for clarity
    />
  );
}
