'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useToast } from '@/app/context/ToastContext'
import ImageSection from '@/app/modules/common/login/ImageSection'
import LoginSection from '@/app/modules/common/login/LoginSection'
import { PAGEANT_COLLEGE_LOGIN_DATA } from '@/app/constants/pageant-college/constants'

export default function PageantCollegePage() {
  const [isLoading, setIsLoading] = useState(false)
  const { showToast } = useToast()
  const router = useRouter()

  const handleLogin = async ({ username, password }) => {
    setIsLoading(true)

    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password,
        requiredCompetition: 'PAGEANTRY'
      })

      if (response.data.success) {
        showToast('Login successful!', 'success')
        setTimeout(() => router.push('/pageant-college/dashboard'), 1000)
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Invalid username or password'
      showToast(errorMessage, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex'>
      <ImageSection data={PAGEANT_COLLEGE_LOGIN_DATA} />
      <LoginSection onSubmit={handleLogin} isLoading={isLoading} />
    </div>
  )
}
