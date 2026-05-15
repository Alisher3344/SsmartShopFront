// Mahsulotlarni subkategoriya bo'yicha round-robin tarzda aralashtirish.
// Maqsad: katalog/asosiy sahifada qo'shni 4-5 ta karta bir xil
// subkategoriyadan bo'lib qolmasligi, har xil bo'limlardan
// almashinib chiqishi.

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

  // Subkategoriya kalit; subkategoriya yo'q bo'lsa kategoriya bo'yicha guruhlaymiz
  const groups = new Map();
  for (const p of products) {
    const key = p.subcategory || p.category || '__other__';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(p);
  }

  // Har bir guruh ichida ham aralashtiramiz, shunda bir guruhdan
  // ketma-ket olinganda ham tasodifiy chiqadi
  const buckets = Array.from(groups.values()).map(shuffleArray);

  const result = [];
  while (buckets.some(b => b.length > 0)) {
    // Har raundda guruhlar tartibi qaytadan aralashadi —
    // shunda 1-mahsulot Smartfonlar, 2-si Kir yuvish, 3-si Smart soat
    // kabi tasodifiy ketmaketlik chiqadi
    const round = shuffleArray(buckets.filter(b => b.length > 0));
    for (const b of round) {
      result.push(b.shift());
    }
  }
  return result;
}
