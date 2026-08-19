const MOVE_TOLERANCE = 12
const TAP_DURATION = 350
const TAP_LOCK = 400

export function attachTapHandler(target, onTap) {
  if (!target) {
    return () => undefined
  }

  let origin = null
  let lastTap = 0

  const pointFrom = (event) => event.changedTouches?.[0] ?? event.touches?.[0] ?? event

  const start = (event) => {
    if (event.isPrimary === false) {
      return
    }
    const point = pointFrom(event)
    origin = { x: point.clientX, y: point.clientY, time: Date.now() }
  }

  const end = (event) => {
    if (!origin || event.isPrimary === false) {
      return
    }

    const point = pointFrom(event)
    const moved = Math.hypot(point.clientX - origin.x, point.clientY - origin.y)
    const elapsed = Date.now() - origin.time
    origin = null

    if (moved > MOVE_TOLERANCE || elapsed > TAP_DURATION) {
      return
    }

    const now = Date.now()
    if (now - lastTap < TAP_LOCK) {
      return
    }
    lastTap = now
    onTap(event)
  }

  const cancel = () => {
    origin = null
  }

  const opts = { passive: true }
  target.addEventListener('pointerdown', start, opts)
  target.addEventListener('pointerup', end, opts)
  target.addEventListener('pointercancel', cancel, opts)
  target.addEventListener('touchstart', start, opts)
  target.addEventListener('touchend', end, opts)
  target.addEventListener('touchcancel', cancel, opts)

  return () => {
    target.removeEventListener('pointerdown', start)
    target.removeEventListener('pointerup', end)
    target.removeEventListener('pointercancel', cancel)
    target.removeEventListener('touchstart', start)
    target.removeEventListener('touchend', end)
    target.removeEventListener('touchcancel', cancel)
  }
}
