export default function Spinner({ label }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-muted">
      <div className="h-6 w-6 animate-spin rounded-full border border-line border-t-accent" />
      {label ? <p className="text-sm">{label}</p> : null}
    </div>
  )
}
