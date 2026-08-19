const BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

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
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })

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

    const response = await fetch(`${BASE_URL}/api/books/${key}/file`, { method: 'POST', body: form })
    const payload = await response.json().catch(() => null)

    if (!response.ok) {
      throw new ApiError(payload?.error ?? 'Upload failed', response.status)
    }
    return payload
  },

  downloadFile: async (key) => {
    const response = await fetch(`${BASE_URL}/api/books/${key}/file`)
    if (!response.ok) {
      throw new ApiError('Could not download this book', response.status)
    }
    return response.blob()
  },
}
