'use client'
import React, { useState, useEffect } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Edit, Trash2 } from 'lucide-react'
import axios from 'axios'
import { useToast } from '@/app/context/ToastContext'
import CriteriaModal from './CriteriaModal'
import DeleteModal from './DeleteModal'

export default function CriteriaTable() {
  const [criterias, setCriterias] = useState([])
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedCriteria, setSelectedCriteria] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { showToast } = useToast()

  const fetchCriterias = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/criterias')
      data.success ? setCriterias(data.criterias) : showToast('Failed to fetch criterias', 'error')
    } catch (error) {
      showToast('Failed to fetch criterias', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCriterias()
  }, [])

  const openModal = (criteria, isEdit = true) => {
    setSelectedCriteria(criteria)
    isEdit ? setEditModalOpen(true) : setDeleteModalOpen(true)
  }

  const closeModals = () => {
    setEditModalOpen(false)
    setDeleteModalOpen(false)
    setSelectedCriteria(null)
  }

  const handleEdit = async (updatedCriteria) => {
    try {
      const { data } = await axios.put(`/api/criterias/${selectedCriteria.id}`, {
        name: updatedCriteria.name,
        percentage: updatedCriteria.percentage,
        categoryId: updatedCriteria.categoryId
      })

      if (data.success) {
        showToast('Criteria updated successfully!', 'success')
        await fetchCriterias()
        closeModals()
      } else {
        showToast(data.error || 'Failed to update criteria', 'error')
      }
    } catch (error) {
      // Handle the case where PUT route doesn't exist yet
      if (error.response?.status === 404) {
        showToast('Edit functionality not yet implemented', 'error')
      } else {
        showToast('Failed to update criteria', 'error')
      }
    }
  }

  const handleDelete = async () => {
    try {
      setDeleteLoading(true)
      const { data } = await axios.delete(`/api/criterias/${selectedCriteria.id}`)

      if (data.success) {
        showToast('Criteria deleted successfully!', 'success')
        await fetchCriterias()
        closeModals()
      } else {
        showToast(data.error || 'Failed to delete criteria', 'error')
      }
    } catch (error) {
      showToast('Failed to delete criteria', 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  const columns = [
    { field: 'id', headerName: 'ID', width: 80, headerAlign: 'center', align: 'center' },
    { field: 'name', headerName: 'Criteria Name', flex: 1, minWidth: 200 },
    {
      field: 'percentage',
      headerName: 'Percentage',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      renderCell: ({ value }) => <span className='font-medium text-gray-900 dark:text-gray-100'>{value}%</span>
    },
    {
      field: 'category',
      headerName: 'Category',
      flex: 1,
      minWidth: 180,
      renderCell: ({ value }) => <span className='text-gray-900 dark:text-gray-100'>{value?.name || 'N/A'}</span>
    },
    {
      field: 'competition',
      headerName: 'Competition',
      flex: 1,
      minWidth: 180,
      renderCell: ({ row }) => (
        <span className='text-gray-900 dark:text-gray-100'>
          {row.category?.competition
            ? row.category.competition
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
            className='p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer rounded transition-colors'
            title='Edit Criteria'
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => openModal(row, false)}
            className='p-2 text-red-600 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors'
            title='Delete Criteria'
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
            rows={criterias}
            columns={columns}
            loading={loading}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            disableRowSelectionOnClick
          />
        </div>
      </div>

      <CriteriaModal isOpen={editModalOpen} onClose={closeModals} onSubmit={handleEdit} editData={selectedCriteria} />

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={closeModals}
        onConfirm={handleDelete}
        itemName={selectedCriteria?.name || ''}
        isLoading={deleteLoading}
        itemType='criteria'
      />
    </div>
  )
}
