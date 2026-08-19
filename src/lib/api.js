import { getPin, setPin } from './lock'

const BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

const PIN_HEADER = 'X-Reader-Pin'

function headers(extra = {}) {
  const pin = getPin()
  return pin ? { ...extra, [PIN_HEADER]: pin } : extra
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

async function request(path, { method = 'GET', body, keepalive = false } = {}) {
  const response = await fetch(`${BASE_URL}/api${path}`, {
    method,
    keepalive,
    headers: headers(body ? { 'Content-Type': 'application/json' } : {}),
    body: body ? JSON.stringify(body) : undefined,
  })

  if (response.status === 401 && getPin()) {
    setPin(null)
  }

  if (response.status === 204) {
    return null
  }

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(payload?.error ?? `Request failed (${response.status})`, response.status)
  }

  return payload
}

export const api = {
  health: () => request('/health'),

  unlock: async (pin) => {
    const response = await fetch(`${BASE_URL}/api/unlock`, {
      method: 'POST',
      headers: { [PIN_HEADER]: pin },
    })

    if (response.ok) {
      return true
    }

    const payload = await response.json().catch(() => null)
    throw new ApiError(payload?.error ?? 'Could not unlock', response.status)
  },

  library: () => request('/books'),
  registerBook: (book) => request('/books', { method: 'POST', body: book }),
  book: (key) => request(`/books/${key}`),
  saveProgress: (key, progress, keepalive = false) =>
    request(`/books/${key}/progress`, { method: 'PUT', body: progress, keepalive }),
  reset: (key) => request(`/books/${key}/reset`, { method: 'POST' }),
  restore: (key, index) => request(`/books/${key}/restore`, { method: 'POST', body: { index } }),
  remove: (key) => request(`/books/${key}`, { method: 'DELETE' }),

  uploadFile: async (key, file) => {
    const form = new FormData()
    form.append('file', file, file.name)

    const response = await fetch(`${BASE_URL}/api/books/${key}/file`, {
      method: 'POST',
      headers: headers(),
      body: form,
    })
    const payload = await response.json().catch(() => null)

    if (!response.ok) {
      throw new ApiError(payload?.error ?? 'Upload failed', response.status)
    }
    return payload
  },

  downloadFile: async (key) => {
    const response = await fetch(`${BASE_URL}/api/books/${key}/file`, { headers: headers() })
    if (!response.ok) {
      throw new ApiError('Could not download this book', response.status)
    }
    return response.blob()
  },
}
