import { useNavigate } from 'react-router-dom'
import ProgressBar from './ProgressBar'
import { BackIcon, CollapseIcon, ExpandIcon, HistoryIcon } from './Icons'
import { formatPercent } from '../lib/format'

const HIT =
  'flex h-11 min-w-11 items-center justify-center text-ink-200 transition active:text-ink-50'

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
        className={`fixed inset-x-0 top-0 z-30 transition-transform duration-500 ease-out ${
          visible ? 'translate-y-0' : 'pointer-events-none -translate-y-full'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex items-center gap-1 border-b border-ink-700 bg-ink-950 px-1.5 py-1.5 sm:gap-2 sm:px-3">
          <button
            type="button"
            aria-label="Back to the shelf"
            className={HIT}
            onClick={async () => {
              await onExit?.()
              navigate('/')
            }}
          >
            <BackIcon />
            <span className="ml-0.5 hidden text-[13px] sm:inline">Shelf</span>
          </button>

          <div className="min-w-0 flex-1 px-1 text-center sm:text-left">
            <p className="truncate font-display text-[17px] leading-tight text-ink-50">{title}</p>
            <p className="truncate text-[11px] text-ink-400">{label}</p>
          </div>

          <button type="button" aria-label="Reading history" className={HIT} onClick={onOpenHistory}>
            <HistoryIcon />
          </button>
          <button
            type="button"
            aria-label={immersive ? 'Exit full screen' : 'Enter full screen'}
            className={HIT}
            onClick={onToggleImmersive}
          >
            {immersive ? <CollapseIcon /> : <ExpandIcon />}
          </button>
        </div>
      </header>

      <footer
        className={`fixed inset-x-0 bottom-0 z-30 transition-transform duration-500 ease-out ${
          visible ? 'translate-y-0' : 'pointer-events-none translate-y-full'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="border-t border-ink-700 bg-ink-950 px-3 pb-3 pt-3 sm:px-5">
          <ProgressBar percent={percent} />
          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center">
              <button
                type="button"
                aria-label="Decrease size"
                className="flex h-11 w-11 items-center justify-center font-display text-[15px] text-ink-400 active:text-ink-50"
                onClick={() => onScaleChange(-1)}
              >
                A
              </button>
              <span className="w-9 text-center text-[11px] tabular-nums text-ink-400">
                {Math.round(scale * 100)}
              </span>
              <button
                type="button"
                aria-label="Increase size"
                className="flex h-11 w-11 items-center justify-center font-display text-[22px] leading-none text-ink-200 active:text-ink-50"
                onClick={() => onScaleChange(1)}
              >
                A
              </button>
            </div>

            <p className="min-w-0 flex-1 truncate text-right font-display text-sm italic text-ink-400">
              {formatPercent(percent)}
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
