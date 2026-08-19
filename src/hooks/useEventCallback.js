import { useCallback, useLayoutEffect, useRef } from 'react'

export function useEventCallback(handler) {
  const stored = useRef(handler)

  useLayoutEffect(() => {
    stored.current = handler
  })

  return useCallback((...args) => stored.current?.(...args), [])
}

export function useInitialValue(value) {
  const stored = useRef(value)
  return stored.current
}
