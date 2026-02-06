'use client'

import { Inter } from 'next/font/google'
import { useBackdrop } from '../modules/backdrop/useBackdrop'
import Backdrop from '../modules/backdrop/Backdrop'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900']
})

const MainLayout = ({ children }) => {
  const { showBackdrop, resetTimer } = useBackdrop(3000)

  return (
    <div className={`flex-1 flex flex-col ${inter.variable} antialiased`}>
      {/* Backdrop overlay */}
      {showBackdrop && (
        <div className='fixed inset-0 z-50 cursor-pointer' onClick={resetTimer}>
          <Backdrop />
        </div>
      )}

      {children}
    </div>
  )
}

export default MainLayout
