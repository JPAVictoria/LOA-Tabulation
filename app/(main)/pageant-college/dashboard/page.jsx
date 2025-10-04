'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useToast } from '@/app/context/ToastContext'
import ScoringTable from '@/app/modules/common/ScoringTable'
import ScoringModal from '@/app/modules/common/ScoringModal'
import Footer from '@/app/modules/common/Footer'

export default function PageantScoringPage() {
  const [candidates, setCandidates] = useState([])
  const [assignedJudges, setAssignedJudges] = useState([])
  const [totalJudges, setTotalJudges] = useState(0)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCandidateId, setSelectedCandidateId] = useState(null)
  const [judgeId, setJudgeId] = useState(null) // Get this from your login state/context
  const { showToast } = useToast()

  useEffect(() => {
    const storedJudgeId = localStorage.getItem('judgeId')
    if (storedJudgeId) {
      setJudgeId(parseInt(storedJudgeId))
    }
  }, [])

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

  return (
    <>
      <ScoringTable
        candidates={candidates}
        assignedJudges={assignedJudges}
        totalJudges={totalJudges}
        loading={loading}
        onGrade={handleGrade}
      />

      <ScoringModal
        open={modalOpen}
        candidateId={selectedCandidateId}
        judgeId={judgeId}
        competition='PAGEANTRY'
        apiEndpoint='/api/scoring/pageant'
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        showToast={showToast}
      />

      <Footer />
    </>
  )
}
