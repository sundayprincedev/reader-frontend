import { Link } from 'react-router-dom'
import BookCover from './BookCover'
import Progress from './Progress'
import { Trash } from './Icons'
import { formatPercent } from '../lib/format'

export default function BookTile({ book, onRemove }) {
  const percent = book.current?.percent || 0

  return (
    <article className="group relative">
      <Link to={`/read/${book.key}`} className="block">
        <BookCover book={book} className="transition duration-300 group-hover:-translate-y-1 group-hover:shadow-lift" />
      </Link>

      <div className="mt-3 space-y-1.5">
        <Link to={`/read/${book.key}`} className="block">
          <h3 className="truncate font-serif text-[15px] leading-snug text-ink">{book.title}</h3>
          <p className="truncate text-xs text-faint">{book.author || 'Unknown author'}</p>
        </Link>

        <div className="flex items-center gap-2 pt-0.5">
          <Progress value={percent} className="flex-1" />
          <span className="shrink-0 text-[11px] tabular-nums text-faint">
            {book.finished ? 'Done' : formatPercent(percent)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onRemove(book)}
        aria-label={`Remove ${book.title}`}
        className="absolute right-1.5 top-1.5 rounded-md bg-paper/90 p-1.5 text-muted opacity-0 shadow-sm backdrop-blur transition hover:text-accent focus-visible:opacity-100 group-hover:opacity-100"
      >
        <Trash className="h-3.5 w-3.5" />
      </button>
    </article>
  )
}
