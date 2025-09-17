'use client'
import { FocusCards } from '@/components/ui/focus-cards'
import { COMPETITION_DATA } from '../constants/main/constants'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <div className='min-h-screen flex flex-col overflow-hidden'>
      <div className='flex-1 flex flex-col justify-center items-center px-4 space-y-26'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='text-center'
        >
          <motion.h2
            className='bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white
              text-lg md:text-3xl font-sans font-bold tracking-tight mb-4 leading-normal'
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Competitions
          </motion.h2>

          <motion.p
            className='max-w-2xl mx-auto text-base md:text-md text-neutral-700 dark:text-neutral-400 text-center leading-relaxed'
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Select which competition you would like to judge for tabulation
          </motion.p>
        </motion.div>

        <motion.div
          className='w-full max-w-6xl'
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <FocusCards cards={COMPETITION_DATA} />
        </motion.div>
      </div>

      <motion.footer
        className='py-6 text-center relative z-10'
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <motion.p
          className='max-w-2xl mx-auto text-base md:text-md text-neutral-700 dark:text-neutral-400 text-center leading-relaxed'
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          © 2025 Junior Programmers Guild. All rights reserved.
        </motion.p>
      </motion.footer>
    </div>
  )
}
