import { useEffect, useState } from 'react'
import { getPhoto } from '../utils/photos'

// Vraća { status, photo } za datu svetinju. Status: loading | ok | none
export function usePhoto(place, enabled = true) {
  const [state, setState] = useState({ status: 'loading', photo: null })

  useEffect(() => {
    if (!place || !enabled) return
    let alive = true
    setState({ status: 'loading', photo: null })
    getPhoto(place).then((photo) => {
      if (alive) setState({ status: photo ? 'ok' : 'none', photo })
    })
    return () => {
      alive = false
    }
  }, [place, enabled])

  return state
}
