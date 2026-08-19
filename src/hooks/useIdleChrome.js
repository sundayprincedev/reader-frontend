import { useCallback, useEffect, useRef, useState } from 'react'

export function useIdleChrome(delay = 4000) {
  const [visible, setVisible] = useState(false)
  const timer = useRef(null)

  const hide = useCallback(() => {
    clearTimeout(timer.current)
    setVisible(false)
  }, [])

  const toggle = useCallback(() => {
    setVisible((current) => {
      clearTimeout(timer.current)
      if (current) {
        return false
      }
      timer.current = setTimeout(() => setVisible(false), delay)
      return true
    })
  }, [delay])

  useEffect(() => () => clearTimeout(timer.current), [])

  return { visible, toggle, hide }
}
