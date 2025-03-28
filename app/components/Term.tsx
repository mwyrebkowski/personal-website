'use client';

import React from 'react';

interface TermProps {
  id: string; 
  children: React.ReactNode;
  definition: string;
  source?: string;
}

/**
 * Term component for side panel definitions.
 * This is a client component that allows for interaction with the 
 * side panel definitions.
 */
const Term: React.FC<TermProps> = ({ id, children, definition, source }) => {
  // Ensure id is safe for DOM - IMPORTANT for querySelector
  const safeId = id ? id.replace(/[^a-zA-Z0-9-_]/g, '-') : 'invalid-term-id';
  
  return (
    <span
      id={`term-${safeId}`}
      data-term-id={safeId}
      data-term-definition={definition} // Embed definition as data attribute
      data-term-source={source || ''} // Embed source, default to empty string if undefined
      className="term-anchor text-blue-600 dark:text-blue-400 border-b border-dotted border-blue-500 hover:border-solid hover:border-blue-600 dark:hover:border-blue-400 cursor-pointer transition-colors duration-150"
      title={definition} // Basic browser tooltip
    >
      {children}
    </span>
  );
};

export default Term;