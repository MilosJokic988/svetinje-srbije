import { useState } from 'react'
import { MONASTERIES, REGIONS } from '../data/monasteries'
import { svecaWord } from '../utils/geo'
import { useT } from '../i18n'
import { Candle } from './Ornament'
import { makeShareImage } from '../utils/shareImage'

// „Moje sveće": svaka posećena svetinja pali po jednu sveću
export default function Candles({ visited, onOpen, script }) {
  const t = useT()
  const total = MONASTERIES.length
  const count = MONASTERIES.filter((p) => visited[p.id]).length
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  async function shareCard() {
    setBusy(true)
    try {
      const blob = await makeShareImage(visited, script)
      const file = new File([blob], 'moje-svece.png', { type: 'image/png' })
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          text: t(`Upalio sam ${count} od ${total} sveća u svetinjama Srbije.`),
        })
      } else {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = file.name
        a.click()
        setTimeout(() => URL.revokeObjectURL(a.href), 2000)
        setMsg(t('Slika je sačuvana'))
        setTimeout(() => setMsg(''), 2500)
      }
    } catch {
      /* deljenje otkazano */
    } finally {
      setBusy(false)
    }
  }

  const groups = Object.entries(REGIONS).map(([key, r]) => ({
    key,
    ...r,
    items: MONASTERIES.filter((p) => p.region === key),
  }))

  return (
    <section className="candles">
      <h2>{t('Moje sveće')}</h2>
      <p className="candles__lede">
        {count === 0
          ? t('Za svaku svetinju koju posetiš pali se jedna sveća. Otvori svetinju i označi da si bio tamo.')
          : t(`Upalio si ${count} ${svecaWord(count)} od ${total}. `) +
            (count === total ? t('Obišao si sve svetinje. Bog te blagoslovio.') : t(`Još ${total - count} do kraja puta.`))}
      </p>

      {groups.map((g) => (
        <div key={g.key} className="candles__group">
          <h3>
            {t(g.label)}
            <span>
              {g.items.filter((p) => visited[p.id]).length}/{g.items.length}
            </span>
          </h3>
          <div className="candles__row">
            {g.items.map((p, i) => (
              <button
                key={p.id}
                className={`candles__item ${visited[p.id] ? 'is-lit' : ''}`}
                onClick={() => onOpen(p.id)}
                aria-label={`${t(p.name)}${visited[p.id] ? t(', posećeno') : ''}`}
                title={t(p.name)}
              >
                <Candle lit={!!visited[p.id]} size={46} delay={(i % 5) * 0.37} />
              </button>
            ))}
          </div>
        </div>
      ))}

      <button className="btn btn--candle is-on candles__share" onClick={shareCard} disabled={busy}>
        {busy ? t('Pravim sliku…') : msg || t('Podeli svoje sveće')}
      </button>
      <p className="candles__hint">{t('Napravićemo sliku za story, spremnu za Instagram i TikTok.')}</p>
    </section>
  )
}
