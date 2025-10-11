'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useToast } from '@/app/context/ToastContext'
import ImageSection from '@/app/modules/common/login/ImageSection'
import LoginSection from '@/app/modules/common/login/LoginSection'
import { BENCH_CHEERING_LOGIN_DATA } from '@/app/constants/bench-cheering/constants'

export default function HiphopLoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { showToast } = useToast()
  const router = useRouter()

  const handleLogin = async ({ username, password }) => {
    setIsLoading(true)

    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password,
        requiredCompetition: 'BENCH_CHEERING'
      })

      if (response.data.success) {
        localStorage.setItem('judgeId', response.data.user.id)
        localStorage.setItem('judgeName', response.data.user.username)

        showToast('Login successful!', 'success')
        setTimeout(() => router.push('/bench-cheering/dashboard'), 1000)
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
      <ImageSection data={BENCH_CHEERING_LOGIN_DATA} />
      <LoginSection onSubmit={handleLogin} isLoading={isLoading} />
    </div>
  )
}
