import { ReactRenderer } from '@tiptap/react';
import Suggestion, { SuggestionOptions, SuggestionProps } from '@tiptap/suggestion';
import tippy, { Instance, Props } from 'tippy.js';
import SuggestionList from './SuggestionList'; // React component for the dropdown
import { DefinitionData } from '../SidePanelDefinition'; // Import definition type
import { Editor, Range } from '@tiptap/core'; // Import Editor and Range types

// Define the type for items in the suggestion list
export interface SuggestionItem extends DefinitionData {
    // Add any additional properties needed for rendering or selection
}

// Define the type for the render function's return value
interface SuggestionRender {
  onStart?: (props: SuggestionProps<SuggestionItem>) => void;
  onUpdate?: (props: SuggestionProps<SuggestionItem>) => void;
  onExit?: () => void;
  onKeyDown?: (props: { event: KeyboardEvent }) => boolean;
}

// Augment SuggestionOptions type to include our custom props
export type TermSuggestionOptions = Omit<SuggestionOptions<SuggestionItem>, 'render'> & {
    definitions: DefinitionData[];
    onRequestNewDefinition: (termName: string) => void;
    render: () => SuggestionRender;
}

const TermSuggestion = Suggestion.create<TermSuggestionOptions>({
  name: 'termSuggestion',

  // Default options can be overridden via configure()
  addOptions() {
    return {
      ...this.parent?.(), // Inherit default suggestion options
      char: '[[', // Trigger character sequence
      allowSpaces: true, // Allow spaces within the [[query]]
      startOfLine: false, // Can trigger anywhere
      definitions: [], // Will be provided via configure()
      onRequestNewDefinition: (termName: string) => { console.warn('onRequestNewDefinition not configured'); }, // Placeholder

      // Command executed when an item is selected
      command: ({ editor, range, props }: { editor: Editor, range: Range, props: SuggestionItem }) => {
        const { id, term } = props; // props is the selected SuggestionItem

        // Handle "Create new" selection
        if (id === 'CREATE_NEW') {
            // Get the query text that triggered the suggestion
            // Adjust range to capture text between [[ and ]]
            const queryRange = { from: range.from - 2, to: range.to };
            const query = editor.state.doc.textBetween(queryRange.from, queryRange.to);
            const actualTerm = query.substring(2, query.length - 2); // Extract term from [[term]]

            // Call the callback provided in options
            // Add type for ext parameter in find()
            const options = (editor.extensionManager.extensions.find((ext: any) => ext.name === 'termSuggestion') as any)?.options as TermSuggestionOptions;
            if (options?.onRequestNewDefinition) {
                options.onRequestNewDefinition(actualTerm); // Pass the extracted term name
            } else {
                 console.warn('onRequestNewDefinition callback not available in TermSuggestion options');
            }
            // Delete the trigger text [[query]]
            editor.chain().focus().deleteRange(queryRange).run();
        } else {
            // Insert the TermNode with the selected term's data
            editor
              .chain()
              .focus()
              // Replace the trigger [[query]] with the TermNode
              .insertContentAt(range, [
                {
                  type: 'termNode', // Name of our custom node
                  attrs: { termId: id, termName: term },
                },
                { // Add a space after insertion
                  type: 'text',
                  text: ' ',
                },
              ])
              .run();
        }
      },

      // Items to show in the suggestion list
      items: ({ query, options }: { query: string, options: TermSuggestionOptions }) => {
        const definitions = options.definitions || [];
        const filtered = definitions
          .filter((item: SuggestionItem) => // Add type
            item.term.toLowerCase().startsWith(query.toLowerCase())
          )
          .slice(0, 10); // Limit results

        // Add "Create new" option if query is not empty and doesn't exactly match
        const exactMatch = definitions.some((item: SuggestionItem) => item.term.toLowerCase() === query.toLowerCase()); // Add type
        if (query.length > 0 && !exactMatch) {
            // Use a special ID or marker for the "create new" item
            return [
                ...filtered,
                { id: 'CREATE_NEW', term: `Create "${query}"...`, definition: '', source: '' } as SuggestionItem
            ];
        }

        return filtered;
      },

      // Render function for the suggestion popup
      render: (): SuggestionRender => {
        let component: ReactRenderer<any, SuggestionProps<SuggestionItem>>;
        let popup: Instance<Props>[]; // Tippy instance

        return {
          onStart: (props) => {
            component = new ReactRenderer(SuggestionList, {
              props,
              editor: props.editor,
            });

            if (!props.clientRect) {
              return;
            }

            popup = tippy('body', {
              getReferenceClientRect: props.clientRect as any,
              appendTo: () => document.body,
              content: component.element,
              showOnCreate: true,
              interactive: true,
              trigger: 'manual',
              placement: 'bottom-start',
            });
          },

          onUpdate(props) {
            component.updateProps(props);

            if (!props.clientRect) {
              return;
            }

            popup[0].setProps({
              getReferenceClientRect: props.clientRect as any,
            });
          },

          onKeyDown(props) {
            if (props.event.key === 'Escape') {
              popup[0].hide();
              return true;
            }
            // Pass keydown events to the SuggestionList component
            return component.ref?.onKeyDown(props);
          },

          onExit() {
            if (popup && popup[0]) {
                popup[0].destroy();
            }
            if (component) {
                component.destroy();
            }
          },
        };
      },
    };
  },
});

export default TermSuggestion;
