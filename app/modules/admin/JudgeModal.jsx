'use client'
import React, { useState, useEffect } from 'react'
import { X, Gavel, Loader2, Eye, EyeOff } from 'lucide-react'
import { Autocomplete, TextField } from '@mui/material'
import axios from 'axios'
import { useToast } from '@/app/context/ToastContext'

export default function JudgeModal({ isOpen, onClose, onSubmit, editData = null }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    competitionId: null
  })
  const [competitions, setCompetitions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCompetitions, setIsLoadingCompetitions] = useState(false)
  const { showToast } = useToast()
  const [showPassword, setShowPassword] = useState(false)

  const isEditMode = Boolean(editData)

  useEffect(() => {
    if (isOpen) {
      fetchCompetitions()

      if (editData) {
        setFormData({
          username: editData.username,
          password: '',
          competitionId: editData.competitionId
        })
      } else {
        setFormData({ username: '', password: '', competitionId: null })
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

    if (!formData.username.trim() || !formData.password.trim() || !formData.competitionId) {
      return showToast('All fields are required', 'error')
    }

    setIsLoading(true)

    try {
      if (isEditMode) {
        onSubmit?.(formData)
      } else {
        const { data } = await axios.post('/api/judges', {
          username: formData.username.trim(),
          password: formData.password.trim(),
          competitionId: parseInt(formData.competitionId)
        })

        if (data.success) {
          showToast('Judge created successfully!', 'success')
          onSubmit?.(data.judge)
          setFormData({ username: '', password: '', competitionId: null })
          onClose?.()
        } else {
          showToast(data.error || 'Failed to create judge', 'error')
        }
      }
    } catch (error) {
      showToast(`Failed to ${isEditMode ? 'update' : 'create'} judge`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleCompetitionChange = (event, newValue) => {
    setFormData((prev) => ({ ...prev, competitionId: newValue?.id || null }))
  }

  const handleClose = () => {
    if (!isLoading) {
      setFormData({ username: '', password: '', competitionId: null })
      onClose?.()
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
      <div className='bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden'>
        <div className='relative px-6 py-6 bg-gradient-to-r from-yellow-500 via-yellow-400 to-amber-300 dark:from-yellow-400 dark:via-yellow-300 dark:to-amber-200'>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className='cursor-pointer absolute right-4 top-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <X size={20} />
          </button>

          <div className='flex items-center gap-3'>
            <div className='p-3 bg-white/20 rounded-xl backdrop-blur-sm'>
              <Gavel className='text-white' size={24} />
            </div>
            <div>
              <h2 className='text-white text-xl font-bold'>{isEditMode ? 'Edit Judge' : 'Create Judge'}</h2>
              <p className='text-white/80 text-sm'>{isEditMode ? 'Update judge details' : 'Add a new judge account'}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Username *</label>
            <input
              type='text'
              name='username'
              value={formData.username}
              onChange={handleChange}
              disabled={isLoading}
              placeholder='Enter username'
              className='w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl 
                       focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       placeholder-gray-500 dark:placeholder-gray-400 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Password *</label>
            <div className='relative'>
              <input
                type={showPassword ? 'text' : 'password'}
                name='password'
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                placeholder='Enter password'
                className='w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl 
       focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent
       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
       placeholder-gray-500 dark:placeholder-gray-400 transition-all
       disabled:opacity-50 disabled:cursor-not-allowed'
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='cursor-pointer absolute inset-y-0 right-0 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                tabIndex={-1}
              >
                <span className='px-3'>{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</span>
              </button>
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Competition *</label>
            <Autocomplete
              options={competitions}
              getOptionLabel={(option) => `${option.name} (${option.level})`}
              value={competitions.find((comp) => comp.id === formData.competitionId) || null}
              onChange={handleCompetitionChange}
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
                      '&:hover fieldset': { borderColor: '#eab308' },
                      '&.Mui-focused fieldset': { borderColor: '#eab308', borderWidth: '2px' },
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
              disabled={isLoading || !formData.username.trim() || !formData.password.trim() || !formData.competitionId}
              className='cursor-pointer flex-1 px-4 py-3 bg-gradient-to-r from-yellow-500 via-yellow-400 to-amber-300 
                       dark:from-yellow-400 dark:via-yellow-300 dark:to-amber-200 text-white rounded-xl 
                       hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none'
            >
              {isLoading && <Loader2 size={16} className='animate-spin' />}
              {isLoading ? (isEditMode ? 'Updating...' : 'Creating...') : isEditMode ? 'Update Judge' : 'Create Judge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
