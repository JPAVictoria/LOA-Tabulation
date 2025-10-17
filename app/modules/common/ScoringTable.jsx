'use client'
import React, { useState, useEffect } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Chip } from '@mui/material'
import { Pen } from 'lucide-react'

export default function ScoringTable({ candidates, loading, onGrade }) {
  const [filteredCandidates, setFilteredCandidates] = useState([])
  const [selectedGender, setSelectedGender] = useState(null)
  const [judgeName, setJudgeName] = useState('')

  useEffect(() => {
    // Get judge name from localStorage
    const name = localStorage.getItem('judgeName')
    if (name) {
      setJudgeName(name)
    }
  }, [])

  useEffect(() => {
    if (selectedGender) {
      setFilteredCandidates(candidates.filter((c) => c.gender.toLowerCase() === selectedGender))
    } else {
      setFilteredCandidates(candidates)
    }
  }, [selectedGender, candidates])

  const handleGenderFilter = (gender) => {
    setSelectedGender(selectedGender === gender ? null : gender)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'NOT_GRADED':
        return { color: 'default', label: 'Not Graded' }
      case 'PENDING':
        return { color: 'warning', label: 'Pending' }
      case 'GRADED':
        return { color: 'success', label: 'Graded' }
      default:
        return { color: 'default', label: 'Unknown' }
    }
  }

  const columns = [
    {
      field: 'candidateNumber',
      headerName: 'Candidate Number',
      width: 120,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'name',
      headerName: 'Candidate Name',
      flex: 1,
      minWidth: 150
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      headerAlign: 'center',
      align: 'center',
      renderCell: ({ value }) => {
        const { color, label } = getStatusColor(value)
        return <Chip label={label} color={color} size='small' sx={{ fontWeight: 500 }} />
      }
    },
    {
      field: 'totalScore',
      headerName: 'Score',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: ({ row }) => {
        if (row.scoredCount === 0) {
          return <span className='text-gray-400'>-</span>
        }

        return (
          <span className='font-semibold text-gray-900 dark:text-gray-100'>
            {row.averageScore ? row.averageScore.toFixed(2) : '-'}
          </span>
        )
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <div className='flex items-center justify-center h-full'>
          <button
            onClick={() => onGrade(row.id)}
            className='p-2 text-blue-600 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors'
            title='Grade Candidate'
          >
            <Pen size={18} />
          </button>
        </div>
      )
    }
  ]

  const genderFilters = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' }
  ]

  return (
    <div className='mt-6 flex flex-col items-center justify-center p-4'>
      <div className='w-full max-w-6xl'>
        {/* Gender Filter Chips */}
        <div className='flex flex-wrap justify-center gap-2 mb-4'>
          {genderFilters.map((filter) => (
            <Chip
              key={filter.value}
              label={filter.label}
              onClick={() => handleGenderFilter(filter.value)}
              variant={selectedGender === filter.value ? 'filled' : 'outlined'}
              color={selectedGender === filter.value ? 'primary' : 'default'}
              sx={{ cursor: 'pointer' }}
            />
          ))}
          {selectedGender && (
            <Chip
              label='Clear Filter'
              onClick={() => setSelectedGender(null)}
              variant='outlined'
              color='secondary'
              sx={{ cursor: 'pointer' }}
            />
          )}
        </div>

        {/* Welcome Message */}
        {judgeName && (
          <div className='mt-5 mb-6 p-4'>
            <p className='text-3xl font-bold text-gray-800 dark:text-gray-100'>
              Welcome, <span className='text-blue-600 dark:text-blue-400'>{judgeName}</span>
            </p>
          </div>
        )}

        {/* Data Grid */}
        <div className='h-[500px] w-full'>
          <DataGrid
            rows={filteredCandidates}
            columns={columns}
            loading={loading}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            disableRowSelectionOnClick
          />
        </div>
      </div>
    </div>
  )
}
