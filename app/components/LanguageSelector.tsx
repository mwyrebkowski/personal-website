import Link from 'next/link'
import Image from 'next/image'

export default function LanguageSelector() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white/90 backdrop-blur-md text-gray-800 p-4">
      <div className="max-w-6xl mx-auto w-full">
        <h1 className="text-3xl md:text-4xl font-light text-center mb-12 tracking-wide">Select Your Language</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <Link href="/pl" className="group relative transform transition duration-300 hover:shadow-lg">
            <div className="relative h-[300px] md:h-[400px] overflow-hidden rounded-md">
              <Image 
                src="/assets/cities/poland.png"
                alt="Poland"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            <div className="absolute bottom-6 left-0 w-full text-center">
              <span className="text-5xl font-light tracking-wider text-white drop-shadow-sm">Polski</span>
            </div>
          </Link>
          
          <Link href="/en" className="group relative transform transition duration-300 hover:shadow-lg">
            <div className="relative h-[300px] md:h-[400px] overflow-hidden rounded-md">
              <Image 
                src="/assets/cities/sanfrancisco.png"
                alt="San Francisco"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            <div className="absolute bottom-6 left-0 w-full text-center">
              <span className="text-5xl font-light tracking-wider text-white drop-shadow-sm">English</span>
            </div>
          </Link>
        </div>
        
        <div className="text-center mt-12 text-gray-400">
          <p className="text-xs">© 2023 Your Name. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
} 