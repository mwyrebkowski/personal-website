"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Term from './Term';
import { DefinitionData } from './SidePanelDefinition';
import BlogPostWithAlignedSidePanel from './BlogPostWithAlignedSidePanel';

interface BlogPostProps {
  title: string;
  date: string;
  content: React.ReactNode;
  lang: 'en' | 'pl';
}

const BlogPost: React.FC<BlogPostProps> = ({ title, date, content, lang }) => {
  // Extract Term components and their definitions from content
  const definitions: DefinitionData[] = [];
  
  // Process children to find Term components and extract their information
  React.Children.forEach(content, (child) => {
    if (React.isValidElement(child)) {
      // Check if this is a Term component
      if (child.type === Term && child.props.id) {
        // Add to our definitions array
        definitions.push({
          id: child.props.id,
          term: typeof child.props.children === 'string' ? child.props.children : `Term ${child.props.id}`,
          definition: child.props.definition || `Definition for ${child.props.id}`,
          source: child.props.source
        });
      }
      
      // Recursively check children of this element
      if (child.props.children) {
        // This is a simplified approach - a more robust solution would need to traverse deeply
      }
    }
  });
  
  // Use the new BlogPostWithAlignedSidePanel component
  return (
    <BlogPostWithAlignedSidePanel
      title={title}
      date={date}
      lang={lang}
      mainContent={content}
      definitions={definitions}
    />
  );
};

// Example blog content using Term components
export const ExampleBlogContent: React.FC<{ lang: 'en' | 'pl' }> = ({ lang }) => {
  if (lang === 'en') {
    return (
      <>
        <p>This is an example of a blog post with side panel references, similar to Gwern's website. 
        When you hover over a term like this <Term id="sidenotes" 
          definition={
            <>
              Sidenotes are a way to display references or additional information without disrupting the flow of the main text.
              They are commonly used in academic papers and textbooks.
            </>
          }>sidenotes</Term>, you'll see its definition displayed in the side panel.</p>
        
        <p>Let's look at another example where we explain a technical term <Term id="react" 
          definition={
            <>
              <strong>React.js</strong> is a JavaScript library for building user interfaces, particularly single-page applications. 
              It's maintained by Meta (formerly Facebook) and a community of individual developers and companies.
            </>
          }>React</Term> without breaking the flow of the main text.</p>
        
        <h2>How the Side Panel Works</h2>
        
        <p>The side panel implementation uses React hooks to manage state <Term id="hooks" 
          definition={
            <>
              React hooks were introduced in React 16.8 and allow you to use state and other React features without writing a class.
              Some commonly used hooks include useState, useEffect, useContext, and useRef.
            </>
          }>hooks</Term> and tracks which reference is currently active.</p>
        
        <p>On mobile devices, the side panel is hidden to conserve space, and references can be tapped to display their content.</p>
      </>
    );
  } else {
    return (
      <>
        <p>To jest przykład wpisu na blogu z odnośnikami w panelu bocznym, podobnymi do strony Gwerna. 
        Gdy najedziesz kursorem na termin taki jak ten <Term id="przypisy" 
          definition={
            <>
              Przypisy boczne są sposobem na wyświetlanie odnośników lub dodatkowych informacji bez zakłócania przepływu tekstu głównego.
              Są powszechnie używane w pracach akademickich i podręcznikach.
            </>
          }>przypisy boczne</Term>, zobaczysz jego definicję wyświetloną w panelu bocznym.</p>
        
        <p>Spójrzmy na inny przykład, w którym wyjaśniamy termin techniczny <Term id="react" 
          definition={
            <>
              <strong>React.js</strong> to biblioteka JavaScript do budowania interfejsów użytkownika, szczególnie aplikacji jednostronicowych. 
              Jest utrzymywany przez Meta (dawniej Facebook) oraz społeczność indywidualnych programistów i firm.
            </>
          }>React</Term> bez przerywania płynności głównego tekstu.</p>
        
        <h2>Jak działa panel boczny</h2>
        
        <p>Implementacja panelu bocznego wykorzystuje hooki React do zarządzania stanem <Term id="hooki" 
          definition={
            <>
              Hooki React zostały wprowadzone w React 16.8 i pozwalają korzystać ze stanu i innych funkcji React bez pisania klasy.
              Niektóre często używane hooki to useState, useEffect, useContext i useRef.
            </>
          }>hooki</Term> i śledzi, który odnośnik jest aktualnie aktywny.</p>
        
        <p>Na urządzeniach mobilnych panel boczny jest ukryty, aby oszczędzić miejsce, a odnośniki można dotknąć, aby wyświetlić ich zawartość.</p>
      </>
    );
  }
};

export default BlogPost; 