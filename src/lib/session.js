const TOKEN_KEY = 'mereader:token'

let current = localStorage.getItem(TOKEN_KEY)
const listeners = new Set()

export function getToken() {
  return current
}

export function setToken(token) {
  current = token
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
  listeners.forEach((listener) => listener(token))
}

export function onTokenChange(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
