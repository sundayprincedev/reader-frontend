const PIN_KEY = 'mereader:pin'

let current = localStorage.getItem(PIN_KEY)
const listeners = new Set()

export function getPin() {
  return current
}

export function setPin(pin) {
  current = pin
  if (pin) {
    localStorage.setItem(PIN_KEY, pin)
  } else {
    localStorage.removeItem(PIN_KEY)
  }
  listeners.forEach((listener) => listener(pin))
}

export function onLockChange(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
