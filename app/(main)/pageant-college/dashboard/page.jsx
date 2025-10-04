'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useToast } from '@/app/context/ToastContext'
import ScoringTable from '@/app/modules/common/ScoringTable'
import Footer from '@/app/modules/common/Footer'

export default function PageantScoringPage() {
  const [candidates, setCandidates] = useState([])
  const [assignedJudges, setAssignedJudges] = useState([])
  const [totalJudges, setTotalJudges] = useState(0)
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

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
    // TODO: Implement grading modal/navigation
    console.log('Grade candidate:', candidateId)
    showToast('Grading feature coming soon!', 'info')
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
      <Footer/>
    </>
  )
}
