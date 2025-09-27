'use client'
import React, { useState, useEffect } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Edit, Trash2 } from 'lucide-react'
import axios from 'axios'
import { useToast } from '@/app/context/ToastContext'
import CompetitionModal from './CompetitionModal'
import DeleteModal from './DeleteModal'

export default function CompetitionTable() {
  const [competitions, setCompetitions] = useState([])
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedCompetition, setSelectedCompetition] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { showToast } = useToast()

  const fetchCompetitions = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/competitions')
      data.success ? setCompetitions(data.competitions) : showToast('Failed to fetch competitions', 'error')
    } catch (error) {
      showToast('Failed to fetch competitions', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompetitions()
  }, [])

  const openModal = (competition, isEdit = true) => {
    setSelectedCompetition(competition)
    isEdit ? setEditModalOpen(true) : setDeleteModalOpen(true)
  }

  const closeModals = () => {
    setEditModalOpen(false)
    setDeleteModalOpen(false)
    setSelectedCompetition(null)
  }

  const handleEdit = async (updatedCompetition) => {
    try {
      const { data } = await axios.put(`/api/competitions/${selectedCompetition.id}`, {
        name: updatedCompetition.name,
        level: updatedCompetition.level
      })

      if (data.success) {
        showToast('Competition updated successfully!', 'success')
        await fetchCompetitions()
        closeModals()
      } else {
        showToast(data.error || 'Failed to update competition', 'error')
      }
    } catch (error) {
      showToast('Failed to update competition', 'error')
    }
  }

  const handleDelete = async () => {
    try {
      setDeleteLoading(true)
      const { data } = await axios.delete(`/api/competitions/${selectedCompetition.id}`)

      if (data.success) {
        showToast('Competition deleted successfully!', 'success')
        await fetchCompetitions()
        closeModals()
      } else {
        showToast(data.error || 'Failed to delete competition', 'error')
      }
    } catch (error) {
      showToast('Failed to delete competition', 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  const columns = [
    { field: 'id', headerName: 'ID', width: 80, headerAlign: 'center', align: 'center' },
    { field: 'name', headerName: 'Competition Name', flex: 1, minWidth: 200 },
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
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          }`}
        >
          {value === 'COLLEGE' ? 'College' : 'Senior High'}
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
            className='p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors cursor-pointer'
            title='Edit Competition'
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => openModal(row, false)}
            className='p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors cursor-pointer'
            title='Delete Competition'
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className='mt-10 flex items-center justify-center p-4'>
      <div className='w-full max-w-4xl'>
        <div className='h-[500px] w-full'>
          <DataGrid
            rows={competitions}
            columns={columns}
            loading={loading}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            disableRowSelectionOnClick
          />
        </div>
      </div>

      <CompetitionModal
        isOpen={editModalOpen}
        onClose={closeModals}
        onSubmit={handleEdit}
        editData={selectedCompetition}
      />

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={closeModals}
        onConfirm={handleDelete}
        itemName={selectedCompetition?.name || ''}
        isLoading={deleteLoading}
        itemType='competition'
      />
    </div>
  )
}
