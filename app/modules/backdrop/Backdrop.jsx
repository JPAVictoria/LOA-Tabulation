import { motion } from 'framer-motion'

export default function Backdrop() {
  return (
    <motion.div
      className='w-screen h-screen flex items-center justify-center overflow-hidden bg-white'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, ease: 'easeInOut' }}
    >
      <motion.div
        className='text-center px-8'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
      >
        <h1
          className='text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tight mb-6'
          style={{ color: '#b90e0a' }}
        >
          Lyceum of Alabang
        </h1>
        <motion.p
          className='text-3xl md:text-4xl lg:text-5xl font-light tracking-wide'
          style={{ color: '#b90e0a' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          2026 INTRAMURALS
        </motion.p>
      </motion.div>
    </motion.div>
  )
}
