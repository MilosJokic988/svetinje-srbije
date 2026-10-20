import { useCallback, useEffect, useState } from 'react'

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

// Vrednost koja se pamti u telefonu (bez naloga)
export function useStored(key, fallback) {
  const [value, setValue] = useState(() => read(key, fallback))
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* privatni režim: ne pamtimo */
    }
  }, [key, value])
  return [value, setValue]
}

// Posećene svetinje: { id: datum }
export function useVisited() {
  const [visited, setVisited] = useStored('svetinje:posetio', {})
  const toggle = useCallback(
    (id) =>
      setVisited((v) => {
        const next = { ...v }
        if (next[id]) delete next[id]
        else next[id] = new Date().toISOString()
        return next
      }),
    [setVisited]
  )
  return { visited, toggle }
}
