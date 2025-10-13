'use client'
import React, { useState, useRef } from 'react'
import axios from 'axios'
import { Music, Flag, Trophy, Users, ChevronDown } from 'lucide-react'
import { ShinyButton } from '@/components/ui/shiny-button'
import { useReactToPrint } from 'react-to-print'
import PrintForm from './PrintForm'

const PRINT_COMPETITIONS = [
  { id: 'hiphop', label: 'Hip-Hop', icon: Music },
  { id: 'flag_twirling', label: 'Flag Twirling', icon: Flag },
  { id: 'singing', label: 'Singing', icon: Trophy },
  { id: 'bench_cheering', label: 'Bench Cheering', icon: Users }
]

export default function PrintScoresButton() {
  const [anchorEl, setAnchorEl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [printingId, setPrintingId] = useState(null)
  const [printData, setPrintData] = useState(null)
  const printRef = useRef()

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    onAfterPrint: () => {
      setPrintData(null)
    }
  })

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleCompetitionClick = async (competition) => {
    try {
      setPrintingId(competition.id)
      setLoading(true)

      const { data } = await axios.get(`/api/scoring/print?competition=${competition.id}`)

      if (data.success) {
        setPrintData({
          competition,
          candidates: data.candidates,
          judges: data.assignedJudges
        })

        // Wait for state to update and component to render
        setTimeout(() => {
          handlePrint()
        }, 100)
      }
    } catch (error) {
      console.error('Error printing:', error)
      alert('Failed to print scores')
    } finally {
      setLoading(false)
      setPrintingId(null)
      handleClose()
    }
  }

  return (
    <>
      <div className='relative'>
        <ShinyButton onClick={handleOpen} disabled={loading}>
          <div className='flex items-center gap-2'>
            <span>{loading ? 'Loading...' : 'Print Scores'}</span>
            <ChevronDown size={16} />
          </div>
        </ShinyButton>

        {anchorEl && (
          <>
            <div className='fixed inset-0 z-10' onClick={handleClose} />

            <div className='absolute top-full mt-2 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-20 min-w-[200px]'>
              {PRINT_COMPETITIONS.map((competition) => {
                const IconComponent = competition.icon
                const isPrinting = printingId === competition.id

                return (
                  <button
                    key={competition.id}
                    onClick={() => handleCompetitionClick(competition)}
                    disabled={loading}
                    className='w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors disabled:opacity-50'
                  >
                    {isPrinting ? (
                      <div className='w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin' />
                    ) : (
                      <IconComponent size={16} />
                    )}
                    <span>{competition.label}</span>
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Hidden print component */}
      {printData && (
        <div style={{ display: 'none' }}>
          <div ref={printRef}>
            <PrintForm
              competition={printData.competition}
              candidates={printData.candidates}
              judges={printData.judges}
            />
          </div>
        </div>
      )}
    </>
  )
}
