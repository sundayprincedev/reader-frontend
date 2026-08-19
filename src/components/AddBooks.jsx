import { useRef } from 'react'
import { Plus } from './Icons'

export default function AddBooks({ onFiles, busy, subtle = false }) {
  const inputRef = useRef(null)

  return (
    <>
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className={
          subtle
            ? 'inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm text-ink transition hover:border-ink/30 disabled:opacity-50'
            : 'inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-medium text-paper transition hover:opacity-90 disabled:opacity-50'
        }
      >
        <Plus className="h-4 w-4" />
        {busy ? 'Adding…' : 'Add book'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.epub,application/pdf,application/epub+zip"
        multiple
        className="hidden"
        onChange={(event) => {
          onFiles(Array.from(event.target.files || []))
          event.target.value = ''
        }}
      />
    </>
  )
}
