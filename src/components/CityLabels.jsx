import { useState } from 'react'
import { Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { CITIES } from '../data/cities'
import { useT } from '../i18n'

// Imena gradova na srpskom, iscrtana preko podloge mape bez natpisa
export default function CityLabels() {
  const t = useT()
  const [zoom, setZoom] = useState(7)
  const map = useMapEvents({ zoomend: () => setZoom(map.getZoom()) })

  const minRank = zoom < 7 ? 1 : zoom < 8 ? 2 : 3

  return CITIES.filter((c) => c.rank <= minRank).map((c) => (
    <Marker
      key={c.name}
      position={[c.lat, c.lng]}
      interactive={false}
      keyboard={false}
      zIndexOffset={-1000}
      icon={L.divIcon({
        className: `city city--${c.rank}`,
        html: `<i></i><span>${t(c.name)}</span>`,
        iconSize: [0, 0],
      })}
    />
  ))
}
