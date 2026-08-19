export function fullscreenElement() {
  return document.fullscreenElement ?? document.webkitFullscreenElement ?? null
}

export function fullscreenSupported() {
  const target = document.documentElement
  return Boolean(target.requestFullscreen ?? target.webkitRequestFullscreen)
}

export async function enterFullscreen() {
  const target = document.documentElement
  const request = target.requestFullscreen ?? target.webkitRequestFullscreen

  try {
    await request?.call(target, { navigationUI: 'hide' })
  } catch {
    return false
  }
  return true
}

export async function exitFullscreen() {
  if (!fullscreenElement()) {
    return
  }

  const request = document.exitFullscreen ?? document.webkitExitFullscreen

  try {
    await request?.call(document)
  } catch {
    return
  }
}
