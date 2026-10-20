import { useState } from 'react'
import { REGIONS } from '../data/monasteries'
import { formatKm, mapsLink } from '../utils/geo'
import { useT } from '../i18n'
import Photo from './Photo'
import { Candle, Cross } from './Ornament'

export default function PlaceDetail({ place, visited, distance, onToggleVisited, onBack }) {
  const t = useT()
  const region = REGIONS[place.region]
  const [shareMsg, setShareMsg] = useState('')
  const [rulesOpen, setRulesOpen] = useState(false)

  const story = t(place.story)
  const initial = story.charAt(0)
  const rest = story.slice(1)

  async function share() {
    const text = `${t(place.name)}: ${t(place.teaser)}`
    const url = `${window.location.origin}/#${place.id}`
    try {
      if (navigator.share) await navigator.share({ title: t(place.name), text, url })
      else {
        await navigator.clipboard.writeText(`${text} ${url}`)
        setShareMsg(t('Link je kopiran'))
        setTimeout(() => setShareMsg(''), 2200)
      }
    } catch {
      /* deljenje otkazano */
    }
  }

  return (
    <article className="detail" style={{ '--c': region.color }}>
      <div className="detail__media">
        <Photo place={place} className="detail__photo" credit eager />
        <button className="detail__back" onClick={onBack} aria-label={t('Nazad na listu')}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <header className="detail__head">
        <p className="detail__region">
          <Cross size={14} color="var(--gold)" />
          {t(region.label)}
          {place.unesco && <span className="badge">UNESCO</span>}
        </p>
        <h2 className="detail__title">{t(place.name)}</h2>
        <p className="detail__place">
          {t(place.place)}
          {distance != null && <>, {t(formatKm(distance))} {t('od tebe')}</>}
        </p>
      </header>

      <div className="detail__content">
        <p className="detail__teaser">{t(place.teaser)}</p>

        <p className="detail__story">
          <span className="initial" aria-hidden="true">
            {initial}
          </span>
          <span className="sr-only">{initial}</span>
          {rest}
        </p>

        <aside className="highlight">
          <h3>{t('Ne propusti')}</h3>
          <p>{t(place.highlight)}</p>
        </aside>

        <dl className="facts">
          <div>
            <dt>{t('Vreme nastanka')}</dt>
            <dd>{t(place.century)}</dd>
          </div>
          <div>
            <dt>{t(place.kind === 'crkva' ? 'Ktitor crkve' : 'Ktitor')}</dt>
            <dd>{t(place.founder)}</dd>
          </div>
          {place.saints && (
            <div>
              <dt>{t('Ovde počiva')}</dt>
              <dd>{t(place.saints.split(',')[0])}</dd>
            </div>
          )}
          <div>
            <dt>{t('Kako stići')}</dt>
            <dd>{t(place.howTo)}</dd>
          </div>
        </dl>

        <div className="rules">
          <button className="rules__toggle" onClick={() => setRulesOpen((o) => !o)} aria-expanded={rulesOpen}>
            {t('Kako se ponašati u manastiru')}
            <svg viewBox="0 0 24 24" aria-hidden="true" className={rulesOpen ? 'is-open' : ''}>
              <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          {rulesOpen && (
            <ul className="rules__list">
              <li>{t('Obuci se pristojno: pokrivena ramena i kolena. Žene obično nose suknju i maramu, a često ih možeš pozajmiti na ulazu.')}</li>
              <li>{t('Muškarci u crkvi skidaju kapu.')}</li>
              <li>{t('Govori tiho i isključi zvuk na telefonu.')}</li>
              <li>{t('Pre fotografisanja unutar crkve pitaj monahe, jer je u mnogim manastirima zabranjeno.')}</li>
              <li>{t('Poštuj vreme bogosluženja i ne ulazi u delove manastira označene kao konak.')}</li>
            </ul>
          )}
        </div>

        <div className="actions">
          <button
            className={`btn btn--candle ${visited ? 'is-on' : ''}`}
            onClick={() => onToggleVisited(place.id)}
            aria-pressed={visited}
          >
            <Candle lit={visited} size={30} />
            {visited ? t('Posetio si ovu svetinju') : t('Upali sveću, bio sam ovde')}
          </button>
          <div className="actions__row">
            <a className="btn btn--ghost" href={mapsLink(place)} target="_blank" rel="noreferrer">
              {t('Navigacija')}
            </a>
            <button className="btn btn--ghost" onClick={share}>
              {shareMsg || t('Podeli')}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
