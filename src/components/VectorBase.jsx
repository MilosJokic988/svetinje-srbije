import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'maplibre-gl'
import * as MaplibreLeaflet from '@maplibre/maplibre-gl-leaflet'
import 'maplibre-gl/dist/maplibre-gl.css'

// Podloga mape: OpenFreeMap (besplatno, bez ključa), sa selima, putevima i rekama.
// Svi nazivi se ispisuju na srpskom: ćirilicom ili latinicom, po izboru korisnika.
// Državne granice iz podloge su sakrivene, a granicu Srbije crta SerbiaOutline.

// Novije verzije dodatka izvoze maplibreGL, starije ga kače na L
const maplibreGL = MaplibreLeaflet.maplibreGL || MaplibreLeaflet.default?.maplibreGL || L.maplibreGL

const STYLE = 'https://tiles.openfreemap.org/styles/liberty'

// Redosled: prvo srpski naziv, pa rezervni ako srpskog nema (npr. za mesta van Srbije)
const LABEL = {
  cyr: ['coalesce', ['get', 'name:sr'], ['get', 'name:sr-Latn'], ['get', 'name']],
  lat: ['coalesce', ['get', 'name:sr-Latn'], ['get', 'name:latin'], ['get', 'name']],
}

function applySerbian(gl, script) {
  const style = gl.getStyle()
  if (!style?.layers) return
  for (const layer of style.layers) {
    const isBoundary = layer['source-layer'] === 'boundary' || layer.id.includes('boundary')
    if (isBoundary) {
      gl.setLayoutProperty(layer.id, 'visibility', 'none')
      continue
    }
    if (layer.type !== 'symbol') continue
    const field = layer.layout?.['text-field']
    // menjamo samo natpise sa imenima, a brojeve puteva ostavljamo
    if (field && JSON.stringify(field).includes('name')) {
      gl.setLayoutProperty(layer.id, 'text-field', LABEL[script])
    }
  }
}

export default function VectorBase({ script = 'lat' }) {
  const map = useMap()
  const glRef = useRef(null)
  const scriptRef = useRef(script)
  scriptRef.current = script

  useEffect(() => {
    const layer = maplibreGL({
      style: STYLE,
      attribution:
        '<a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> &copy; <a href="https://www.openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    }).addTo(map)

    const gl = layer.getMaplibreMap()
    glRef.current = gl
    const onLoad = () => applySerbian(gl, scriptRef.current)
    if (gl.isStyleLoaded()) onLoad()
    else gl.once('load', onLoad)

    return () => {
      glRef.current = null
      map.removeLayer(layer)
    }
  }, [map])

  // promena pisma (Ћ / L) bez ponovnog učitavanja mape
  useEffect(() => {
    const gl = glRef.current
    if (gl && gl.isStyleLoaded()) applySerbian(gl, script)
  }, [script])

  return null
}
