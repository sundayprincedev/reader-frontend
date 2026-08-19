import { Trash } from './Icons'

export default function RemoveButton({ onClick, label, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex h-8 w-8 items-center justify-center rounded-full border border-line bg-paper/90 text-muted shadow-sm backdrop-blur transition hover:border-accent/40 hover:text-accent active:scale-95 ${className}`}
    >
      <Trash className="h-3.5 w-3.5" />
    </button>
  )
}
