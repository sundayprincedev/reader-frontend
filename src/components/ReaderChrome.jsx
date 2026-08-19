import { useNavigate } from 'react-router-dom'
import ProgressBar from './ProgressBar'
import { BackIcon, CollapseIcon, ExpandIcon, HistoryIcon, TextIcon } from './Icons'
import { formatPercent } from '../lib/format'

const CONTROL_CLASS =
  'flex h-11 w-11 items-center justify-center rounded-full bg-ink-800/90 text-ink-200 backdrop-blur transition active:scale-95 hover:bg-ink-700'

export default function ReaderChrome({
  visible,
  title,
  label,
  percent,
  immersive,
  onToggleImmersive,
  onOpenHistory,
  onScaleChange,
  scale,
  onExit,
}) {
  const navigate = useNavigate()

  return (
    <>
      <header
        className={`pointer-events-none fixed inset-x-0 top-0 z-30 transition-all duration-300 ${
          visible ? 'translate-y-0 opacity-100' : 'invisible -translate-y-full opacity-0'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="pointer-events-auto flex items-center gap-3 bg-gradient-to-b from-ink-950 via-ink-950/95 to-transparent px-3 pb-8 pt-3">
          <button
            type="button"
            aria-label="Back to dashboard"
            className={CONTROL_CLASS}
            onClick={async () => {
              await onExit?.()
              navigate('/')
            }}
          >
            <BackIcon />
          </button>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink-200">{title}</p>
            <p className="truncate text-xs text-ink-400">{label}</p>
          </div>

          <button type="button" aria-label="Reading history" className={CONTROL_CLASS} onClick={onOpenHistory}>
            <HistoryIcon />
          </button>
          <button
            type="button"
            aria-label={immersive ? 'Exit full screen' : 'Enter full screen'}
            className={CONTROL_CLASS}
            onClick={onToggleImmersive}
          >
            {immersive ? <CollapseIcon /> : <ExpandIcon />}
          </button>
        </div>
      </header>

      <footer
        className={`pointer-events-none fixed inset-x-0 bottom-0 z-30 transition-all duration-300 ${
          visible ? 'translate-y-0 opacity-100' : 'invisible translate-y-full opacity-0'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="pointer-events-auto flex items-center gap-4 bg-gradient-to-t from-ink-950 via-ink-950/95 to-transparent px-4 pb-4 pt-10">
          <div className="flex items-center gap-1 rounded-full bg-ink-800/90 p-1 backdrop-blur">
            <button
              type="button"
              aria-label="Decrease size"
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-400 transition hover:text-ink-200"
              onClick={() => onScaleChange(-1)}
            >
              <TextIcon className="h-3.5 w-3.5" />
            </button>
            <span className="w-10 text-center text-xs tabular-nums text-ink-400">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              aria-label="Increase size"
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-400 transition hover:text-ink-200"
              onClick={() => onScaleChange(1)}
            >
              <TextIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-1 items-center gap-3">
            <ProgressBar percent={percent} />
            <span className="w-10 text-right text-xs tabular-nums text-ink-400">{formatPercent(percent)}</span>
          </div>
        </div>
      </footer>
    </>
  )
}
