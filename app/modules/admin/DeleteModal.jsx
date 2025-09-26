import React from 'react'
import { Trash2, X } from 'lucide-react'

const DeleteModal = ({ isOpen, onClose, onConfirm, competitionName, isLoading }) => {
  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md'>
        <div className='flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700'>
          <div className='flex items-center gap-2'>
            <Trash2 className='text-red-500' size={20} />
            <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>Delete Competition</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50'
          >
            <X size={20} />
          </button>
        </div>

        <div className='p-4'>
          <p className='text-gray-700 dark:text-gray-300 mb-2'>Are you sure you want to delete the competition:</p>
          <p className='font-semibold text-gray-900 dark:text-white mb-4'>"{competitionName}"</p>
          <p className='text-sm text-red-600 dark:text-red-400'>This action cannot be undone.</p>
        </div>

        <div className='flex gap-3 p-4 border-t border-gray-200 dark:border-gray-700'>
          <button
            type='button'
            onClick={onClose}
            disabled={isLoading}
            className='flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 
                     rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={onConfirm}
            disabled={isLoading}
            className='flex-1 px-4 py-2 bg-red-600 text-white rounded-md 
                     hover:bg-red-700 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteModal
