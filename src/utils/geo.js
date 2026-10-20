export function distanceKm(a, b) {
  const R = 6371
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function formatKm(km) {
  if (km < 1) return 'manje od 1 km'
  if (km < 10) return `${km.toFixed(1).replace('.', ',')} km`
  return `${Math.round(km)} km`
}

export function mapsLink(place) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.query || place.name)}`
}

// 1 svetinja, 2 svetinje, 5 svetinja
export function svetinjaWord(n) {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return 'svetinja'
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'svetinje'
  return 'svetinja'
}

// 1 sveća, 2 sveće, 5 sveća
export function svecaWord(n) {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'sveće'
  return 'sveća'
}
