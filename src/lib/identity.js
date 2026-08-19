const STORAGE_KEY = 'mereader:reader-id'

function createId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function getReaderId() {
  let id = localStorage.getItem(STORAGE_KEY)
  if (!id || id.length < 16) {
    id = createId()
    localStorage.setItem(STORAGE_KEY, id)
  }
  return id
}

export function setReaderId(id) {
  const normalized = String(id || '').trim().toLowerCase()
  if (!/^[0-9a-f]{16,128}$/.test(normalized)) {
    throw new Error('A reader id must be 16 to 128 hexadecimal characters')
  }
  localStorage.setItem(STORAGE_KEY, normalized)
  return normalized
}
