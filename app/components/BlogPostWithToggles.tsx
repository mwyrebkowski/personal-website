"use client";

import React from 'react';
import Link from 'next/link';
import ExpandableSection from './ExpandableSection';

interface BlogPostWithTogglesProps {
  title: string;
  date: string;
  lang: 'en' | 'pl';
}

const BlogPostWithToggles: React.FC<BlogPostWithTogglesProps> = ({ 
  title, 
  date, 
  lang 
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-16 pb-24">
      {/* Back to blog list */}
      <div className="mb-8">
        <Link 
          href={`/${lang}/blog`} 
          className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {lang === 'en' ? 'Back to all articles' : 'Powrót do artykułów'}
        </Link>
      </div>

      {/* Post header */}
      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-slate-900 dark:text-white">
          {title}
        </h1>
        <time className="text-sm text-slate-500 dark:text-slate-400">
          {date}
        </time>
      </header>

      {/* Article content */}
      <article className="prose prose-slate max-w-none dark:prose-invert">
        {lang === 'en' ? (
          <>
            <p>
              This article demonstrates how to use expandable sections in your blog posts, similar to Notion's toggle functionality but without the arrow symbol. These expandable sections are perfect for creating structured, hierarchical content that readers can explore at their own pace.
            </p>

            <p>
              Below, you'll find several expandable sections containing different types of content. Click on any section title to expand or collapse it.
            </p>

            <h2>Using Expandable Sections for Technical Documentation</h2>

            <p>
              Expandable sections are particularly useful for technical documentation where you want to provide both high-level summaries and detailed explanations.
            </p>

            <ExpandableSection title="What are React Hooks?">
              <p>
                Hooks are a feature introduced in React 16.8 that allow you to use state and other React features without writing a class component.
              </p>
              
              <p>
                Some of the most commonly used hooks include:
              </p>
              
              <ul>
                <li><strong>useState</strong> - For managing state in functional components</li>
                <li><strong>useEffect</strong> - For handling side effects like data fetching or DOM manipulation</li>
                <li><strong>useContext</strong> - For accessing context values within components</li>
                <li><strong>useRef</strong> - For creating mutable references that persist across renders</li>
              </ul>
            </ExpandableSection>

            <ExpandableSection title="Setting up a Next.js Project">
              <p>
                To create a new Next.js project, you can use the following commands:
              </p>
              
              <pre><code>
                npx create-next-app@latest my-project<br/>
                cd my-project<br/>
                npm run dev
              </code></pre>
              
              <p>
                This will create a new Next.js project with the following features:
              </p>
              
              <ul>
                <li>React 18</li>
                <li>Next.js App Router</li>
                <li>TypeScript support</li>
                <li>ESLint configuration</li>
                <li>Tailwind CSS integration</li>
              </ul>
            </ExpandableSection>

            <h2>Organizing Research Notes and References</h2>

            <p>
              Another great use case for expandable sections is organizing research notes and references in academic or educational content.
            </p>

            <ExpandableSection title="Historical Development of Intoxication Laws">
              <p>
                The concept of intoxication laws has evolved significantly over the past century:
              </p>
              
              <ul>
                <li><strong>1928</strong> - First legal regulation of driving under the influence</li>
                <li><strong>1933</strong> - Revised regulations maintained the prohibition despite the original act expiring</li>
                <li><strong>1937</strong> - Further revisions expanded the scope of regulations</li>
                <li><strong>Post-WWII</strong> - Development of measurement tools and more precise terminology</li>
              </ul>
              
              <p>
                The evolution of these laws reflects both technological advancements in measurement capabilities and a growing societal awareness of the dangers of impaired driving.
              </p>
            </ExpandableSection>

            <ExpandableSection title="Legal Terminology Definitions">
              <dl>
                <dt><strong>State of intoxication (Stan nietrzeźwości)</strong></dt>
                <dd>A condition in which the blood alcohol content exceeds 0.5 per mille or leads to a concentration exceeding this value, or the alcohol content in 1 dm³ of exhaled air exceeds 0.25 mg or leads to a concentration exceeding this value.</dd>
                
                <dt><strong>Driving ban (Zakaz prowadzenia pojazdu)</strong></dt>
                <dd>A penal measure applied to persons who drove a vehicle while intoxicated, under the influence of an intoxicant, or fled the scene of an accident. The court may impose a ban on driving certain types of vehicles for a period from 1 year to 15 years.</dd>
              </dl>
            </ExpandableSection>

            <h2>Conclusion</h2>

            <p>
              Expandable sections provide a clean way to organize complex or detailed information without overwhelming your readers. They're particularly useful for:
            </p>

            <ul>
              <li>Technical documentation with varying levels of detail</li>
              <li>Academic content with supporting evidence and references</li>
              <li>Tutorials with step-by-step instructions</li>
              <li>FAQs or Q&A sections</li>
            </ul>

            <p>
              By implementing expandable sections like these in your articles, you can create more accessible, reader-friendly content that caters to different levels of expertise and interest.
            </p>
          </>
        ) : (
          <>
            <p>
              Ten artykuł demonstruje, jak używać rozszerzalnych sekcji w postach na blogu, podobnych do funkcji przełączania w Notion, ale bez symbolu strzałki. Te rozszerzalne sekcje są idealne do tworzenia ustrukturyzowanej, hierarchicznej treści, którą czytelnicy mogą eksplorować we własnym tempie.
            </p>

            <p>
              Poniżej znajdziesz kilka rozszerzalnych sekcji zawierających różne rodzaje treści. Kliknij dowolny tytuł sekcji, aby ją rozwinąć lub zwinąć.
            </p>

            <h2>Używanie rozszerzalnych sekcji do dokumentacji technicznej</h2>

            <p>
              Rozszerzalne sekcje są szczególnie przydatne w dokumentacji technicznej, gdzie chcesz zapewnić zarówno podsumowania wysokiego poziomu, jak i szczegółowe wyjaśnienia.
            </p>

            <ExpandableSection title="Czym są hooki React?">
              <p>
                Hooki to funkcja wprowadzona w React 16.8, która pozwala używać stanu i innych funkcji React bez pisania komponentu klasowego.
              </p>
              
              <p>
                Niektóre z najczęściej używanych hooków to:
              </p>
              
              <ul>
                <li><strong>useState</strong> - Do zarządzania stanem w komponentach funkcyjnych</li>
                <li><strong>useEffect</strong> - Do obsługi efektów ubocznych, takich jak pobieranie danych lub manipulacja DOM</li>
                <li><strong>useContext</strong> - Do uzyskiwania dostępu do wartości kontekstu w ramach komponentów</li>
                <li><strong>useRef</strong> - Do tworzenia zmiennych referencji, które utrzymują się między renderowaniami</li>
              </ul>
            </ExpandableSection>

            <ExpandableSection title="Konfiguracja projektu Next.js">
              <p>
                Aby utworzyć nowy projekt Next.js, możesz użyć następujących poleceń:
              </p>
              
              <pre><code>
                npx create-next-app@latest moj-projekt<br/>
                cd moj-projekt<br/>
                npm run dev
              </code></pre>
              
              <p>
                Spowoduje to utworzenie nowego projektu Next.js z następującymi funkcjami:
              </p>
              
              <ul>
                <li>React 18</li>
                <li>Router aplikacji Next.js</li>
                <li>Obsługa TypeScript</li>
                <li>Konfiguracja ESLint</li>
                <li>Integracja Tailwind CSS</li>
              </ul>
            </ExpandableSection>

            <h2>Organizowanie notatek i odniesień badawczych</h2>

            <p>
              Innym świetnym zastosowaniem rozszerzalnych sekcji jest organizowanie notatek badawczych i odniesień w treściach akademickich lub edukacyjnych.
            </p>

            <ExpandableSection title="Rozwój historyczny prawa o nietrzeźwości">
              <p>
                Koncepcja praw dotyczących nietrzeźwości znacznie ewoluowała w ciągu ostatniego stulecia:
              </p>
              
              <ul>
                <li><strong>1928</strong> - Pierwsza regulacja prawna dotycząca prowadzenia pojazdów pod wpływem alkoholu</li>
                <li><strong>1933</strong> - Zmienione przepisy utrzymały zakaz mimo wygaśnięcia pierwotnego aktu</li>
                <li><strong>1937</strong> - Dalsze rewizje rozszerzyły zakres regulacji</li>
                <li><strong>Po II wojnie światowej</strong> - Rozwój narzędzi pomiarowych i bardziej precyzyjnej terminologii</li>
              </ul>
              
              <p>
                Ewolucja tych praw odzwierciedla zarówno postęp technologiczny w zakresie możliwości pomiarowych, jak i rosnącą świadomość społeczną dotyczącą zagrożeń związanych z prowadzeniem pojazdów w stanie nietrzeźwości.
              </p>
            </ExpandableSection>

            <ExpandableSection title="Definicje terminologii prawnej">
              <dl>
                <dt><strong>Stan nietrzeźwości</strong></dt>
                <dd>Stan, w którym zawartość alkoholu we krwi przekracza 0,5 promila albo prowadzi do stężenia przekraczającego tę wartość lub zawartość alkoholu w 1 dm³ wydychanego powietrza przekracza 0,25 mg albo prowadzi do stężenia przekraczającego tę wartość.</dd>
                
                <dt><strong>Zakaz prowadzenia pojazdu</strong></dt>
                <dd>Środek karny stosowany wobec osób, które prowadziły pojazd w stanie nietrzeźwości, pod wpływem środka odurzającego lub zbiegły z miejsca wypadku. Sąd może orzec zakaz prowadzenia pojazdów określonego rodzaju na okres od 1 roku do 15 lat.</dd>
              </dl>
            </ExpandableSection>

            <h2>Podsumowanie</h2>

            <p>
              Rozszerzalne sekcje zapewniają czysty sposób organizowania złożonych lub szczegółowych informacji bez przytłaczania czytelników. Są szczególnie przydatne do:
            </p>

            <ul>
              <li>Dokumentacji technicznej o różnym poziomie szczegółowości</li>
              <li>Treści akademickich z dowodami i odniesieniami</li>
              <li>Tutoriali z instrukcjami krok po kroku</li>
              <li>Sekcji FAQ lub Q&A</li>
            </ul>

            <p>
              Implementując takie rozszerzalne sekcje w swoich artykułach, możesz tworzyć bardziej dostępne, przyjazne dla czytelników treści, które zaspokajają różne poziomy wiedzy i zainteresowania.
            </p>
          </>
        )}
      </article>
    </div>
  );
};

export default BlogPostWithToggles; 