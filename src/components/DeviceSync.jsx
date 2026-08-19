import { useState } from 'react'
import { getReaderId, setReaderId } from '../lib/identity'

export default function DeviceSync({ open, onClose }) {
  const [value, setValue] = useState(getReaderId)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(null)

  if (!open) {
    return null
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(getReaderId())
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      setError('Copying is blocked here — select the code and copy it manually')
    }
  }

  const apply = () => {
    try {
      setReaderId(value)
      window.location.reload()
    } catch (saveError) {
      setError(saveError.message)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-0 sm:items-center sm:p-4">
      <div
        className="w-full max-w-md border-t border-ink-700 bg-ink-900 px-5 pb-6 pt-5 sm:border sm:border-ink-700"
        style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
      >
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink-400">Devices</p>
        <h2 className="mt-1 font-display text-3xl text-ink-50">Read elsewhere</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-400">
          Your shelf is tied to this code. Enter the same one on your phone to keep the same books and
          places.
        </p>

        <div className="mt-6">
          <p className="text-[12px] text-ink-400">This device</p>
          <div className="mt-2 flex gap-2">
            <code className="min-h-12 flex-1 truncate border border-ink-700 bg-ink-950 px-3 py-3 font-mono text-xs text-rust">
              {getReaderId()}
            </code>
            <button
              type="button"
              onClick={copy}
              className="min-h-12 shrink-0 border border-ink-700 px-4 text-sm text-ink-200"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="mt-5">
          <label htmlFor="reader-code" className="text-[12px] text-ink-400">
            Use an existing code
          </label>
          <input
            id="reader-code"
            value={value}
            spellCheck={false}
            autoComplete="off"
            onChange={(event) => {
              setValue(event.target.value.trim().toLowerCase())
              setError(null)
            }}
            className="mt-2 min-h-12 w-full border border-ink-700 bg-ink-950 px-3 py-3 font-mono text-xs text-ink-200 outline-none focus:border-rust"
          />
        </div>

        {error ? <p className="mt-3 text-xs text-red-400">{error}</p> : null}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-12 flex-1 border border-ink-700 text-sm text-ink-200"
          >
            Close
          </button>
          <button type="button" onClick={apply} className="min-h-12 flex-1 bg-rust text-sm font-medium text-ink-50">
            Save code
          </button>
        </div>
      </div>
    </div>
  )
}
