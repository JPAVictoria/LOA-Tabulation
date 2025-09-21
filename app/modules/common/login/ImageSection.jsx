import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, Sparkles, Heart } from 'lucide-react'

export default function ImageSection({ data }) {
  const [currentImage, setCurrentImage] = useState(0)
  const { images, content } = data

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [images.length])

  const floatingElements = [
    { icon: Crown, delay: 0, x: 100, y: 100 },
    { icon: Sparkles, delay: 1, x: 200, y: 300 },
    { icon: Heart, delay: 2, x: 300, y: 200 },
    { icon: Sparkles, delay: 0.5, x: 150, y: 400 },
    { icon: Crown, delay: 1.5, x: 250, y: 450 }
  ]

  return (
    <div className='flex-1 relative overflow-hidden'>
      <div
        className='absolute inset-0 bg-gradient-to-br from-red-600/20 via-red-500/30 to-pink-400/20 dark:from-red-400/10 dark:via-red-300/20 dark:to-pink-200/10 z-20'
        style={{
          clipPath: 'polygon(0 0, 85% 0, 95% 100%, 0% 100%)'
        }}
      />

      <div className='absolute inset-0 z-30 pointer-events-none'>
        {floatingElements.map((element, index) => {
          const IconComponent = element.icon
          return (
            <motion.div
              key={index}
              className='absolute'
              style={{ left: element.x, top: element.y }}
              initial={{ opacity: 0, scale: 0, rotate: 0 }}
              animate={{
                opacity: [0, 0.6, 0],
                scale: [0, 1.2, 0],
                rotate: [0, 180, 360],
                y: [0, -20, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: element.delay,
                ease: 'easeInOut'
              }}
            >
              <IconComponent className='w-6 h-6 text-white/70' />
            </motion.div>
          )
        })}
      </div>

      <div className='relative h-full'>
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentImage}
            className='absolute inset-0'
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          >
            <Image src={images[currentImage]} alt='Pageant' fill className='object-cover' />
          </motion.div>
        </AnimatePresence>

        <div className='absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10' />

        <div className='absolute bottom-10 left-10 z-30 text-white max-w-md'>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className='text-4xl md:text-5xl font-bold mb-4 leading-tight'
          >
            {content.mainTitle}
            <span className='bg-clip-text text-transparent bg-gradient-to-r from-red-300 via-pink-300 to-red-200 block'>
              {content.subtitle}
            </span>
          </motion.h1>
        </div>
      </div>
    </div>
  )
}
