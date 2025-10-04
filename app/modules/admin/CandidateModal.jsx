'use client'
import React, { useState, useEffect } from 'react'
import { X, Users, Loader2, Image as ImageIcon, Trash2 } from 'lucide-react'
import { Autocomplete, TextField } from '@mui/material'
import axios from 'axios'
import { useToast } from '@/app/context/ToastContext'

const genderOptions = ['MALE', 'FEMALE', 'OTHER']
const levelOptions = ['COLLEGE', 'SENIOR_HIGH']

export default function CandidateModal({ isOpen, onClose, onSubmit, editData = null }) {
  const [formData, setFormData] = useState({
    name: '',
    course: '',
    candidateNumber: '',
    gender: null,
    competition: null,
    level: null,
    image: null
  })
  const [competitions, setCompetitions] = useState([])
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [removeExistingImage, setRemoveExistingImage] = useState(false)
  const { showToast } = useToast()

  const isEditMode = Boolean(editData)

  useEffect(() => {
    if (isOpen) {
      fetchCompetitions()
      if (editData) {
        setFormData({
          name: editData.name || '',
          course: editData.course || '',
          candidateNumber: editData.candidateNumber?.toString() || '',
          gender: editData.gender || null,
          competition: editData.competition || null,
          level: editData.level || null,
          image: null
        })
        setImagePreview(editData.imageUrl || null)
        setRemoveExistingImage(false)
      } else {
        resetForm()
      }
    }
  }, [isOpen, editData])

  const fetchCompetitions = async () => {
    try {
      const { data } = await axios.get('/api/competitions')
      if (data.success) setCompetitions(data.competitions)
    } catch (error) {
      showToast('Failed to load competitions', 'error')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      course: '',
      candidateNumber: '',
      gender: null,
      competition: null,
      level: null,
      image: null
    })
    setImagePreview(null)
    setRemoveExistingImage(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { name, course, candidateNumber, gender, competition, level, image } = formData

    if (!name.trim() || !course.trim() || !candidateNumber || !gender || !competition || !level) {
      return showToast('All fields except image are required', 'error')
    }

    if (parseInt(candidateNumber) < 1) {
      return showToast('Candidate number must be greater than 0', 'error')
    }

    setLoading(true)
    try {
      const formDataToSubmit = new FormData()
      formDataToSubmit.append('name', name.trim())
      formDataToSubmit.append('course', course.trim())
      formDataToSubmit.append('candidateNumber', candidateNumber)
      formDataToSubmit.append('gender', gender)
      formDataToSubmit.append('competition', competition)
      formDataToSubmit.append('level', level)

      if (isEditMode) {
        if (removeExistingImage) {
          formDataToSubmit.append('removeImage', 'true')
        } else if (image) {
          formDataToSubmit.append('image', image)
        }

        const { data } = await axios.put(`/api/candidates/${editData.id}`, formDataToSubmit, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })

        if (data.success) {
          showToast('Candidate updated successfully!', 'success')
          onSubmit(data.candidate)
          resetForm()
          onClose()
        } else {
          showToast(data.error || 'Failed to update candidate', 'error')
        }
      } else {
        if (image) formDataToSubmit.append('image', image)

        const { data } = await axios.post('/api/candidates', formDataToSubmit, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })

        if (data.success) {
          showToast('Candidate created successfully!', 'success')
          onSubmit(data.candidate)
          resetForm()
          onClose()
        } else {
          showToast(data.error || 'Failed to create candidate', 'error')
        }
      }
    } catch (error) {
      showToast(`Failed to ${isEditMode ? 'update' : 'create'} candidate`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) return showToast('Please select an image file', 'error')
    if (file.size > 5 * 1024 * 1024) return showToast('Image size must be less than 5MB', 'error')

    setFormData((prev) => ({ ...prev, image: file }))
    setRemoveExistingImage(false)

    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target.result)
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }))
    setImagePreview(null)
    setRemoveExistingImage(isEditMode && editData?.imageUrl)
    document.getElementById('image-upload').value = ''
  }

  const isFormValid =
    formData.name.trim() &&
    formData.course.trim() &&
    formData.candidateNumber &&
    formData.gender &&
    formData.competition &&
    formData.level

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-lg relative max-h-[90vh] overflow-y-auto'>
        <div className='relative px-6 py-6 bg-gradient-to-r from-blue-600 to-cyan-400'>
          <button
            onClick={() => !loading && (resetForm(), onClose())}
            disabled={loading}
            className='absolute right-4 top-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed'
          >
            <X size={20} />
          </button>
          <div className='flex items-center gap-3'>
            <div className='p-3 bg-white/20 rounded-xl'>
              <Users className='text-white' size={24} />
            </div>
            <div>
              <h2 className='text-white text-xl font-bold'>{isEditMode ? 'Edit Candidate' : 'Create Candidate'}</h2>
              <p className='text-white/80 text-sm'>{isEditMode ? 'Update candidate details' : 'Add a new candidate'}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Name *</label>
            <input
              type='text'
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              disabled={loading}
              placeholder='Enter candidate name'
              className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:opacity-50'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Course *</label>
            <input
              type='text'
              value={formData.course}
              onChange={(e) => setFormData((prev) => ({ ...prev, course: e.target.value }))}
              disabled={loading}
              placeholder='Enter course'
              className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:opacity-50'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Candidate Number *</label>
            <input
              type='text'
              value={formData.candidateNumber}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, candidateNumber: e.target.value.replace(/[^0-9]/g, '') }))
              }
              disabled={loading}
              placeholder='Enter candidate number'
              className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:opacity-50'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Gender *</label>
            <Autocomplete
              options={genderOptions}
              value={formData.gender}
              onChange={(e, value) => setFormData((prev) => ({ ...prev, gender: value }))}
              disabled={loading}
              renderInput={(params) => <TextField {...params} placeholder='Select gender' />}
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Competition *</label>
            <Autocomplete
              options={competitions}
              getOptionLabel={(option) => option.displayName}
              value={competitions.find((comp) => comp.name === formData.competition) || null}
              onChange={(e, value) => setFormData((prev) => ({ ...prev, competition: value?.name || null }))}
              disabled={loading}
              renderInput={(params) => <TextField {...params} placeholder='Select competition' />}
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Level *</label>
            <Autocomplete
              options={levelOptions}
              getOptionLabel={(option) => (option === 'COLLEGE' ? 'College' : 'Senior High')}
              value={formData.level}
              onChange={(e, value) => setFormData((prev) => ({ ...prev, level: value }))}
              disabled={loading}
              renderInput={(params) => <TextField {...params} placeholder='Select level' />}
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Image (Optional)</label>
            <input
              type='file'
              accept='image/*'
              onChange={handleImageChange}
              disabled={loading}
              className='hidden'
              id='image-upload'
            />

            {imagePreview && !removeExistingImage ? (
              <div className='relative group'>
                <img
                  src={imagePreview}
                  alt='Preview'
                  className='w-full h-48 object-cover rounded-xl border-2 border-gray-300'
                />
                <div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all rounded-xl flex items-center justify-center'>
                  <button
                    type='button'
                    onClick={removeImage}
                    disabled={loading}
                    className='opacity-0 group-hover:opacity-100 bg-white/10 hover:bg-white/20 text-white rounded-lg px-3 py-2 text-sm flex items-center gap-2 border border-white/30 cursor-pointer disabled:cursor-not-allowed'
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className='space-y-2'>
                {removeExistingImage && <p className='text-sm text-orange-600'>Image will be removed when saved</p>}
                <label
                  htmlFor='image-upload'
                  className='flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 cursor-pointer'
                >
                  <ImageIcon size={48} className='text-gray-400 mb-3' />
                  <span className='text-gray-600'>Click to upload image</span>
                  <span className='text-sm text-gray-500 mt-1'>PNG, JPG, JPEG up to 5MB</span>
                </label>
              </div>
            )}
          </div>

          <div className='flex gap-3 pt-4'>
            <button
              type='button'
              onClick={() => !loading && (resetForm(), onClose())}
              disabled={loading}
              className='flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading || !isFormValid}
              className='flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-400 text-white rounded-xl hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed'
            >
              {loading && <Loader2 size={16} className='animate-spin' />}
              {loading ? (isEditMode ? 'Updating...' : 'Creating...') : isEditMode ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
