'use client'
import React, { useState, useEffect } from 'react'
import { X, Tags, Loader2 } from 'lucide-react'
import { Autocomplete, TextField } from '@mui/material'
import axios from 'axios'
import { useToast } from '@/app/context/ToastContext'

export default function CategoryModal({ isOpen, onClose, onSubmit, editData = null }) {
  const [formData, setFormData] = useState({ name: '', competition: null })
  const [competitions, setCompetitions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCompetitions, setIsLoadingCompetitions] = useState(false)
  const { showToast } = useToast()

  const isEditMode = Boolean(editData)

  useEffect(() => {
    if (isOpen) {
      fetchCompetitions()

      if (editData) {
        setFormData({
          name: editData.name,
          competition: editData.competition
        })
      } else {
        setFormData({ name: '', competition: null })
      }
    }
  }, [isOpen, editData])

  const fetchCompetitions = async () => {
    setIsLoadingCompetitions(true)
    try {
      const { data } = await axios.get('/api/competitions')
      if (data.success) {
        setCompetitions(data.competitions)
      }
    } catch (error) {
      showToast('Failed to load competitions', 'error')
    } finally {
      setIsLoadingCompetitions(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.competition) {
      return showToast('All fields are required', 'error')
    }

    setIsLoading(true)

    try {
      if (isEditMode) {
        const { data } = await axios.put(`/api/categories/${editData.id}`, {
          name: formData.name.trim(),
          competition: formData.competition // Remove parseInt()
        })

        if (data.success) {
          showToast('Category updated successfully!', 'success')
          onSubmit?.(data.category)
          setFormData({ name: '', competition: null })
          onClose?.()
        } else {
          showToast(data.error || 'Failed to update category', 'error')
        }
      } else {
        const { data } = await axios.post('/api/categories', {
          name: formData.name.trim(),
          competition: formData.competition // Remove parseInt()
        })

        if (data.success) {
          showToast('Category created successfully!', 'success')
          onSubmit?.(data.category)
          setFormData({ name: '', competition: null })
          onClose?.()
        } else {
          showToast(data.error || 'Failed to create category', 'error')
        }
      }
    } catch (error) {
      showToast(`Failed to ${isEditMode ? 'update' : 'create'} category`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleClose = () => {
    if (!isLoading) {
      setFormData({ name: '', competition: null })
      onClose?.()
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
      <div className='bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden'>
        <div className='relative px-6 py-6 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-400 dark:from-blue-400 dark:via-blue-300 dark:to-purple-200'>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className='cursor-pointer absolute right-4 top-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <X size={20} />
          </button>

          <div className='flex items-center gap-3'>
            <div className='p-3 bg-white/20 rounded-xl backdrop-blur-sm'>
              <Tags className='text-white' size={24} />
            </div>
            <div>
              <h2 className='text-white text-xl font-bold'>{isEditMode ? 'Edit Category' : 'Create Category'}</h2>
              <p className='text-white/80 text-sm'>
                {isEditMode ? 'Update category details' : 'Add a new category to a competition'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Category Name *</label>
            <input
              type='text'
              name='name'
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
              placeholder='Enter category name'
              className='w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       placeholder-gray-500 dark:placeholder-gray-400 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Competition *</label>
            <Autocomplete
              options={competitions}
              getOptionLabel={(option) => option.displayName}
              value={competitions.find((comp) => comp.name === formData.competition) || null}
              onChange={(e, value) => setFormData((prev) => ({ ...prev, competition: value?.name || null }))}
              disabled={isLoading || isLoadingCompetitions}
              loading={isLoadingCompetitions}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={isLoadingCompetitions ? 'Loading competitions...' : 'Select competition'}
                  variant='outlined'
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isLoadingCompetitions && <Loader2 size={20} className='animate-spin' />}
                        {params.InputProps.endAdornment}
                      </>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '& fieldset': { borderColor: '#d1d5db' },
                      '&:hover fieldset': { borderColor: '#3b82f6' },
                      '&.Mui-focused fieldset': { borderColor: '#3b82f6', borderWidth: '2px' },
                      '&.Mui-disabled fieldset': { borderColor: '#d1d5db', opacity: 0.5 }
                    }
                  }}
                />
              )}
            />
          </div>

          <div className='flex gap-3 pt-4'>
            <button
              type='button'
              onClick={handleClose}
              disabled={isLoading}
              className='cursor-pointer flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 
                       rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium
                       disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isLoading || !formData.name.trim() || !formData.competition}
              className='cursor-pointer flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-400 
                       dark:from-blue-400 dark:via-blue-300 dark:to-purple-200 text-white rounded-xl 
                       hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none'
            >
              {isLoading && <Loader2 size={16} className='animate-spin' />}
              {isLoading
                ? isEditMode
                  ? 'Updating...'
                  : 'Creating...'
                : isEditMode
                ? 'Update Category'
                : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
