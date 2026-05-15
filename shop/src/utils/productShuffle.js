// Mahsulotlarni subkategoriya BLOKLARI bo'yicha aralashtirish.
// Maqsad: foydalanuvchi har xil bo'limlarni ko'rsin, lekin
// bitta subkategoriya mahsulotlari birga ko'rinsin.
//
// Misol: "Oddiy tugmali telefonlar" (10 ta) birinchi blok,
// keyin "Aqilli kamera" (5 ta) ikkinchi blok, ... Subkategoriya
// blokining ketma-ketligi tasodifiy. Blok ichidagi mahsulotlar
// asl tartibda (yangilari oldida) qoladi.

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function shuffleBySubcategory(products) {
  if (!Array.isArray(products) || products.length <= 1) return products || [];

  // Subkategoriya bo'yicha guruhlash. Subkategoriya yo'q mahsulotlar uchun
  // kategoriya kalitidan foydalanamiz.
  const groups = new Map();
  for (const p of products) {
    const key = p.subcategory || p.category || '__other__';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(p);
  }

  // Subkategoriya bloklarining tartibini aralashtiramiz.
  // Blok ichidagi mahsulotlar asl tartibda qoladi.
  const blocks = shuffleArray(Array.from(groups.values()));
  return blocks.flat();
}
