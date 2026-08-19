export default function Spinner({ label }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 text-ink-400">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-600 border-t-amber" />
      {label ? <p className="text-sm">{label}</p> : null}
    </div>
  )
}
