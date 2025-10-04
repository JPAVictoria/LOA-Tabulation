  'use client'
  import React from 'react'
  import ImageSection from '@/app/modules/common/login/ImageSection'
  import LoginSection from '@/app/modules/common/login/LoginSection'
  import { PAGEANT_COLLEGE_LOGIN_DATA } from '@/app/constants/pageant-college/constants'

  export default function PageantCollegePage() {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex'>
        <ImageSection data={PAGEANT_COLLEGE_LOGIN_DATA} />
        <LoginSection />
      </div>
    )
  }
