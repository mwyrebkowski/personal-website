'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import rehypeSanitize from 'rehype-sanitize'; // Basic security for preview

// Dynamically import MDEditor to prevent SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

// Simple placeholder component for Term in the MDEditor preview
const TermPreview = ({ children, id }: { children: React.ReactNode, id?: string }) => {
  return (
    <span
      className="font-semibold text-blue-600 dark:text-blue-400 border-b border-dotted border-blue-500 cursor-help"
      title={`Preview: Term ID='${id || 'MISSING'}'`} // Show ID on hover in preview
    >
      {children}
    </span>
  );
};

interface MarkdownPostEditorProps {
  initialValue?: string;
  onChange?: (value: string) => void;
  onSave?: (value: string) => void;
  height?: number;
  readOnly?: boolean; // Add readOnly prop
}

const MarkdownPostEditor: React.FC<MarkdownPostEditorProps> = ({
  initialValue = '',
  onChange,
  onSave,
  height = 600,
  readOnly = false,
}) => {
  const [value, setValue] = useState<string | undefined>(initialValue);
  const [colorMode, setColorMode] = useState<'light' | 'dark'>('light');

  // Update internal state if initialValue changes
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Detect system color scheme on mount
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateMode = () => setColorMode(mediaQuery.matches ? 'dark' : 'light');
    updateMode(); // Initial check
    mediaQuery.addEventListener('change', updateMode);
    return () => mediaQuery.removeEventListener('change', updateMode);
  }, []);


  const handleEditorChange = (newValue: string | undefined) => {
    if (!readOnly) {
        setValue(newValue);
        if (onChange) {
            onChange(newValue || '');
        }
    }
  };

  const handleSaveClick = () => {
    if (!readOnly && onSave && value !== undefined) {
      onSave(value);
    }
  };

  // Note: The preview in @uiw/react-md-editor uses react-markdown.
  // It won't execute the *actual* <Term> component's logic or interact
  // with the side panel context. It's primarily for visual representation.
  // We can pass basic styling or a placeholder representation if needed.

  return (
    <div className={`markdown-editor-container ${readOnly ? 'pointer-events-none opacity-80' : ''}`}>
      <div data-color-mode={colorMode}>
        <MDEditor
          value={value}
          onChange={handleEditorChange}
          height={height}
          preview={readOnly ? "preview" : "live"} // Show only preview if readOnly
          // Configure preview props for react-markdown used internally
          previewOptions={{
            rehypePlugins: [[rehypeSanitize]], // Basic XSS protection
            // Add the custom component mapping for the preview
            // Use the capitalized name as it's a React component used in MDX
            // Cast to any to avoid type issues with the components prop
            components: { 'Term': TermPreview } as any
          }}
          // Hide controls completely if readOnly
          hideToolbar={readOnly}
          visibleDragbar={!readOnly}
          textareaProps={readOnly ? { disabled: true } : {}}

        />
      </div>
      {!readOnly && onSave && (
        <div className="mt-4 text-right">
          <button
            onClick={handleSaveClick}
            className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950 transition-colors"
          >
            Save Post
          </button>
        </div>
      )}
    </div>
  );
};

export default MarkdownPostEditor; 