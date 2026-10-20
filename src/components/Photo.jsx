import { useEffect, useRef, useState } from 'react'
import { usePhoto } from '../hooks/usePhoto'
import { useT } from '../i18n'
import { Arch } from './Ornament'

// Učitava sliku tek kad se pojavi na ekranu, da lista ne bi bila spora
function useInView() {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    if (!('IntersectionObserver' in window)) return setSeen(true)
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && (setSeen(true), io.disconnect()),
      { rootMargin: '200px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [seen])
  return [ref, seen]
}

export default function Photo({ place, className = '', credit = false, eager = false }) {
  const t = useT()
  const [ref, seen] = useInView()
  const { status, photo } = usePhoto(place, eager || seen)
  const [loaded, setLoaded] = useState(false)

  return (
    <figure ref={ref} className={`photo ${className} ${loaded ? 'is-loaded' : ''}`}>
      {status === 'ok' && (
        <img
          src={photo.src}
          alt={t(place.name)}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(false)}
        />
      )}
      {(status !== 'ok' || !loaded) && (
        <div className={`photo__placeholder ${status === 'loading' ? 'is-loading' : ''}`}>
          <Arch size={28} fill="rgba(200,162,80,0.55)" inner="transparent" />
        </div>
      )}
      {credit && status === 'ok' && (
        <figcaption className="photo__credit">
          <a href={photo.source} target="_blank" rel="noreferrer">
            {t('Foto')}: {photo.author}
            {photo.license && `, ${photo.license}`}
          </a>
        </figcaption>
      )}
    </figure>
  )
}
