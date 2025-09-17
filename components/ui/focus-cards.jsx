'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Card = React.memo(({ card, index, hovered, setHovered }) => (
  <Link href={card.link}>
    <div
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      className={cn(
        'rounded-lg relative bg-gray-100 dark:bg-neutral-900 overflow-hidden h-40 md:h-48 w-full transition-all duration-300 ease-out cursor-pointer',
        hovered !== null && hovered !== index && 'blur-sm scale-[0.98]'
      )}
    >
      <img src={card.src} alt={card.title} className='object-cover absolute inset-0 w-full h-full' />
      <div
        className={cn(
          'absolute inset-0 bg-black/50 flex items-end justify-between py-4 px-3 transition-opacity duration-300',
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
))

Card.displayName = 'Card'

export function FocusCards({ cards }) {
  const [hovered, setHovered] = useState(null)

  return (
    <div className='grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto w-full'>
      {cards.map((card, index) => (
        <Card key={`${card.title}-${index}`} card={card} index={index} hovered={hovered} setHovered={setHovered} />
      ))}
    </div>
  )
}
