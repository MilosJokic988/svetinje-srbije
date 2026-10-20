import { MONASTERIES } from '../data/monasteries'
import { toCyrillic } from './script'

const LAPIS = '#14213F'
const LAPIS_DEEP = '#0D1730'
const GOLD = '#C8A250'
const PARCH = '#EFE4CC'
const CINNABAR = '#B23A2E'

function candle(ctx, x, y, s, lit) {
  // telo
  ctx.fillStyle = lit ? '#EADBB4' : 'rgba(239,228,204,0.16)'
  ctx.fillRect(x - s * 0.17, y - s * 0.55, s * 0.34, s * 0.95)
  if (!lit) return
  // sjaj
  const g = ctx.createRadialGradient(x, y - s * 0.75, 0, x, y - s * 0.75, s * 0.6)
  g.addColorStop(0, 'rgba(255,200,90,0.55)')
  g.addColorStop(1, 'rgba(255,200,90,0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(x, y - s * 0.75, s * 0.6, 0, Math.PI * 2)
  ctx.fill()
  // plamen
  ctx.fillStyle = '#F6B544'
  ctx.beginPath()
  ctx.moveTo(x, y - s * 1.05)
  ctx.bezierCurveTo(x + s * 0.18, y - s * 0.8, x + s * 0.17, y - s * 0.62, x, y - s * 0.6)
  ctx.bezierCurveTo(x - s * 0.17, y - s * 0.62, x - s * 0.18, y - s * 0.8, x, y - s * 1.05)
  ctx.fill()
}

function pleter(ctx, y, w) {
  ctx.fillStyle = LAPIS_DEEP
  ctx.fillRect(0, y, w, 40)
  ctx.strokeStyle = GOLD
  ctx.lineWidth = 4
  for (const flip of [1, -1]) {
    ctx.beginPath()
    for (let x = 0; x <= w; x += 2) {
      const yy = y + 20 + flip * 12 * Math.cos((x / 64) * Math.PI * 2)
      x === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy)
    }
    ctx.stroke()
  }
  ctx.fillStyle = CINNABAR
  for (let x = 16; x <= w; x += 32) {
    ctx.beginPath()
    ctx.arc(x, y + 20, 3.5, 0, Math.PI * 2)
    ctx.fill()
  }
}

// Slika 1080×1920 za Instagram/TikTok story
export async function makeShareImage(visited, script = 'cyr') {
  const t = (s) => (script === 'cyr' ? toCyrillic(s) : s)
  try {
    await Promise.all([document.fonts.load('700 120px Cormorant'), document.fonts.load('500 40px "Alegreya Sans"')])
  } catch {
    /* koristimo sistemske fontove */
  }

  const W = 1080
  const H = 1920
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')

  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, LAPIS)
  bg.addColorStop(1, LAPIS_DEEP)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)
  pleter(ctx, 60, W)
  pleter(ctx, H - 100, W)

  const count = MONASTERIES.filter((p) => visited[p.id]).length

  ctx.textAlign = 'center'
  ctx.fillStyle = GOLD
  ctx.font = '700 230px Cormorant, Georgia, serif'
  ctx.fillText(String(count), W / 2, 420)
  ctx.fillStyle = PARCH
  ctx.font = '500 48px "Alegreya Sans", sans-serif'
  ctx.fillText(t(`od ${MONASTERIES.length} svetinja Srbije`), W / 2, 500)
  ctx.fillStyle = 'rgba(239,228,204,0.7)'
  ctx.fillText(t('sam posetio. A ti?'), W / 2, 564)

  // sveće u redovima, veličina se prilagođava broju svetinja
  const n = MONASTERIES.length
  const cols = n > 36 ? 8 : 6
  const rows = Math.ceil(n / cols)
  const cell = Math.min(150, 960 / cols)
  const rowH = Math.min(160, 880 / rows)
  const x0 = (W - cols * cell) / 2 + cell / 2
  const y0 = 760
  MONASTERIES.forEach((p, i) => {
    candle(ctx, x0 + (i % cols) * cell, y0 + Math.floor(i / cols) * rowH, rowH * 0.7, !!visited[p.id])
  })

  ctx.fillStyle = PARCH
  ctx.font = '700 72px Cormorant, Georgia, serif'
  ctx.fillText(t('Svetinje Srbije'), W / 2, H - 170)

  return new Promise((resolve) => c.toBlob(resolve, 'image/png'))
}
