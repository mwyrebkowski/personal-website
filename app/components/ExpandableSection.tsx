"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChevronRightIcon } from '@heroicons/react/20/solid';

interface ExpandableSectionProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  forceOpen?: boolean;
  titleClassName?: string;
  contentClassName?: string;
  onToggleClick?: () => void;
}

const ANIMATION_DURATION_CLASS = 'duration-300'; // Slightly longer for ease-in-out
const ANIMATION_DURATION_MS = 300;
const EASING_CLASS = 'ease-in-out'; // Gentler start/end

const ExpandableSection: React.FC<ExpandableSectionProps> = ({
  title,
  children,
  defaultOpen = false,
  className = "",
  forceOpen,
  titleClassName = "",
  contentClassName = "",
  onToggleClick,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState<string>('0px');
  const initialRenderRef = useRef(true);

  useEffect(() => {
    if (forceOpen !== undefined) {
      setIsOpen(forceOpen);
    }
  }, [forceOpen]);

  useEffect(() => {
    if (defaultOpen || forceOpen) {
        setMaxHeight('none');
    } else {
        setMaxHeight('0px');
    }
    const timer = setTimeout(() => {
        initialRenderRef.current = false;
    }, 0);
    return () => clearTimeout(timer);
  }, [defaultOpen, forceOpen]);


  useEffect(() => {
    if (initialRenderRef.current) return;

    if (isOpen) {
      if (contentRef.current) {
        const scrollHeight = contentRef.current.scrollHeight;
        setMaxHeight(`${scrollHeight}px`);
        const timer = setTimeout(() => {
             if (contentRef.current && isOpen) {
                 setMaxHeight('none');
             }
        }, ANIMATION_DURATION_MS + 50);

        return () => clearTimeout(timer);
      } else {
        setMaxHeight('none');
      }
    } else {
      if (contentRef.current) {
        const scrollHeight = contentRef.current.scrollHeight;
        setMaxHeight(`${scrollHeight}px`);
        requestAnimationFrame(() => {
          setMaxHeight('0px');
        });
      } else {
        setMaxHeight('0px');
      }
    }
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (forceOpen !== undefined && onToggleClick) {
      onToggleClick();
    } else if (forceOpen === undefined) {
      setIsOpen(prev => !prev);
    }
  };

  return (
    <div className={`expandable-section ${className}`}>
      {/* Button styling remains the same */}
      <button
        onClick={handleToggle}
        aria-expanded={isOpen}
        className={`flex items-center w-full text-left py-2 px-3 font-medium rounded-t-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-opacity-75 transition-colors duration-150 ease-in-out ${
          isOpen
            ? 'bg-slate-100 dark:bg-slate-700/50 text-slate-800 dark:text-slate-100'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
        } ${titleClassName}`}
      >
        <span className={`transform transition-transform duration-200 mr-2 ${isOpen ? 'rotate-90' : 'rotate-0'}`}>
           <ChevronRightIcon className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
        </span>
        <span className="flex-1">{title}</span>
      </button>

      {/* Wrapper div for max-height animation */}
      <div
        ref={contentRef}
        style={{ maxHeight }}
        // Apply max-height transition with new easing
        className={`overflow-hidden transition-max-height ${EASING_CLASS} ${ANIMATION_DURATION_CLASS} ${contentClassName}`}
      >
        {/* Inner div for content, border, padding, AND opacity transition */}
        <div
          className={`border border-t-0 border-slate-200 dark:border-slate-700/50 rounded-b-md bg-white dark:bg-slate-800/50 transition-opacity ${EASING_CLASS} ${ANIMATION_DURATION_CLASS} ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        >
           {/* Content Padding and Prose styles */}
           <div className="px-3 pb-3 pt-2 prose prose-sm dark:prose-invert text-slate-700 dark:text-slate-300 max-w-none">
            {children}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ExpandableSection;