'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { Chip } from '@mui/material'
import { ADMIN_DASHBOARD_DATA } from '@/app/constants/admin/constants'
import CategoryTable from '@/app/modules/admin/CategoryTable'
import CriteriaTable from '@/app/modules/admin/CriteriaTable'
import CandidateTable from '@/app/modules/admin/CandidateTable'
import JudgeTable from '@/app/modules/admin/JudgeTable'
import Footer from '@/app/modules/common/Footer'
import { ShinyButton } from '@/components/ui/shiny-button'

export default function AdminCompilation() {
  const [selectedChip, setSelectedChip] = useState('category')

  const handleChipClick = (chipId) => {
    setSelectedChip(chipId)
  }

  const renderContent = () => {
    switch (selectedChip) {
      case 'category':
        return <CategoryTable />
      case 'criteria':
        return <CriteriaTable />
      case 'candidate':
        return <CandidateTable />
      case 'judges':
        return <JudgeTable />
      default:
        return <CategoryTable />
    }
  }

  // Filter out the scores item from chips
  const chipItems = ADMIN_DASHBOARD_DATA.filter((item) => item.id !== 'scores')

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-8'>
      {/* Top navigation buttons */}
      <div className='flex justify-between items-center mb-6'>
        <Link href='/admin/dashboard'>
          <ShinyButton>← Back</ShinyButton>
        </Link>

        <Link href='/admin/scores'>
          <ShinyButton>View Scores</ShinyButton>
        </Link>
      </div>

      {/* Main content */}
      <div className='max-w-6xl mx-auto'>
        <div className='flex flex-wrap justify-center gap-2 mb-6'>
          {chipItems.map((item) => {
            const IconComponent = item.icon
            const isSelected = selectedChip === item.id

            return (
              <Chip
                key={item.id}
                label={
                  <div className='flex items-center gap-1'>
                    <IconComponent size={14} />
                    {item.id.charAt(0).toUpperCase() + item.id.slice(1)}
                  </div>
                }
                onClick={() => handleChipClick(item.id)}
                size='small'
                variant={isSelected ? 'filled' : 'outlined'}
                sx={{ cursor: 'pointer' }}
              />
            )
          })}
        </div>

        {renderContent()}
      </div>

      <Footer />
    </div>
  )
}
