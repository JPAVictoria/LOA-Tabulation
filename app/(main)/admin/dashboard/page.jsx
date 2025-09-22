'use client'
import React, { useState } from 'react'
import { ADMIN_DASHBOARD_DATA } from '@/app/constants/admin/constants'
import Footer from '@/app/modules/common/Footer'
import CompetitionModal from '@/app/modules/admin/CompetitionModal'
import CategoryModal from '@/app/modules/admin/CategoryModal'
import CriteriaModal from '@/app/modules/admin/CriteriaModal'

export default function AdminDashboard() {
  const [activeModal, setActiveModal] = useState(null)

  const handleButtonClick = (itemId) => {
    setActiveModal(itemId)
  }

  const handleModalClose = () => {
    setActiveModal(null)
  }

  const handleModalSubmit = (data) => {
    setActiveModal(null)
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 p-25'>
      <div className='max-w-6xl mx-auto'>
        <div className='mb-8'>
          <h1
            className='bg-clip-text text-transparent text-center 
                       bg-gradient-to-r from-red-600 via-red-500 to-pink-400
                       dark:from-red-400 dark:via-red-300 dark:to-pink-200
                       text-4xl md:text-5xl font-sans font-bold tracking-tight mb-4 leading-normal'
          >
            Admin Dashboard
          </h1>
          <p className='text-gray-600 dark:text-gray-400 text-center text-lg'>
            Manage competitions, categories, criteria, and candidates
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20'>
          {ADMIN_DASHBOARD_DATA.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => handleButtonClick(item.id)}
                className='cursor-pointer group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 text-left border border-gray-200 dark:border-gray-700'
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />

                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${item.color} mb-4 shadow-lg`}>
                  <Icon className='text-white' size={24} />
                </div>

                <div>
                  <h3 className='text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors'>
                    {item.title}
                  </h3>
                  <p className='text-gray-600 dark:text-gray-400 text-sm leading-relaxed'>{item.description}</p>
                </div>

                <div className='absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0'>
                  <div className='w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center'>
                    <svg
                      className='w-4 h-4 text-gray-600 dark:text-gray-300'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                    </svg>
                  </div>
                </div>

                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none`}
                  style={{ padding: '1px', background: 'transparent' }}
                >
                  <div className='w-full h-full bg-white dark:bg-gray-800 rounded-2xl' />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <Footer />

      <CompetitionModal
        isOpen={activeModal === 'competition'}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
      />

      <CategoryModal isOpen={activeModal === 'category'} onClose={handleModalClose} onSubmit={handleModalSubmit} />
      <CriteriaModal isOpen={activeModal === 'criteria'} onClose={handleModalClose} onSubmit={handleModalSubmit} />
    </div>
  )
}
