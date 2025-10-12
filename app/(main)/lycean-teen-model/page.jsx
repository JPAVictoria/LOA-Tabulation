'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useToast } from '@/app/context/ToastContext'
import ImageSection from '@/app/modules/common/login/ImageSection'
import LoginSection from '@/app/modules/common/login/LoginSection'
import { LYCEAN_TEEN_LOGIN_DATA } from '@/app/constants/lycean-teen-model/constants'

export default function LyceanTeenModelLoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { showToast } = useToast()
  const router = useRouter()

  const handleLogin = async ({ username, password }) => {
    setIsLoading(true)

    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password,
        requiredCompetition: 'LYCEAN_TEEN_MODEL'
      })

      if (response.data.success) {
        localStorage.setItem('judgeId', response.data.user.id)
        localStorage.setItem('judgeName', response.data.user.username)

        showToast('Login successful!', 'success')
        setTimeout(() => router.push('/lycean-teen-model/dashboard'), 1000)
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
      <ImageSection data={LYCEAN_TEEN_LOGIN_DATA} />
      <LoginSection onSubmit={handleLogin} isLoading={isLoading} />
    </div>
  )
}
