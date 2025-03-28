"use client";

import React, { useState } from 'react';

interface SidenoteProps {
  id: string;
  children: React.ReactNode;
}

const Sidenote: React.FC<SidenoteProps> = ({ id, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span className="sidenote-reference relative group">
      <sup
        id={`ref-${id}`}
        className="text-blue-600 dark:text-blue-400 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
        aria-describedby={`sidenote-${id}`}
      >
        [{id}]
      </sup>
      <span
        id={`sidenote-${id}`}
        className={`
          absolute invisible opacity-0 z-10 bg-white dark:bg-slate-800 shadow-lg rounded p-4 
          text-sm text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700
          transition-opacity duration-200 max-w-xs transform -translate-y-full top-0 left-0
          group-hover:opacity-100 group-hover:visible
          md:group-hover:opacity-0 md:group-hover:invisible
          ${isOpen ? 'md:opacity-100 md:visible' : 'md:opacity-0 md:invisible'}
        `}
        role="tooltip"
      >
        {children}
      </span>
    </span>
  );
};

export default Sidenote; 