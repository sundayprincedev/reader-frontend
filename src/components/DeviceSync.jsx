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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-2xl border border-ink-700 bg-ink-900 p-6">
        <h2 className="text-lg font-semibold text-white">Read on another device</h2>
        <p className="mt-2 text-sm text-ink-400">
          Your library is tied to this code. Enter the same code on your phone to see the same books and
          positions.
        </p>

        <div className="mt-5 space-y-2">
          <span className="text-xs uppercase tracking-wider text-ink-400">This device</span>
          <div className="flex gap-2">
            <code className="flex-1 truncate rounded-xl border border-ink-700 bg-ink-950 px-4 py-3 font-mono text-xs text-amber">
              {getReaderId()}
            </code>
            <button
              type="button"
              onClick={copy}
              className="rounded-xl bg-ink-700 px-4 text-sm text-ink-200 transition hover:bg-ink-600"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <label htmlFor="reader-code" className="text-xs uppercase tracking-wider text-ink-400">
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
            className="w-full rounded-xl border border-ink-700 bg-ink-950 px-4 py-3 font-mono text-xs text-ink-200 outline-none focus:border-amber"
          />
        </div>

        {error ? <p className="mt-3 text-xs text-red-300">{error}</p> : null}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-ink-700 px-4 py-3 text-sm text-ink-200 transition hover:bg-ink-800"
          >
            Close
          </button>
          <button
            type="button"
            onClick={apply}
            className="flex-1 rounded-xl bg-amber px-4 py-3 text-sm font-medium text-ink-950 transition hover:brightness-110"
          >
            Save code
          </button>
        </div>
      </div>
    </div>
  )
}
