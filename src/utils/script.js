// Prebacivanje srpske latinice u ćirilicu.
// Sav tekst u aplikaciji je pisan latinicom, a ćirilica se pravi automatski.

const DIGRAPHS = { lj: 'љ', nj: 'њ', dž: 'џ', Lj: 'Љ', LJ: 'Љ', Nj: 'Њ', NJ: 'Њ', Dž: 'Џ', DŽ: 'Џ' }
const SINGLE = {
  a: 'а', b: 'б', c: 'ц', č: 'ч', ć: 'ћ', d: 'д', đ: 'ђ', e: 'е', f: 'ф', g: 'г', h: 'х',
  i: 'и', j: 'ј', k: 'к', l: 'л', m: 'м', n: 'н', o: 'о', p: 'п', r: 'р', s: 'с', š: 'ш',
  t: 'т', u: 'у', v: 'в', z: 'з', ž: 'ж',
}
// Reči koje ostaju latinicom
const KEEP = ['UNESCO', 'OpenStreetMap', 'Wikimedia', 'Commons', 'CC', 'BY', 'SA', 'Google']

export function toCyrillic(text) {
  if (!text) return text
  const parts = text.split(new RegExp(`(${KEEP.join('|')}|https?://\\S+)`, 'g'))
  return parts
    .map((part, i) => {
      if (i % 2 === 1) return part
      let out = ''
      for (let k = 0; k < part.length; k++) {
        const two = part.slice(k, k + 2)
        if (DIGRAPHS[two]) {
          out += DIGRAPHS[two]
          k++
          continue
        }
        const ch = part[k]
        const lower = ch.toLowerCase()
        const cyr = SINGLE[lower]
        if (!cyr) out += ch
        else out += ch === lower ? cyr : cyr.toUpperCase()
      }
      return out
    })
    .join('')
}
