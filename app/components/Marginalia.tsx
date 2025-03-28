import React from 'react';

interface MarginaliaProps {
  children: React.ReactNode;
  id: string; // Unique identifier to link with Term component
}

/**
 * Represents a marginalia note within MDX content.
 * This component does not render anything directly in the main flow.
 * Its children and id are intended to be extracted and displayed elsewhere (e.g., a side panel).
 */
const Marginalia: React.FC<MarginaliaProps> = ({ children, id }) => {
  // This component doesn't render anything inline.
  // It serves as a data container for the MDX processing step.
  return null;
};

export default Marginalia;
