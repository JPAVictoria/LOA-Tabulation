'use client'
import React, { useState, useEffect } from 'react'
import { X, Save, User } from 'lucide-react'
import { Dialog, DialogContent, TextField, CircularProgress } from '@mui/material'
import axios from 'axios'

export default function BenchCheeringScoringModal({ open, candidateId, onClose, onSuccess, showToast }) {
  const [candidate, setCandidate] = useState(null)
  const [category, setCategory] = useState(null)
  const [criteria, setCriteria] = useState([])
  const [scores, setScores] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const judgeId = typeof window !== 'undefined' ? localStorage.getItem('judgeId') : null

  useEffect(() => {
    if (open && candidateId && judgeId) {
      fetchCandidateData()
    } else if (!open) {
      setScores({})
      setIsEditing(false)
      setCandidate(null)
      setCategory(null)
      setCriteria([])
    }
  }, [open, candidateId, judgeId])

  const fetchCandidateData = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(`/api/scoring/bench-cheering/${candidateId}?judgeId=${judgeId}`)

      if (data.success) {
        setCandidate(data.candidate)
        setCategory(data.category)
        setCriteria(data.criteria)

        if (data.existingScores && data.existingScores.length > 0) {
          const existingScoresMap = {}
          data.existingScores.forEach((score) => {
            existingScoresMap[score.criteriaId] = score.score
          })
          setScores(existingScoresMap)
          setIsEditing(true)
        } else {
          setScores({})
          setIsEditing(false)
        }
      }
    } catch (error) {
      showToast?.('Failed to fetch candidate data', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleScoreChange = (criteriaId, value) => {
    const numValue = value === '' ? '' : parseFloat(value)
    setScores((prev) => ({
      ...prev,
      [criteriaId]: numValue
    }))
  }

  const validateScores = () => {
    for (const [criteriaId, score] of Object.entries(scores)) {
      if (score === '' || score === undefined || score === null) continue

      if (score < 65 || score > 100) {
        const criteriaItem = criteria.find((c) => c.id === parseInt(criteriaId))
        showToast?.(`Score for "${criteriaItem?.name}" must be between 65 and 100`, 'error')
        return false
      }
    }

    const hasAnyScore = Object.values(scores).some((score) => score !== '' && score !== undefined && score !== null)

    if (!hasAnyScore) {
      showToast?.('Please enter at least one score', 'error')
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateScores()) return

    try {
      setSubmitting(true)

      const validScores = Object.entries(scores)
        .filter(([_, score]) => score !== '' && score !== undefined && score !== null)
        .map(([criteriaId, score]) => ({
          criteriaId: parseInt(criteriaId),
          score: parseFloat(score)
        }))

      const payload = {
        judgeId: parseInt(judgeId),
        candidateId: candidate.id,
        scores: validScores
      }

      if (isEditing) {
        await axios.put(`/api/scoring/bench-cheering/${candidateId}`, payload)
        showToast?.('Scores updated successfully!', 'success')
      } else {
        await axios.post('/api/scoring/bench-cheering', payload)
        showToast?.('Scores submitted successfully!', 'success')
      }

      onSuccess?.()
      onClose()
    } catch (error) {
      showToast?.(error.response?.data?.error || 'Failed to submit scores', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth='lg' fullWidth>
        <div className='flex items-center justify-center h-96'>
          <CircularProgress />
        </div>
      </Dialog>
    )
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='lg'
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, maxHeight: '90vh' }
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <div className='flex flex-col h-full'>
          {/* Header */}
          <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200'>
            <h2 className='text-xl font-semibold text-gray-900'>{isEditing ? 'Edit Scores' : 'Score Team'}</h2>
            <button
              onClick={onClose}
              className='p-1.5 hover:bg-gray-100 rounded-full transition-colors'
              disabled={submitting}
            >
              <X size={20} className='text-gray-500' />
            </button>
          </div>

          {/* Content */}
          <div className='flex flex-col lg:flex-row gap-8 p-6 overflow-y-auto'>
            {/* Left Side - Team Info */}
            <div className='lg:w-1/3'>
              <div className='sticky top-0'>
                {/* Team Image */}
                <div className='relative w-full aspect-square mb-4 rounded-lg overflow-hidden bg-gray-100 border border-gray-200'>
                  {candidate?.imageUrl ? (
                    <img src={candidate.imageUrl} alt={candidate.name} className='w-full h-full object-cover' />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center'>
                      <User size={64} className='text-gray-400' />
                    </div>
                  )}
                </div>

                {/* Team Details */}
                <div className='space-y-3'>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900'>{candidate?.name}</h3>
                  </div>

                  <div className='pt-3 border-t border-gray-200 space-y-2 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Team No.</span>
                      <span className='font-medium text-gray-900'>{candidate?.candidateNumber}</span>
                    </div>

                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Gender</span>
                      <span className='font-medium text-gray-900 capitalize'>{candidate?.gender?.toLowerCase()}</span>
                    </div>

                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Course</span>
                      <span className='font-medium text-gray-900'>{candidate?.course}</span>
                    </div>

                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Level</span>
                      <span className='font-medium text-gray-900'>{candidate?.level?.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Scoring Form */}
            <div className='lg:w-2/3 flex flex-col'>
              <div className='space-y-6 flex-1'>
                <div className='border border-gray-200 rounded-lg p-4'>
                  <h1 className='font-semibold text-gray-900 uppercase tracking-wide mb-4'>
                    {category?.name || 'Bench Cheering Performance'}
                  </h1>
                  {/* Criteria List */}
                  <div className='space-y-10'>
                    {criteria.map((criteriaItem) => (
                      <div key={criteriaItem.id} className='flex items-center gap-4'>
                        {/* Criteria Info */}
                        <div className='flex-1'>
                          <p className='text-sm font-medium text-gray-900'>{criteriaItem.name}</p>
                          {criteriaItem.percentage && (
                            <p className='text-xs text-gray-500 mt-0.5'>{criteriaItem.percentage}%</p>
                          )}
                        </div>

                        {/* Score Input */}
                        <div className='w-24'>
                          <TextField
                            type='number'
                            value={scores[criteriaItem.id] ?? ''}
                            onChange={(e) => handleScoreChange(criteriaItem.id, e.target.value)}
                            placeholder='65-100'
                            inputProps={{
                              min: 65,
                              max: 100,
                              step: 0.01
                            }}
                            size='small'
                            fullWidth
                            disabled={submitting}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: '#e5e7eb'
                                },
                                '&:hover fieldset': {
                                  borderColor: '#d1d5db'
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#3b82f6',
                                  borderWidth: 1
                                }
                              },
                              '& input': {
                                fontSize: '0.875rem',
                                padding: '8px 12px'
                              }
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className='mt-6 pt-4 border-t border-gray-200'>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className='cursor-pointer w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2'
                >
                  {submitting ? (
                    <>
                      <CircularProgress size={16} sx={{ color: 'white' }} />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>{isEditing ? 'Update Scores' : 'Submit Scores'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
