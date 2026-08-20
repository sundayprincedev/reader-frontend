import { useCallback, useEffect, useRef } from 'react'
import { api } from '../lib/api'

const FLUSH_INTERVAL = 10000
const DEBOUNCE = 1200

export function useReadingSession(bookKey, onSaved) {
  const pending = useRef(null)
  const latest = useRef(null)
  const seconds = useRef(0)
  const timer = useRef(null)
  const inFlight = useRef(null)
  const notify = useRef(onSaved)

  notify.current = onSaved

  const flush = useCallback(
    async ({ keepalive = false, manual = false } = {}) => {
      if (!bookKey) {
        return false
      }

      if (!keepalive && inFlight.current) {
        await inFlight.current.catch(() => undefined)
      }

      const location = manual ? latest.current : pending.current
      if (!location) {
        return false
      }

      clearTimeout(timer.current)
      pending.current = null

      const elapsed = Math.round(seconds.current)
      seconds.current = 0

      const request = api
        .saveProgress(bookKey, { ...location, manual, secondsRead: elapsed }, keepalive)
        .then((book) => {
          notify.current?.(book)
          return true
        })
        .catch(() => {
          if (!pending.current) {
            pending.current = location
          }
          seconds.current += elapsed
          return false
        })

      inFlight.current = request
      const succeeded = await request

      if (inFlight.current === request) {
        inFlight.current = null
      }
      return succeeded
    },
    [bookKey],
  )

  const report = useCallback(
    (location) => {
      pending.current = location
      latest.current = location
      clearTimeout(timer.current)
      timer.current = setTimeout(() => flush(), DEBOUNCE)
    },
    [flush],
  )

  const save = useCallback(() => flush({ manual: true }), [flush])

  useEffect(() => {
    const tick = setInterval(() => {
      if (document.visibilityState === 'visible') {
        seconds.current += 1
      }
    }, 1000)

    const heartbeat = setInterval(() => flush(), FLUSH_INTERVAL)

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        flush({ keepalive: true })
      }
    }

    const onPageHide = () => flush({ keepalive: true })

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', onPageHide)

    return () => {
      clearInterval(tick)
      clearInterval(heartbeat)
      clearTimeout(timer.current)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', onPageHide)
      flush({ keepalive: true })
    }
  }, [flush])

  return { report, flush, save }
}
