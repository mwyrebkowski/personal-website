import React from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';

const TermNodeView: React.FC<NodeViewProps> = ({ node, editor, getPos, deleteNode }) => {
  const { termId, termName } = node.attrs;
  const isEditable = editor.isEditable;

  const handleClick = () => {
    if (!isEditable) return;
    // Optional: Add behavior when clicking the node in edit mode,
    // e.g., open a small popup to edit the term or definition link.
    console.log(`Clicked term node: ID=${termId}, Name=${termName}`);
  };

  // Basic styling for the term node - resembles a link or chip
  const style: React.CSSProperties = {
    display: 'inline-block',
    padding: '0.1em 0.4em',
    margin: '0 0.1em',
    borderRadius: '4px',
    backgroundColor: 'rgba(0, 100, 255, 0.1)', // Light blue background
    color: 'rgb(0, 80, 200)', // Darker blue text
    border: '1px solid rgba(0, 100, 255, 0.3)',
    cursor: isEditable ? 'pointer' : 'default',
    whiteSpace: 'nowrap',
  };

  return (
    <NodeViewWrapper
        as="span"
        style={style}
        onClick={handleClick}
        // Make it draggable/selectable as a unit
        draggable="true"
        data-drag-handle
    >
      {/* Display the term name */}
      {termName || 'term'}
      {/* Optionally show the ID for debugging */}
      {/* {termId && <span style={{ fontSize: '0.7em', marginLeft: '4px', opacity: 0.5 }}>({termId})</span>} */}
    </NodeViewWrapper>
  );
};

export default TermNodeView;
