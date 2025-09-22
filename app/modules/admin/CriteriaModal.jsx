'use client'
import React, { useState, useEffect } from 'react'
import { X, Target, Loader2 } from 'lucide-react'
import { Autocomplete, TextField } from '@mui/material'
import axios from 'axios'
import { useToast } from '@/app/context/ToastContext'

export default function CriteriaModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({ name: '', percentage: '', categoryId: null })
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
    }
  }, [isOpen])

  const fetchCategories = async () => {
    setIsLoadingCategories(true)
    try {
      const { data } = await axios.get('/api/categories')
      if (data.success) {
        setCategories(data.categories)
      }
    } catch (error) {
      showToast('Failed to load categories', 'error')
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.percentage || !formData.categoryId) {
      return showToast('All fields are required', 'error')
    }

    const percentage = parseInt(formData.percentage)
    if (percentage < 1 || percentage > 100) {
      return showToast('Percentage must be between 1 and 100', 'error')
    }

    setIsLoading(true)

    try {
      const { data } = await axios.post('/api/criterias', {
        name: formData.name.trim(),
        percentage,
        categoryId: parseInt(formData.categoryId)
      })

      if (data.success) {
        showToast('Criteria created successfully!', 'success')
        onSubmit?.(data.criteria)
        setFormData({ name: '', percentage: '', categoryId: null })
        onClose?.()
      } else {
        showToast(data.error || 'Failed to create criteria', 'error')
      }
    } catch (error) {
      showToast('Failed to create criteria', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'percentage') {
      const numValue = value.replace(/[^0-9]/g, '')
      if (numValue === '' || (parseInt(numValue) >= 1 && parseInt(numValue) <= 100)) {
        setFormData((prev) => ({ ...prev, [name]: numValue }))
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleCategoryChange = (event, newValue) => {
    setFormData((prev) => ({ ...prev, categoryId: newValue?.id || null }))
  }

  const handleClose = () => {
    if (!isLoading) {
      setFormData({ name: '', percentage: '', categoryId: null })
      onClose?.()
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
      <div className='bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden'>
        <div className='relative px-6 py-6 bg-gradient-to-r from-green-600 via-green-500 to-emerald-400 dark:from-green-400 dark:via-green-300 dark:to-emerald-200'>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className='cursor-pointer absolute right-4 top-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <X size={20} />
          </button>

          <div className='flex items-center gap-3'>
            <div className='p-3 bg-white/20 rounded-xl backdrop-blur-sm'>
              <Target className='text-white' size={24} />
            </div>
            <div>
              <h2 className='text-white text-xl font-bold'>Create Criteria</h2>
              <p className='text-white/80 text-sm'>Add a new criteria to a category</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Criteria Name *</label>
            <input
              type='text'
              name='name'
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
              placeholder='Enter criteria name'
              className='w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl 
                       focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       placeholder-gray-500 dark:placeholder-gray-400 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Percentage (1-100) *
            </label>
            <input
              type='text'
              name='percentage'
              value={formData.percentage}
              onChange={handleChange}
              disabled={isLoading}
              placeholder='Enter percentage (1-100)'
              className='w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl 
                       focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       placeholder-gray-500 dark:placeholder-gray-400 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Category *</label>
            <Autocomplete
              options={categories}
              getOptionLabel={(option) => `${option.name} (${option.competition.name})`}
              value={categories.find((cat) => cat.id === formData.categoryId) || null}
              onChange={handleCategoryChange}
              disabled={isLoading || isLoadingCategories}
              loading={isLoadingCategories}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={isLoadingCategories ? 'Loading categories...' : 'Select category'}
                  variant='outlined'
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isLoadingCategories && <Loader2 size={20} className='animate-spin' />}
                        {params.InputProps.endAdornment}
                      </>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '& fieldset': { borderColor: '#d1d5db' },
                      '&:hover fieldset': { borderColor: '#10b981' },
                      '&.Mui-focused fieldset': { borderColor: '#10b981', borderWidth: '2px' },
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
              disabled={isLoading || !formData.name.trim() || !formData.percentage || !formData.categoryId}
              className='cursor-pointer flex-1 px-4 py-3 bg-gradient-to-r from-green-600 via-green-500 to-emerald-400 
                       dark:from-green-400 dark:via-green-300 dark:to-emerald-200 text-white rounded-xl 
                       hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none'
            >
              {isLoading && <Loader2 size={16} className='animate-spin' />}
              {isLoading ? 'Creating...' : 'Create Criteria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
