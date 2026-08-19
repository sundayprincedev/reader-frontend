import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PdfReader from '../components/PdfReader'
import EpubReader from '../components/EpubReader'
import ReaderChrome from '../components/ReaderChrome'
import HistoryPanel from '../components/HistoryPanel'
import Spinner from '../components/Spinner'
import { api } from '../lib/api'
import { loadFile, saveFile } from '../lib/localLibrary'
import { deriveBookKey } from '../lib/bookKey'
import { attachTapHandler } from '../lib/tap'
import { useReadingSession } from '../hooks/useReadingSession'
import { useImmersiveMode } from '../hooks/useImmersiveMode'
import { useIdleChrome } from '../hooks/useIdleChrome'

const SCALE_STEP = 0.1
const SCALE_BOUNDS = { min: 0.6, max: 2.4 }
const SCALE_STORAGE_KEY = 'mereader:scale'

function readStoredScale() {
  const stored = Number(localStorage.getItem(SCALE_STORAGE_KEY))
  return Number.isFinite(stored) && stored > 0 ? stored : 1
}

export default function Reader() {
  const { key } = useParams()
  const navigate = useNavigate()

  const [book, setBook] = useState(null)
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [scale, setScale] = useState(readStoredScale)
  const [live, setLive] = useState({ percent: 0, label: '' })

  const startLocation = useRef(null)
  const surfaceRef = useRef(null)
  const locationPrimed = useRef(false)
  const { isImmersive, enter, exit } = useImmersiveMode()
  const { visible, toggle, reveal, hide } = useIdleChrome()

  const { report, flush } = useReadingSession(key, (saved) => {
    setBook((current) => (current ? { ...current, ...saved } : saved))
  })

  useEffect(() => {
    locationPrimed.current = false
  }, [key])

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [record, blob] = await Promise.all([api.book(key), loadFile(key)])
        if (cancelled) {
          return
        }

        startLocation.current = record.current
        setBook(record)
        setLive({ percent: record.current?.percent || 0, label: record.current?.label || '' })

        if (!blob) {
          setStatus('missing-file')
          return
        }

        setFile(blob)
        setStatus('reading')
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message)
          setStatus('error')
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [key])

  const handleLocation = useCallback(
    (location) => {
      setLive({ percent: location.percent, label: location.label })
      report(location)
      if (locationPrimed.current) {
        hide()
      } else {
        locationPrimed.current = true
      }
    },
    [report, hide],
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
        const updated = await api.register({
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

  const handleScale = useCallback((direction) => {
    setScale((current) => {
      const next = Math.min(
        SCALE_BOUNDS.max,
        Math.max(SCALE_BOUNDS.min, Number((current + direction * SCALE_STEP).toFixed(2))),
      )
      localStorage.setItem(SCALE_STORAGE_KEY, String(next))
      return next
    })
  }, [])

  const applyBook = useCallback((updated) => {
    startLocation.current = updated.current
    locationPrimed.current = false
    setBook(updated)
    setLive({ percent: updated.current?.percent || 0, label: updated.current?.label || '' })
    setStatus('reloading')
    requestAnimationFrame(() => setStatus('reading'))
  }, [])

  const handleRestore = useCallback(
    async (index) => {
      setBusy(true)
      try {
        await flush()
        applyBook(await api.restore(key, index))
        setHistoryOpen(false)
      } catch (restoreError) {
        setError(restoreError.message)
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
    } catch (resetError) {
      setError(resetError.message)
    } finally {
      setBusy(false)
    }
  }, [key, flush, applyBook])

  const handleRelink = useCallback(
    async (candidate) => {
      const derived = await deriveBookKey(candidate)
      if (derived !== key) {
        setError('That file does not match this book. Pick the exact same file you added before.')
        return
      }

      await saveFile(key, candidate)
      setFile(candidate)
      setError(null)
      setStatus('reading')
    },
    [key],
  )

  useEffect(() => {
    if (status !== 'reading' || book?.format !== 'pdf') {
      return undefined
    }
    return attachTapHandler(surfaceRef.current, toggle)
  }, [status, book?.format, toggle])

  const toggleImmersive = useCallback(() => {
    if (isImmersive) {
      exit()
      reveal()
    } else {
      enter()
      hide()
    }
  }, [isImmersive, enter, exit, reveal, hide])

  if (status === 'loading') {
    return (
      <div className="flex h-full items-center justify-center bg-ink-950">
        <Spinner label="Opening" />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5 bg-ink-950 px-5 text-center">
        <p className="max-w-sm text-sm text-red-400">{error}</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="min-h-11 px-1 text-sm text-ink-200 underline decoration-ink-600 underline-offset-4"
        >
          Back to the shelf
        </button>
      </div>
    )
  }

  if (status === 'missing-file') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 bg-ink-950 px-5 text-center">
        <div>
          <h2 className="font-display text-3xl text-ink-50">{book?.title}</h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-400">
            This device does not have the file. Progress is kept at {Math.round(book?.current?.percent || 0)}%
            — choose the same file to continue.
          </p>
        </div>

        <label className="min-h-12 cursor-pointer bg-rust px-6 py-3 text-sm font-medium text-ink-50">
          Choose the file
          <input
            type="file"
            accept=".pdf,.epub"
            className="hidden"
            onChange={(event) => {
              const candidate = event.target.files?.[0]
              if (candidate) {
                handleRelink(candidate)
              }
              event.target.value = ''
            }}
          />
        </label>

        {error ? <p className="max-w-sm text-xs text-red-400">{error}</p> : null}

        <button
          type="button"
          onClick={() => navigate('/')}
          className="min-h-11 text-sm text-ink-400 underline decoration-ink-700 underline-offset-4"
        >
          Back to the shelf
        </button>
      </div>
    )
  }

  return (
    <div className="relative h-full overflow-hidden bg-ink-950">
      <div ref={surfaceRef} className="absolute inset-0">
        {status === 'reading' && file ? (
          book.format === 'pdf' ? (
            <PdfReader
              key={`${key}-${startLocation.current?.recorded}`}
              file={file}
              startLocation={startLocation.current}
              onLocationChange={handleLocation}
              onError={(readerError) => setError(readerError.message)}
              zoom={scale}
            />
          ) : (
            <EpubReader
              key={`${key}-${startLocation.current?.recorded}`}
              file={file}
              startLocation={startLocation.current}
              onLocationChange={handleLocation}
              onReady={handleReady}
              onError={(readerError) => setError(readerError.message)}
              onTap={toggle}
              onScroll={hide}
              fontScale={scale}
            />
          )
        ) : (
          <div className="flex h-full items-center justify-center">
            <Spinner label="Restoring your place" />
          </div>
        )}
      </div>

      <ReaderChrome
        visible={visible || historyOpen}
        title={book?.title}
        label={live.label || book?.current?.label || 'Ready'}
        percent={live.percent}
        immersive={isImmersive}
        onToggleImmersive={toggleImmersive}
        onOpenHistory={() => setHistoryOpen(true)}
        onScaleChange={handleScale}
        scale={scale}
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
