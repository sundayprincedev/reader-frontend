import { useCallback, useEffect, useRef, useState } from 'react'

export function useIdleChrome(delay = 2800) {
  const [visible, setVisible] = useState(true)
  const timer = useRef(null)

  const schedule = useCallback(() => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setVisible(false), delay)
  }, [delay])

  const reveal = useCallback(() => {
    setVisible(true)
    schedule()
  }, [schedule])

  const toggle = useCallback(() => {
    setVisible((current) => {
      if (current) {
        clearTimeout(timer.current)
        return false
      }
      schedule()
      return true
    })
  }, [schedule])

  useEffect(() => {
    schedule()
    return () => clearTimeout(timer.current)
  }, [schedule])

  return { visible, reveal, toggle, hide: () => setVisible(false) }
}
