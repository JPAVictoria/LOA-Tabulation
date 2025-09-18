'use client'
import React, { useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Card = React.memo(({ card, index, hovered, setHovered }) => {
  const handleMouseEnter = useCallback(() => setHovered(index), [index, setHovered])
  const handleMouseLeave = useCallback(() => setHovered(null), [setHovered])

  return (
    <Link href={card.link} className='block'>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          'rounded-lg relative bg-gray-100 dark:bg-neutral-900 overflow-hidden h-40 md:h-48 w-full transition-all duration-300 ease-out will-change-transform',
          hovered !== null && hovered !== index && 'blur-sm scale-[0.98]'
        )}
      >
        <Image 
          src={card.src} 
          alt={card.title} 
          fill
          className='object-cover'
        />
        <div
          className={cn(
            'absolute inset-0 bg-black/50 flex items-end justify-between py-4 px-3 transition-opacity duration-300 will-change-opacity',
            hovered === index ? 'opacity-100' : 'opacity-0'
          )}
        >
          <div className='text-sm md:text-lg font-medium bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-200'>
            {card.title}
          </div>
          <ArrowUpRight className='text-white w-4 h-4 md:w-5 md:h-5 flex-shrink-0' />
        </div>
      </div>
    </Link>
  )
})

Card.displayName = 'Card'

export function FocusCards({ cards }) {
  const [hovered, setHovered] = useState(null)

  return (
    <div className='grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto w-full'>
      {cards.map((card, index) => (
        <Card key={card.id || card.title} card={card} index={index} hovered={hovered} setHovered={setHovered} />
      ))}
    </div>
  )
}