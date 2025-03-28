import { Node, mergeAttributes, nodeInputRule } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import TermNodeView from './TermNodeView'; // We'll create this React component next

export interface TermNodeOptions {
  HTMLAttributes: Record<string, any>;
}

// Regex to potentially match [[term]] syntax for input rules (optional)
// const inputRegex = /\[\[([a-zA-Z0-9\s_-]+)\]\]$/;

const TermNode = Node.create<TermNodeOptions>({
  name: 'termNode',
  group: 'inline',
  inline: true,
  atom: true, // Makes it behave like a single unit, prevents cursor inside

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'term-node-span', // Add a class for styling
      },
    };
  },

  addAttributes() {
    return {
      termId: {
        default: null,
        parseHTML: element => element.getAttribute('data-term-id'),
        renderHTML: attributes => ({ 'data-term-id': attributes.termId }),
      },
      termName: {
        default: 'term',
        parseHTML: element => element.getAttribute('data-term-name') || element.innerText,
        renderHTML: attributes => ({ 'data-term-name': attributes.termName }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-term-id]', // Parse from spans with data-term-id
      },
       // Also parse from the <Term> component structure if needed for MD -> HTML
       {
         tag: 'Term', // Assuming <Term> component renders something parseable or we adjust MD->HTML
         getAttrs: node => {
            if (typeof node === 'string') return false; // Cannot parse from string
            return {
                termId: node.getAttribute('id'),
                // termName might need to be inferred or handled differently
                // For now, let's rely on data attributes primarily
            };
         }
       }
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    // Render as a span with data attributes. The actual text content comes from the React view.
    return [
        'span',
        mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
        // Content is handled by ReactNodeViewRenderer
    ];
  },

  addNodeView() {
    // Use a React component to render the node's appearance
    return ReactNodeViewRenderer(TermNodeView);
  },

  // Optional: Input rule to automatically create a node when typing [[term]]
  // addInputRules() {
  //   return [
  //     nodeInputRule({
  //       find: inputRegex,
  //       type: this.type,
  //       getAttributes: match => {
  //         return { termName: match[1] }; // Initially set name, ID comes later
  //       },
  //     }),
  //   ];
  // },
});

export default TermNode;
