import { useCallback, useEffect, useRef, useState } from 'react'

function fullscreenElement() {
  return document.fullscreenElement ?? document.webkitFullscreenElement ?? null
}

export function useImmersiveMode() {
  const [isImmersive, setIsImmersive] = useState(Boolean(fullscreenElement()))
  const wakeLock = useRef(null)
  const wanted = useRef(Boolean(fullscreenElement()))

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
    wanted.current = true
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
    wanted.current = false
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
    const sync = () => {
      const active = Boolean(fullscreenElement())
      if (active) {
        wanted.current = true
        setIsImmersive(true)
        return
      }
      if (!wanted.current) {
        setIsImmersive(false)
      }
    }
    const reacquire = () => {
      if (document.visibilityState === 'visible' && wanted.current) {
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
  }, [acquireWakeLock])

  useEffect(() => {
    document.documentElement.classList.toggle('is-immersive', isImmersive)
    return () => document.documentElement.classList.remove('is-immersive')
  }, [isImmersive])

  useEffect(() => () => { releaseWakeLock() }, [releaseWakeLock])

  return { isImmersive, enter, exit }
}
