"use client";

import React, { useState } from 'react';

interface ExpandableDefinitionProps {
  term: string;
  children: React.ReactNode;
  className?: string;
}

const ExpandableDefinition: React.FC<ExpandableDefinitionProps> = ({ 
  term, 
  children,
  className = ""
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <span 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="text-blue-600 dark:text-blue-400 border-b border-dotted border-blue-400 cursor-help">
        {term}
      </span>
      
      <div 
        className={`
          absolute z-50 left-0 bottom-full mb-2
          bg-white dark:bg-slate-800 
          shadow-xl rounded-md p-4 
          border border-slate-200 dark:border-slate-700
          max-w-sm w-max min-w-[200px]
          transition-all duration-200 origin-bottom-left
          ${isHovered 
            ? 'opacity-100 visible scale-100 translate-y-0' 
            : 'opacity-0 invisible scale-95 translate-y-2'
          }
        `}
      >
        <div className="text-sm text-slate-700 dark:text-slate-300 prose prose-sm dark:prose-invert">
          {children}
        </div>
        <div className="absolute w-3 h-3 bg-white dark:bg-slate-800 border-b border-r border-slate-200 dark:border-slate-700 transform rotate-45 -bottom-1.5 left-5"></div>
      </div>
    </span>
  );
};

export default ExpandableDefinition; 