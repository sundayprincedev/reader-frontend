import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AddBooks from '../components/AddBooks'
import BookTile from '../components/BookTile'
import ContinueReading from '../components/ContinueReading'
import Spinner from '../components/Spinner'
import AccountMenu from '../components/AccountMenu'
import ConfirmDialog from '../components/ConfirmDialog'
import { api } from '../lib/api'
import { cacheFile, dropFile } from '../lib/fileCache'
import { deriveBookKey, detectFormat, titleFromFilename } from '../lib/bookKey'
import { formatDuration } from '../lib/format'

export default function Library() {
  const [books, setBooks] = useState([])
  const [stats, setStats] = useState(null)
  const [status, setStatus] = useState('loading')
  const [notice, setNotice] = useState(null)
  const [busy, setBusy] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [pendingRemoval, setPendingRemoval] = useState(null)
  const dragDepth = useRef(0)

  const refresh = useCallback(async () => {
    try {
      const data = await api.library()
      setBooks(data.books)
      setStats(data.stats)
      setStatus('ready')
    } catch (error) {
      setNotice(error.message)
      setStatus('ready')
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addFiles = useCallback(
    async (files) => {
      if (files.length === 0) {
        return
      }

      setBusy(true)
      setNotice(null)

      try {
        for (const file of files) {
          const format = detectFormat(file)
          if (!format) {
            setNotice(`${file.name} is not a PDF or EPUB`)
            continue
          }

          const key = await deriveBookKey(file)
          const book = await api.registerBook({
            key,
            title: titleFromFilename(file.name),
            author: '',
            format,
            sizeBytes: file.size,
          })

          await cacheFile(key, file)

          if (!book.hasFile) {
            await api.uploadFile(key, file)
          }
        }
        await refresh()
      } catch (error) {
        setNotice(error.message)
      } finally {
        setBusy(false)
      }
    },
    [refresh],
  )

  const removeBook = useCallback(async () => {
    if (!pendingRemoval) {
      return
    }

    setBusy(true)
    try {
      await api.remove(pendingRemoval.key)
      await dropFile(pendingRemoval.key)
      setPendingRemoval(null)
      await refresh()
    } catch (error) {
      setNotice(error.message)
    } finally {
      setBusy(false)
    }
  }, [pendingRemoval, refresh])

  const current = useMemo(
    () => books.find((book) => !book.finished && (book.current?.percent || 0) > 0) ?? null,
    [books],
  )

  const rest = useMemo(() => books.filter((book) => book.key !== current?.key), [books, current])

  const summary = useMemo(() => {
    if (!stats || stats.books === 0) {
      return null
    }
    const parts = [`${stats.books} ${stats.books === 1 ? 'book' : 'books'}`]
    if (stats.started > 0) {
      parts.push(`${stats.started} in progress`)
    }
    if (stats.finished > 0) {
      parts.push(`${stats.finished} finished`)
    }
    if (stats.secondsRead > 0) {
      parts.push(`${formatDuration(stats.secondsRead)} read`)
    }
    return parts.join(' · ')
  }, [stats])

  return (
    <div
      className="min-h-full"
      onDragEnter={(event) => {
        event.preventDefault()
        dragDepth.current += 1
        setDragging(true)
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => {
        dragDepth.current -= 1
        if (dragDepth.current <= 0) {
          setDragging(false)
        }
      }}
      onDrop={(event) => {
        event.preventDefault()
        dragDepth.current = 0
        setDragging(false)
        addFiles(Array.from(event.dataTransfer.files || []))
      }}
    >
      <header className="sticky top-0 z-20 border-b border-line bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
          <h1 className="font-serif text-lg tracking-tight">meReader</h1>
          <div className="flex items-center gap-3">
            <AddBooks onFiles={addFiles} busy={busy} subtle />
            <AccountMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-24 pt-10 sm:px-8">
        {notice ? (
          <p className="mb-8 rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-accent">
            {notice}
          </p>
        ) : null}

        {status === 'loading' ? (
          <div className="py-24">
            <Spinner label="Opening your library" />
          </div>
        ) : books.length === 0 ? (
          <section className="animate-rise py-20 text-center">
            <h2 className="font-serif text-2xl tracking-tight">Your library is empty</h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
              Add a PDF or EPUB and it will be waiting for you on every device you sign in to — open to the
              exact line you stopped on.
            </p>
            <div className="mt-8 flex justify-center">
              <AddBooks onFiles={addFiles} busy={busy} />
            </div>
          </section>
        ) : (
          <div className="space-y-16">
            {current ? <ContinueReading book={current} onRemove={setPendingRemoval} /> : null}

            {rest.length > 0 ? (
              <section className="animate-rise">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="text-xs uppercase tracking-label text-faint">
                    {current ? 'Also in your library' : 'Your library'}
                  </h2>
                  {summary ? <p className="text-xs text-faint">{summary}</p> : null}
                </div>

                <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {rest.map((book) => (
                    <BookTile key={book.key} book={book} onRemove={setPendingRemoval} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </main>

      <ConfirmDialog
        open={Boolean(pendingRemoval)}
        busy={busy}
        title={`Remove ${pendingRemoval?.title ?? ''}?`}
        body="This deletes the stored file and your reading history for it. You can add the book again later, but it will start from the beginning."
        confirmLabel="Remove"
        onConfirm={removeBook}
        onCancel={() => setPendingRemoval(null)}
      />

      {dragging ? (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-paper/80 backdrop-blur-sm">
          <p className="rounded-xl border border-dashed border-accent px-8 py-6 font-serif text-xl text-ink">
            Drop to add to your library
          </p>
        </div>
      ) : null}
    </div>
  )
}
