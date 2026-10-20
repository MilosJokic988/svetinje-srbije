import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, CircleMarker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { MONASTERIES, REGIONS } from '../data/monasteries'
import SerbiaOutline from './SerbiaOutline'

const BOUNDS = [
  [39.8, 17.6],
  [47.2, 24.2],
]

const isMobile = () => window.innerWidth < 900
const sheetPad = () => (isMobile() ? window.innerHeight * 0.45 + 16 : 40)

function pinIcon(color, { visited, selected }) {
  const w = selected ? 38 : 26
  const h = Math.round(w * 1.25)
  const cls = ['pin', visited && 'pin--visited', selected && 'pin--selected'].filter(Boolean).join(' ')
  return L.divIcon({
    className: 'pin-wrap',
    html: `<span class="${cls}" style="--c:${color}">
      <svg viewBox="0 0 40 50" aria-hidden="true">
        <path d="M4 48V20A16 16 0 0 1 36 20V48Z" class="pin-outer"/>
        <path d="M9 44V21A11 11 0 0 1 31 21V44Z" class="pin-inner"/>
        <path d="M18.5 22h3v5h4.5v3h-4.5v9h-3v-9H14v-3h4.5z" class="pin-cross"/>
      </svg>
    </span>`,
    iconSize: [w, h],
    iconAnchor: [w / 2, h],
  })
}

// ── Ispravka „sive mape": Leaflet mora da zna tačnu veličinu svog prostora.
// Na telefonu se veličina menja dok se stranica učitava (traka pregledača, donji panel,
// fontovi), pa mapa ponekad ostane prazna dok se stranica ne osveži. Ovde je stalno
// obaveštavamo o promeni veličine.
function KeepSized() {
  const map = useMap()
  useEffect(() => {
    const el = map.getContainer()
    const fix = () => map.invalidateSize({ pan: false })
    const ro = new ResizeObserver(fix)
    ro.observe(el)
    const timers = [100, 400, 1000].map((t) => setTimeout(fix, t))
    const onShow = () => !document.hidden && fix()
    document.addEventListener('visibilitychange', onShow)
    window.addEventListener('pageshow', onShow)
    window.addEventListener('orientationchange', fix)
    return () => {
      ro.disconnect()
      timers.forEach(clearTimeout)
      document.removeEventListener('visibilitychange', onShow)
      window.removeEventListener('pageshow', onShow)
      window.removeEventListener('orientationchange', fix)
    }
  }, [map])
  return null
}

function InitialFit() {
  const map = useMap()
  useEffect(() => {
    const fit = () => {
      map.invalidateSize({ pan: false })
      map.fitBounds(L.latLngBounds(MONASTERIES.map((p) => [p.lat, p.lng])), {
        paddingTopLeft: [24, isMobile() ? 80 : 40],
        paddingBottomRight: [24, sheetPad()],
        animate: false,
      })
    }
    map.whenReady(() => requestAnimationFrame(fit))
  }, [map])
  return null
}

function FlyTo({ target }) {
  const map = useMap()
  useEffect(() => {
    if (!target) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const zoom = Math.max(map.getZoom(), 10)
    const point = map.project([target.lat, target.lng], zoom)
    if (isMobile()) point.y += window.innerHeight * 0.3
    const center = map.unproject(point, zoom)
    if (reduce) map.setView(center, zoom)
    else map.flyTo(center, zoom, { duration: 1.1 })
  }, [target, map])
  return null
}

function FitUser({ position }) {
  const map = useMap()
  useEffect(() => {
    if (position) map.flyTo([position.lat, position.lng], 9, { duration: 1 })
  }, [position, map])
  return null
}

function MapTouch({ onTouch }) {
  useMapEvents({ dragstart: () => onTouch?.(), click: () => onTouch?.() })
  return null
}

export default function MapView({ places, visited, selectedId, onSelect, userPosition, onMapTouch }) {
  const selected = useMemo(() => places.find((p) => p.id === selectedId), [places, selectedId])

  return (
    <MapContainer
      center={[44, 20.9]}
      zoom={7}
      minZoom={6}
      zoomSnap={0.25}
      maxBounds={BOUNDS}
      maxBoundsViscosity={0.8}
      zoomControl={false}
      className="map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
        keepBuffer={4}
      />

      <SerbiaOutline />

      {places.map((p) => (
        <Marker
          key={p.id}
          position={[p.lat, p.lng]}
          icon={pinIcon(REGIONS[p.region].color, { visited: !!visited[p.id], selected: p.id === selectedId })}
          zIndexOffset={p.id === selectedId ? 1000 : 0}
          title={p.name}
          eventHandlers={{ click: () => onSelect(p.id) }}
        />
      ))}

      {userPosition && (
        <CircleMarker
          center={[userPosition.lat, userPosition.lng]}
          radius={8}
          pathOptions={{ color: '#fff', weight: 3, fillColor: '#1d3a6e', fillOpacity: 1 }}
        />
      )}

      <KeepSized />
      <InitialFit />
      <MapTouch onTouch={onMapTouch} />
      <FlyTo target={selected} />
      <FitUser position={userPosition} />
    </MapContainer>
  )
}
