'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { Chip } from '@mui/material'
import ViewScoresTable from '@/app/modules/admin/ViewScoresTable'
import Footer from '@/app/modules/common/Footer'
import { ShinyButton } from '@/components/ui/shiny-button'
import { COMPETITIONS_CHIPS } from '@/app/constants/main/constants'
export default function AdminScores() {
  const [selectedCompetition, setSelectedCompetition] = useState('pageantry')

  const handleChipClick = (competitionId) => {
    setSelectedCompetition(competitionId)
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-8'>
      {/* Top navigation buttons */}
      <div className='flex justify-between items-center mb-6'>
        <Link href='/admin/compilation'>
          <ShinyButton>← Back</ShinyButton>
        </Link>
      </div>

      {/* Main content */}
      <div className='max-w-6xl mx-auto'>
        {/* Competition chips */}
        <div className='flex flex-wrap justify-center gap-2 mb-6'>
          {COMPETITIONS_CHIPS.map((competition) => {
            const IconComponent = competition.icon
            const isSelected = selectedCompetition === competition.id

            return (
              <Chip
                key={competition.id}
                label={
                  <div className='flex items-center gap-1'>
                    <IconComponent size={14} />
                    {competition.label}
                  </div>
                }
                onClick={() => handleChipClick(competition.id)}
                size='small'
                variant={isSelected ? 'filled' : 'outlined'}
                sx={{ cursor: 'pointer' }}
              />
            )
          })}
        </div>

        <ViewScoresTable competition={selectedCompetition} />
      </div>

      <Footer />
    </div>
  )
}
