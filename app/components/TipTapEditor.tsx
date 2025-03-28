'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react'; // Import Editor type
import StarterKit from '@tiptap/starter-kit';
// Import custom extensions
import TermNode from './TipTapExtensions/TermNode';
import TermSuggestion from './TipTapExtensions/TermSuggestion';
import { DefinitionData } from './SidePanelDefinition'; // Assuming this type exists
import TurndownService from 'turndown';
// We might need a Markdown parser if @tiptap/html isn't sufficient
// import { generateHTML } from '@tiptap/html';
// import MarkdownIt from 'markdown-it';

// Suggestion utility configuration is now part of the extension itself

interface TipTapEditorProps {
    initialValue?: string; // Markdown content
    onChange?: (value: string) => void; // Callback with Markdown content
    onSave?: (value: string, definitions: DefinitionData[]) => void; // Callback with Markdown content and definitions
    height?: number;
    readOnly?: boolean;
    initialDefinitions: DefinitionData[];
    // onRequestNewDefinition is handled internally now by suggestion config
}

const TipTapEditor: React.FC<TipTapEditorProps> = ({
    initialValue = '',
    onChange,
    onSave,
    height = 600,
    readOnly = false,
    initialDefinitions,
    // onRequestNewDefinition, // Removed from props
}) => {
    const [editorMode, setEditorMode] = useState<'wysiwyg' | 'markdown'>('wysiwyg');
    const [markdownValue, setMarkdownValue] = useState<string>(initialValue);
    const [definitions, setDefinitions] = useState<DefinitionData[]>(initialDefinitions);
    const [colorMode, setColorMode] = useState<'light' | 'dark'>('light');

    // State for the definition management panel (similar to MarkdownPostEditor)
    const [newTerm, setNewTerm] = useState('');
    const [newDefinition, setNewDefinition] = useState('');
    const [newSource, setNewSource] = useState('');

    // Turndown service for HTML -> Markdown conversion
    const turndownService = new TurndownService();
    // TODO: Configure Turndown to convert TermNode HTML back to <Term> or [[term]]

    // Markdown -> HTML conversion (basic placeholder)
    // const md = new MarkdownIt(); // Example if using markdown-it
    const convertMarkdownToHtml = (markdown: string): string => {
        // Basic placeholder - This needs proper implementation, potentially handling [[term]]
        // For now, just return markdown; TipTap might handle basic MD
        // return md.render(markdown);
        // Or using @tiptap/html if configured:
        // return generateHTML(markdownSchema, markdown);
        console.warn("Markdown to HTML conversion is basic placeholder.");
        // TODO: Enhance this to parse <Term id="...">...</Term> into TermNode attributes
        // or [[term]] syntax if we decide on that.
        return markdown.replace(/\n/g, '<br>'); // Very basic conversion
    };

    // Callback for when "Create new" is selected in suggestion
    const handleRequestNewDefinition = useCallback((termName: string) => {
        console.log('Requesting new definition for:', termName);
        setNewTerm(termName); // Pre-fill the term input in the panel
        // Optionally focus the definition input
        document.getElementById('new-definition-input')?.focus();
    }, []);


    const editor = useEditor({
        extensions: [
            StarterKit,
            TermNode, // Add the custom node
            TermSuggestion.configure({ // Configure the suggestion extension
                definitions: definitions, // Pass current definitions
                onRequestNewDefinition: handleRequestNewDefinition, // Pass the callback
            }),
        ],
        content: convertMarkdownToHtml(initialValue), // Initial content needs conversion
        editable: !readOnly && editorMode === 'wysiwyg',
        onUpdate: ({ editor }: { editor: Editor }) => { // Type the editor parameter
            if (editorMode === 'wysiwyg') {
                const html = editor.getHTML();
                const markdown = turndownService.turndown(html);
                setMarkdownValue(markdown); // Keep markdown state in sync
                if (onChange) {
                    onChange(markdown);
                }
            }
        },
    });

    // Effect to update suggestion extension when definitions change
    useEffect(() => {
        if (editor) {
            // Update the options of the TermSuggestion extension instance
            const suggestionExtension = editor.extensionManager.extensions.find((ext: any) => ext.name === 'termSuggestion');
            if (suggestionExtension) {
                suggestionExtension.options.definitions = definitions;
                // Note: This direct mutation might not be ideal. If issues arise,
                // we might need a more robust way to update extension options or reconfigure.
            }
        }
    }, [definitions, editor]);


    // Effect to update editor content if initialValue changes externally
    useEffect(() => {
        if (editor && initialValue !== markdownValue) {
            // Avoid loop, only update if external value changed
            const newHtml = convertMarkdownToHtml(initialValue);
            if (editor.getHTML() !== newHtml) {
                 editor.commands.setContent(newHtml, false); // Don't emit update
                 setMarkdownValue(initialValue);
            }
        }
    }, [initialValue, editor]); // Removed markdownValue dependency to prevent potential loops

     // Effect to update internal definitions if initialDefinitions prop changes
     useEffect(() => {
        setDefinitions(initialDefinitions);
    }, [initialDefinitions]);

    // Effect for color scheme
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const updateMode = () => setColorMode(mediaQuery.matches ? 'dark' : 'light');
        updateMode();
        mediaQuery.addEventListener('change', updateMode);
        return () => mediaQuery.removeEventListener('change', updateMode);
    }, []);

    // Update editor editable state based on readOnly and editorMode
    useEffect(() => {
        if (editor) {
            editor.setEditable(!readOnly && editorMode === 'wysiwyg');
        }
    }, [readOnly, editorMode, editor]);

    // --- Definition Management Logic (Copied from MarkdownPostEditor, needs adjustment) ---
    const handleAddDefinition = useCallback(() => {
        if (newTerm && newDefinition) {
            const newId = `term-${Date.now()}`; // Simple ID generation
            const newDefinitionData: DefinitionData = { id: newId, term: newTerm, definition: newDefinition, source: newSource };
            setDefinitions(prev => [...prev, newDefinitionData]);
            setNewTerm(''); setNewDefinition(''); setNewSource('');
        }
    }, [newTerm, newDefinition, newSource]);

    const handleRemoveDefinition = useCallback((id: string) => {
        setDefinitions(prev => prev.filter(def => def.id !== id));
    }, []);

    const handleUpdateDefinition = useCallback((id: string, updatedDef: Partial<DefinitionData>) => {
        setDefinitions(prev => prev.map(def => def.id === id ? { ...def, ...updatedDef } : def));
    }, []);
    // --- End Definition Management Logic ---

    const handleToggleMode = () => {
        if (readOnly) return;
        if (editorMode === 'wysiwyg') {
            // Switching to Markdown: Ensure markdownValue is up-to-date
            const html = editor?.getHTML() || '';
            const currentMarkdown = turndownService.turndown(html);
            setMarkdownValue(currentMarkdown);
            setEditorMode('markdown');
        } else {
            // Switching to WYSIWYG: Update editor content from markdownValue
            const newHtml = convertMarkdownToHtml(markdownValue);
            editor?.commands.setContent(newHtml, false); // Don't emit update
            setEditorMode('wysiwyg');
        }
    };

    const handleMarkdownChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!readOnly) {
            const newMarkdown = event.target.value;
            setMarkdownValue(newMarkdown);
            if (onChange) {
                onChange(newMarkdown);
            }
        }
    };

    const handleSaveClick = () => {
        if (!readOnly && onSave) {
            let finalMarkdown = markdownValue;
            // If currently in WYSIWYG mode, ensure markdown is derived from latest editor state
            if (editorMode === 'wysiwyg') {
                 finalMarkdown = turndownService.turndown(editor?.getHTML() || '');
            }
            onSave(finalMarkdown, definitions);
        }
    };

    return (
        <div className={`tiptap-editor-container ${readOnly ? 'opacity-80' : ''}`} data-color-mode={colorMode}>
            <div className="flex justify-end mb-2">
                <button
                    onClick={handleToggleMode}
                    disabled={readOnly}
                    className="px-3 py-1 border rounded text-sm mr-2 disabled:opacity-50"
                >
                    {editorMode === 'wysiwyg' ? 'Show Markdown' : 'Show Editor'}
                </button>
                {!readOnly && (
                     <button
                        onClick={handleSaveClick}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                        Save Post
                    </button>
                )}
            </div>

            {editorMode === 'wysiwyg' ? (
                <div className="border rounded p-2 prose dark:prose-invert max-w-none" style={{ minHeight: height }}>
                     <EditorContent editor={editor} />
                </div>
            ) : (
                <textarea
                    value={markdownValue}
                    onChange={handleMarkdownChange}
                    readOnly={readOnly}
                    className="w-full p-2 border rounded font-mono text-sm bg-gray-50 dark:bg-gray-800 dark:text-gray-200"
                    style={{ minHeight: height }}
                    placeholder="Enter Markdown content..."
                />
            )}

            {/* --- Definition Management Panel --- */}
            {!readOnly && (
                <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Manage Definitions</h3>
                    {/* Existing Definitions List */}
                    {definitions.map(def => (
                        <div key={def.id} className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600">
                            <input
                                type="text" value={def.term}
                                onChange={e => handleUpdateDefinition(def.id, { term: e.target.value })}
                                placeholder="Term"
                                className="w-full p-1 border rounded dark:bg-gray-700 dark:text-white mb-1 text-sm"
                            />
                            <textarea
                                value={def.definition}
                                onChange={e => handleUpdateDefinition(def.id, { definition: e.target.value })}
                                placeholder="Definition" rows={2}
                                className="w-full p-1 border rounded dark:bg-gray-700 dark:text-white mb-1 text-sm"
                            />
                            <input
                                type="text" value={def.source || ''}
                                onChange={e => handleUpdateDefinition(def.id, { source: e.target.value })}
                                placeholder="Source (optional)"
                                className="w-full p-1 border rounded dark:bg-gray-700 dark:text-white mb-1 text-sm"
                            />
                            <button
                                onClick={() => handleRemoveDefinition(def.id)}
                                className="text-red-500 hover:text-red-700 text-xs"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                    {/* Add New Definition Form */}
                    <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
                         <h4 className="text-md font-semibold mb-2 text-gray-800 dark:text-gray-200">Add New Definition</h4>
                         <input
                            type="text" value={newTerm} onChange={e => setNewTerm(e.target.value)}
                            placeholder="New Term"
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white mb-2"
                         />
                         <textarea
                            id="new-definition-input" // Add ID for potential focus
                            value={newDefinition} onChange={e => setNewDefinition(e.target.value)}
                            placeholder="New Definition" rows={3}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white mb-2"
                         />
                         <input
                            type="text" value={newSource} onChange={e => setNewSource(e.target.value)}
                            placeholder="Source (optional)"
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white mb-2"
                         />
                         <button
                            onClick={handleAddDefinition}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                         >
                            Add Definition
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TipTapEditor;
