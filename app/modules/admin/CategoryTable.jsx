'use client'
import React, { useState, useEffect } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Edit, Trash2 } from 'lucide-react'
import axios from 'axios'
import { useToast } from '@/app/context/ToastContext'
import CategoryModal from './CategoryModal'
import DeleteModal from './DeleteModal'

export default function CategoryTable() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { showToast } = useToast()

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/categories')
      data.success ? setCategories(data.categories) : showToast('Failed to fetch categories', 'error')
    } catch (error) {
      showToast('Failed to fetch categories', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const openModal = (category, isEdit = true) => {
    setSelectedCategory(category)
    isEdit ? setEditModalOpen(true) : setDeleteModalOpen(true)
  }

  const closeModals = () => {
    setEditModalOpen(false)
    setDeleteModalOpen(false)
    setSelectedCategory(null)
  }

  const handleEdit = async (updatedCategory) => {
    try {
      const { data } = await axios.put(`/api/categories/${selectedCategory.id}`, {
        name: updatedCategory.name,
        competition: updatedCategory.competition
      })

      if (data.success) {
        showToast('Category updated successfully!', 'success')
        await fetchCategories()
        closeModals()
      } else {
        showToast(data.error || 'Failed to update category', 'error')
      }
    } catch (error) {
      showToast('Failed to update category', 'error')
    }
  }

  const handleDelete = async () => {
    try {
      setDeleteLoading(true)
      const { data } = await axios.delete(`/api/categories/${selectedCategory.id}`)

      if (data.success) {
        showToast('Category deleted successfully!', 'success')
        await fetchCategories()
        closeModals()
      } else {
        showToast(data.error || 'Failed to delete category', 'error')
      }
    } catch (error) {
      showToast('Failed to delete category', 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  const columns = [
    { field: 'id', headerName: 'ID', width: 80, headerAlign: 'center', align: 'center' },
    { field: 'name', headerName: 'Category Name', flex: 1, minWidth: 200 },
    {
      field: 'competition',
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
            title='Edit Category'
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => openModal(row, false)}
            className='p-2 text-red-600 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors'
            title='Delete Category'
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
            rows={categories}
            columns={columns}
            loading={loading}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            disableRowSelectionOnClick
          />
        </div>
      </div>

      <CategoryModal isOpen={editModalOpen} onClose={closeModals} onSubmit={handleEdit} editData={selectedCategory} />

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={closeModals}
        onConfirm={handleDelete}
        itemName={selectedCategory?.name || ''}
        isLoading={deleteLoading}
        itemType='category'
      />
    </div>
  )
}
