import { toCyrillic } from './script'

// Fotografije se učitavaju sa Wikipedije i Wikimedia Commons-a.
// Te slike su pod slobodnim licencama i smeju da se koriste uz navođenje autora,
// pa uz svaku sliku prikazujemo autora i licencu.
//
// Ako za neku svetinju dobiješ pogrešnu sliku, u src/data/monasteries.js dodaj polje
// photo: 'Ime_fajla.jpg' sa tačnim imenom fajla sa commons.wikimedia.org.

const cache = new Map()
const OK = /\.(jpe?g|webp)$/i

async function api(host, params) {
  const url = `https://${host}/w/api.php?` + new URLSearchParams({ format: 'json', origin: '*', ...params })
  const res = await fetch(url)
  if (!res.ok) throw new Error(res.status)
  return res.json()
}

async function searchWiki(host, query) {
  const data = await api(host, {
    action: 'query',
    generator: 'search',
    gsrsearch: query,
    gsrlimit: '1',
    prop: 'pageimages',
    piprop: 'original|thumbnail|name',
    pithumbsize: '1280',
    redirects: '1',
  })
  const page = Object.values(data?.query?.pages || {})[0]
  if (!page?.pageimage || !OK.test(page.pageimage)) return null
  return {
    file: page.pageimage,
    src: page.thumbnail?.source || page.original?.source,
    page: `https://${host}/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`,
  }
}

async function fromCommons(file) {
  const data = await api('commons.wikimedia.org', {
    action: 'query',
    titles: `File:${file}`,
    prop: 'imageinfo',
    iiprop: 'url|extmetadata',
    iiurlwidth: '1280',
  })
  const info = Object.values(data?.query?.pages || {})[0]?.imageinfo?.[0]
  if (!info) return null
  const meta = info.extmetadata || {}
  const strip = (html) => (html || '').replace(/<[^>]+>/g, '').trim()
  return {
    src: info.thumburl || info.url,
    author: strip(meta.Artist?.value).slice(0, 80) || 'nepoznat autor',
    license: strip(meta.LicenseShortName?.value) || 'slobodna licenca',
    source: info.descriptionurl,
  }
}

export function getPhoto(place) {
  if (cache.has(place.id)) return cache.get(place.id)
  const job = (async () => {
    try {
      let file = place.photo
      let found = null
      if (!file) {
        found =
          (await searchWiki('sr.wikipedia.org', toCyrillic(place.name)).catch(() => null)) ||
          (await searchWiki('en.wikipedia.org', `${place.query} Serbia`).catch(() => null))
        file = found?.file
      }
      if (!file) return null
      const credit = await fromCommons(file).catch(() => null)
      if (credit) return credit
      return found ? { src: found.src, author: 'Wikipedia', license: '', source: found.page } : null
    } catch {
      return null
    }
  })()
  cache.set(place.id, job)
  return job
}
