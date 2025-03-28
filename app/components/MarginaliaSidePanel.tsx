'use client';

import React, { useState, useEffect, useRef } from 'react';

export interface MarginaliaNote {
  id: string;
  content: React.ReactNode;
}

interface MarginaliaSidePanelProps {
  notes: MarginaliaNote[];
  activeNoteId?: string | null; // ID of the note activated from the main text
  onNoteActivate?: (id: string | null) => void; // Optional: To sync state upwards if needed
}

const MarginaliaSidePanel: React.FC<MarginaliaSidePanelProps> = ({
  notes,
  activeNoteId,
  onNoteActivate,
}) => {
  // Removed expandedNoteId state
  const panelRef = useRef<HTMLDivElement>(null);
  const noteRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Effect to handle activation from the main text (Term component) - Simplified
  useEffect(() => {
    if (activeNoteId) {
      // Removed setExpandedNoteId(activeNoteId);
      const noteElement = noteRefs.current[activeNoteId];
      if (noteElement && panelRef.current) {
        // Scroll the note into view within the panel
        const panelRect = panelRef.current.getBoundingClientRect();
        const noteRect = noteElement.getBoundingClientRect();

        // Check if the note is fully or partially outside the panel's viewport
        if (noteRect.top < panelRect.top || noteRect.bottom > panelRect.bottom) {
          noteElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center', // Adjust block alignment as needed ('start', 'center', 'end')
          });
        }

        // Optional: Add a temporary highlight
        noteElement.classList.add('highlighted-note');
        const timer = setTimeout(() => {
          noteElement.classList.remove('highlighted-note');
          // Reset activeNoteId via callback if provided, to allow re-triggering
          // Keep this reset logic if needed for re-highlighting
          if (onNoteActivate) onNoteActivate(null);
        }, 1500);
        return () => clearTimeout(timer);
      } else {
         // Reset if the note element isn't found
         if (onNoteActivate) onNoteActivate(null);
      }
    }
    // Only depend on activeNoteId and onNoteActivate
  }, [activeNoteId, onNoteActivate]);

  // Removed handleNoteClick function

  if (!notes || notes.length === 0) {
    return null; // Don't render the panel if there are no notes
  }

  return (
    <div
      ref={panelRef}
      className="marginalia-side-panel p-4 border-l border-gray-200 overflow-y-auto" // Add basic styling
      style={{ maxHeight: 'calc(100vh - 4rem)' }} // Example max height, adjust as needed
    >
      <h3 className="text-lg font-semibold mb-4">Notes</h3>
      <ul className="space-y-4">
        {notes.map((note) => (
          <li key={note.id}>
            <div
              ref={(el) => { noteRefs.current[note.id] = el; }} // Corrected ref assignment
              id={note.id} // Match the ID for direct linking/scrolling
              tabIndex={-1} // Make it programmatically focusable for highlighting
              // Removed background change based on expansion
              className="note-container border border-gray-300 rounded p-3 transition-all duration-300 ease-in-out"
            >
              {/* Removed button wrapper */}
              <div className="font-medium mb-2"> {/* Simple header */}
                Note {note.id} {/* Or use a more descriptive title if available */}
              </div>
              {/* Removed collapsible div wrapper and classes */}
              <div id={`note-content-${note.id}`} className="mt-2">
                <div className="prose prose-sm max-w-none"> {/* Apply some basic prose styling */}
                  {note.content}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {/* Basic CSS for highlighting */}
      <style jsx global>{`
        .highlighted-note {
          transition: background-color 0.3s ease-in-out;
          background-color: #ffffcc !important; /* Light yellow highlight */
        }
        .marginalia-side-panel {
          /* Add more specific styles here */
        }
        .note-container {
          /* Styles for individual note containers */
        }
        /* Ensure max-height transition works */
        .transition-max-height {
           transition-property: max-height;
        }
      `}</style>
    </div>
  );
};

export default MarginaliaSidePanel;
