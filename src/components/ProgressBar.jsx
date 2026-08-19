export default function ProgressBar({ percent, className = '' }) {
  const value = Math.min(100, Math.max(0, percent || 0))

  return (
    <div className={`h-px w-full bg-ink-700 ${className}`}>
      <div className="h-full bg-rust transition-[width] duration-300" style={{ width: `${value}%` }} />
    </div>
  )
}
