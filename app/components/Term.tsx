'use client';

import React from 'react';

interface TermProps {
  children: React.ReactNode;
  targetId: string;
  // Optional: Callback function to handle term activation (e.g., scrolling/expanding the note)
  onActivate?: (targetId: string) => void;
}

const Term: React.FC<TermProps> = ({ children, targetId, onActivate }) => {
  const handleClick = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.preventDefault(); // Prevent potential default link behavior if wrapped in <a>
    if (onActivate) {
      onActivate(targetId);
    } else {
      // Basic fallback: try scrolling to an element with the ID
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add a temporary highlight or focus effect if desired
        targetElement.focus({ preventScroll: true }); // Needs tabindex="-1" on target
        targetElement.classList.add('highlighted-note'); // Example class
        setTimeout(() => targetElement.classList.remove('highlighted-note'), 1500);
      }
    }
  };

  return (
    <span
      onClick={handleClick}
      style={{
        cursor: 'pointer',
        textDecoration: 'underline', // Basic styling, customize as needed
        textDecorationStyle: 'dotted',
        color: 'blue', // Example color
      }}
      role="button" // Improve accessibility
      aria-describedby={targetId} // Link to the note semantically
      tabIndex={0} // Make it focusable
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(e as any); }} // Allow activation with keyboard
      data-term-id={targetId} // Add this attribute for positioning logic
    >
      {children}
    </span>
  );
};

export default Term;
