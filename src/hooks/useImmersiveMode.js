import { useCallback, useEffect, useRef, useState } from 'react'
import { enterFullscreen, exitFullscreen, fullscreenElement, fullscreenSupported } from '../lib/immersive'

export function useImmersiveMode() {
  const [isImmersive, setIsImmersive] = useState(() => Boolean(fullscreenElement()))
  const wakeLock = useRef(null)

  const releaseWakeLock = useCallback(async () => {
    try {
      await wakeLock.current?.release()
    } catch {
      wakeLock.current = null
    }
    wakeLock.current = null
  }, [])

  const acquireWakeLock = useCallback(async () => {
    if (!('wakeLock' in navigator) || wakeLock.current) {
      return
    }
    try {
      wakeLock.current = await navigator.wakeLock.request('screen')
    } catch {
      wakeLock.current = null
    }
  }, [])

  const enter = useCallback(async () => {
    await enterFullscreen()
    await acquireWakeLock()
    setIsImmersive(Boolean(fullscreenElement()))
  }, [acquireWakeLock])

  const exit = useCallback(async () => {
    await exitFullscreen()
    await releaseWakeLock()
    setIsImmersive(false)
  }, [releaseWakeLock])

  useEffect(() => {
    acquireWakeLock()

    const sync = () => setIsImmersive(Boolean(fullscreenElement()))
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        acquireWakeLock()
      }
    }

    document.addEventListener('fullscreenchange', sync)
    document.addEventListener('webkitfullscreenchange', sync)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      document.removeEventListener('fullscreenchange', sync)
      document.removeEventListener('webkitfullscreenchange', sync)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [acquireWakeLock])

  useEffect(() => () => { releaseWakeLock() }, [releaseWakeLock])

  return { isImmersive, enter, exit, canFullscreen: fullscreenSupported() }
}
