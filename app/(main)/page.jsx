'use client'

import { FocusCards } from '@/components/ui/focus-cards'
import { COMPETITION_DATA } from '../constants/main/constants'
import { cn } from '@/lib/utils'
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern'

export default function Home() {
  return (
    <div className='relative min-h-screen flex flex-col overflow-hidden'>
      {/* Animated Background */}
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.08}
        duration={3}
        repeatDelay={1}
        className={cn(
          'absolute inset-0',
          'h-full w-full',
          '[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]',
          'mx-auto my-auto'
        )}
      />

      {/* Page Content */}
      <div className='flex-1 flex flex-col justify-center items-center px-4 space-y-26 relative z-10'>
        <div className='text-center'>
          <h2
            className='bg-clip-text text-transparent text-center 
              bg-gradient-to-r from-red-600 via-red-500 to-pink-400
              dark:from-red-400 dark:via-red-300 dark:to-pink-200
              text-lg md:text-3xl font-sans font-bold tracking-tight mb-4 leading-normal'
          >
            Competitions
          </h2>

          <p className='max-w-2xl mx-auto text-base md:text-md text-red-600 dark:text-red-400 text-center leading-relaxed'>
            Select which competition you would like to judge for tabulation
          </p>
        </div>

        <FocusCards cards={COMPETITION_DATA} />
      </div>

      <footer className='py-6 text-center relative z-10'>
        <p className='max-w-2xl mx-auto text-base md:text-md text-red-600 dark:text-red-400 text-center leading-relaxed'>
          © 2025 Junior Programmers Guild. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
