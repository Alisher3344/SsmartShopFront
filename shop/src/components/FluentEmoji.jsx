// Lokal `public/emoji/` dan yuklanadi — CDN'ga bog'liqlik yo'q, sahifa refresh'da
// ikonlar darhol ko'rinadi va `app-shell` keshlash bilan offline ham ishlaydi.
const ASSETS = {
  fire: '/emoji/fire.png',
  card: '/emoji/card.png',
  cash: '/emoji/cash.png',
  phone: '/emoji/phone.png',
  pin: '/emoji/pin.png',
  pushpin: '/emoji/pushpin.png',
  clock: '/emoji/clock.png',
  package: '/emoji/package.png',
  user: '/emoji/user.png',
  check: '/emoji/check.png',
  cross: '/emoji/cross.png',
  warning: '/emoji/warning.png',
  search: '/emoji/search.png',
  shield: '/emoji/shield.png',
  speech: '/emoji/speech.png',
  numbers: '/emoji/numbers.png',
  star: '/emoji/star.png',
  'flag-uz': '/emoji/flag-uz.svg',
  'flag-ru': '/emoji/flag-ru.svg',
};

export default function FluentEmoji({ name, size = 16, className = '' }) {
  const src = ASSETS[name];
  if (!src) return null;
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`inline-block object-contain align-middle ${className}`}
      draggable={false}
      decoding="async"
      loading="eager"
    />
  );
}
