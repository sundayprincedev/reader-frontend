import { useCallback, useEffect, useRef } from 'react'
import { api } from '../lib/api'

const FLUSH_INTERVAL = 10000
const DEBOUNCE = 1200

export function useReadingSession(bookKey, onSaved) {
  const pending = useRef(null)
  const seconds = useRef(0)
  const timer = useRef(null)
  const savedCallback = useRef(onSaved)

  savedCallback.current = onSaved

  const flush = useCallback(
    async (keepalive = false) => {
      if (!bookKey || (!pending.current && seconds.current === 0)) {
        return
      }

      const location = pending.current
      const elapsed = Math.round(seconds.current)
      pending.current = null
      seconds.current = 0

      if (!location) {
        return
      }

      try {
        const book = await api.saveProgress(bookKey, { ...location, secondsRead: elapsed }, keepalive)
        savedCallback.current?.(book)
      } catch {
        pending.current = location
        seconds.current += elapsed
      }
    },
    [bookKey],
  )

  const report = useCallback(
    (location) => {
      pending.current = location
      clearTimeout(timer.current)
      timer.current = setTimeout(flush, DEBOUNCE)
    },
    [flush],
  )

  useEffect(() => {
    const tick = setInterval(() => {
      if (document.visibilityState === 'visible') {
        seconds.current += 1
      }
    }, 1000)

    const heartbeat = setInterval(() => flush(), FLUSH_INTERVAL)

    const onHidden = () => {
      if (document.visibilityState === 'hidden') {
        flush(true)
      }
    }

    document.addEventListener('visibilitychange', onHidden)
    window.addEventListener('pagehide', () => flush(true))

    return () => {
      clearInterval(tick)
      clearInterval(heartbeat)
      clearTimeout(timer.current)
      document.removeEventListener('visibilitychange', onHidden)
      flush(true)
    }
  }, [flush])

  return { report, flush }
}
