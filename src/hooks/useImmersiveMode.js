import { useCallback, useEffect, useRef, useState } from 'react'

function fullscreenElement() {
  return document.fullscreenElement ?? document.webkitFullscreenElement ?? null
}

export function useImmersiveMode() {
  const [isImmersive, setIsImmersive] = useState(Boolean(fullscreenElement()))
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
    const target = document.documentElement
    const request = target.requestFullscreen ?? target.webkitRequestFullscreen

    try {
      await request?.call(target, { navigationUI: 'hide' })
    } catch {
      setIsImmersive(true)
    }

    await acquireWakeLock()
    setIsImmersive(true)
  }, [acquireWakeLock])

  const exit = useCallback(async () => {
    const request = document.exitFullscreen ?? document.webkitExitFullscreen

    if (fullscreenElement()) {
      try {
        await request?.call(document)
      } catch {
        setIsImmersive(false)
      }
    }

    await releaseWakeLock()
    setIsImmersive(false)
  }, [releaseWakeLock])

  useEffect(() => {
    const sync = () => setIsImmersive(Boolean(fullscreenElement()))
    const reacquire = () => {
      if (document.visibilityState === 'visible' && isImmersive) {
        acquireWakeLock()
      }
    }

    document.addEventListener('fullscreenchange', sync)
    document.addEventListener('webkitfullscreenchange', sync)
    document.addEventListener('visibilitychange', reacquire)

    return () => {
      document.removeEventListener('fullscreenchange', sync)
      document.removeEventListener('webkitfullscreenchange', sync)
      document.removeEventListener('visibilitychange', reacquire)
    }
  }, [acquireWakeLock, isImmersive])

  useEffect(() => () => { releaseWakeLock() }, [releaseWakeLock])

  return { isImmersive, enter, exit }
}
