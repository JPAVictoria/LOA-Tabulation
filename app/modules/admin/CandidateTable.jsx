'use client'
import React, { useState, useEffect } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Edit, Trash2, User } from 'lucide-react'
import axios from 'axios'
import { useToast } from '@/app/context/ToastContext'
import CandidateModal from './CandidateModal'
import DeleteModal from './DeleteModal'

export default function CandidateTable() {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { showToast } = useToast()

  const fetchCandidates = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/candidates')
      data.success ? setCandidates(data.candidates) : showToast('Failed to fetch candidates', 'error')
    } catch (error) {
      showToast('Failed to fetch candidates', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCandidates()
  }, [])

  const openModal = (candidate, isEdit = true) => {
    setSelectedCandidate(candidate)
    isEdit ? setEditModalOpen(true) : setDeleteModalOpen(true)
  }

  const closeModals = () => {
    setEditModalOpen(false)
    setDeleteModalOpen(false)
    setSelectedCandidate(null)
  }

  const handleEdit = async (updatedCandidate) => {
    await fetchCandidates()
    closeModals()
  }

  const handleDelete = async () => {
    try {
      setDeleteLoading(true)
      const { data } = await axios.delete(`/api/candidates/${selectedCandidate.id}`)

      if (data.success) {
        showToast('Candidate deleted successfully!', 'success')
        await fetchCandidates()
        closeModals()
      } else {
        showToast(data.error || 'Failed to delete candidate', 'error')
      }
    } catch (error) {
      showToast('Failed to delete candidate', 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  const columns = [
    {
      field: 'imageUrl',
      headerName: 'Photo',
      width: 80,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      filterable: false,
      renderCell: ({ value }) => (
        <div className='flex items-center justify-center h-full'>
          {value ? (
            <img src={value} alt='Candidate' className='w-10 h-10 rounded-full object-cover border-2 border-gray-200' />
          ) : (
            <div className='w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center'>
              <User size={16} className='text-gray-500' />
            </div>
          )}
        </div>
      )
    },
    {
      field: 'candidateNumber',
      headerName: 'No.',
      width: 80,
      headerAlign: 'center',
      align: 'center',
      renderCell: ({ value }) => <span className='font-semibold text-blue-600'>#{value}</span>
    },
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 200 },
    { field: 'course', headerName: 'Course', width: 150 },
    {
      field: 'gender',
      headerName: 'Gender',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: ({ value }) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            value === 'MALE'
              ? 'bg-blue-100 text-blue-800'
              : value === 'FEMALE'
              ? 'bg-pink-100 text-pink-800'
              : 'bg-purple-100 text-purple-800'
          }`}
        >
          {value === 'MALE' ? 'Male' : value === 'FEMALE' ? 'Female' : 'Other'}
        </span>
      )
    },
    {
      field: 'competition',
      headerName: 'Competition',
      width: 150,
      renderCell: ({ value }) => (
        <span>
          {value
            ? value
                .replace(/_/g, ' ')
                .toLowerCase()
                .replace(/\b\w/g, (l) => l.toUpperCase())
            : 'N/A'}
        </span>
      )
    },
    {
      field: 'level',
      headerName: 'Level',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      renderCell: ({ value }) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            value === 'COLLEGE'
              ? 'bg-blue-100 text-blue-800'
              : value === 'SENIOR_HIGH'
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {value === 'COLLEGE' ? 'College' : value === 'SENIOR_HIGH' ? 'Senior High' : 'Basic Education'}
        </span>
      )
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
        <div className='flex gap-1 items-center justify-center h-full'>
          <button
            onClick={() => openModal(row, true)}
            className='p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors cursor-pointer'
            title='Edit Candidate'
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => openModal(row, false)}
            className='p-2 text-red-600 hover:bg-red-100 rounded transition-colors cursor-pointer'
            title='Delete Candidate'
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className='mt-10 flex items-center justify-center p-4'>
      <div className='w-full max-w-6xl'>
        <div className='h-[500px] w-full'>
          <DataGrid
            rows={candidates}
            columns={columns}
            loading={loading}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            disableRowSelectionOnClick
            rowHeight={60}
          />
        </div>
      </div>

      <CandidateModal isOpen={editModalOpen} onClose={closeModals} onSubmit={handleEdit} editData={selectedCandidate} />

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={closeModals}
        onConfirm={handleDelete}
        itemName={selectedCandidate?.name || ''}
        isLoading={deleteLoading}
        itemType='candidate'
      />
    </div>
  )
}
