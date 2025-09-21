import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from './context/ToastContext'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900']
})

export const metadata = {
  title: {
    default: 'LOA-Tabulation',
    template: '%s | LOA-Tabulation'
  },
  description:
    'LOA-Tabulation is a digital scoring system developed for Lyceum of Alabang to ensure fair, transparent, and efficient tabulation in pageants and competitions.',
  keywords: [
    'Tabulation System',
    'Pageant Scoring',
    'Competition Scoring',
    'Lyceum of Alabang',
    'Digital Tabulation',
    'Judging System',
    'LOA-Tabulation'
  ],
  authors: [
    {
      name: 'Your Team Name',
      url: 'https://github.com/your-team-or-profile'
    }
  ],
  creator: 'Lyceum of Alabang Students',
  openGraph: {
    title: 'LOA-Tabulation - Fair and Transparent Scoring',
    description:
      'A modern tabulation system designed for Lyceum of Alabang, making pageant and competition scoring accurate, transparent, and efficient.',
    url: 'https://your-deployment-url.vercel.app',
    siteName: 'LOA-Tabulation',
    images: [
      {
        url: 'https://your-deployment-url.vercel.app/preview.png',
        width: 1200,
        height: 630,
        alt: 'LOA Tabulation - Pageant Scoring Dashboard Preview'
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  icons: {
    icon: '/logo.png'
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={`${inter.variable} antialiased`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
