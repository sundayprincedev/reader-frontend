import { useCallback, useEffect, useMemo, useState } from 'react'
import UploadZone from '../components/UploadZone'
import BookCard from '../components/BookCard'
import Spinner from '../components/Spinner'
import DeviceSync from '../components/DeviceSync'
import { BookIcon } from '../components/Icons'
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
      <div className="mx-auto w-full max-w-6xl px-5 pb-20 pt-10 sm:px-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-semibold text-white">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-800 text-amber">
                <BookIcon />
              </span>
              meReader
            </h1>
            <p className="mt-2 text-sm text-ink-400">
              Your library picks up exactly where you left off, on any device.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSyncOpen(true)}
              className="rounded-xl border border-ink-700 bg-ink-900 px-4 py-2.5 text-sm text-ink-400 transition hover:text-ink-200"
            >
              Sync devices
            </button>

            <div className="flex gap-1 rounded-xl border border-ink-700 bg-ink-900 p-1">
              {FILTERS.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setFilter(entry.id)}
                  className={`rounded-lg px-4 py-2 text-sm transition ${
                    filter === entry.id ? 'bg-ink-700 text-white' : 'text-ink-400 hover:text-ink-200'
                  }`}
                >
                  {entry.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        {stats ? (
          <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Books" value={stats.books} />
            <StatTile label="In progress" value={stats.started} />
            <StatTile label="Finished" value={stats.finished} />
            <StatTile label="Time read" value={formatDuration(stats.secondsRead)} />
          </section>
        ) : null}

        {stats?.books > 0 ? (
          <p className="mt-4 text-xs text-ink-400">
            Average progress across your library: {formatPercent(stats.averagePercent)}
          </p>
        ) : null}

        <section className="mt-8">
          <UploadZone onFiles={handleFiles} busy={busy} />
        </section>

        {message ? (
          <p className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {message}
          </p>
        ) : null}

        <section className="mt-8">
          {status === 'loading' ? (
            <div className="py-16">
              <Spinner label="Loading your library" />
            </div>
          ) : books.length === 0 ? (
            <p className="rounded-2xl border border-ink-700 bg-ink-900 px-6 py-14 text-center text-sm text-ink-400">
              Nothing here yet. Add a PDF or EPUB above to start reading.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {books.map((book) => (
                <BookCard
                  key={book.key}
                  book={book}
                  available={present.has(book.key)}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <DeviceSync open={syncOpen} onClose={() => setSyncOpen(false)} />
    </div>
  )
}

function StatTile({ label, value }) {
  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900 px-5 py-4">
      <p className="text-xs uppercase tracking-wider text-ink-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-white">{value}</p>
    </div>
  )
}
