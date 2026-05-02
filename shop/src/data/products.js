// ===== KATEGORIYALAR (2 darajali ierarxiya) =====
// Kategoriyalar — schema (UI navigatsiyasi). Mahsulotlar backenddan keladi.

export const categories = [
  {
    id: 'large-appliances',
    icon: '🏠',
    name: { uz: 'Katta maishiy texnika', ru: 'Крупная бытовая техника' },
    subcategories: [
      { id: 'washing', name: { uz: 'Kir yuvish mashinalari', ru: 'Стиральные машины' } },
      { id: 'fridges', name: { uz: 'Muzlatgichlar', ru: 'Холодильники' } },
      { id: 'stoves', name: { uz: 'Gaz va elektr plitalar', ru: 'Газовые и электроплиты' } },
      { id: 'ovens', name: { uz: 'Duxovkalar', ru: 'Духовки' } },
      { id: 'dishwashers', name: { uz: 'Idish yuvish mashinalari', ru: 'Посудомоечные машины' } },
    ],
  },
  {
    id: 'small-appliances',
    icon: '⚡',
    name: { uz: 'Kichik maishiy texnika', ru: 'Малая бытовая техника' },
    subcategories: [
      { id: 'kettles', name: { uz: 'Elektr choynaklar', ru: 'Электрочайники' } },
      { id: 'blenders', name: { uz: 'Blenderlar', ru: 'Блендеры' } },
      { id: 'mixers', name: { uz: 'Mikserlar', ru: 'Миксеры' } },
      { id: 'meat-grinders', name: { uz: "Go'sht maydalagichlar", ru: 'Мясорубки' } },
      { id: 'toasters', name: { uz: "Toster va gril'", ru: 'Тостеры и грили' } },
    ],
  },
  {
    id: 'climate',
    icon: '❄️',
    name: { uz: 'Iqlim texnikasi', ru: 'Климатическая техника' },
    subcategories: [
      { id: 'ac', name: { uz: 'Konditsionerlar', ru: 'Кондиционеры' } },
      { id: 'heaters', name: { uz: 'Isitgichlar', ru: 'Обогреватели' } },
      { id: 'fans', name: { uz: 'Ventilyatorlar', ru: 'Вентиляторы' } },
      { id: 'air-purifiers', name: { uz: 'Havo tozalagichlar', ru: 'Очистители воздуха' } },
      { id: 'humidifiers', name: { uz: 'Namlagichlar', ru: 'Увлажнители' } },
    ],
  },
  {
    id: 'cleaning',
    icon: '🧹',
    name: { uz: 'Tozalash texnikasi', ru: 'Техника для уборки' },
    subcategories: [
      { id: 'vacuums', name: { uz: 'Changyutgichlar', ru: 'Пылесосы' } },
      { id: 'robot-vacuums', name: { uz: 'Robot changyutgichlar', ru: 'Роботы-пылесосы' } },
      { id: 'floor-washers', name: { uz: "Pol yuvish qurilmalari", ru: 'Моющие пылесосы' } },
      { id: 'steam-cleaners', name: { uz: "Bug'li tozalagichlar", ru: 'Пароочистители' } },
    ],
  },
  {
    id: 'electronics',
    icon: '📺',
    name: { uz: 'Maishiy elektronika', ru: 'Бытовая электроника' },
    subcategories: [
      { id: 'tvs', name: { uz: 'Televizorlar', ru: 'Телевизоры' } },
      { id: 'audio', name: { uz: 'Audio tizimlar', ru: 'Аудиосистемы' } },
      { id: 'tv-boxes', name: { uz: 'TV pristavkalar', ru: 'ТВ-приставки' } },
      { id: 'home-cinema', name: { uz: 'Uy kinoteatrlari', ru: 'Домашние кинотеатры' } },
    ],
  },
  {
    id: 'clothes-care',
    icon: '👕',
    name: { uz: 'Kiyim parvarishi', ru: 'Уход за одеждой' },
    subcategories: [
      { id: 'irons', name: { uz: 'Utyuglar', ru: 'Утюги' } },
      { id: 'steamers', name: { uz: 'Parogeneratorlar', ru: 'Парогенераторы' } },
      { id: 'steam-cabinets', name: { uz: "Bug'li shkaflar", ru: 'Паровые шкафы' } },
      { id: 'sewing', name: { uz: 'Tikuv mashinalari', ru: 'Швейные машины' } },
    ],
  },
  {
    id: 'kitchen',
    icon: '🍳',
    name: { uz: 'Oshxona texnikasi', ru: 'Кухонная техника' },
    subcategories: [
      { id: 'multicookers', name: { uz: 'Multivarkalar', ru: 'Мультиварки' } },
      { id: 'microwaves', name: { uz: "Mikroto'lqinli pechlar", ru: 'Микроволновые печи' } },
      { id: 'coffee', name: { uz: 'Kofe mashinalari', ru: 'Кофемашины' } },
      { id: 'juicers', name: { uz: 'Sharbat chiqargichlar', ru: 'Соковыжималки' } },
    ],
  },
  {
    id: 'smart',
    icon: '💡',
    name: { uz: 'Aqlli (Smart) texnika', ru: 'Умная техника' },
    subcategories: [
      { id: 'smart-devices', name: { uz: 'Smart qurilmalar', ru: 'Умные устройства' } },
      { id: 'wifi-sockets', name: { uz: 'Wi-Fi rozetkalar', ru: 'Wi-Fi розетки' } },
      { id: 'smart-bulbs', name: { uz: 'Aqlli lampalar', ru: 'Умные лампы' } },
      { id: 'smart-cameras', name: { uz: 'Smart kameralar', ru: 'Умные камеры' } },
    ],
  },
  {
    id: 'accessories',
    icon: '🔌',
    name: { uz: 'Aksessuarlar va ehtiyot qismlar', ru: 'Аксессуары и запчасти' },
    subcategories: [
      { id: 'spare-parts', name: { uz: 'Zapchastlar', ru: 'Запчасти' } },
      { id: 'filters', name: { uz: "Filtrlar", ru: 'Фильтры' } },
      { id: 'cables', name: { uz: 'Kabellar', ru: 'Кабели' } },
      { id: 'adapters', name: { uz: 'Adapterlar', ru: 'Адаптеры' } },
    ],
  },
];

// ===== YORDAMCHI FUNKSIYALAR =====

export const findCategoryById = (id) => categories.find(c => c.id === id);

export const findSubcategoryById = (id) => {
  for (const cat of categories) {
    const sub = cat.subcategories.find(s => s.id === id);
    if (sub) return { ...sub, parent: cat };
  }
  return null;
};

// Narxni formatlash
export const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU').format(price || 0);
};

// Oylik to'lovni hisoblash
export const calculateMonthly = (price, months = 12) => {
  if (!months || months === 0) return 0;
  return Math.round(price / months);
};
