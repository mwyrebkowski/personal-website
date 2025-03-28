import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Your Name - Author & Entrepreneur',
  description: 'Articles, notes, courses, and books. Join subscribers who get my latest articles and recommendations every week.',
  openGraph: {
    title: 'Your Name - Author & Entrepreneur',
    description: 'Articles, notes, courses, and books. Join subscribers who get my latest articles and recommendations every week.',
    siteName: 'Your Name',
    images: [
      {
        url: '/assets/cities/sanfrancisco.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@yourtwitter',
    creator: '@yourtwitter',
    title: 'Your Name - Author & Entrepreneur',
    description: 'Articles, notes, courses, and books. Join subscribers who get my latest articles and recommendations every week.',
    images: ['/assets/cities/sanfrancisco.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} dark:bg-slate-900 dark:text-slate-400`}>
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
} 