import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { SuggestionProps } from '@tiptap/suggestion';
import { SuggestionItem } from './TermSuggestion'; // Import the item type

interface SuggestionListProps extends SuggestionProps<SuggestionItem> {
  // No additional props needed for now
}

// Destructure props directly in the function signature
const SuggestionList = forwardRef(({ items, query, command, editor }: SuggestionListProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = useCallback((index: number) => {
    const item = items[index]; // Use destructured items

    if (item) {
        if (item.id === 'CREATE_NEW') {
            // Handle "Create new" selection - Trigger callback passed via options
            // We need to access the onRequestNewDefinition callback configured in TermSuggestion options
            // This requires passing it down through the ReactRenderer props somehow, or accessing editor context.
            // For now, let's assume it's available via props.editor.extensionManager.extensions... (complex)
            // Simpler approach: Modify the command in TermSuggestion to handle CREATE_NEW.
            // Let's adjust TermSuggestion later. For now, just call the command.
            console.log("Create new selected:", query); // Use destructured query
            // Ideally: editor.commands.callOnRequestNewDefinition(query);
            command(item); // Use destructured command
        } else {
            command(item); // Use destructured command
        }
    }
  }, [items, query, command]); // Update dependencies

  useEffect(() => setSelectedIndex(0), [items]); // Reset index when items change

  const upHandler = useCallback(() => {
    setSelectedIndex((selectedIndex + items.length - 1) % items.length); // Use destructured items
  }, [selectedIndex, items]);

  const downHandler = useCallback(() => {
    setSelectedIndex((selectedIndex + 1) % items.length); // Use destructured items
  }, [selectedIndex, items]);

  const enterHandler = useCallback(() => {
    selectItem(selectedIndex);
  }, [selectItem, selectedIndex]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }): boolean => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }
      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }
      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }
      return false; // Let TipTap handle other keys
    },
  }));

  // Basic styling for the suggestion list
  const listStyle: React.CSSProperties = {
    padding: '0.2rem',
    background: 'white',
    color: 'black',
    fontSize: '0.9rem',
    borderRadius: '0.5rem',
    boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.05), 0px 10px 20px rgba(0, 0, 0, 0.1)',
    maxHeight: '200px',
    overflowY: 'auto',
  };

  const itemStyle = (index: number): React.CSSProperties => ({
    display: 'block',
    margin: 0,
    width: '100%',
    textAlign: 'left',
    background: index === selectedIndex ? '#a9d5ff' : 'transparent', // Highlight selected
    borderRadius: '0.25rem',
    padding: '0.2rem 0.4rem',
    cursor: 'pointer',
  });

  return items.length > 0 ? ( // Use destructured items
    <div style={listStyle}>
      {items.map((item: SuggestionItem, index: number) => ( // Add types here
        <button
          style={itemStyle(index)}
          key={item.id || index} // Use ID if available
          onClick={() => selectItem(index)}
        >
          {item.term}
        </button>
      ))}
    </div>
  ) : null; // Don't render if no items
});

SuggestionList.displayName = 'SuggestionList';

export default SuggestionList;
