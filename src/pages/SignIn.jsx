import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function SignIn() {
  const { authenticate } = useAuth()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const isRegister = mode === 'register'

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError(null)

    try {
      await authenticate(mode, { email, password })
    } catch (failure) {
      setError(failure.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="flex min-h-full items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm animate-rise">
        <header className="text-center">
          <h1 className="font-serif text-3xl tracking-tight">meReader</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {isRegister
              ? 'Create an account and your library follows you to every device.'
              : 'Welcome back. Your books and places are waiting.'}
          </p>
        </header>

        <form onSubmit={submit} className="mt-10 space-y-4">
          <label className="block">
            <span className="text-xs uppercase tracking-label text-faint">Email</span>
            <input
              type="email"
              value={email}
              required
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-lg border border-line bg-surface px-4 py-3 text-[15px] outline-none transition placeholder:text-faint focus:border-accent"
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="text-xs uppercase tracking-label text-faint">Password</span>
            <input
              type="password"
              value={password}
              required
              minLength={isRegister ? 8 : undefined}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-lg border border-line bg-surface px-4 py-3 text-[15px] outline-none transition placeholder:text-faint focus:border-accent"
              placeholder={isRegister ? 'At least 8 characters' : '••••••••'}
            />
          </label>

          {error ? (
            <p className="rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-accent">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-ink px-4 py-3.5 text-sm font-medium text-paper transition hover:opacity-90 disabled:opacity-50"
          >
            {busy ? 'One moment…' : isRegister ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-muted">
          {isRegister ? 'Already have an account?' : 'New here?'}{' '}
          <button
            type="button"
            onClick={() => {
              setMode(isRegister ? 'login' : 'register')
              setError(null)
            }}
            className="text-ink underline decoration-line underline-offset-4 transition hover:decoration-accent"
          >
            {isRegister ? 'Sign in' : 'Create an account'}
          </button>
        </p>
      </div>
    </main>
  )
}
