'use client'
import React, { useState, useEffect } from 'react'
import { X, Users, Loader2, Image as ImageIcon, Trash2 } from 'lucide-react'
import { Autocomplete, TextField } from '@mui/material'
import axios from 'axios'
import { useToast } from '@/app/context/ToastContext'

const genderOptions = ['MALE', 'FEMALE', 'OTHER']

export default function CandidateModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    course: '',
    candidateNumber: '',
    gender: null,
    competitionId: null,
    image: null
  })
  const [competitions, setCompetitions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCompetitions, setIsLoadingCompetitions] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const { showToast } = useToast()

  useEffect(() => {
    if (isOpen) fetchCompetitions()
  }, [isOpen])

  const fetchCompetitions = async () => {
    setIsLoadingCompetitions(true)
    try {
      const { data } = await axios.get('/api/competitions')
      if (data.success) setCompetitions(data.competitions)
    } catch (error) {
      showToast('Failed to load competitions', 'error')
    } finally {
      setIsLoadingCompetitions(false)
    }
  }

  const resetForm = () => {
    setFormData({ name: '', course: '', candidateNumber: '', gender: null, competitionId: null, image: null })
    setImagePreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { name, course, candidateNumber, gender, competitionId, image } = formData

    if (!name.trim() || !course.trim() || !candidateNumber || !gender || !competitionId) {
      return showToast('All fields except image are required', 'error')
    }

    const candidateNum = parseInt(candidateNumber)
    if (candidateNum < 1) {
      return showToast('Candidate number must be greater than 0', 'error')
    }

    setIsLoading(true)
    try {
      const submitData = new FormData()
      submitData.append('name', name.trim())
      submitData.append('course', course.trim())
      submitData.append('candidateNumber', candidateNum.toString())
      submitData.append('gender', gender)
      submitData.append('competitionId', competitionId.toString())
      if (image) submitData.append('image', image)

      const { data } = await axios.post('/api/candidates', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (data.success) {
        showToast('Candidate created successfully!', 'success')
        onSubmit?.(data.candidate)
        resetForm()
        onClose?.()
      } else {
        showToast(data.error || 'Failed to create candidate', 'error')
      }
    } catch (error) {
      showToast('Failed to create candidate', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'candidateNumber' ? value.replace(/[^0-9]/g, '') : value
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      return showToast('Please select an image file', 'error')
    }
    if (file.size > 5 * 1024 * 1024) {
      return showToast('Image size must be less than 5MB', 'error')
    }

    setFormData((prev) => ({ ...prev, image: file }))
    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target.result)
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }))
    setImagePreview(null)
    document.getElementById('image-upload').value = ''
  }

  const handleClose = () => {
    if (!isLoading) {
      resetForm()
      onClose?.()
    }
  }

  const isFormValid =
    formData.name.trim() &&
    formData.course.trim() &&
    formData.candidateNumber &&
    formData.gender &&
    formData.competitionId

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
      <div className='bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg relative max-h-[90vh] overflow-y-auto'>
        <div className='relative px-6 py-6 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 dark:from-blue-400 dark:via-blue-300 dark:to-cyan-200'>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className='cursor-pointer absolute right-4 top-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <X size={20} />
          </button>
          <div className='flex items-center gap-3'>
            <div className='p-3 bg-white/20 rounded-xl backdrop-blur-sm'>
              <Users className='text-white' size={24} />
            </div>
            <div>
              <h2 className='text-white text-xl font-bold'>Create Candidate</h2>
              <p className='text-white/80 text-sm'>Add a new candidate to a competition</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          {['name', 'course'].map((field) => (
            <div key={field}>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                {field === 'name' ? 'Candidate Name' : 'Course'} *
              </label>
              <input
                type='text'
                name={field}
                value={formData[field]}
                onChange={handleChange}
                disabled={isLoading}
                placeholder={`Enter ${field === 'name' ? 'candidate name' : 'course'}`}
                className='w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
              />
            </div>
          ))}

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Candidate Number *
            </label>
            <input
              type='text'
              name='candidateNumber'
              value={formData.candidateNumber}
              onChange={handleChange}
              disabled={isLoading}
              placeholder='Enter candidate number'
              className='w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Gender *</label>
            <Autocomplete
              options={genderOptions}
              value={formData.gender}
              onChange={(e, newValue) => setFormData((prev) => ({ ...prev, gender: newValue }))}
              disabled={isLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder='Select gender'
                  variant='outlined'
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '& fieldset': { borderColor: '#d1d5db' },
                      '&:hover fieldset': { borderColor: '#3b82f6' },
                      '&.Mui-focused fieldset': { borderColor: '#3b82f6', borderWidth: '2px' }
                    }
                  }}
                />
              )}
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Competition *</label>
            <Autocomplete
              options={competitions}
              getOptionLabel={(option) => option.name}
              value={competitions.find((comp) => comp.id === formData.competitionId) || null}
              onChange={(e, newValue) => setFormData((prev) => ({ ...prev, competitionId: newValue?.id || null }))}
              disabled={isLoading || isLoadingCompetitions}
              loading={isLoadingCompetitions}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={isLoadingCompetitions ? 'Loading...' : 'Select competition'}
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
                      '&.Mui-focused fieldset': { borderColor: '#3b82f6', borderWidth: '2px' }
                    }
                  }}
                />
              )}
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Image (Optional)</label>
            <input
              type='file'
              accept='image/*'
              onChange={handleImageChange}
              disabled={isLoading}
              className='hidden'
              id='image-upload'
            />

            {imagePreview ? (
              <div className='relative group'>
                <img
                  src={imagePreview}
                  alt='Preview'
                  className='w-full h-48 object-cover rounded-xl border-2 border-gray-300 dark:border-gray-600'
                />
                <div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 rounded-xl flex items-center justify-center'>
                  <button
                    type='button'
                    onClick={removeImage}
                    disabled={isLoading}
                    className='cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg px-3 py-2 text-sm font-medium flex items-center gap-2 border border-white/30 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    <Trash2 size={16} />
                    Remove Image
                  </button>
                </div>
              </div>
            ) : (
              <label
                htmlFor='image-upload'
                className='cursor-pointer flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-500 transition-colors group'
              >
                <div className='flex flex-col items-center justify-center py-6'>
                  <ImageIcon size={48} className='text-gray-400 group-hover:text-blue-500 transition-colors mb-3' />
                  <span className='text-base font-medium text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'>
                    Click to upload image
                  </span>
                  <span className='text-sm text-gray-500 dark:text-gray-400 mt-1'>PNG, JPG, JPEG up to 5MB</span>
                </div>
              </label>
            )}
          </div>

          <div className='flex gap-3 pt-4'>
            <button
              type='button'
              onClick={handleClose}
              disabled={isLoading}
              className='cursor-pointer flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isLoading || !isFormValid}
              className='cursor-pointer flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 dark:from-blue-400 dark:via-blue-300 dark:to-cyan-200 text-white rounded-xl hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoading && <Loader2 size={16} className='animate-spin' />}
              {isLoading ? 'Creating...' : 'Create Candidate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
