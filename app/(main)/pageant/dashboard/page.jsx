'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { useToast } from '@/app/context/ToastContext'
import ScoringTable from '@/app/modules/common/ScoringTable'
import PageantScoringModal from '@/app/modules/pageant/ScoringModal'
import Footer from '@/app/modules/common/Footer'
import { ShinyButton } from '@/components/ui/shiny-button'

export default function PageantScoringPage() {
  const [candidates, setCandidates] = useState([])
  const [assignedJudges, setAssignedJudges] = useState([])
  const [totalJudges, setTotalJudges] = useState(0)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCandidateId, setSelectedCandidateId] = useState(null)
  const { showToast } = useToast()
  const router = useRouter()

  const fetchCandidates = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/scoring/pageant')

      if (data.success) {
        setCandidates(data.candidates)
        setAssignedJudges(data.assignedJudges)
        setTotalJudges(data.totalJudges)
      } else {
        showToast('Failed to fetch candidates', 'error')
      }
    } catch (error) {
      showToast('Failed to fetch candidates', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCandidates()
  }, [])

  const handleGrade = (candidateId) => {
    setSelectedCandidateId(candidateId)
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setSelectedCandidateId(null)
  }

  const handleModalSuccess = () => {
    fetchCandidates()
  }

  const handleSignOut = () => {
    localStorage.clear()
    showToast('Signed out successfully', 'success')
    router.push('/pageant')
  }

  return (
    <>
      {/* Sign Out Button */}
      <div className='fixed top-4 left-4 z-50'>
        <button
          onClick={handleSignOut}
          className='flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors cursor-pointer'
        >
         <ShinyButton>Sign out</ShinyButton>
        </button>
      </div>

      <ScoringTable
        candidates={candidates}
        assignedJudges={assignedJudges}
        totalJudges={totalJudges}
        loading={loading}
        onGrade={handleGrade}
      />

      <PageantScoringModal
        open={modalOpen}
        candidateId={selectedCandidateId}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        showToast={showToast}
      />

      <Footer />
    </>
  )
}
