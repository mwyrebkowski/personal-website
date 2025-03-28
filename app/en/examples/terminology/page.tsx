import React from 'react';
import TerminologyExample from '../../../components/TerminologyExample';

export default function TerminologyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-slate-900 dark:text-white text-center">
          Expandable Definitions Example
        </h1>
        
        <div className="mb-8 text-center">
          <p className="text-slate-600 dark:text-slate-400">
            Hover over highlighted terms to see their expanded definitions.
          </p>
        </div>
        
        <TerminologyExample />
      </div>
    </div>
  );
} 