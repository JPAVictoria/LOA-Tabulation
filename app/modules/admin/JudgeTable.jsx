'use client'
import React, { useState, useEffect } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Edit, Trash2 } from 'lucide-react'
import axios from 'axios'
import { useToast } from '@/app/context/ToastContext'
import JudgeModal from './JudgeModal'
import DeleteModal from './DeleteModal'

export default function JudgeTable() {
  const [judges, setJudges] = useState([])
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedJudge, setSelectedJudge] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { showToast } = useToast()

  const fetchJudges = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/judges')
      data.success ? setJudges(data.judges) : showToast('Failed to fetch judges', 'error')
    } catch (error) {
      showToast('Failed to fetch judges', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJudges()
  }, [])

  const openModal = (judge, isEdit = true) => {
    setSelectedJudge(judge)
    isEdit ? setEditModalOpen(true) : setDeleteModalOpen(true)
  }

  const closeModals = () => {
    setEditModalOpen(false)
    setDeleteModalOpen(false)
    setSelectedJudge(null)
  }

  const handleEdit = async (updatedJudge) => {
    try {
      const { data } = await axios.put(`/api/judges/${selectedJudge.id}`, {
        username: updatedJudge.username,
        password: updatedJudge.password,
        assignedCompetition: updatedJudge.assignedCompetition
      })

      if (data.success) {
        showToast('Judge updated successfully!', 'success')
        await fetchJudges()
        closeModals()
      } else {
        showToast(data.error || 'Failed to update judge', 'error')
      }
    } catch (error) {
      showToast('Failed to update judge', 'error')
    }
  }

  const handleDelete = async () => {
    try {
      setDeleteLoading(true)
      const { data } = await axios.delete(`/api/judges/${selectedJudge.id}`)

      if (data.success) {
        showToast('Judge deleted successfully!', 'success')
        await fetchJudges()
        closeModals()
      } else {
        showToast(data.error || 'Failed to delete judge', 'error')
      }
    } catch (error) {
      showToast('Failed to delete judge', 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  const columns = [
    { field: 'id', headerName: 'ID', width: 80, headerAlign: 'center', align: 'center' },
    { field: 'username', headerName: 'Username', flex: 1, minWidth: 200 },
    {
      field: 'assignedCompetition',
      headerName: 'Competition',
      flex: 1,
      minWidth: 200,
      renderCell: ({ value }) => (
        <span className='text-gray-900 dark:text-gray-100'>
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
            className='p-2 text-blue-600 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors'
            title='Edit Judge'
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => openModal(row, false)}
            className='p-2 text-red-600 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors'
            title='Delete Judge'
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className='mt-10 flex items-center justify-center p-4'>
      <div className='w-full max-w-5xl'>
        <div className='h-[500px] w-full'>
          <DataGrid
            rows={judges}
            columns={columns}
            loading={loading}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            disableRowSelectionOnClick
          />
        </div>
      </div>

      <JudgeModal isOpen={editModalOpen} onClose={closeModals} onSubmit={handleEdit} editData={selectedJudge} />

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={closeModals}
        onConfirm={handleDelete}
        itemName={selectedJudge?.username || ''}
        isLoading={deleteLoading}
        itemType='judge'
      />
    </div>
  )
}
