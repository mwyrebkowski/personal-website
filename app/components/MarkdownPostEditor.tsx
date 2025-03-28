'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import rehypeSanitize from 'rehype-sanitize';
import { DefinitionData } from './SidePanelDefinition';

// Dynamically import MDEditor
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

// Simple placeholder component for Term in the MDEditor preview
interface TermPreviewProps {
    children: React.ReactNode;
    id?: string;
}

const TermPreview: React.FC<TermPreviewProps> = ({ children, id }) => {
    return (
        <span
            className="font-semibold text-blue-600 dark:text-blue-400 border-b border-dotted border-blue-500 cursor-help"
            title={`Preview: Term ID='${id || 'MISSING'}'`}
        >
            {children}
        </span>
    );
};

interface MarkdownPostEditorProps {
    initialValue?: string;
    onChange?: (value: string) => void;
    onSave?: (value: string, definitions: DefinitionData[]) => void;
    height?: number;
    readOnly?: boolean;
    initialDefinitions: DefinitionData[];
}

const MarkdownPostEditor: React.FC<MarkdownPostEditorProps> = ({
    initialValue = '',
    onChange,
    onSave,
    height = 600,
    readOnly = false,
    initialDefinitions,
}) => {
    const [value, setValue] = useState<string | undefined>(initialValue);
    const [colorMode, setColorMode] = useState<'light' | 'dark'>('light');
    const [definitions, setDefinitions] = useState<DefinitionData[]>(initialDefinitions);
    const [newTerm, setNewTerm] = useState('');
    const [newDefinition, setNewDefinition] = useState('');
    const [newSource, setNewSource] = useState('');

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const updateMode = () => setColorMode(mediaQuery.matches ? 'dark' : 'light');
        updateMode();
        mediaQuery.addEventListener('change', updateMode);
        return () => {
            mediaQuery.removeEventListener('change', updateMode);
        };
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
            onSave(value, definitions);
        }
    };

    const handleAddDefinition = useCallback(() => {
        if (newTerm && newDefinition) {
            const newId = `term-${Date.now()}`;
            const newDefinitionData: DefinitionData = {
                id: newId,
                term: newTerm,
                definition: newDefinition,
                source: newSource
            };
            setDefinitions([...definitions, newDefinitionData]);
            setNewTerm('');
            setNewDefinition('');
            setNewSource('');
        }
    }, [definitions, newTerm, newDefinition, newSource]);

    const handleRemoveDefinition = useCallback((id: string) => {
        const updatedDefinitions = definitions.filter(def => def.id !== id);
        setDefinitions(updatedDefinitions);
    }, [definitions]);

    const handleUpdateDefinition = useCallback((id: string, updatedDef: Partial<DefinitionData>) => {
        const updatedDefinitions = definitions.map(def =>
            def.id === id ? { ...def, ...updatedDef } : def
        );
        setDefinitions(updatedDefinitions);
    }, [definitions]);

    return (
        <div className={`markdown-editor-container ${readOnly ? 'pointer-events-none opacity-80' : ''}`}>
            <div data-color-mode={colorMode}>
                <MDEditor
                    value={value}
                    onChange={handleEditorChange}
                    height={height}
                    preview={readOnly ? "preview" : "live"}
                    previewOptions={{
                        rehypePlugins: [[rehypeSanitize]],
                        components: { 'Term': TermPreview } as any
                    }}
                    hideToolbar={readOnly}
                    visibleDragbar={!readOnly}
                    textareaProps={readOnly ? { disabled: true } : {}}

                />
            </div>
            {!readOnly && (
                <div className="mt-4">
                    <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Manage Definitions</h3>

                        {definitions.map(def => (
                            <div key={def.id} className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600">
                                <input
                                    type="text"
                                    value={def.term}
                                    onChange={e => handleUpdateDefinition(def.id, { term: e.target.value })}
                                    placeholder="Term"
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white mb-2"
                                />
                                <textarea
                                    value={def.definition}
                                    onChange={e => handleUpdateDefinition(def.id, { definition: e.target.value })}
                                    placeholder="Definition"
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white mb-2"
                                />
                                <input
                                    type="text"
                                    value={def.source || ''}
                                    onChange={e => handleUpdateDefinition(def.id, { source: e.target.value })}
                                    placeholder="Source (optional)"
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white mb-2"
                                />
                                <button
                                    onClick={() => handleRemoveDefinition(def.id)}
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}

                        <h4 className="text-md font-semibold mt-4 text-gray-800 dark:text-gray-200">Add New Definition</h4>
                        <input
                            type="text"
                            value={newTerm}
                            onChange={e => setNewTerm(e.target.value)}
                            placeholder="New Term"
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white mb-2"
                        />
                        <textarea
                            value={newDefinition}
                            onChange={e => setNewDefinition(e.target.value)}
                            placeholder="New Definition"
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white mb-2"
                        />
                        <input
                            type="text"
                            value={newSource}
                            onChange={e => setNewSource(e.target.value)}
                            placeholder="Source (optional)"
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white mb-2"
                        />
                        <button
                            onClick={handleAddDefinition}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Add Definition
                        </button>
                    </div>
                    <div className="mt-4 text-right">
                        <button
                            onClick={handleSaveClick}
                            className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950 transition-colors"
                        >
                            Save Post
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarkdownPostEditor;