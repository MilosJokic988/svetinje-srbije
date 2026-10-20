// Ukrasi inspirisani srednjovekovnim srpskim pleterom, freskama i rukopisima.

// Traka sa pleterom: dve zlatne niti koje se prepliću
export function PleterBand({ height = 20, className = '' }) {
  return (
    <svg className={className} width="100%" height={height} aria-hidden="true">
      <defs>
        <pattern id="pleter" width="32" height="20" patternUnits="userSpaceOnUse">
          <rect width="32" height="20" fill="var(--lapis-deep)" />
          <path d="M0 4 C8 4 8 16 16 16 S24 4 32 4" fill="none" stroke="var(--gold)" strokeWidth="2.2" />
          <path d="M0 16 C8 16 8 4 16 4 S24 16 32 16" fill="none" stroke="var(--gold)" strokeWidth="2.2" />
          {/* prekid niti, da se vidi preplitanje */}
          <path d="M6.2 8.6 L9.8 11.4" stroke="var(--lapis-deep)" strokeWidth="3.4" />
          <path d="M6.6 9 C7.6 9.8 8.6 10.6 9.4 11" fill="none" stroke="var(--gold)" strokeWidth="2.2" />
          <circle cx="16" cy="10" r="1.6" fill="var(--cinnabar)" />
          <circle cx="0" cy="10" r="1.6" fill="var(--cinnabar)" />
          <circle cx="32" cy="10" r="1.6" fill="var(--cinnabar)" />
        </pattern>
      </defs>
      <rect width="100%" height={height} fill="url(#pleter)" />
      <rect width="100%" height="1" fill="var(--gold)" opacity="0.6" />
      <rect y={height - 1} width="100%" height="1" fill="var(--gold)" opacity="0.6" />
    </svg>
  )
}

// Krst sa proširenim krajevima
export function Cross({ size = 18, color = 'currentColor', className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M10 2h4v6h6v4h-6v10h-4V12H4V8h6z"
        fill={color}
      />
      <path d="M9 2h6M3 8v4M21 8v4M9 22h6" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

// Romanički luk (prozor raške škole) sa krstom: oblik markera i ikonice
export function Arch({ size = 40, fill = 'var(--gold)', inner = 'var(--lapis)', className = '' }) {
  return (
    <svg className={className} width={size} height={size * 1.25} viewBox="0 0 40 50" aria-hidden="true">
      <path d="M4 48V20A16 16 0 0 1 36 20V48Z" fill={fill} />
      <path d="M9 44V21A11 11 0 0 1 31 21V44Z" fill={inner} />
      <path d="M18.5 22h3v5h4.5v3h-4.5v9h-3v-9H14v-3h4.5z" fill={fill} />
    </svg>
  )
}

// Sveća: upaljena ako je svetinja posećena
export function Candle({ lit = false, size = 48, delay = 0 }) {
  return (
    <svg
      className={`candle ${lit ? 'is-lit' : ''}`}
      width={size * 0.6}
      height={size}
      viewBox="0 0 30 50"
      aria-hidden="true"
      style={{ '--delay': `${delay}s` }}
    >
      {lit && (
        <>
          <ellipse className="candle__glow" cx="15" cy="12" rx="13" ry="13" />
          <path
            className="candle__flame"
            d="M15 2 C19 8 20 11 20 13.5 A5 5 0 0 1 10 13.5 C10 11 11 8 15 2Z"
          />
          <path className="candle__core" d="M15 9 C16.6 11.5 17 12.5 17 14 A2 2 0 0 1 13 14 C13 12.5 13.4 11.5 15 9Z" />
        </>
      )}
      <rect x="14.3" y="16" width="1.4" height="4" fill={lit ? '#2a1b0e' : 'var(--muted)'} />
      <rect x="10" y="20" width="10" height="28" rx="1.5" className="candle__body" />
      <path d="M10 22 Q12 25 11 28" stroke="rgba(255,255,255,0.35)" strokeWidth="1" fill="none" />
    </svg>
  )
}
