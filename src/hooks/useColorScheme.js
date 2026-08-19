import { useEffect, useState } from 'react'

const QUERY = '(prefers-color-scheme: dark)'

export function useColorScheme() {
  const [scheme, setScheme] = useState(() =>
    window.matchMedia(QUERY).matches ? 'dark' : 'light',
  )

  useEffect(() => {
    const media = window.matchMedia(QUERY)
    const sync = (event) => setScheme(event.matches ? 'dark' : 'light')

    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  return scheme
}
