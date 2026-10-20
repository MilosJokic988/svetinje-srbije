import { useEffect, useState } from 'react'
import { Polygon } from 'react-leaflet'
import { merge } from 'topojson-client'

// Granica Srbije zajedno sa Kosovom i Metohijom, kao jedna celina.
// Sve van Srbije je blago zatamnjeno, pa se zemlja jasno izdvaja na mapi.

const WORLD = [
  [85, -180],
  [85, 180],
  [-85, 180],
  [-85, -180],
]

const toLatLng = (ring) => ring.map(([lng, lat]) => [lat, lng])

export default function SerbiaOutline() {
  const [rings, setRings] = useState(null)

  useEffect(() => {
    let alive = true
    // Podaci se učitavaju odvojeno, da ne usporavaju prvo otvaranje aplikacije
    import('world-atlas/countries-50m.json').then((mod) => {
      const topo = mod.default || mod
      const parts = topo.objects.countries.geometries.filter((g) =>
        ['Serbia', 'Kosovo'].includes(g.properties?.name)
      )
      if (!parts.length || !alive) return
      const shape = merge(topo, parts)
      // Uzimamo spoljne ivice svih delova (MultiPolygon)
      setRings(shape.coordinates.map((poly) => toLatLng(poly[0])))
    })
    return () => {
      alive = false
    }
  }, [])

  if (!rings) return null

  return (
    <>
      <Polygon
        positions={[WORLD, ...rings]}
        interactive={false}
        pathOptions={{ stroke: false, fillColor: '#E8DCC0', fillOpacity: 0.6 }}
      />
      <Polygon
        positions={rings}
        interactive={false}
        pathOptions={{ color: '#8C6A22', weight: 2.5, opacity: 0.95, fill: false, lineJoin: 'round' }}
      />
    </>
  )
}
