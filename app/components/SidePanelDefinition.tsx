'use client';

import React from 'react';
import ExpandableSection from './ExpandableSection';

export interface DefinitionData {
  id: string;
  term: string;
  definition: string;
  source?: string;
}

interface SidePanelDefinitionProps extends DefinitionData {
  forceOpen?: boolean;
  className?: string;
  onToggleClick?: (id: string) => void;
}

// --- CONFIGURATION ---
const ANIMATION_DURATION_CLASS = 'duration-300'; // Matches ExpandableSection
const EASING_CLASS = 'ease-in-out'; // Use consistent easing
const TRANSFORM_TRANSITION_CLASS = `transition-transform ${ANIMATION_DURATION_CLASS} ${EASING_CLASS}`;
const OPACITY_TRANSITION_CLASS = `transition-opacity ${ANIMATION_DURATION_CLASS} ${EASING_CLASS}`;
const WILL_CHANGE_CLASS = 'will-change-transform, will-change-opacity'; // Add opacity
// --- END CONFIGURATION ---


const SidePanelDefinition: React.FC<SidePanelDefinitionProps> = ({
  id,
  term,
  definition,
  source,
  forceOpen,
  className = '',
  onToggleClick,
}) => {

  const handleInternalToggleClick = () => {
    if (onToggleClick) {
      onToggleClick(id);
    }
  };

  return (
    // Apply transitions for transform AND opacity
    <div
      id={`definition-${id}`}
      className={`definition-block absolute left-0 right-0 ${TRANSFORM_TRANSITION_CLASS} ${OPACITY_TRANSITION_CLASS} ${WILL_CHANGE_CLASS} ${className}`}
      // Start hidden AND transparent
      style={{ visibility: 'hidden', opacity: 0 }}
    >
      {/* Inner card styling remains the same */}
      <div className="mb-4 shadow-sm rounded-md border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800 overflow-hidden">
        <ExpandableSection
          title={term}
          forceOpen={forceOpen}
          onToggleClick={handleInternalToggleClick}
        >
          {definition}
          {source && (
            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-600 text-xs text-slate-500 dark:text-slate-400">
              Source: {source}
            </div>
          )}
        </ExpandableSection>
      </div>
    </div>
  );
};

export default SidePanelDefinition;