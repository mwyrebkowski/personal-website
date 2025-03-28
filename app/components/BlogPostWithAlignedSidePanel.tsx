'use client'; // Needs client-side hooks and DOM interaction

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { throttle, debounce } from 'lodash';

// Import necessary component types and components
import SidePanelDefinition, { DefinitionData } from './SidePanelDefinition'; // Used for rendering notes
// Removed unused MarginaliaNote import

// Helper function to find the closest ancestor term element
const findClosestTermMarker = (element: HTMLElement | null): HTMLElement | null => {
    while (element) {
        if (element.matches && element.matches('span[data-term-id]')) { // Use data-term-id
            return element;
        }
        element = element.parentElement;
    }
    return null;
};

// --- Timing & Animation Configuration ---
const EVENT_THROTTLE_MS = 60;
const POSITION_DEBOUNCE_MS = 60;
const OBSERVER_DEBOUNCE_MS = 80;
const SCROLL_INTO_VIEW_OFFSET = 100;
const STAGGER_DELAY_MS = 40;
// --- End Configuration ---

// Updated Props interface to match BlogPostClientView
export interface BlogPostWithAlignedSidePanelProps {
    title: string;
    date: string;
    lang: 'en' | 'pl';
    mainContent: React.ReactNode;
    definitions: DefinitionData[]; // Changed from marginaliaNotes
    activeDefinitionId: string | null; // Changed from activeMarginaliaId
    onDefinitionActivate: (id: string | null) => void; // Changed from onMarginaliaActivate
}

const BlogPostWithAlignedSidePanel: React.FC<BlogPostWithAlignedSidePanelProps> = ({
    title,
    date,
    mainContent,
    definitions, // Changed from marginaliaNotes
    activeDefinitionId, // Changed from activeMarginaliaId
    onDefinitionActivate, // Changed from onMarginaliaActivate
    lang,
}) => {
    // Refs for DOM elements
    const mainContentRef = useRef<HTMLDivElement>(null);
    const sidePanelRef = useRef<HTMLDivElement>(null);
    const sidePanelInnerRef = useRef<HTMLDivElement>(null);

    // State variables
    const [isClient, setIsClient] = useState(false);
    const [sidePanelMinHeight, setSidePanelMinHeight] = useState<number | string>('auto');

    // Refs for managing logic state
    const resizeObserverRef = useRef<ResizeObserver | null>(null);
    const lastToggledIdRef = useRef<string | null>(null); // Tracks the most recently user-toggled definition ID for staggering

    // Set isClient flag on component mount
    useEffect(() => {
        setIsClient(true);
    }, []);

    // --- Definition Positioning Logic ---
    const positionDefinitions = useCallback(() => {
        if (!isClient || !mainContentRef.current || !sidePanelInnerRef.current || typeof window === 'undefined') {
            return;
        }

        const sidePanelInnerRect = sidePanelInnerRef.current.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const sidePanelTopOffset = sidePanelInnerRect.top + scrollTop;

        let cumulativeOffset = 0;
        let maxRequiredHeight = 0;
        const definitionMarginBottom = 16; // Matches mb-4 class on SidePanelDefinition's inner div

        let staggerIndex = 0;
        let foundToggled = !lastToggledIdRef.current;

        // Iterate through definitions
        definitions.forEach((defData) => { // Changed from note to defData
            // Find the marker span using data-term-id
            const termElement = mainContentRef.current?.querySelector<HTMLElement>(`span[data-term-id="${defData.id}"]`); // Use defData.id
            // Find the definition element using definition-${id} convention
            const definitionElement = document.getElementById(`definition-${defData.id}`); // Use defData.id

            if (termElement && definitionElement) {
                const termRect = termElement.getBoundingClientRect();
                const termTopAbsolute = termRect.top + scrollTop;
                let targetTop = termTopAbsolute - sidePanelTopOffset;
                targetTop = Math.max(targetTop, cumulativeOffset);

                let delay = 0;
                if (foundToggled && staggerIndex > 0) {
                    delay = staggerIndex * STAGGER_DELAY_MS;
                }

                definitionElement.style.position = 'absolute';
                definitionElement.style.transform = `translateY(${targetTop}px)`;
                definitionElement.style.left = '0';
                definitionElement.style.right = '0';
                definitionElement.style.visibility = 'visible';
                definitionElement.style.opacity = '1';
                definitionElement.style.transitionDelay = `${delay}ms`;

                if (foundToggled) {
                    staggerIndex++;
                }
                if (defData.id === lastToggledIdRef.current) { // Use defData.id
                    foundToggled = true;
                }

                const defHeight = definitionElement.offsetHeight;
                cumulativeOffset = targetTop + defHeight + definitionMarginBottom;
                maxRequiredHeight = Math.max(maxRequiredHeight, cumulativeOffset);

            } else if (definitionElement) {
                definitionElement.style.visibility = 'hidden';
                definitionElement.style.opacity = '0';
                definitionElement.style.transform = 'translateY(0px)';
                definitionElement.style.transitionDelay = '0ms';
            }
        });

        lastToggledIdRef.current = null;

        const finalMinHeight = maxRequiredHeight > 0 ? maxRequiredHeight - definitionMarginBottom : 'auto';
        setSidePanelMinHeight(finalMinHeight);

    }, [definitions, isClient]); // Dependencies updated to definitions

    // --- Throttled/Debounced Positioning Functions ---
    const throttledPositionDefinitions = useCallback(
        throttle(positionDefinitions, EVENT_THROTTLE_MS, { leading: false, trailing: true }),
        [positionDefinitions]
    );
    const debouncedPositionDefinitions = useCallback(
        debounce(positionDefinitions, POSITION_DEBOUNCE_MS),
        [positionDefinitions]
    );
    const debouncedObserverCallback = useCallback(
        debounce(positionDefinitions, OBSERVER_DEBOUNCE_MS),
        [positionDefinitions]
    );

    // Effect to set up and clean up observers and event listeners
    useEffect(() => {
        if (!isClient || definitions.length === 0 || !mainContentRef.current || !sidePanelInnerRef.current) { // Use definitions.length
            return;
        }

        const initialPositionTimer = setTimeout(positionDefinitions, 150);

        const observer = new ResizeObserver(() => {
            debouncedObserverCallback();
        });
        observer.observe(mainContentRef.current);
        observer.observe(sidePanelInnerRef.current);
        resizeObserverRef.current = observer;

        window.addEventListener('resize', throttledPositionDefinitions);
        window.addEventListener('scroll', throttledPositionDefinitions, { passive: true });

        return () => {
            clearTimeout(initialPositionTimer);
            if (resizeObserverRef.current) {
                resizeObserverRef.current.disconnect();
            }
            window.removeEventListener('resize', throttledPositionDefinitions);
            window.removeEventListener('scroll', throttledPositionDefinitions);
            throttledPositionDefinitions.cancel();
            debouncedPositionDefinitions.cancel();
            debouncedObserverCallback.cancel();
        };
    }, [isClient, definitions.length, positionDefinitions, debouncedPositionDefinitions, throttledPositionDefinitions, debouncedObserverCallback]); // Use definitions.length

    // --- Click Handling ---

    // Handler for clicks on term markers within the main content
    const handleTermClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        const termElement = findClosestTermMarker(event.target as HTMLElement);
        if (termElement) {
            const termId = termElement.dataset.termId; // Use data-term-id
            if (termId) {
                const newId = activeDefinitionId === termId ? null : termId; // Toggle behavior, use activeDefinitionId
                lastToggledIdRef.current = newId; // Record for staggering logic
                onDefinitionActivate(newId); // Update state in parent component, use onDefinitionActivate
                debouncedPositionDefinitions(); // Trigger repositioning calculation

                // Scroll into view logic (only if opening a new definition)
                if (newId) { // Check if we are activating, not deactivating
                    const definitionElement = document.getElementById(`definition-${termId}`);
                    if (definitionElement && sidePanelRef.current) {
                        // Check if the definition is already reasonably visible
                        const sidePanelRect = sidePanelRef.current.getBoundingClientRect();
                        const definitionRect = definitionElement.getBoundingClientRect();
                        const windowHeight = window.innerHeight;

                        // Define visible area (consider sticky header offset if any)
                        const visibleTop = SCROLL_INTO_VIEW_OFFSET; // Use the offset as the top boundary
                        const visibleBottom = windowHeight - 20; // Small buffer at the bottom

                        const isDefinitionTopVisible = definitionRect.top >= visibleTop;
                        const isDefinitionBottomVisible = definitionRect.bottom <= visibleBottom;
                        const isFullyVisible = isDefinitionTopVisible && isDefinitionBottomVisible;

                        // Also check if it's within the side panel's vertical bounds on screen
                        const isWithinSidePanelBounds = definitionRect.top >= sidePanelRect.top && definitionRect.bottom <= sidePanelRect.bottom;

                        if (!isFullyVisible || !isWithinSidePanelBounds) {
                            const currentScrollY = window.scrollY;
                            // Calculate target scroll position to bring the top of the definition near the offset
                            const targetScrollY = currentScrollY + definitionRect.top - SCROLL_INTO_VIEW_OFFSET;
                            window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
                        }
                    }
                }
            }
        }
    }, [debouncedPositionDefinitions, activeDefinitionId, onDefinitionActivate]); // Dependencies updated

    // Handler for clicks directly on the SidePanelDefinition toggles
    const handleDefinitionToggle = useCallback((toggledId: string) => {
        const newId = activeDefinitionId === toggledId ? null : toggledId; // Toggle behavior, use activeDefinitionId
        lastToggledIdRef.current = newId; // Record for staggering logic
        onDefinitionActivate(newId); // Update state in parent component, use onDefinitionActivate
        debouncedPositionDefinitions(); // Trigger repositioning calculation
    }, [debouncedPositionDefinitions, activeDefinitionId, onDefinitionActivate]); // Dependencies updated

    // --- Render ---
    return (
        <div className="bg-slate-50 dark:bg-gray-950 text-slate-800 dark:text-slate-200 min-h-screen">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">

                {/* Back Link & Header Section (Unchanged) */}
                <div className="max-w-3xl mx-auto lg:max-w-none mb-12 lg:mb-16">
                    <Link
                        href={`/${lang}/blog`}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 inline-flex items-center mb-6 text-sm group"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 transition-transform duration-200 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        {lang === 'en' ? 'Back to all articles' : 'Powrót do artykułów'}
                    </Link>
                    <header>
                        <h1 className="text-4xl sm:text-5xl font-bold mb-3 text-gray-900 dark:text-white !leading-tight tracking-tight">
                            {title}
                        </h1>
                        <time className="text-base text-gray-500 dark:text-gray-400">
                            {date}
                        </time>
                    </header>
                </div>

                {/* Main Content & Side Panel Layout */}
                <div className="flex flex-col lg:flex-row lg:gap-x-12 xl:gap-x-16">

                    {/* Main Content Column - Added ref and onClick */}
                    <div
                        className="lg:w-[60%] xl:w-3/5 order-1 lg:order-1 flex-shrink-0"
                        ref={mainContentRef}
                        onClick={handleTermClick} // Attach click handler here
                    >
                        <article className="prose prose-lg prose-slate max-w-none dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight dark:prose-headings:text-slate-100 prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:underline prose-p:leading-relaxed prose-li:my-1">
                            {mainContent}
                        </article>
                    </div>

                    {/* Side Panel Column (Large Screens Only) - Modified Structure */}
                    {definitions && definitions.length > 0 && ( // Use definitions
                        <aside
                            className="hidden lg:block lg:w-[40%] xl:w-2/5 order-2 lg:order-2 mt-16 lg:mt-0 flex-shrink-0"
                            ref={sidePanelRef} // Add ref to the aside
                        >
                            <div className="sticky top-24"> {/* Sticky container */}
                                <h3 className="text-base font-semibold mb-5 border-b border-slate-200 dark:border-slate-700 pb-2 text-slate-700 dark:text-slate-300 tracking-wide">
                                    {lang === 'en' ? 'Definitions & Notes' : 'Definicje i Notatki'}
                                </h3>
                                {/* Relative container for positioning */}
                                <div
                                    ref={sidePanelInnerRef}
                                    className="relative"
                                    style={{ minHeight: sidePanelMinHeight }} // Apply dynamic min-height
                                >
                                    {/* Render SidePanelDefinition directly using definitions data */}
                                    {definitions.map((defData) => ( // Iterate over definitions
                                        <SidePanelDefinition
                                            key={defData.id}
                                            id={defData.id}
                                            term={defData.term} // Use term from DefinitionData
                                            definition={defData.definition} // Use definition from DefinitionData
                                            source={defData.source}
                                            forceOpen={defData.id === activeDefinitionId} // Use activeDefinitionId
                                            onToggleClick={handleDefinitionToggle} // Pass toggle handler
                                        />
                                    ))}
                                </div>
                            </div>
                        </aside>
                    )}
                </div>

                {/* Removed Small Screens Definitions Section */}
            </div>
        </div>
    );
}

export default BlogPostWithAlignedSidePanel;
