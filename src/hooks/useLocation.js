import { useCallback, useState } from 'react'

// Traži lokaciju korisnika samo kad on to zatraži
export function useLocation() {
  const [position, setPosition] = useState(null)
  const [status, setStatus] = useState('idle') // idle | loading | ok | denied | unavailable

  const request = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('unavailable')
      return
    }
    setStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setStatus('ok')
      },
      (err) => setStatus(err.code === 1 ? 'denied' : 'unavailable'),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    )
  }, [])

  return { position, status, request }
}
