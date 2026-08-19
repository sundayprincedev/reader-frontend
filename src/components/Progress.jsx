export default function Progress({ value, className = '' }) {
  const percent = Math.min(100, Math.max(0, value || 0))

  return (
    <div className={`h-px w-full bg-line ${className}`}>
      <div
        className="h-px bg-accent transition-[width] duration-700 ease-out"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
