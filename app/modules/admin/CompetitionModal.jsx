'use client'
import React, { useState } from 'react'
import { X, Trophy, Loader2 } from 'lucide-react'
import { Autocomplete, TextField } from '@mui/material'
import axios from 'axios'
import { useToast } from '@/app/context/ToastContext'

const levelOptions = ['COLLEGE', 'SENIOR_HIGH']

export default function CompetitionModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({ name: '', level: null })
  const [isLoading, setIsLoading] = useState(false)
  const { showToast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.level) {
      return showToast('All fields are required', 'error')
    }

    setIsLoading(true)

    try {
      const { data } = await axios.post('/api/competitions', {
        name: formData.name.trim(),
        level: formData.level
      })

      if (data.success) {
        showToast('Competition created successfully!', 'success')
        onSubmit?.(data.competition)
        setFormData({ name: '', level: null })
        onClose?.()
      } else {
        showToast(data.error || 'Failed to create competition', 'error')
      }
    } catch (error) {
      showToast('Failed to create competition', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleLevelChange = (event, newValue) => {
    setFormData((prev) => ({ ...prev, level: newValue }))
  }

  const handleClose = () => {
    if (!isLoading) {
      setFormData({ name: '', level: null })
      onClose?.()
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
      <div className='bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden'>
        <div className='relative px-6 py-6 bg-gradient-to-r from-red-600 via-red-500 to-pink-400 dark:from-red-400 dark:via-red-300 dark:to-pink-200'>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className='cursor-pointer absolute right-4 top-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <X size={20} />
          </button>

          <div className='flex items-center gap-3'>
            <div className='p-3 bg-white/20 rounded-xl backdrop-blur-sm'>
              <Trophy className='text-white' size={24} />
            </div>
            <div>
              <h2 className='text-white text-xl font-bold'>Create Competition</h2>
              <p className='text-white/80 text-sm'>Add a new competition event</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Competition Name *
            </label>
            <input
              type='text'
              name='name'
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
              placeholder='Enter competition name'
              className='w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl 
                       focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       placeholder-gray-500 dark:placeholder-gray-400 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Level *</label>
            <Autocomplete
              options={levelOptions}
              value={formData.level}
              onChange={handleLevelChange}
              disabled={isLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder='Select level'
                  variant='outlined'
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '& fieldset': { borderColor: '#d1d5db' },
                      '&:hover fieldset': { borderColor: '#ef4444' },
                      '&.Mui-focused fieldset': { borderColor: '#ef4444', borderWidth: '2px' },
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
              className='flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 
                       rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium
                       disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isLoading || !formData.name.trim() || !formData.level}
              className='flex-1 px-4 py-3 bg-gradient-to-r from-red-600 via-red-500 to-pink-400 
                       dark:from-red-400 dark:via-red-300 dark:to-pink-200 text-white rounded-xl 
                       hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none cursor-pointer'
            >
              {isLoading && <Loader2 size={16} className='animate-spin' />}
              {isLoading ? 'Creating...' : 'Create Competition'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
