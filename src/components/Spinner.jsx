export default function Spinner({ label }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 text-ink-400">
      <div className="h-px w-24 overflow-hidden bg-ink-700">
        <div className="h-full w-1/3 animate-slide bg-rust" />
      </div>
      {label ? <p className="font-display text-sm italic">{label}</p> : null}
    </div>
  )
}
