import { Link } from 'react-router-dom'
import ProgressBar from './ProgressBar'
import { TrashIcon } from './Icons'
import { formatPercent, formatRelative, formatSize } from '../lib/format'

export default function BookCard({ book, available, onRemove }) {
  const percent = book.current?.percent || 0
  const status = book.finished ? 'Finished' : percent > 0 ? 'Reading' : 'Unopened'

  const body = (
    <div className="min-w-0 flex-1 py-4 pr-2 sm:py-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="truncate font-display text-[1.35rem] leading-tight text-ink-50">{book.title}</h3>
        <span className="shrink-0 text-[11px] tabular-nums text-ink-400">{formatPercent(percent)}</span>
      </div>
      <p className="mt-1 truncate text-[12px] text-ink-400">
        {book.author || 'Unknown author'}
        <span className="text-ink-700"> · </span>
        {book.format.toUpperCase()}
        <span className="text-ink-700"> · </span>
        {formatSize(book.sizeBytes)}
      </p>
      <div className="mt-3">
        <ProgressBar percent={percent} />
      </div>
      <p className="mt-2 text-[12px] text-ink-400">
        <span className={book.finished ? 'text-ink-50' : percent > 0 ? 'text-rust' : ''}>{status}</span>
        <span className="text-ink-700"> · </span>
        {book.current?.label || 'No place saved'}
        <span className="text-ink-700"> · </span>
        {formatRelative(book.updatedAt)}
      </p>
      {!available ? (
        <p className="mt-2 text-[12px] text-rust">File missing on this device</p>
      ) : null}
    </div>
  )

  return (
    <article className="flex items-stretch gap-0">
      <span
        className={`w-[3px] shrink-0 ${percent > 0 || book.finished ? 'bg-rust' : 'bg-ink-700'}`}
        aria-hidden="true"
      />
      {available ? (
        <Link to={`/read/${book.key}`} className="min-w-0 flex-1 active:bg-ink-900">
          {body}
        </Link>
      ) : (
        body
      )}
      <button
        type="button"
        onClick={() => onRemove(book)}
        aria-label={`Remove ${book.title}`}
        className="flex h-auto w-11 shrink-0 items-center justify-center self-center text-ink-400 active:text-red-400"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </article>
  )
}
