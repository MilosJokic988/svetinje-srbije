import { useEffect, useMemo, useRef, useState } from 'react'
import { MONASTERIES, REGIONS } from './data/monasteries'
import { distanceKm, svetinjaWord } from './utils/geo'
import { toCyrillic } from './utils/script'
import { useStored, useVisited } from './hooks/useStore'
import { useLocation } from './hooks/useLocation'
import { ScriptContext } from './i18n'
import MapView from './components/MapView'
import PlaceCard from './components/PlaceCard'
import PlaceDetail from './components/PlaceDetail'
import Candles from './components/Candles'
import { Cross, PleterBand } from './components/Ornament'

const TABS = [
  { id: 'lista', label: 'Svetinje' },
  { id: 'blizu', label: 'Blizu mene' },
  { id: 'svece', label: 'Moje sveće' },
]

// Pretraga radi i ćirilicom i latinicom, sa kvačicama i bez
function normalize(s) {
  const lat = s
    .toLowerCase()
    .replace(/[а-яђјљњћџ]/g, (ch) => CYR_TO_LAT[ch] || ch)
  return lat.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'dj')
}
const CYR_TO_LAT = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', ђ: 'đ', е: 'e', ж: 'ž', з: 'z', и: 'i', ј: 'j', к: 'k',
  л: 'l', љ: 'lj', м: 'm', н: 'n', њ: 'nj', о: 'o', п: 'p', р: 'r', с: 's', т: 't', ћ: 'ć', у: 'u',
  ф: 'f', х: 'h', ц: 'c', ч: 'č', џ: 'dž', ш: 'š',
}

const isMobile = () => window.innerWidth < 900

export default function App() {
  const [script, setScript] = useStored('svetinje:pismo', 'cyr')
  const t = (s) => (script === 'cyr' ? toCyrillic(s) : s)
  const { visited, toggle } = useVisited()
  const { position, status, request } = useLocation()
  const [tab, setTab] = useState('lista')
  const [region, setRegion] = useState('sve')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(() => {
    const hash = window.location.hash.slice(1)
    return MONASTERIES.some((p) => p.id === hash) ? hash : null
  })
  const [sheet, setSheet] = useState(selectedId ? 'full' : 'mid')
  const scrollRef = useRef(null)
  const panelRef = useRef(null)
  const drag = useRef(null)

  useEffect(() => {
    document.documentElement.lang = script === 'cyr' ? 'sr-Cyrl' : 'sr-Latn'
    document.title = t('Svetinje Srbije')
  }, [script])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [selectedId, tab])

  useEffect(() => {
    window.history.replaceState(null, '', selectedId ? `#${selectedId}` : window.location.pathname)
  }, [selectedId])

  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    return MONASTERIES.filter(
      (p) =>
        (region === 'sve' || p.region === region) &&
        (!q || normalize(`${p.name} ${p.place} ${p.founder} ${p.saints || ''}`).includes(q))
    )
  }, [region, query])

  const nearby = useMemo(() => {
    if (!position) return null
    return MONASTERIES.map((p) => ({ place: p, km: distanceKm(position, p) })).sort((a, b) => a.km - b.km)
  }, [position])

  const selected = MONASTERIES.find((p) => p.id === selectedId)
  const visitedCount = MONASTERIES.filter((p) => visited[p.id]).length
  const dist = (p) => (position ? distanceKm(position, p) : null)

  function open(id) {
    setSelectedId(id)
    setSheet('full')
  }

  function goTab(id) {
    setTab(id)
    setSelectedId(null)
    setSheet((s) => (s === 'min' ? 'mid' : s))
    if (id === 'blizu' && status === 'idle') request()
  }

  // ── Donji panel na telefonu: povlačenje prstom između tri položaja
  const snaps = () => {
    const p = panelRef.current
    const min =
      p.querySelector('.brand').offsetHeight +
      p.querySelector('.panel__band').getBoundingClientRect().height +
      p.querySelector('.tabs').offsetHeight
    return { min, mid: window.innerHeight * 0.45, full: window.innerHeight * 0.88 }
  }
  function onDragStart(e) {
    if (!isMobile() || e.target.closest('.script-toggle, .brand__count')) return
    drag.current = { y: e.clientY, h: panelRef.current.offsetHeight, moved: false, id: e.pointerId }
  }
  function onDragMove(e) {
    const d = drag.current
    if (!d) return
    const dy = e.clientY - d.y
    if (!d.moved && Math.abs(dy) < 6) return
    if (!d.moved) {
      d.moved = true
      e.currentTarget.setPointerCapture(d.id)
      panelRef.current.style.transition = 'none'
    }
    const { min, full } = snaps()
    panelRef.current.style.height = `${Math.min(full, Math.max(min, d.h - dy))}px`
  }
  function onDragEnd(e) {
    const d = drag.current
    drag.current = null
    if (!d || !d.moved) return
    const p = panelRef.current
    const h = p.offsetHeight
    const s = snaps()
    const order = ['min', 'mid', 'full']
    const nearest = (val) => order.reduce((a, b) => (Math.abs(s[b] - val) < Math.abs(s[a] - val) ? b : a))
    const dy = e.clientY - d.y
    let next = nearest(h)
    // brz potez pomera panel bar za jedan položaj u smeru povlačenja
    if (Math.abs(dy) > 50 && next === nearest(d.h)) {
      const i = order.indexOf(next) + (dy < 0 ? 1 : -1)
      next = order[Math.max(0, Math.min(2, i))]
    }
    p.style.transition = ''
    p.style.height = ''
    setSheet(next)
  }
  const cycleSheet = () => setSheet((s) => (s === 'min' ? 'mid' : s === 'mid' ? 'full' : 'min'))

  return (
    <ScriptContext.Provider value={script}>
      <div className={`app sheet-${sheet}`}>
        <aside className="panel" aria-label={t('Lista svetinja')} ref={panelRef}>
          <header
            className="brand"
            onPointerDown={onDragStart}
            onPointerMove={onDragMove}
            onPointerUp={onDragEnd}
            onPointerCancel={onDragEnd}
          >
            <button
              className="brand__handle"
              onClick={cycleSheet}
              aria-label={t(sheet === 'full' ? 'Spusti panel' : 'Podigni panel')}
            />
            <div className="brand__row">
              <h1 className="brand__name">
                <Cross size={20} color="var(--gold)" className="brand__cross" />
                <span>{t('Svetinje')}</span> <span>{t('Srbije')}</span>
              </h1>
              <div className="brand__tools">
                <div className="script-toggle" role="group" aria-label="Pismo">
                  <button className={script === 'cyr' ? 'is-on' : ''} onClick={() => setScript('cyr')} aria-pressed={script === 'cyr'}>
                    Ћ
                  </button>
                  <button className={script === 'lat' ? 'is-on' : ''} onClick={() => setScript('lat')} aria-pressed={script === 'lat'}>
                    L
                  </button>
                </div>
                <button className="brand__count" onClick={() => goTab('svece')} aria-label={t('Moje sveće')}>
                  <svg viewBox="0 0 12 18" aria-hidden="true">
                    <path d="M6 1C8.5 5 9.5 7 9.5 9.5A3.5 3.5 0 0 1 2.5 9.5C2.5 7 3.5 5 6 1Z" />
                  </svg>
                  <span>
                    <b>{visitedCount}</b>/{MONASTERIES.length}
                  </span>
                </button>
              </div>
            </div>
            <p className="brand__lede">
              {t(`${MONASTERIES.length} manastira i crkava, od Nemanjićkih zadužbina do fruškogorskih manastira.`)}
            </p>
          </header>
          <PleterBand className="panel__band" />

          <nav className="tabs" aria-label={t('Pregled')}>
            {TABS.map((tb) => (
              <button
                key={tb.id}
                className={`tabs__btn ${tab === tb.id && !selected ? 'is-active' : ''}`}
                onClick={() => goTab(tb.id)}
              >
                {t(tb.label)}
              </button>
            ))}
          </nav>

          <div className="panel__scroll" ref={scrollRef}>
            {selected ? (
              <PlaceDetail
                key={selected.id}
                place={selected}
                visited={!!visited[selected.id]}
                distance={dist(selected)}
                onToggleVisited={toggle}
                onBack={() => setSelectedId(null)}
              />
            ) : tab === 'lista' ? (
              <>
                <div className="filters">
                  <label className="search">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
                      <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span className="sr-only">{t('Pretraži svetinje')}</span>
                    <input
                      type="search"
                      placeholder={t('Manastir, mesto ili svetitelj')}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </label>
                  <div className="chips" role="group" aria-label={t('Krajevi')}>
                    <button className={`chip ${region === 'sve' ? 'is-active' : ''}`} onClick={() => setRegion('sve')}>
                      {t('Sve')}
                    </button>
                    {Object.entries(REGIONS).map(([key, r]) => (
                      <button
                        key={key}
                        className={`chip ${region === key ? 'is-active' : ''}`}
                        style={{ '--c': r.color }}
                        onClick={() => setRegion(key)}
                      >
                        <i className="chip__dot" />
                        {t(r.label)}
                      </button>
                    ))}
                  </div>
                </div>

                {filtered.length ? (
                  <ul className="list">
                    {filtered.map((p) => (
                      <PlaceCard key={p.id} place={p} visited={!!visited[p.id]} distance={dist(p)} onOpen={open} />
                    ))}
                  </ul>
                ) : (
                  <div className="empty">
                    <p>{t(`Nijedna svetinja ne odgovara pretrazi „${query}".`)}</p>
                    <button className="btn btn--ghost" onClick={() => { setQuery(''); setRegion('sve') }}>
                      {t('Prikaži sve svetinje')}
                    </button>
                  </div>
                )}
              </>
            ) : tab === 'blizu' ? (
              <NearMe t={t} status={status} request={request} items={nearby} visited={visited} onOpen={open} />
            ) : (
              <Candles visited={visited} onOpen={open} script={script} />
            )}
          </div>
        </aside>

        <main className="stage">
          <MapView
            places={tab === 'lista' ? filtered : MONASTERIES}
            visited={visited}
            selectedId={selectedId}
            onSelect={open}
            userPosition={position}
            onMapTouch={() => isMobile() && setSheet('min')}
          />
        </main>
      </div>
    </ScriptContext.Provider>
  )
}

function NearMe({ t, status, request, items, visited, onOpen }) {
  if (status === 'loading' || status === 'idle') {
    return (
      <div className="empty">
        <p>{t('Tražim tvoju lokaciju…')}</p>
      </div>
    )
  }
  if (status === 'denied' || status === 'unavailable') {
    return (
      <div className="empty">
        <p>
          {t(
            status === 'denied'
              ? 'Pristup lokaciji je isključen. Uključi ga u podešavanjima pregledača za ovaj sajt, pa pokušaj ponovo.'
              : 'Lokacija trenutno nije dostupna. Proveri da li je GPS uključen.'
          )}
        </p>
        <button className="btn btn--ghost" onClick={request}>
          {t('Pokušaj ponovo')}
        </button>
      </div>
    )
  }
  const close = items.filter((i) => i.km <= 100)
  const shown = close.length >= 3 ? close : items.slice(0, 6)
  return (
    <>
      <p className="near__note">
        {close.length >= 3
          ? t(`${close.length} ${svetinjaWord(close.length)} na manje od 100 km od tebe.`)
          : t('U krugu od 100 km nema mnogo svetinja, evo najbližih.')}
      </p>
      <ul className="list">
        {shown.map(({ place, km }) => (
          <PlaceCard key={place.id} place={place} visited={!!visited[place.id]} distance={km} onOpen={onOpen} />
        ))}
      </ul>
    </>
  )
}
