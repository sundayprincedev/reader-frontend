import ProgressBar from './ProgressBar'
import { RefreshIcon } from './Icons'
import { formatPercent, formatRelative } from '../lib/format'

export default function HistoryPanel({ open, book, onClose, onRestore, onReset, busy }) {
  const checkpoints = [...(book?.history ?? [])].reverse()

  return (
    <div
      className={`fixed inset-0 z-40 transition ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        tabIndex={open ? 0 : -1}
        aria-label="Close history"
        onClick={onClose}
        className={`absolute inset-0 bg-black/55 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
      />

      <aside
        className={`absolute flex flex-col bg-ink-900 transition-transform duration-500 ease-out max-md:inset-x-0 max-md:bottom-0 max-md:top-auto max-md:h-[min(78vh,640px)] max-md:w-full max-md:border-t max-md:border-ink-700 md:right-0 md:top-0 md:h-full md:w-full md:max-w-sm md:border-l md:border-ink-700 ${
          open ? 'max-md:translate-y-0 md:translate-x-0' : 'max-md:translate-y-full md:translate-x-full'
        }`}
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <header className="flex items-start justify-between gap-3 border-b border-ink-700 px-5 py-4">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.18em] text-ink-400">Places</p>
            <h2 className="mt-1 truncate font-display text-2xl text-ink-50">{book?.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center text-ink-400 md:hidden"
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-3">
          {checkpoints.length === 0 ? (
            <p className="py-12 font-display text-lg italic text-ink-400">No checkpoints yet.</p>
          ) : (
            <ul>
              {checkpoints.map((entry, index) => (
                <li key={`${entry.recorded}-${index}`} className="border-b border-ink-800">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onRestore(book.history.length - 1 - index)}
                    className="w-full py-4 text-left disabled:opacity-50"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="truncate pr-2 text-sm text-ink-200">{entry.label || 'Saved position'}</span>
                      <span className="tabular-nums text-[12px] text-rust">{formatPercent(entry.percent)}</span>
                    </div>
                    <div className="mt-2">
                      <ProgressBar percent={entry.percent} />
                    </div>
                    <p className="mt-2 text-[12px] text-ink-400">{formatRelative(entry.recorded)}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="border-t border-ink-700 p-4">
          <button
            type="button"
            disabled={busy}
            onClick={onReset}
            className="flex min-h-12 w-full items-center justify-center gap-2 text-sm text-ink-200 disabled:opacity-50"
          >
            <RefreshIcon className="h-4 w-4" />
            Start from the first page
          </button>
        </footer>
      </aside>
    </div>
  )
}
