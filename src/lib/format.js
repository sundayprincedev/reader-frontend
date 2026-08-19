export function formatDuration(seconds) {
  if (!seconds || seconds < 60) {
    return `${Math.max(0, Math.round(seconds || 0))}s`
  }

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.round((seconds % 3600) / 60)

  if (hours === 0) {
    return `${minutes}m`
  }
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`
}

export function formatRelative(value) {
  if (!value) {
    return 'never'
  }

  const elapsed = Date.now() - new Date(value).getTime()
  if (Number.isNaN(elapsed) || elapsed < 0) {
    return 'just now'
  }

  const units = [
    ['day', 86400000],
    ['hour', 3600000],
    ['minute', 60000],
  ]

  for (const [label, ms] of units) {
    const amount = Math.floor(elapsed / ms)
    if (amount >= 1) {
      return `${amount} ${label}${amount > 1 ? 's' : ''} ago`
    }
  }
  return 'just now'
}

export function formatSize(bytes) {
  if (!bytes) {
    return '—'
  }
  const megabytes = bytes / (1024 * 1024)
  return megabytes < 1 ? `${Math.round(bytes / 1024)} KB` : `${megabytes.toFixed(1)} MB`
}

export function formatPercent(value) {
  return `${Math.min(100, Math.max(0, value || 0)).toFixed(0)}%`
}
