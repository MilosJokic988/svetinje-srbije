// Service worker: omogućava instalaciju na telefon.
// Stranicu uvek uzima sa interneta. Keš koristi samo kad internet ne radi,
// i nikad ne vraća prazan odgovor.
const CACHE = 'svetinje-v2'

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  // Sve sa drugih sajtova (mapa, slike, fontovi) ide direktno, bez service workera
  if (url.origin !== self.location.origin) return

  event.respondWith(
    (async () => {
      try {
        const res = await fetch(request)
        if (res.ok && res.type === 'basic') {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {})
        }
        return res
      } catch (err) {
        const hit =
          (await caches.match(request)) ||
          (request.mode === 'navigate' ? await caches.match('/') : undefined)
        if (hit) return hit
        // Nema interneta i nema sačuvane kopije: jasna poruka umesto greške
        if (request.mode === 'navigate') {
          return new Response(
            '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><body style="font-family:sans-serif;background:#0d1730;color:#efe4cc;display:grid;place-items:center;height:100vh;margin:0;text-align:center"><div><h1>Nema interneta</h1><p>Poveži se na internet i osveži stranicu.</p></div>',
            { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          )
        }
        return Response.error()
      }
    })()
  )
})
