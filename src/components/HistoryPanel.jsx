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
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
      />

      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-sm flex-col border-l border-ink-700 bg-ink-900 transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <header className="border-b border-ink-700 px-5 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-400">Reading history</h2>
          <p className="mt-1 truncate text-base font-medium text-ink-200">{book?.title}</p>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {checkpoints.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-400">
              Checkpoints appear here as you read.
            </p>
          ) : (
            <ul className="space-y-2">
              {checkpoints.map((entry, index) => (
                <li key={`${entry.recorded}-${index}`}>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onRestore(book.history.length - 1 - index)}
                    className="w-full rounded-xl border border-ink-700 bg-ink-800/60 p-4 text-left transition hover:border-amber/60 hover:bg-ink-800 disabled:opacity-50"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate pr-3 text-ink-200">{entry.label || 'Saved position'}</span>
                      <span className="tabular-nums text-xs text-amber">{formatPercent(entry.percent)}</span>
                    </div>
                    <div className="mt-2">
                      <ProgressBar percent={entry.percent} />
                    </div>
                    <p className="mt-2 text-xs text-ink-400">{formatRelative(entry.recorded)}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="border-t border-ink-700 p-5">
          <button
            type="button"
            disabled={busy}
            onClick={onReset}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-ink-600 px-4 py-3 text-sm font-medium text-ink-200 transition hover:border-red-500/60 hover:text-red-400 disabled:opacity-50"
          >
            <RefreshIcon className="h-4 w-4" />
            Restart from the beginning
          </button>
        </footer>
      </aside>
    </div>
  )
}
