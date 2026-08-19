import { useNavigate } from 'react-router-dom'
import Progress from './Progress'
import { ArrowLeft, Clock, Collapse, Expand, Type } from './Icons'
import { formatPercent } from '../lib/format'

const CONTROL =
  'flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface/95 text-muted backdrop-blur transition hover:text-ink active:scale-95'

export default function ReaderChrome({
  visible,
  title,
  label,
  percent,
  immersive,
  scale,
  onToggleImmersive,
  onOpenHistory,
  onScaleChange,
  onExit,
}) {
  const navigate = useNavigate()

  const hidden = visible ? '' : 'invisible opacity-0'

  return (
    <>
      <header
        className={`pointer-events-none fixed inset-x-0 top-0 z-30 transition-all duration-300 ${
          visible ? 'translate-y-0 opacity-100' : `-translate-y-3 ${hidden}`
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="pointer-events-auto flex items-center gap-3 border-b border-line bg-paper/90 px-4 py-3 backdrop-blur-md">
          <button
            type="button"
            aria-label="Back to library"
            className={CONTROL}
            onClick={async () => {
              await onExit?.()
              navigate('/')
            }}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-[15px] leading-tight text-ink">{title}</p>
            <p className="truncate text-xs text-faint">{label}</p>
          </div>

          <button type="button" aria-label="Reading history" className={CONTROL} onClick={onOpenHistory}>
            <Clock className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={immersive ? 'Exit full screen' : 'Enter full screen'}
            className={CONTROL}
            onClick={onToggleImmersive}
          >
            {immersive ? <Collapse className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <footer
        className={`pointer-events-none fixed inset-x-0 bottom-0 z-30 transition-all duration-300 ${
          visible ? 'translate-y-0 opacity-100' : `translate-y-3 ${hidden}`
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="pointer-events-auto flex items-center gap-4 border-t border-line bg-paper/90 px-4 py-3 backdrop-blur-md">
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Smaller"
              onClick={() => onScaleChange(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:text-ink"
            >
              <Type className="h-3.5 w-3.5" />
            </button>
            <span className="w-9 text-center text-[11px] tabular-nums text-faint">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              aria-label="Larger"
              onClick={() => onScaleChange(1)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:text-ink"
            >
              <Type className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-1 items-center gap-3">
            <Progress value={percent} className="flex-1" />
            <span className="w-9 text-right text-[11px] tabular-nums text-faint">
              {formatPercent(percent)}
            </span>
          </div>
        </div>
      </footer>
    </>
  )
}
