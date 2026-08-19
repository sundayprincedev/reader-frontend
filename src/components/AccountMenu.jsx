import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function AccountMenu() {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!open) {
      return undefined
    }

    const close = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [open])

  const initial = (user?.email?.[0] ?? '?').toUpperCase()

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Account"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-sm font-medium text-muted transition hover:border-ink/30 hover:text-ink"
      >
        {initial}
      </button>

      {open ? (
        <div className="absolute right-0 top-11 z-30 w-60 animate-fade overflow-hidden rounded-xl border border-line bg-surface shadow-panel">
          <div className="border-b border-line px-4 py-3">
            <p className="text-xs uppercase tracking-label text-faint">Signed in</p>
            <p className="mt-1 truncate text-sm text-ink">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="w-full px-4 py-3 text-left text-sm text-muted transition hover:bg-raised hover:text-ink"
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  )
}
