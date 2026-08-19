import { Link } from 'react-router-dom'
import BookCover from './BookCover'
import Progress from './Progress'
import { formatPercent, formatRelative } from '../lib/format'
import { enterFullscreen } from '../lib/immersive'

export default function ContinueReading({ book }) {
  const percent = book.current?.percent || 0

  return (
    <section className="animate-rise">
      <h2 className="text-xs uppercase tracking-label text-faint">Continue reading</h2>

      <div className="mt-5 flex gap-6 sm:gap-8">
        <Link to={`/read/${book.key}`} onClick={enterFullscreen} className="w-24 shrink-0 sm:w-32">
          <BookCover book={book} className="transition duration-300 hover:-translate-y-1 hover:shadow-lift" />
        </Link>

        <div className="flex min-w-0 flex-col justify-center">
          <Link to={`/read/${book.key}`} onClick={enterFullscreen}>
            <h3 className="font-serif text-2xl leading-tight tracking-tight sm:text-[28px]">{book.title}</h3>
          </Link>
          <p className="mt-1.5 text-sm text-muted">{book.author || 'Unknown author'}</p>

          <div className="mt-5 max-w-xs">
            <Progress value={percent} />
            <p className="mt-2.5 text-xs text-faint">
              {formatPercent(percent)} · {book.current?.label || 'Not started'} · {formatRelative(book.updatedAt)}
            </p>
          </div>

          <Link
            to={`/read/${book.key}`}
            onClick={enterFullscreen}
            className="mt-6 inline-flex w-fit rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-paper transition hover:opacity-90"
          >
            {percent > 0 ? 'Continue' : 'Start reading'}
          </Link>
        </div>
      </div>
    </section>
  )
}
