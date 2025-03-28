import Image from 'next/image'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-5">
        <header className="flex justify-between items-center py-10 px-4 relative">
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight md:tracking-tighter leading-tight">
            <a className="hover:underline transition-all duration-300" href="/en">Your Name</a>
          </h2>
          <button className="block md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1.5" aria-label="Toggle menu">
            <span className="block w-6 h-0.5 bg-slate-800 dark:bg-white transition-transform duration-300 ease-in-out"></span>
            <span className="block w-6 h-0.5 bg-slate-800 dark:bg-white transition-opacity duration-300 ease-in-out opacity-100"></span>
            <span className="block w-6 h-0.5 bg-slate-800 dark:bg-white transition-transform duration-300 ease-in-out"></span>
          </button>
          <nav className="hidden md:block">
            <ul className="flex space-x-8">
              <li><a className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300" href="/en/newsletter">Newsletter</a></li>
              <li><a className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300" href="/en/books">Books</a></li>
              <li><a className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300" href="/en/blog">Articles</a></li>
              <li><a className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300" href="/en/notes">Notes</a></li>
              <li><a className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300" href="/en/courses">Courses</a></li>
            </ul>
          </nav>
        </header>

        <div className="flex flex-col md:flex-row max-w-4xl mx-auto mt-16 md:mt-28 pb-20">
          <div className="flex-1 md:pr-12">
            <div className="mb-12 md:mb-16">
              <span className="inline-block px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full mb-4 font-medium">Author • Creator • Thinker</span>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-center md:text-left leading-tight text-slate-900 dark:text-white">Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Your Name</span>.</h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">I write about learning, philosophy, and the intersection of technology and humanity.</p>
            </div>

            <div className="space-y-5 text-slate-700 dark:text-slate-300">
              <p className="text-lg leading-relaxed">I'm an <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Author</a>.</p>
              <p className="text-lg leading-relaxed">If you want an extremely entertaining read that teaches you about [topic] along the way, pick up my book <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">[Book Title]</a>.</p>
              <p className="text-lg leading-relaxed">My next book is [description of next book].</p>
              <p className="text-lg leading-relaxed">Millions of people have <a href="/en/blog" className="text-blue-600 dark:text-blue-400 hover:underline">read and enjoyed my articles</a> about learning, writing, philosophy, entrepreneurship, and a host of other topics.</p>
              <p className="text-lg leading-relaxed">I've published <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">my notes and reviews</a> from 250+ books, articles, and speeches if you're looking for something to read.</p>
              <p className="text-lg leading-relaxed">If you're a visual person, you might enjoy the videos on my <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">YouTube channel</a>.</p>
              <p className="text-lg leading-relaxed">To contact me, <a href="mailto:your@email.com" className="text-blue-600 dark:text-blue-400 hover:underline">send me an email.</a> Or reach out on <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">X</a> or <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Instagram</a>.</p>
            </div>
            
            <div className="mt-12">
              <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Join my newsletter</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Get my latest thoughts on learning, creativity, and personal growth.</p>
              <form className="flex flex-col sm:flex-row gap-4 max-w-md" action="#" method="post">
                <input
                  type="email"
                  placeholder="Your best email..."
                  id="email"
                  required
                  className="flex-grow px-4 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  name="email_address"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-300 shadow-sm hover:shadow flex items-center justify-center"
                >
                  <span>Subscribe</span>
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
                alt="Your Name"
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