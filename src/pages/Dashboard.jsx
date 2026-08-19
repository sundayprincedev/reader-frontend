import { useCallback, useEffect, useMemo, useState } from 'react'
import UploadZone from '../components/UploadZone'
import BookCard from '../components/BookCard'
import Spinner from '../components/Spinner'
import DeviceSync from '../components/DeviceSync'
import { DevicesIcon } from '../components/Icons'
import { api } from '../lib/api'
import { availableKeys, removeFile, saveFile } from '../lib/localLibrary'
import { deriveBookKey, detectFormat, titleFromFilename } from '../lib/bookKey'
import { formatDuration, formatPercent } from '../lib/format'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'reading', label: 'Reading' },
  { id: 'finished', label: 'Finished' },
]

export default function Dashboard() {
  const [library, setLibrary] = useState({ books: [], stats: null })
  const [present, setPresent] = useState(() => new Set())
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState(null)
  const [filter, setFilter] = useState('all')
  const [busy, setBusy] = useState(false)
  const [syncOpen, setSyncOpen] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const [data, keys] = await Promise.all([api.library(), availableKeys()])
      setLibrary(data)
      setPresent(keys)
      setStatus('ready')
    } catch (error) {
      setMessage(error.message)
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleFiles = useCallback(
    async (files) => {
      setBusy(true)
      setMessage(null)

      try {
        for (const file of files) {
          const format = detectFormat(file)
          if (!format) {
            setMessage(`${file.name} is not a PDF or EPUB`)
            continue
          }

          const key = await deriveBookKey(file)
          await saveFile(key, file)
          await api.register({
            key,
            title: titleFromFilename(file.name),
            author: '',
            format,
            sizeBytes: file.size,
          })
        }
        await refresh()
      } catch (error) {
        setMessage(error.message)
      } finally {
        setBusy(false)
      }
    },
    [refresh],
  )

  const handleRemove = useCallback(
    async (book) => {
      setBusy(true)
      try {
        await api.remove(book.key)
        await removeFile(book.key)
        await refresh()
      } catch (error) {
        setMessage(error.message)
      } finally {
        setBusy(false)
      }
    },
    [refresh],
  )

  const books = useMemo(() => {
    if (filter === 'reading') {
      return library.books.filter((book) => !book.finished && (book.current?.percent || 0) > 0)
    }
    if (filter === 'finished') {
      return library.books.filter((book) => book.finished)
    }
    return library.books
  }, [library.books, filter])

  const stats = library.stats

  return (
    <div className="min-h-full bg-ink-950 text-ink-200">
      <div className="mx-auto w-full max-w-3xl px-4 pb-28 pt-8 sm:px-8 sm:pb-20 sm:pt-14">
        <header className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.22em] text-ink-400">Private press</p>
            <h1 className="mt-1 font-display text-[2.5rem] leading-none text-ink-50 sm:text-5xl">
              meReader
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setSyncOpen(true)}
            className="mt-1 flex h-11 items-center gap-2 px-1 text-sm text-ink-400 active:text-ink-50"
          >
            <DevicesIcon />
            <span className="hidden sm:inline">Devices</span>
          </button>
        </header>

        {stats ? (
          <p className="mt-6 max-w-xl font-display text-lg italic leading-snug text-ink-200 sm:text-xl">
            {stats.books} on the shelf
            <span className="text-ink-400"> · </span>
            {stats.started} underway
            <span className="text-ink-400"> · </span>
            {formatDuration(stats.secondsRead)} read
            {stats.books > 0 ? (
              <span className="text-ink-400"> · {formatPercent(stats.averagePercent)} through</span>
            ) : null}
          </p>
        ) : null}

        <nav className="-mx-4 mt-8 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
          {FILTERS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setFilter(entry.id)}
              className={`h-11 shrink-0 px-3 text-sm ${
                filter === entry.id
                  ? 'text-ink-50 underline decoration-rust decoration-2 underline-offset-8'
                  : 'text-ink-400'
              }`}
            >
              {entry.label}
            </button>
          ))}
        </nav>

        <div className="mt-6 hidden sm:block">
          <UploadZone onFiles={handleFiles} busy={busy} />
        </div>

        {message ? (
          <p className="mt-6 border-l-2 border-red-500/80 pl-3 text-sm text-red-400">{message}</p>
        ) : null}

        <section className="mt-2">
          {status === 'loading' ? (
            <div className="py-20">
              <Spinner label="Loading the shelf" />
            </div>
          ) : books.length === 0 ? (
            <p className="py-16 font-display text-2xl italic text-ink-400">The shelf is empty.</p>
          ) : (
            <ul className="divide-y divide-ink-700 border-y border-ink-700">
              {books.map((book) => (
                <li key={book.key}>
                  <BookCard book={book} available={present.has(book.key)} onRemove={handleRemove} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div
        className="fixed inset-x-0 bottom-0 z-20 border-t border-ink-700 bg-ink-950 px-4 pt-3 sm:hidden"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
      >
        <UploadZone onFiles={handleFiles} busy={busy} compact />
      </div>

      <DeviceSync open={syncOpen} onClose={() => setSyncOpen(false)} />
    </div>
  )
}
