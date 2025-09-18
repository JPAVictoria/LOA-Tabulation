import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, User, Lock, Crown } from 'lucide-react'

export default function LoginSection() {
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      console.log('Login attempted with:', { username, password })
    }, 1500)
  }

  return (
    <div className='flex-1 flex items-center justify-center p-8 lg:p-16'>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className='w-full max-w-md'
      >
        <div className='text-center mb-12'>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className='w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-red-600 via-red-500 to-pink-400 dark:from-red-400 dark:via-red-300 dark:to-pink-200 rounded-full flex items-center justify-center shadow-lg'
          >
            <Crown className='w-10 h-10 text-white' />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className='bg-clip-text text-transparent text-center bg-gradient-to-r from-red-600 via-red-500 to-pink-400 dark:from-red-400 dark:via-red-300 dark:to-pink-200 text-2xl md:text-3xl font-sans font-bold tracking-tight mb-2 leading-normal'
          >
            Sign In
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className='text-gray-600 dark:text-gray-400'
          >
            Contact your administrator.
          </motion.p>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className='space-y-6'
        >
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
              <User className='h-5 w-5 text-gray-400' />
            </div>
            <input
              type='text'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className='w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 shadow-sm hover:shadow-md'
              placeholder='Username'
              required
            />
          </div>

          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
              <Lock className='h-5 w-5 text-gray-400' />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full pl-12 pr-12 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 shadow-sm hover:shadow-md'
              placeholder='Password'
              required
            />
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className='absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
            >
              {showPassword ? <EyeOff className='h-5 w-5' /> : <Eye className='h-5 w-5' />}
            </button>
          </div>

          <motion.button
            type='submit'
            disabled={isLoading}
            className='w-full py-4 px-6 bg-gradient-to-r from-red-600 via-red-500 to-pink-400 hover:from-red-700 hover:via-red-600 hover:to-pink-500 dark:from-red-400 dark:via-red-300 dark:to-pink-200 dark:hover:from-red-500 dark:hover:via-red-400 dark:hover:to-pink-300 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed'
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
          >
            {isLoading ? (
              <div className='flex items-center justify-center space-x-2'>
                <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
                <span>Signing In...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  )
}
