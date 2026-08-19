import { useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'
import { setPin } from '../lib/lock'

const PIN_LENGTH = 4

export default function PinGate() {
  const [value, setValue] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const submit = async (pin) => {
    setBusy(true)
    setError(null)

    try {
      await api.unlock(pin)
      setPin(pin)
    } catch (failure) {
      setError(failure.message)
      setValue('')
      inputRef.current?.focus()
    } finally {
      setBusy(false)
    }
  }

  const change = (event) => {
    const digits = event.target.value.replace(/\D/g, '').slice(0, PIN_LENGTH)
    setValue(digits)
    setError(null)

    if (digits.length === PIN_LENGTH) {
      submit(digits)
    }
  }

  return (
    <main className="flex min-h-full items-center justify-center px-6 py-16">
      <div className="w-full max-w-xs animate-rise text-center">
        <h1 className="font-serif text-3xl tracking-tight">meReader</h1>
        <p className="mt-3 text-sm text-muted">Enter your PIN to open the library.</p>

        <button
          type="button"
          onClick={() => inputRef.current?.focus()}
          aria-label="Enter PIN"
          className="mt-10 flex w-full justify-center gap-3"
        >
          {Array.from({ length: PIN_LENGTH }, (unused, index) => (
            <span
              key={index}
              className={`h-12 w-11 rounded-lg border transition ${
                value.length === index && !busy
                  ? 'border-accent'
                  : value[index]
                    ? 'border-line bg-raised'
                    : 'border-line'
              }`}
            >
              <span className="flex h-full items-center justify-center font-serif text-2xl text-ink">
                {value[index] ? '•' : ''}
              </span>
            </span>
          ))}
        </button>

        <input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={value}
          disabled={busy}
          onChange={change}
          aria-label="PIN"
          className="absolute h-px w-px opacity-0"
        />

        <p className="mt-6 min-h-[2.5rem] text-sm leading-relaxed text-accent">
          {busy ? <span className="text-muted">Checking…</span> : error}
        </p>
      </div>
    </main>
  )
}
