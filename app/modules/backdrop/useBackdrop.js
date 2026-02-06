// useBackdrop.js
import { useState, useEffect, useCallback } from 'react'

export function useBackdrop(timeout = 15000) {
  const [showBackdrop, setShowBackdrop] = useState(false)

  const resetTimer = useCallback(() => {
    setShowBackdrop(false)
  }, [])

  useEffect(() => {
    let timer

    const handleActivity = () => {
      setShowBackdrop(false)
      clearTimeout(timer)
      timer = setTimeout(() => {
        setShowBackdrop(true)
      }, timeout)
    }

    // Events to track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleActivity)
    })

    // Start initial timer
    timer = setTimeout(() => {
      setShowBackdrop(true)
    }, timeout)

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity)
      })
      clearTimeout(timer)
    }
  }, [timeout])

  return { showBackdrop, resetTimer }
}
