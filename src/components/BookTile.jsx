import { Link } from 'react-router-dom'
import BookCover from './BookCover'
import Progress from './Progress'
import RemoveButton from './RemoveButton'
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

      <RemoveButton
        onClick={() => onRemove(book)}
        label={`Remove ${book.title}`}
        className="absolute right-1.5 top-1.5 opacity-70 group-hover:opacity-100"
      />
    </article>
  )
}
