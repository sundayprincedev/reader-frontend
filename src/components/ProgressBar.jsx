export default function ProgressBar({ percent, className = '' }) {
  const value = Math.min(100, Math.max(0, percent || 0))

  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-ink-700 ${className}`}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-amber to-amber/70 transition-[width] duration-500"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}
