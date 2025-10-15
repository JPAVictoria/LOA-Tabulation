'use client'
import React, { useState, useEffect } from 'react'
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

  useEffect(() => {
    // Prevent judges from accessing admin login page
    const role = localStorage.getItem('role')
    if (role === 'JUDGE') {
      showToast('Access denied. Judges cannot access the admin panel.', 'error')
      router.push('/') // redirect to homepage or another route
    }
  }, [router, showToast])

  const handleLogin = async ({ username, password }) => {
    setIsLoading(true)

    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password
      })

      if (response.data.success) {
        const user = response.data.user

        // ✅ Prevent judge login at API response level too
        if (user.role === 'JUDGE') {
          showToast('Access denied. Judges cannot log in here.', 'error')
          setIsLoading(false)
          return
        }

        // Store session data in localStorage
        localStorage.setItem('userId', user.id)
        localStorage.setItem('username', user.username)
        localStorage.setItem('role', user.role)

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
