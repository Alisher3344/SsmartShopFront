# 🛒 Smart.uz — Maishiy texnika do'koni

Senior darajadagi React + Vite + TailwindCSS bilan yaratilgan zamonaviy onlayn do'kon. Maishiy texnika va smart qurilmalar.

**Manzil:** Qarshi sh., I.Karimov ko'chasi 276-uy
**Telefon:** +998 94 808 00 55

## 🚀 Loyihani ishga tushirish

```bash
# 1. Kutubxonalarni o'rnatish
npm install

# 2. Development server (http://localhost:5173)
npm run dev

# 3. Production build
npm run build

# 4. Build natijasini ko'rish
npm run preview
```

## 📦 Tech Stack

- **React 19** + **Vite 8** + **TailwindCSS 3**
- **React Router DOM** — sahifalar
- **i18next** — UZ/RU tillari
- **Lucide React** — ikonlar
- **Context API + localStorage** — savatcha, sevimlilar

## 📂 Kategoriyalar (9 ta katta + 40+ kichik)

1. **🏠 Katta maishiy texnika** — Kir yuvish, Muzlatgich, Plitalar, Duxovka, Idish yuvish
2. **⚡ Kichik maishiy texnika** — Choynak, Blender, Mikser, Go'sht maydalagich, Toster
3. **❄️ Klimat texnikasi** — Konditsioner, Isitgich, Ventilyator, Havo tozalagich, Namlagich
4. **🧹 Tozalash texnikasi** — Changyutgich, Robot pylesos, Pol yuvish, Bug'li tozalagich
5. **📺 Maishiy elektronika** — Televizor, Audio, TV pristavka, Uy kinoteatri
6. **👕 Kiyim parvarishi** — Utyug, Parogenerator, Bug'li shkaf, Tikuv mashina
7. **🍳 Oshxona texnikasi** — Multivarka, Mikropech, Kofe mashina, Sharbat chiqargich
8. **💡 Smart texnika** — Smart qurilmalar, Wi-Fi rozetka, Aqlli lampa, Smart kamera
9. **🔌 Aksessuarlar** — Zapchastlar, Filtrlar, Kabellar, Adapterlar

## 🗂 Loyiha strukturasi

```
ssmart/
├── public/
│   ├── manifest.json       # PWA
│   ├── sw.js              # Service Worker
│   └── icon-192/512.png
├── src/
│   ├── components/
│   │   ├── Header.jsx     # Mega menu, qidiruv, tillar
│   │   ├── Footer.jsx     # Manzil, tel, ijtimoiy tarmoqlar
│   │   └── ProductCard.jsx
│   ├── pages/
│   │   ├── HomePage.jsx       # Hero, 9 kategoriya, hitlar
│   │   ├── CatalogPage.jsx    # Sidebar filter (kategoriya+subkategoriya)
│   │   ├── ProductPage.jsx    # Mahsulot batafsil
│   │   ├── CartPage.jsx       # Savatcha + buyurtma
│   │   ├── FavoritesPage.jsx  # Sevimlilar
│   │   └── ProfilePage.jsx    # OTP login
│   ├── context/
│   │   └── ShopContext.jsx
│   ├── data/
│   │   └── products.js        # Kategoriyalar + 39 ta mahsulot
│   ├── i18n/
│   │   ├── index.js
│   │   └── locales/
│   │       ├── uz.json
│   │       └── ru.json
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
└── package.json
```

## 🌐 Sahifalar

| URL | Sahifa |
|-----|--------|
| `/` | Bosh sahifa — Hero, 9 ta kategoriya, hitlar |
| `/catalog` | Katalog — Sidebar filter |
| `/catalog?category=XXX` | Kategoriya bo'yicha |
| `/catalog?subcategory=XXX` | Subkategoriya bo'yicha |
| `/product/:id` | Mahsulot kartasi |
| `/cart` | Savatcha + checkout |
| `/favorites` | Sevimlilar |
| `/profile` | OTP login + kabinet |

## 📱 Mobil dasturni o'rnatish (PWA)

1. Saytni telefon brauzerida ochish
2. **Android Chrome**: menyu → "Add to Home Screen"
3. **iOS Safari**: Share → "Add to Home Screen"

## 🎨 Asosiy xususiyatlar

- ✅ 2 til (UZ/RU) — to'liq tarjima
- ✅ Mobil mos (responsive)
- ✅ Mega menu — barcha kategoriyalar
- ✅ Kategoriya + subkategoriya filter
- ✅ Sidebar tree navigation (desktop)
- ✅ Pills navigation (mobile)
- ✅ URL'da filter saqlanadi (share qilish mumkin)
- ✅ Savatcha + sevimlilar (localStorage)
- ✅ OTP login (telefon raqam)
- ✅ Yetkazib berish: o'zi olish / kuryer
- ✅ To'lov: Click, Payme, Uzcard, HUMO, naqd
- ✅ PWA — telefonga o'rnatish mumkin

## 🔌 Backend bilan ulash

Hozir mock data ishlatilmoqda. Real API uchun `src/api/client.js` yarating:

```js
const API = import.meta.env.VITE_API_URL;

export const fetchCategories = () => fetch(`${API}/categories`).then(r => r.json());
export const fetchProducts = (filters) => {
  const params = new URLSearchParams(filters);
  return fetch(`${API}/products?${params}`).then(r => r.json());
};
```

`.env` fayl:
```
VITE_API_URL=https://api.ssmart.uz/api
```

## 🚢 Deploy

### Vercel (eng oson)
```bash
npm i -g vercel
vercel
```

### Netlify
```bash
npm run build
# dist/ papkasini netlify.com saytga yuklang
```

### O'z hostingingiz (Nginx)
```bash
npm run build
# dist/ tarkibini server'ga yuklang
```

`nginx.conf`:
```nginx
location / {
  try_files $uri /index.html;
}
```

## 📞 Kontaktlar

- 📍 Qarshi sh., I.Karimov ko'chasi 276-uy
- 📞 +998 94 808 00 55
- 🌐 ssmart.uz

## 📄 Litsenziya

MIT
