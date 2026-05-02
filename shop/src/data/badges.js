// Mahsulot uchun mavjud badjlar (yorliqlar)
// Super admin har bir mahsulotga shu yorliqlardan tanlaydi

export const PRODUCT_BADGES = [
  {
    id: 'sale',
    label: { uz: 'Aksiya', ru: 'Акция' },
    icon: '🔥',
    bgClass: 'bg-red-500',
    textClass: 'text-white',
  },
  {
    id: 'warranty',
    label: { uz: 'Kafolat narxi', ru: 'Гарантия цена' },
    icon: '🛡',
    bgClass: 'bg-blue-500',
    textClass: 'text-white',
  },
  {
    id: 'bestseller',
    label: { uz: "Eng ko'p sotilgan", ru: 'Самый продаваемый' },
    icon: '⭐',
    bgClass: 'bg-amber-500',
    textClass: 'text-white',
  },
];

// ID bo'yicha badge topish
export const getBadgeById = (id) => PRODUCT_BADGES.find(b => b.id === id);
