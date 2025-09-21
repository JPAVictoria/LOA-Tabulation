'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useToast } from '@/app/context/ToastContext'
import ImageSection from '@/app/modules/common/login/ImageSection'
import LoginSection from '@/app/modules/common/login/LoginSection'
import { ADMIN_LOGIN_DATA } from '@/app/constants/admin/constants'

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { showToast } = useToast()
  const router = useRouter()

  const handleLogin = async ({ username, password }) => {
    setIsLoading(true)

    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password
      })

      if (response.data.success) {
        showToast('Login successful!', 'success')
        setTimeout(() => router.push('/admin/dashboard'), 1000)
      }
    } catch (error) {
      showToast('Invalid username or password', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex'>
      <ImageSection data={ADMIN_LOGIN_DATA} />
      <LoginSection onSubmit={handleLogin} isLoading={isLoading} />
    </div>
  )
}
