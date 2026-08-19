import Progress from './Progress'
import { Rewind } from './Icons'
import { formatPercent, formatRelative } from '../lib/format'

export default function HistoryPanel({ open, book, busy, onClose, onRestore, onReset }) {
  const checkpoints = [...(book?.history ?? [])].reverse()

  return (
    <div className={`fixed inset-0 z-40 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <button
        type="button"
        tabIndex={open ? 0 : -1}
        aria-label="Close history"
        onClick={onClose}
        className={`absolute inset-0 bg-ink/25 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-sm flex-col border-l border-line bg-paper shadow-panel transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <header className="border-b border-line px-6 py-5">
          <h2 className="text-xs uppercase tracking-label text-faint">Reading history</h2>
          <p className="mt-1.5 truncate font-serif text-lg text-ink">{book?.title}</p>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {checkpoints.length === 0 ? (
            <p className="py-12 text-center text-sm leading-relaxed text-muted">
              Checkpoints appear here as you read, so you can always step back.
            </p>
          ) : (
            <ul className="space-y-1">
              {checkpoints.map((entry, index) => (
                <li key={`${entry.recorded}-${index}`}>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onRestore(book.history.length - 1 - index)}
                    className="w-full rounded-lg px-3 py-3 text-left transition hover:bg-raised disabled:opacity-50"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-sm text-ink">{entry.label || 'Saved position'}</span>
                      <span className="shrink-0 text-[11px] tabular-nums text-accent">
                        {formatPercent(entry.percent)}
                      </span>
                    </div>
                    <div className="mt-2.5">
                      <Progress value={entry.percent} />
                    </div>
                    <p className="mt-2 text-[11px] text-faint">{formatRelative(entry.recorded)}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="border-t border-line p-6">
          <button
            type="button"
            disabled={busy}
            onClick={onReset}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-line px-4 py-3 text-sm text-muted transition hover:border-accent/40 hover:text-accent disabled:opacity-50"
          >
            <Rewind className="h-4 w-4" />
            Start this book over
          </button>
        </footer>
      </aside>
    </div>
  )
}
