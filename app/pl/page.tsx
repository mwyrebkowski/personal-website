import Image from 'next/image'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-5">
        <header className="flex justify-between items-center py-10 px-4 relative">
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight md:tracking-tighter leading-tight">
            <a className="hover:underline transition-all duration-300" href="/pl">Twoje Imię</a>
          </h2>
          <button className="block md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1.5" aria-label="Przełącz menu">
            <span className="block w-6 h-0.5 bg-slate-800 dark:bg-white transition-transform duration-300 ease-in-out"></span>
            <span className="block w-6 h-0.5 bg-slate-800 dark:bg-white transition-opacity duration-300 ease-in-out opacity-100"></span>
            <span className="block w-6 h-0.5 bg-slate-800 dark:bg-white transition-transform duration-300 ease-in-out"></span>
          </button>
          <nav className="hidden md:block">
            <ul className="flex space-x-8">
              <li><a className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300" href="/pl/newsletter">Newsletter</a></li>
              <li><a className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300" href="/pl/books">Książki</a></li>
              <li><a className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300" href="/pl/blog">Artykuły</a></li>
              <li><a className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300" href="/pl/notes">Notatki</a></li>
              <li><a className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300" href="/pl/courses">Kursy</a></li>
            </ul>
          </nav>
        </header>

        <div className="flex flex-col md:flex-row max-w-4xl mx-auto mt-16 md:mt-28 pb-20">
          <div className="flex-1 md:pr-12">
            <div className="mb-12 md:mb-16">
              <span className="inline-block px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full mb-4 font-medium">Autor • Twórca • Myśliciel</span>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-center md:text-left leading-tight text-slate-900 dark:text-white">Cześć, jestem <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Twoje Imię</span>.</h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">Piszę o nauce, filozofii i miejscu, gdzie technologia spotyka się z człowieczeństwem.</p>
            </div>

            <div className="space-y-5 text-slate-700 dark:text-slate-300">
              <p className="text-lg leading-relaxed">Jestem <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Autorem</a>.</p>
              <p className="text-lg leading-relaxed">Jeśli chcesz przeczytać coś niezwykle zajmującego, co jednocześnie nauczy Cię o [temat], sięgnij po moją książkę <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">[Tytuł Książki]</a>.</p>
              <p className="text-lg leading-relaxed">Moja następna książka to [opis następnej książki].</p>
              <p className="text-lg leading-relaxed">Miliony ludzi <a href="/pl/blog" className="text-blue-600 dark:text-blue-400 hover:underline">przeczytało i polubiło moje artykuły</a> o nauce, pisaniu, filozofii, przedsiębiorczości i wielu innych tematach.</p>
              <p className="text-lg leading-relaxed">Opublikowałem <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">moje notatki i recenzje</a> z ponad 250 książek, artykułów i przemówień, jeśli szukasz czegoś do przeczytania.</p>
              <p className="text-lg leading-relaxed">Jeśli jesteś wzrokowcem, możesz polubić filmy na moim <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">kanale YouTube</a>.</p>
              <p className="text-lg leading-relaxed">Aby się ze mną skontaktować, <a href="mailto:twoj@email.com" className="text-blue-600 dark:text-blue-400 hover:underline">napisz do mnie email.</a> Lub znajdź mnie na <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">X</a> lub <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Instagramie</a>.</p>
            </div>
            
            <div className="mt-12">
              <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Dołącz do mojego newslettera</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Otrzymuj moje najnowsze przemyślenia o nauce, kreatywności i rozwoju osobistym.</p>
              <form className="flex flex-col sm:flex-row gap-4 max-w-md" action="#" method="post">
                <input
                  type="email"
                  placeholder="Twój najlepszy email..."
                  id="email"
                  required
                  className="flex-grow px-4 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  name="email_address"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-300 shadow-sm hover:shadow flex items-center justify-center"
                >
                  <span>Zapisz się</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
          
          <div className="flex-shrink-0 hidden md:block relative">
            <div className="absolute -left-4 -top-4 w-full h-full bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-2xl transform rotate-3"></div>
            <div className="relative">
              <Image
                src="/profilepicture.JPG"
                alt="Twoje Imię"
                width={300}
                height={300}
                className="w-72 h-72 rounded-2xl object-cover shadow-xl"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 