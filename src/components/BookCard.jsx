import { Link } from 'react-router-dom'
import ProgressBar from './ProgressBar'
import { TrashIcon } from './Icons'
import { formatPercent, formatRelative, formatSize } from '../lib/format'

export default function BookCard({ book, available, onRemove }) {
  const percent = book.current?.percent || 0
  const status = book.finished ? 'Finished' : percent > 0 ? 'Reading' : 'Not started'

  return (
    <article className="group relative flex flex-col justify-between gap-4 rounded-2xl border border-ink-700 bg-ink-900 p-5 transition hover:border-ink-600 hover:bg-ink-800/70">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-ink-200">{book.title}</h3>
          <p className="mt-1 truncate text-xs text-ink-400">
            {book.author || 'Unknown author'} · {book.format.toUpperCase()} · {formatSize(book.sizeBytes)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onRemove(book)}
          aria-label={`Remove ${book.title}`}
          className="rounded-lg p-2 text-ink-400 opacity-0 transition hover:bg-ink-700 hover:text-red-400 focus:opacity-100 group-hover:opacity-100"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className={book.finished ? 'text-emerald-400' : percent > 0 ? 'text-amber' : 'text-ink-400'}>
            {status}
          </span>
          <span className="tabular-nums text-ink-400">{formatPercent(percent)}</span>
        </div>
        <ProgressBar percent={percent} />
        <p className="text-xs text-ink-400">
          {book.current?.label || 'No position saved'} · {formatRelative(book.updatedAt)}
        </p>
      </div>

      {available ? (
        <Link
          to={`/read/${book.key}`}
          className="rounded-xl bg-ink-700 px-4 py-2.5 text-center text-sm font-medium text-ink-200 transition hover:bg-amber hover:text-ink-950"
        >
          {percent > 0 ? 'Continue reading' : 'Start reading'}
        </Link>
      ) : (
        <p className="rounded-xl border border-ink-700 bg-ink-950/60 px-4 py-2.5 text-center text-xs text-ink-400">
          Not on this device — add the file again to continue
        </p>
      )}
    </article>
  )
}
