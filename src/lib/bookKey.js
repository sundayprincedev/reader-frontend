const FINGERPRINT_BYTES = 512 * 1024

const EXTENSIONS = {
  pdf: 'pdf',
  epub: 'epub',
}

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function detectFormat(file) {
  const extension = file.name.split('.').pop()?.toLowerCase()
  return EXTENSIONS[extension] ?? null
}

export function titleFromFilename(name) {
  return name
    .replace(/\.(pdf|epub)$/i, '')
    .replace(/[_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function deriveBookKey(file) {
  const head = await file.slice(0, FINGERPRINT_BYTES).arrayBuffer()
  const identity = new TextEncoder().encode(`${titleFromFilename(file.name).toLowerCase()}:${file.size}:`)

  const payload = new Uint8Array(identity.length + head.byteLength)
  payload.set(identity, 0)
  payload.set(new Uint8Array(head), identity.length)

  return toHex(await crypto.subtle.digest('SHA-256', payload))
}
