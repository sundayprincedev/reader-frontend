import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PdfReader from '../components/PdfReader'
import EpubReader from '../components/EpubReader'
import ReaderChrome from '../components/ReaderChrome'
import HistoryPanel from '../components/HistoryPanel'
import Spinner from '../components/Spinner'
import { api } from '../lib/api'
import { resolveFile } from '../lib/fileCache'
import { attachTapHandler } from '../lib/tap'
import { useReadingSession } from '../hooks/useReadingSession'
import { useImmersiveMode } from '../hooks/useImmersiveMode'
import { useIdleChrome } from '../hooks/useIdleChrome'
import { useColorScheme } from '../hooks/useColorScheme'

const SCALE_STEP = 0.1
const SCALE_BOUNDS = { min: 0.6, max: 2.4 }
const SCALE_KEY = 'mereader:scale'

function storedScale() {
  const value = Number(localStorage.getItem(SCALE_KEY))
  return Number.isFinite(value) && value > 0 ? value : 1
}

export default function Reader() {
  const { key } = useParams()
  const navigate = useNavigate()
  const scheme = useColorScheme()

  const [book, setBook] = useState(null)
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [scale, setScale] = useState(storedScale)
  const [live, setLive] = useState({ percent: 0, label: '' })
  const [saveState, setSaveState] = useState('idle')

  const startLocation = useRef(null)
  const surfaceRef = useRef(null)

  const { isImmersive, enter, exit, canFullscreen } = useImmersiveMode()
  const { visible, toggle, hide } = useIdleChrome()

  const { report, flush, save } = useReadingSession(key, (saved) => {
    setBook((current) => (current ? { ...current, ...saved } : saved))
  })

  useEffect(() => {
    let cancelled = false

    async function open() {
      try {
        const record = await api.book(key)
        if (cancelled) {
          return
        }

        startLocation.current = record.current
        setBook(record)
        setLive({ percent: record.current?.percent || 0, label: record.current?.label || '' })
        setStatus('fetching')

        const blob = await resolveFile(key, { synced: record.hasFile })
        if (cancelled) {
          return
        }

        setFile(blob)
        setStatus('reading')
      } catch (failure) {
        if (!cancelled) {
          setError(failure.message)
          setStatus('error')
        }
      }
    }

    open()

    return () => {
      cancelled = true
    }
  }, [key])

  const handleLocation = useCallback(
    (location) => {
      setLive({ percent: location.percent, label: location.label })
      report({
        ...location,
        width: Math.round(window.innerWidth),
        height: Math.round(window.innerHeight),
        scale,
      })
      hide()
    },
    [report, hide, scale],
  )

  const handleReady = useCallback(
    async (details) => {
      const title = details?.title?.trim()
      const author = details?.author?.trim()

      if (!book || (!title && !author)) {
        return
      }
      if (title === book.title && (author || '') === (book.author || '')) {
        return
      }

      try {
        const updated = await api.registerBook({
          key,
          title: title || book.title,
          author: author || book.author || '',
          format: book.format,
          sizeBytes: book.sizeBytes,
        })
        setBook((current) => ({ ...current, title: updated.title, author: updated.author }))
      } catch {
        return
      }
    },
    [book, key],
  )

  const handleSave = useCallback(async () => {
    setSaveState('saving')
    const succeeded = await save()
    setSaveState(succeeded ? 'saved' : 'failed')
    setTimeout(() => setSaveState('idle'), succeeded ? 1600 : 2600)
  }, [save])

  const handleScale = useCallback((direction) => {
    setScale((current) => {
      const next = Math.min(
        SCALE_BOUNDS.max,
        Math.max(SCALE_BOUNDS.min, Number((current + direction * SCALE_STEP).toFixed(2))),
      )
      localStorage.setItem(SCALE_KEY, String(next))
      return next
    })
  }, [])

  const applyBook = useCallback((updated) => {
    startLocation.current = updated.current
    setBook(updated)
    setLive({ percent: updated.current?.percent || 0, label: updated.current?.label || '' })
    setStatus('restoring')
    requestAnimationFrame(() => setStatus('reading'))
  }, [])

  const handleRestore = useCallback(
    async (index) => {
      setBusy(true)
      try {
        await flush()
        applyBook(await api.restore(key, index))
        setHistoryOpen(false)
      } catch (failure) {
        setError(failure.message)
      } finally {
        setBusy(false)
      }
    },
    [key, flush, applyBook],
  )

  const handleReset = useCallback(async () => {
    setBusy(true)
    try {
      await flush()
      applyBook(await api.reset(key))
      setHistoryOpen(false)
    } catch (failure) {
      setError(failure.message)
    } finally {
      setBusy(false)
    }
  }, [key, flush, applyBook])

  useEffect(() => {
    if (status !== 'reading') {
      return undefined
    }
    enter()
    return undefined
  }, [status, enter])

  useEffect(() => {
    if (status !== 'reading' || book?.format !== 'pdf') {
      return undefined
    }
    return attachTapHandler(surfaceRef.current, toggle)
  }, [status, book?.format, toggle])

  const toggleImmersive = useCallback(() => {
    if (isImmersive) {
      exit()
    } else {
      enter()
    }
  }, [isImmersive, enter, exit])

  if (status === 'loading' || status === 'fetching') {
    return (
      <div className="flex h-full items-center justify-center bg-paper">
        <Spinner label={status === 'fetching' ? 'Fetching your book' : 'Opening'} />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5 bg-paper px-6 text-center">
        <div>
          <h2 className="font-serif text-xl">This book would not open</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">{error}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-paper transition hover:opacity-90"
        >
          Back to library
        </button>
      </div>
    )
  }

  return (
    <div className="relative h-full overflow-hidden bg-paper">
      <div ref={surfaceRef} className="absolute inset-0">
        {status === 'reading' && file ? (
          book.format === 'pdf' ? (
            <PdfReader
              key={`${key}-${startLocation.current?.recorded}`}
              file={file}
              startLocation={startLocation.current}
              onLocationChange={handleLocation}
              onError={(failure) => setError(failure.message)}
              zoom={scale}
            />
          ) : (
            <EpubReader
              key={`${key}-${startLocation.current?.recorded}`}
              file={file}
              startLocation={startLocation.current}
              onLocationChange={handleLocation}
              onReady={handleReady}
              onError={(failure) => setError(failure.message)}
              onTap={toggle}
              onActivity={hide}
              fontScale={scale}
              scheme={scheme}
            />
          )
        ) : (
          <div className="flex h-full items-center justify-center">
            <Spinner label="Finding your place" />
          </div>
        )}
      </div>

      <ReaderChrome
        visible={visible || historyOpen}
        title={book?.title}
        label={live.label || book?.current?.label || 'Ready'}
        percent={live.percent}
        immersive={isImmersive}
        canFullscreen={canFullscreen}
        scale={scale}
        onToggleImmersive={toggleImmersive}
        onOpenHistory={() => setHistoryOpen(true)}
        onSave={handleSave}
        saveState={saveState}
        onScaleChange={handleScale}
        onExit={async () => {
          await flush()
          await exit()
        }}
      />

      <HistoryPanel
        open={historyOpen}
        book={book}
        busy={busy}
        onClose={() => setHistoryOpen(false)}
        onRestore={handleRestore}
        onReset={handleReset}
      />
    </div>
  )
}
