const PALETTE = [
  { light: '#8C5A3C', dark: '#C08A63' },
  { light: '#3F6B5A', dark: '#7FB39C' },
  { light: '#5B5A8C', dark: '#9694CC' },
  { light: '#8C3F52', dark: '#CC8092' },
  { light: '#4A6785', dark: '#89A9CC' },
  { light: '#7A6231', dark: '#C0A667' },
  { light: '#6B4577', dark: '#B189BD' },
  { light: '#3E6E77', dark: '#84B6BD' },
]

export function coverFor(key = '') {
  let hash = 0
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) >>> 0
  }
  return PALETTE[hash % PALETTE.length]
}

export function initialsFor(title = '') {
  const words = title.replace(/[^\p{L}\p{N}\s]/gu, ' ').trim().split(/\s+/)
  if (words.length === 0 || !words[0]) {
    return '?'
  }
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase()
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}
