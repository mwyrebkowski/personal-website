'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import SidePanelDefinition, { DefinitionData } from './SidePanelDefinition';
// Using lodash for throttle/debounce - ensure it's installed
import { throttle, debounce } from 'lodash';
import ExpandableSection from './ExpandableSection'; // Used for mobile view

// Helper function to find the closest ancestor term element
const findClosestTermMarker = (element: HTMLElement | null): HTMLElement | null => {
    while (element) {
        // Check if the element itself matches the criteria
        if (element.matches && element.matches('span[data-def-id]')) {
            return element;
        }
        // Move up to the parent element
        element = element.parentElement;
    }
    // No matching ancestor found
    return null;
};

// Props interface for the component
interface BlogPostWithAlignedSidePanelProps {
    title: string;
    date: string;
    lang: 'en' | 'pl';
    mainContent: React.ReactNode; // The main blog content
    definitions: DefinitionData[]; // Array of definitions from frontmatter
}

// --- Timing & Animation Configuration ---
const EVENT_THROTTLE_MS = 60;       // Throttle delay for scroll/resize events (ms)
const POSITION_DEBOUNCE_MS = 60;    // Debounce delay for observer/toggle triggers (ms)
const OBSERVER_DEBOUNCE_MS = 80;    // Separate debounce for ResizeObserver (slightly longer)
const SCROLL_INTO_VIEW_OFFSET = 100;// Pixel offset from top when scrolling definition into view
const STAGGER_DELAY_MS = 40;        // Delay increment for staggered animation (ms)
// --- End Configuration ---

const BlogPostWithAlignedSidePanel: React.FC<BlogPostWithAlignedSidePanelProps> = ({
    title,
    date,
    mainContent,
    definitions, // Definitions passed from server (from frontmatter)
    lang,
}) => {
    // Refs for DOM elements
    const mainContentRef = useRef<HTMLDivElement>(null);
    const sidePanelRef = useRef<HTMLDivElement>(null); // Outer side panel container
    const sidePanelInnerRef = useRef<HTMLDivElement>(null); // Inner relative container for positioning

    // State variables
    const [isClient, setIsClient] = useState(false); // Ensure execution only on client-side
    const [sidePanelMinHeight, setSidePanelMinHeight] = useState<number | string>('auto'); // Dynamic height for side panel
    const [activeDefinitionId, setActiveDefinitionId] = useState<string | null>(null); // Currently focused definition

    // Refs for managing logic state
    const resizeObserverRef = useRef<ResizeObserver | null>(null); // Holds the ResizeObserver instance
    const lastToggledIdRef = useRef<string | null>(null); // Tracks the most recently user-toggled definition ID for staggering

    // Set isClient flag on component mount
    useEffect(() => {
        setIsClient(true);
    }, []);

    // --- Definition Positioning Logic ---
    const positionDefinitions = useCallback(() => {
        // Guard clauses for client-side execution and ref availability
        if (!isClient || !mainContentRef.current || !sidePanelInnerRef.current || typeof window === 'undefined') {
            return;
        }

        // Get necessary measurements
        const sidePanelInnerRect = sidePanelInnerRef.current.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const sidePanelTopOffset = sidePanelInnerRect.top + scrollTop; // Absolute top of the positioning container

        // Variables for layout calculation
        let cumulativeOffset = 0; // Tracks the bottom edge of the last positioned definition
        let maxRequiredHeight = 0; // Tracks the maximum height needed for the container
        const definitionMarginBottom = 16; // Matches mb-4 class

        // Staggering logic variables
        let staggerIndex = 0; // Counter for applying incremental delay
        // Start staggering immediately unless a specific item was just toggled
        let foundToggled = !lastToggledIdRef.current;

        // Iterate through each definition to position it
        definitions.forEach((defData) => {
            // Find the marker span using data-def-id
            const termElement = mainContentRef.current?.querySelector<HTMLElement>(`span[data-def-id="${defData.id}"]`);
            const definitionElement = document.getElementById(`definition-${defData.id}`);

            // Position only if both term and definition elements exist
            if (termElement && definitionElement) {
                const termRect = termElement.getBoundingClientRect();
                const termTopAbsolute = termRect.top + scrollTop; // Absolute top of the term
                let targetTop = termTopAbsolute - sidePanelTopOffset; // Ideal top relative to container
                targetTop = Math.max(targetTop, cumulativeOffset); // Prevent overlap

                // Calculate stagger delay (only applied *after* the toggled element)
                let delay = 0;
                if (foundToggled && staggerIndex > 0) { // Don't delay the first item after toggle
                    delay = staggerIndex * STAGGER_DELAY_MS;
                }

                // Apply styles directly to the definition element
                definitionElement.style.position = 'absolute';
                definitionElement.style.transform = `translateY(${targetTop}px)`; // Use transform for performance
                definitionElement.style.left = '0';
                definitionElement.style.right = '0';
                definitionElement.style.visibility = 'visible'; // Make container visible
                definitionElement.style.opacity = '1'; // Trigger fade-in
                definitionElement.style.transitionDelay = `${delay}ms`; // Apply calculated stagger delay

                // Logic to track when to start staggering
                if (foundToggled) {
                    staggerIndex++; // Increment for the next element
                }
                // If this element *was* the last one toggled, start staggering from the *next* one
                if (defData.id === lastToggledIdRef.current) {
                    foundToggled = true;
                }

                // Update layout tracking variables
                const defHeight = definitionElement.offsetHeight; // Get height after styles applied
                cumulativeOffset = targetTop + defHeight + definitionMarginBottom;
                maxRequiredHeight = Math.max(maxRequiredHeight, cumulativeOffset);

            } else if (definitionElement) {
                // If term is missing, hide the definition and reset styles
                definitionElement.style.visibility = 'hidden';
                definitionElement.style.opacity = '0';
                definitionElement.style.transform = 'translateY(0px)';
                definitionElement.style.transitionDelay = '0ms';
            }
        });

        // Reset the tracked toggled ID after calculations for this cycle are done
        lastToggledIdRef.current = null;

        // Set minimum height for the container to prevent positioned items from overflowing
        const finalMinHeight = maxRequiredHeight > 0 ? maxRequiredHeight - definitionMarginBottom : 'auto';
        setSidePanelMinHeight(finalMinHeight);

    }, [definitions, isClient]); // Dependencies for the positioning function

    // --- Throttled/Debounced Positioning Functions ---
    // Throttle for frequent events (scroll/resize) - updates happen *during* the event
    const throttledPositionDefinitions = useCallback(
        throttle(positionDefinitions, EVENT_THROTTLE_MS, { leading: false, trailing: true }),
        [positionDefinitions] // Ensure it uses the latest positionDefinitions callback
    );
    // Debounce for less frequent events (observer/toggle) - updates happen *after* events settle
    const debouncedPositionDefinitions = useCallback(
        debounce(positionDefinitions, POSITION_DEBOUNCE_MS),
        [positionDefinitions] // Ensure it uses the latest positionDefinitions callback
    );
    // Separate debounce instance for ResizeObserver with potentially different timing
    const debouncedObserverCallback = useCallback(
        debounce(positionDefinitions, OBSERVER_DEBOUNCE_MS),
        [positionDefinitions]
    );


    // Effect to set up and clean up observers and event listeners
    useEffect(() => {
        // Guard clauses
        if (!isClient || definitions.length === 0 || !mainContentRef.current || !sidePanelInnerRef.current) {
            return;
        }

        // Initial positioning attempt shortly after mount
        const initialPositionTimer = setTimeout(positionDefinitions, 150);

        // Setup ResizeObserver to trigger repositioning on content/panel size changes
        const observer = new ResizeObserver(() => {
            debouncedObserverCallback(); // Use the dedicated observer debounce
        });
        observer.observe(mainContentRef.current);
        observer.observe(sidePanelInnerRef.current);
        resizeObserverRef.current = observer; // Store for cleanup

        // Add window event listeners using the throttled function
        window.addEventListener('resize', throttledPositionDefinitions);
        window.addEventListener('scroll', throttledPositionDefinitions, { passive: true }); // Passive for scroll performance

        // Cleanup function on unmount or dependency change
        return () => {
            clearTimeout(initialPositionTimer);
            if (resizeObserverRef.current) {
                resizeObserverRef.current.disconnect(); // Clean up observer
            }
            // Remove event listeners
            window.removeEventListener('resize', throttledPositionDefinitions);
            window.removeEventListener('scroll', throttledPositionDefinitions);
            // Cancel any pending throttled/debounced calls
            throttledPositionDefinitions.cancel();
            debouncedPositionDefinitions.cancel();
            debouncedObserverCallback.cancel();
        };
        // Dependencies ensure effect reruns if necessary, includes positioning functions
    }, [isClient, definitions.length, positionDefinitions, debouncedPositionDefinitions, throttledPositionDefinitions, debouncedObserverCallback]);

    // --- Click Handling ---

    // Handler for clicks on term markers within the main content
    const handleTermClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        const termElement = findClosestTermMarker(event.target as HTMLElement);
        if (termElement) {
            const termId = termElement.dataset.defId;
            if (termId) {
                // Update active state & record the ID for staggering
                setActiveDefinitionId(prevId => {
                    const newId = prevId === termId ? null : termId; // Toggle behavior
                    lastToggledIdRef.current = newId; // Record for staggering logic
                    return newId;
                });
                debouncedPositionDefinitions(); // Trigger repositioning calculation

                // Scroll into view logic (only if opening a new definition)
                if (termId !== activeDefinitionId) {
                    const definitionElement = document.getElementById(`definition-${termId}`);
                    if (definitionElement && sidePanelRef.current) {
                        const sidePanelRect = sidePanelRef.current.getBoundingClientRect();
                        const definitionRect = definitionElement.getBoundingClientRect();
                        const currentScrollY = window.scrollY;
                        const targetScrollY = currentScrollY + definitionRect.top - SCROLL_INTO_VIEW_OFFSET;
                        const sidePanelVisibleTop = Math.max(SCROLL_INTO_VIEW_OFFSET, sidePanelRect.top);
                        const sidePanelVisibleBottom = Math.min(window.innerHeight, sidePanelRect.bottom);
                        const isFullyVisible = definitionRect.top >= sidePanelVisibleTop && definitionRect.bottom <= sidePanelVisibleBottom;
                        if (!isFullyVisible) {
                            window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
                        }
                    }
                }
            }
        }
    }, [debouncedPositionDefinitions, activeDefinitionId]);

    // Handler for clicks directly on the SidePanelDefinition toggles
    const handleDefinitionToggle = useCallback((toggledId: string) => {
        // Update active state & record the ID for staggering
        setActiveDefinitionId(prevId => {
            const newId = prevId === toggledId ? null : toggledId; // Toggle behavior
            lastToggledIdRef.current = newId; // Record for staggering logic
            return newId;
        });
        debouncedPositionDefinitions(); // Trigger repositioning calculation
    }, [debouncedPositionDefinitions]); // Dependency

    // --- Render ---
    return (
        <div className="bg-slate-50 dark:bg-gray-950 text-slate-800 dark:text-slate-200 min-h-screen">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">

                {/* Back Link & Header Section */}
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

                    {/* Main Content Column */}
                    <div
                        className="lg:w-[60%] xl:w-3/5 order-1 lg:order-1 flex-shrink-0"
                        ref={mainContentRef}
                        onClick={handleTermClick}
                    >
                        <article className="prose prose-lg prose-slate max-w-none dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight dark:prose-headings:text-slate-100 prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:underline prose-p:leading-relaxed prose-li:my-1">
                            {mainContent}
                        </article>
                    </div>

                    {/* Side Panel Column (Large Screens Only) */}
                    {definitions.length > 0 && (
                        <aside
                            className="hidden lg:block lg:w-[40%] xl:w-2/5 order-2 lg:order-2 mt-16 lg:mt-0 flex-shrink-0"
                            ref={sidePanelRef}
                        >
                            <div className="sticky top-24">
                                <h3 className="text-base font-semibold mb-5 border-b border-slate-200 dark:border-slate-700 pb-2 text-slate-700 dark:text-slate-300 tracking-wide">
                                    {lang === 'en' ? 'Definitions & Notes' : 'Definicje i Notatki'}
                                </h3>
                                <div
                                    ref={sidePanelInnerRef}
                                    className="relative"
                                    style={{ minHeight: sidePanelMinHeight }}
                                >
                                    {definitions.map((def) => (
                                        <SidePanelDefinition
                                            key={def.id}
                                            {...def}
                                            forceOpen={def.id === activeDefinitionId}
                                            onToggleClick={handleDefinitionToggle}
                                        />
                                    ))}
                                </div>
                            </div>
                        </aside>
                    )}
                </div>

                {/* Definitions Section (Small Screens Only - Stacked) */}
                {definitions.length > 0 && (
                    <div className="block lg:hidden mt-16 pt-10 border-t border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-semibold mb-5 text-slate-800 dark:text-slate-100">
                            {lang === 'en' ? 'Definitions & Notes' : 'Definicje i Notatki'}
                        </h3>
                        <div className="space-y-4">
                            {definitions.map((def) => (
                                <div key={`mobile-${def.id}`} className="shadow-sm rounded-md border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800 overflow-hidden">
                                    <ExpandableSection title={def.term} defaultOpen={false} >
                                        {def.definition}
                                        {def.source && (
                                            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-600 text-xs text-slate-500 dark:text-slate-400">
                                                Source: {def.source}
                                            </div>
                                        )}
                                    </ExpandableSection>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default BlogPostWithAlignedSidePanel;