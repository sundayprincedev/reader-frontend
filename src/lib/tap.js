const MOVE_TOLERANCE = 12
const TAP_DURATION = 350

export function attachTapHandler(target, onTap) {
  if (!target) {
    return () => undefined
  }

  let origin = null

  const start = (event) => {
    const point = event.touches?.[0] ?? event
    origin = { x: point.clientX, y: point.clientY, time: Date.now() }
  }

  const end = (event) => {
    if (!origin) {
      return
    }

    const point = event.changedTouches?.[0] ?? event
    const moved = Math.hypot(point.clientX - origin.x, point.clientY - origin.y)
    const elapsed = Date.now() - origin.time
    origin = null

    if (moved <= MOVE_TOLERANCE && elapsed <= TAP_DURATION) {
      onTap(event)
    }
  }

  target.addEventListener('pointerdown', start, { passive: true })
  target.addEventListener('pointerup', end, { passive: true })
  target.addEventListener('touchstart', start, { passive: true })
  target.addEventListener('touchend', end, { passive: true })

  return () => {
    target.removeEventListener('pointerdown', start)
    target.removeEventListener('pointerup', end)
    target.removeEventListener('touchstart', start)
    target.removeEventListener('touchend', end)
  }
}
