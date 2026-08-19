import { useEffect, useRef, useState } from 'react'
import ePub from 'epubjs'
import { useEventCallback, useInitialValue } from '../hooks/useEventCallback'
import { attachTapHandler } from '../lib/tap'

const LOCATION_GRANULARITY = 1200

const PALETTES = {
  light: { background: '#FCFBF8', color: '#1C1A16', heading: '#100F0C', accent: '#A85432' },
  dark: { background: '#121110', color: '#EDE8DF', heading: '#F7F3EC', accent: '#D88A60' },
}

function themeFor(scheme) {
  const palette = PALETTES[scheme] ?? PALETTES.light

  return {
    body: {
      background: palette.background,
      color: palette.color,
      'font-family': 'Literata, Georgia, serif',
      'line-height': '1.8',
      padding: '12px 16px 64px',
    },
    'a, a:visited': { color: palette.accent },
    'h1, h2, h3, h4, h5, h6': { color: palette.heading, 'line-height': '1.3' },
    img: { 'max-width': '100%', height: 'auto' },
    'p, li': { 'text-align': 'left', hyphens: 'auto' },
  }
}

export default function EpubReader({
  file,
  startLocation,
  onLocationChange,
  onReady,
  onError,
  onTap,
  onActivity,
  fontScale,
  scheme,
}) {
  const initialLocation = useInitialValue(startLocation)
  const reportLocation = useEventCallback(onLocationChange)
  const reportReady = useEventCallback(onReady)
  const reportError = useEventCallback(onError)
  const reportTap = useEventCallback(onTap)
  const reportActivity = useEventCallback(onActivity)

  const hostRef = useRef(null)
  const bookRef = useRef(null)
  const renditionRef = useRef(null)
  const schemeRef = useRef(scheme)
  const [ready, setReady] = useState(false)

  const emit = useEventCallback((location) => {
    const book = bookRef.current
    if (!book || !location?.start) {
      return
    }

    const cfi = location.start.cfi
    const percent = book.locations.length()
      ? book.locations.percentageFromCfi(cfi) * 100
      : (location.start.percentage || 0) * 100

    const chapter = book.navigation?.get(location.start.href)

    reportLocation?.({
      page: location.start.displayed?.page || 0,
      pages: book.locations.length() || 0,
      cfi,
      offset: 0,
      percent,
      label: chapter?.label?.trim() || 'Reading',
    })
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const buffer = await file.arrayBuffer()
        if (cancelled) {
          return
        }

        const book = ePub(buffer)
        bookRef.current = book

        const rendition = book.renderTo(hostRef.current, {
          width: '100%',
          height: '100%',
          manager: 'continuous',
          flow: 'scrolled',
          spread: 'none',
          allowScriptedContent: false,
        })
        renditionRef.current = rendition

        rendition.themes.register('mereader', themeFor(schemeRef.current))
        rendition.themes.select('mereader')

        rendition.hooks.content.register((contents) => {
          attachTapHandler(contents.document.documentElement, () => reportTap?.())
          contents.document.addEventListener('scroll', () => reportActivity?.(), { passive: true })
        })

        await rendition.display(initialLocation?.cfi || undefined)
        if (cancelled) {
          return
        }

        const metadata = await book.loaded.metadata
        await book.loaded.navigation
        reportReady?.({ title: metadata?.title, author: metadata?.creator })

        setReady(true)
        rendition.on('relocated', emit)

        await book.locations.generate(LOCATION_GRANULARITY)
        if (!cancelled) {
          emit(rendition.currentLocation())
        }
      } catch (error) {
        if (!cancelled) {
          reportError?.(error)
        }
      }
    }

    load()

    return () => {
      cancelled = true
      renditionRef.current?.destroy()
      bookRef.current?.destroy()
      renditionRef.current = null
      bookRef.current = null
    }
  }, [file, initialLocation, emit, reportReady, reportError, reportTap, reportActivity])

  useEffect(() => {
    schemeRef.current = scheme

    if (!ready) {
      return
    }

    const rendition = renditionRef.current
    rendition?.themes.register('mereader', themeFor(scheme))
    rendition?.themes.select('mereader')
    rendition?.themes.fontSize(`${Math.round(fontScale * 100)}%`)
  }, [scheme, fontScale, ready])

  return <div ref={hostRef} className="h-full w-full overflow-hidden bg-paper" />
}
