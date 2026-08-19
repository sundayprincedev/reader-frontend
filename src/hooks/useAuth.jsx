import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { getToken, onTokenChange, setToken } from '../lib/session'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState(getToken() ? 'loading' : 'signed-out')

  useEffect(() => {
    if (!getToken()) {
      return undefined
    }

    let cancelled = false
    api
      .me()
      .then((profile) => {
        if (!cancelled) {
          setUser(profile)
          setStatus('signed-in')
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null)
          setStatus('signed-out')
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(
    () =>
      onTokenChange((token) => {
        if (!token) {
          setUser(null)
          setStatus('signed-out')
        }
      }),
    [],
  )

  const authenticate = useCallback(async (mode, credentials) => {
    const result = mode === 'register' ? await api.register(credentials) : await api.login(credentials)
    setToken(result.token)
    setUser(result.user)
    setStatus('signed-in')
    return result.user
  }, [])

  const signOut = useCallback(() => {
    setToken(null)
    setUser(null)
    setStatus('signed-out')
  }, [])

  const value = useMemo(
    () => ({ user, status, authenticate, signOut }),
    [user, status, authenticate, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
