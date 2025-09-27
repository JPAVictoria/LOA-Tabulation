'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { Chip } from '@mui/material'
import { ADMIN_DASHBOARD_DATA } from '@/app/constants/admin/constants'
import CompetitionTable from '@/app/modules/admin/CompetitionTable'
import CategoryTable from '@/app/modules/admin/CategoryTable'
import CriteriaTable from '@/app/modules/admin/CriteriaTable'
import CandidateTable from '@/app/modules/admin/CandidateTable'
import Footer from '@/app/modules/common/Footer'
import { ShinyButton } from '@/components/ui/shiny-button'

export default function AdminCompilation() {
  const [selectedChip, setSelectedChip] = useState('competition')

  const handleChipClick = (chipId) => {
    setSelectedChip(chipId)
  }

  const renderContent = () => {
    switch (selectedChip) {
      case 'competition':
        return <CompetitionTable />
      case 'category':
        return <CategoryTable/>
      case 'criteria':
        return <CriteriaTable/>
      case 'candidate':
        return <CandidateTable/>
      default:
        return <CompetitionTable />
    }
  }

  return (
    <div className='p-4'>
      <div className='mb-4'>
        <Link href='/admin/dashboard'>
          <ShinyButton>← Back</ShinyButton>
        </Link>
      </div>

      <div className='flex flex-wrap justify-center gap-2'>
        {ADMIN_DASHBOARD_DATA.map((item) => {
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

      <Footer />
    </div>
  )
}
