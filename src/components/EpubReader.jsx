import { useEffect, useRef, useState } from 'react'
import ePub from 'epubjs'
import { useEventCallback, useInitialValue } from '../hooks/useEventCallback'
import { attachTapHandler } from '../lib/tap'

const LOCATION_GRANULARITY = 1200

const READER_THEME = {
  body: {
    background: '#12100c',
    color: '#e6d9c0',
    'font-family': 'Literata, Georgia, serif',
    'line-height': '1.8',
    padding: '12px 16px 40px',
  },
  'a, a:visited': { color: '#c24e2d' },
  'h1, h2, h3, h4, h5, h6': { color: '#f3ead8', 'line-height': '1.3' },
  img: { 'max-width': '100%', height: 'auto' },
  'p, li': { 'text-align': 'left', hyphens: 'auto' },
}

export default function EpubReader({ file, startLocation, onLocationChange, onReady, onError, onTap, onScroll, fontScale }) {
  const initialLocation = useInitialValue(startLocation)
  const reportLocation = useEventCallback(onLocationChange)
  const reportReady = useEventCallback(onReady)
  const reportError = useEventCallback(onError)
  const reportTap = useEventCallback(onTap)
  const reportScroll = useEventCallback(onScroll)
  const hostRef = useRef(null)
  const bookRef = useRef(null)
  const renditionRef = useRef(null)
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

        rendition.themes.register('mereader', READER_THEME)
        rendition.themes.select('mereader')

        rendition.hooks.content.register((contents) => {
          attachTapHandler(contents.document.documentElement, () => reportTap?.())
          const frame = contents.document.documentElement
          frame.style.touchAction = 'pan-y'
          frame.style.overscrollBehavior = 'none'
          const noteScroll = () => reportScroll?.()
          contents.document.addEventListener('scroll', noteScroll, { passive: true })
          contents.window?.addEventListener('scroll', noteScroll, { passive: true })
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
  }, [file, initialLocation, emit, reportReady, reportError, reportTap, reportScroll])

  useEffect(() => {
    if (ready) {
      renditionRef.current?.themes.fontSize(`${Math.round(fontScale * 100)}%`)
    }
  }, [fontScale, ready])

  return <div ref={hostRef} className="h-full w-full overflow-hidden bg-ink-950" />
}
