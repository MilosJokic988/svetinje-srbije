import { REGIONS } from '../data/monasteries'
import { formatKm } from '../utils/geo'
import { useT } from '../i18n'
import Photo from './Photo'

export default function PlaceCard({ place, visited, distance, onOpen }) {
  const t = useT()
  const region = REGIONS[place.region]
  return (
    <li>
      <button className="card" onClick={() => onOpen(place.id)} style={{ '--c': region.color }}>
        <Photo place={place} className="card__photo" />
        <span className="card__body">
          <span className="card__name">{t(place.name)}</span>
          <span className="card__meta">
            {t(place.century)}, {t(place.place)}
            {distance != null && <strong className="card__km">{t(formatKm(distance))}</strong>}
          </span>
          <span className="card__teaser">{t(place.teaser)}</span>
        </span>
        {visited && (
          <span className="card__lit" title={t('Posetio si ovu svetinju')}>
            <svg viewBox="0 0 12 18" aria-hidden="true">
              <path d="M6 1C8.5 5 9.5 7 9.5 9.5A3.5 3.5 0 0 1 2.5 9.5C2.5 7 3.5 5 6 1Z" />
            </svg>
            <span className="sr-only">{t('Posećeno')}</span>
          </span>
        )}
      </button>
    </li>
  )
}
