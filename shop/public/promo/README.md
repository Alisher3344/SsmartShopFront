# Promo Karusel rasmlari

Bu papkaga 8 ta PNG rasmni joylang:
- `promo-1.png`
- `promo-2.png`
- `promo-3.png`
- `promo-4.png`
- `promo-5.png`
- `promo-6.png`
- `promo-7.png`
- `promo-8.png`

## Tavsiyalar

- **Format**: PNG (orqa fon shaffof tavsiya etiladi)
- **O'lcham**: 500x500 px yoki kattaroq, kvadrat
- **Sifat**: yaxshi sifatli, mahsulot aniq ko'rinadigan

## Mahsulot nomlari va chegirmalarni o'zgartirish

`src/components/PromoCarousel.jsx` fayldagi `promoItems` massivini tahrirlang:

```javascript
const promoItems = [
  { 
    id: 1, 
    image: '/promo/promo-1.png', 
    title: { uz: 'Sizning mahsulot nomi', ru: 'Название товара' }, 
    discount: '−25%',  // chegirma foizi
    link: '/catalog?subcategory=washing'  // bosilganda qayerga olib boradi
  },
  // ... va h.k. 8 tagacha
];
```

## Rasm joylash misoli

1. Rasmni tayyorlang (mahsulot rasmi, shaffof PNG bo'lsa yaxshi)
2. Nomini `promo-1.png` (yoki 2, 3...) qilib qo'ying
3. `public/promo/` papkaga ko'chiring
4. Sayt avtomatik yangi rasmni ko'rsatadi
