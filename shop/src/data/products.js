// ===== KATEGORIYALAR (2 darajali ierarxiya) =====
// Kategoriyalar — schema (UI navigatsiyasi). Mahsulotlar backenddan keladi.

export const categories = [
  {
    id: 'large-appliances',
    icon: 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/House/3D/house_3d.png',
    name: { uz: 'Katta maishiy texnika', ru: 'Крупная бытовая техника' },
    shortName: { uz: 'Katta texnika', ru: 'Крупная' },
    subcategories: [
      { id: 'fridges', name: { uz: 'Sovutkich (muzlatkich)', ru: 'Холодильники' } },
      { id: 'washing', name: { uz: 'Kir yuvish mashinasi', ru: 'Стиральные машины' } },
      { id: 'stoves', name: { uz: 'Gaz va elektr plita', ru: 'Газовые и электрические плиты' } },
      { id: 'ovens', name: { uz: 'Pech (duxovka)', ru: 'Духовые шкафы' } },
      { id: 'dishwashers', name: { uz: 'Idish yuvish mashinasi', ru: 'Посудомоечные машины' } },
      { id: 'freezers', name: { uz: 'Katta muzlatgich (freezer)', ru: 'Морозильные камеры' } },
      { id: 'water-heaters', name: { uz: 'Suv isitkich (bojler)', ru: 'Водонагреватели (бойлеры)' } },
    ],
  },
  {
    id: 'small-appliances',
    icon: 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/High%20voltage/3D/high_voltage_3d.png',
    name: { uz: 'Kichik maishiy texnika', ru: 'Малая бытовая техника' },
    shortName: { uz: 'Kichik texnika', ru: 'Малая' },
    subcategories: [
      { id: 'blenders', name: { uz: 'Blender', ru: 'Блендеры' } },
      { id: 'mixers', name: { uz: 'Mikser', ru: 'Миксеры' } },
      { id: 'coffee-machines', name: { uz: 'Kofe mashinasi', ru: 'Кофемашины' } },
      { id: 'kettles', name: { uz: 'Elektr choynak', ru: 'Электрочайники' } },
      { id: 'toasters', name: { uz: 'Tost tayyorlagich', ru: 'Тостеры' } },
      { id: 'meat-grinders', name: { uz: "Go'sht maydalagich", ru: 'Мясорубки' } },
      { id: 'juicers', name: { uz: 'Sharbat chiqargich', ru: 'Соковыжималки' } },
      { id: 'multicookers', name: { uz: 'Multivarka', ru: 'Мультиварки' } },
      { id: 'slow-cookers', name: { uz: 'Sekin pishirgich', ru: 'Медленноварки' } },
      { id: 'air-fryers', name: { uz: "Yog'siz qovurish apparati (air fryer)", ru: 'Аэрогрили' } },
      { id: 'grills', name: { uz: 'Gril', ru: 'Грили' } },
      { id: 'bread-makers', name: { uz: 'Non pishirgich', ru: 'Хлебопечки' } },
      { id: 'handheld-vacuums', name: { uz: "Qo'l changyutgich", ru: 'Ручные пылесосы' } },
      { id: 'hair-dryers', name: { uz: 'Soch fen', ru: 'Фены' } },
      { id: 'coffee-grinders', name: { uz: 'Qahva maydalagich', ru: 'Кофемолки' } },
      { id: 'yogurt-makers', name: { uz: 'Yogurt tayyorlagich', ru: 'Йогуртницы' } },
      { id: 'steam-cookers', name: { uz: "Bug'da pishirgich", ru: 'Пароварки' } },
      { id: 'milk-frothers', name: { uz: "Sut ko'pirtirgich", ru: 'Вспениватели молока' } },
      { id: 'electric-knives', name: { uz: 'Elektr pichoq', ru: 'Электроножи' } },
    ],
  },
  {
    id: 'climate',
    icon: 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Snowflake/3D/snowflake_3d.png',
    name: { uz: 'Iqlim texnikasi', ru: 'Климатическая техника' },
    shortName: { uz: 'Iqlim', ru: 'Климат' },
    subcategories: [
      { id: 'ac', name: { uz: 'Konditsioner', ru: 'Кондиционеры' } },
      { id: 'fans', name: { uz: 'Ventilyator', ru: 'Вентиляторы' } },
      { id: 'heaters', name: { uz: 'Isitgich', ru: 'Обогреватели' } },
      { id: 'humidifiers', name: { uz: 'Havo namlagich', ru: 'Увлажнители воздуха' } },
      { id: 'air-purifiers', name: { uz: 'Havo tozalagich', ru: 'Очистители воздуха' } },
    ],
  },
  {
    id: 'cleaning',
    icon: 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Broom/3D/broom_3d.png',
    name: { uz: 'Tozalash texnikasi', ru: 'Техника для уборки' },
    shortName: { uz: 'Tozalash', ru: 'Уборка' },
    subcategories: [
      { id: 'vacuums', name: { uz: 'Changyutgich', ru: 'Пылесосы' } },
      { id: 'robot-vacuums', name: { uz: 'Robot changyutgich', ru: 'Роботы-пылесосы' } },
      { id: 'steam-cleaners', name: { uz: "Bug' bilan tozalash apparati", ru: 'Пароочистители' } },
      { id: 'floor-washers', name: { uz: 'Pol yuvish mashinasi', ru: 'Моющие пылесосы' } },
      { id: 'professional-cleaners', name: { uz: 'Professional tozalash uskunalari', ru: 'Профессиональная уборочная техника' } },
    ],
  },
  {
    id: 'electronics',
    icon: 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Television/3D/television_3d.png',
    name: { uz: 'Maishiy elektronika', ru: 'Бытовая электроника' },
    shortName: { uz: 'Elektronika', ru: 'Электроника' },
    subcategories: [
      { id: 'tvs', name: { uz: 'Televizor', ru: 'Телевизоры' } },
      { id: 'tv-tuners', name: { uz: 'TV-pristavkalar va tyunerlar', ru: 'Тюнеры и TV-приставки' } },
      { id: 'tv-mounts', name: { uz: 'TV uchun kronshteyn', ru: 'Кронштейны для ТВ' } },
      { id: 'audio', name: { uz: 'Karnay va ovoz tizimi', ru: 'Колонки и аудиосистемы' } },
      { id: 'media-players', name: { uz: 'DVD va media pleyer', ru: 'DVD и медиаплееры' } },
      { id: 'photo-video-cameras', name: { uz: 'Foto va video kamera', ru: 'Фото и видеокамеры' } },
      { id: 'radio-tape', name: { uz: 'Radio va magnitofon', ru: 'Радио и магнитофоны' } },
    ],
  },
  {
    id: 'clothes-care',
    icon: 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/T-shirt/3D/t-shirt_3d.png',
    name: { uz: 'Kiyim parvarishi', ru: 'Уход за одеждой' },
    shortName: { uz: 'Kiyim', ru: 'Одежда' },
    subcategories: [
      { id: 'irons', name: { uz: 'Dazmol', ru: 'Утюги' } },
      { id: 'steam-irons', name: { uz: "Bug'li dazmol", ru: 'Парогенераторы' } },
      { id: 'sewing', name: { uz: 'Tikuv mashinasi', ru: 'Швейные машины' } },
      { id: 'clothes-dryers', name: { uz: 'Kiyim quritgich', ru: 'Сушильные машины' } },
      { id: 'clothes-steamers', name: { uz: "Kiyim bug'lagich", ru: 'Отпариватели для одежды' } },
    ],
  },
  {
    id: 'kitchen',
    icon: 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Cooking/3D/cooking_3d.png',
    name: { uz: 'Oshxona texnikasi', ru: 'Кухонная техника' },
    shortName: { uz: 'Oshxona', ru: 'Кухня' },
    subcategories: [
      { id: 'kitchen-mixers-blenders', name: { uz: 'Mikser va blender', ru: 'Миксеры и блендеры' } },
      { id: 'kitchen-coffee', name: { uz: 'Kofe mashinasi', ru: 'Кофемашины' } },
      { id: 'electric-ovens', name: { uz: 'Elektr pech', ru: 'Электропечи' } },
      { id: 'kitchen-air-fryers', name: { uz: "Yog'siz qovurish apparati", ru: 'Аэрогрили' } },
      { id: 'kitchen-multicookers', name: { uz: 'Multivarka', ru: 'Мультиварки' } },
      { id: 'juice-press', name: { uz: 'Sharbat press', ru: 'Соковыжималки прессовые' } },
      { id: 'rice-cookers', name: { uz: 'Guruch pishirgich', ru: 'Рисоварки' } },
      { id: 'sous-vide', name: { uz: 'Sous-vide (sekin pishirish qurilmasi)', ru: 'Су-вид' } },
    ],
  },
  {
    id: 'smart',
    icon: 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Light%20bulb/3D/light_bulb_3d.png',
    name: { uz: 'Aqlli texnika', ru: 'Умная техника' },
    shortName: { uz: 'Aqlli', ru: 'Умная' },
    subcategories: [
      { id: 'smart-tvs', name: { uz: 'Aqlli televizor', ru: 'Умные телевизоры' } },
      { id: 'smart-watches', name: { uz: 'Aqlli soat', ru: 'Умные часы' } },
      { id: 'smart-home', name: { uz: 'Aqlli uy tizimi', ru: 'Системы умного дома' } },
      { id: 'smart-cameras', name: { uz: 'Aqlli kamera', ru: 'Умные камеры' } },
      { id: 'smart-lighting', name: { uz: 'Aqlli yoritish tizimi', ru: 'Умное освещение' } },
      { id: 'voice-controlled', name: { uz: 'Ovoz bilan boshqariladigan qurilmalar', ru: 'Устройства с голосовым управлением' } },
      { id: 'wifi-sockets', name: { uz: 'Aqlli rozetka', ru: 'Умные розетки' } },
    ],
  },
  {
    id: 'phones',
    icon: 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Mobile%20phone/3D/mobile_phone_3d.png',
    name: { uz: 'Telefonlar', ru: 'Телефоны' },
    shortName: { uz: 'Telefon', ru: 'Телефоны' },
    subcategories: [
      { id: 'smartphones', name: { uz: 'Smartfonlar (zamonaviy telefonlar)', ru: 'Смартфоны' } },
      { id: 'feature-phones', name: { uz: 'Oddiy tugmali telefonlar', ru: 'Кнопочные телефоны' } },
      { id: 'large-screen-phones', name: { uz: 'Katta ekranli telefonlar', ru: 'Телефоны с большим экраном' } },
      { id: 'kids-phones', name: { uz: 'Bolalar uchun telefonlar', ru: 'Детские телефоны' } },
      { id: 'business-phones', name: { uz: 'Ish uchun telefonlar', ru: 'Бизнес-телефоны' } },
      { id: 'phone-accessories', name: { uz: "Telefon aksessuarlari (g'ilof, himoya oynasi, quloqchin)", ru: 'Аксессуары для телефонов (чехлы, защитные стёкла, наушники)' } },
    ],
  },
  {
    id: 'computers',
    icon: 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Laptop/3D/laptop_3d.png',
    name: { uz: 'Kompyuter va elektronika', ru: 'Компьютеры и электроника' },
    shortName: { uz: 'Kompyuter', ru: 'Компьютеры' },
    subcategories: [
      { id: 'desktop-computers', name: { uz: 'Kompyuterlar', ru: 'Настольные компьютеры' } },
      { id: 'laptops', name: { uz: 'Noutbuklar', ru: 'Ноутбуки' } },
      { id: 'all-in-one', name: { uz: 'Monobloklar', ru: 'Моноблоки' } },
      { id: 'monitors', name: { uz: 'Monitor', ru: 'Мониторы' } },
      { id: 'printers', name: { uz: 'Printerlar', ru: 'Принтеры' } },
      { id: 'scanners', name: { uz: 'Skanerlar', ru: 'Сканеры' } },
      { id: 'power-adapters', name: { uz: 'Quvvat bloklari (adapterlar)', ru: 'Блоки питания (адаптеры)' } },
      { id: 'speakers', name: { uz: 'Kolonkalar (karnaylar)', ru: 'Колонки' } },
      { id: 'gaming-desks', name: { uz: "O'yin va ish stollari", ru: 'Игровые и рабочие столы' } },
    ],
  },
  {
    id: 'accessories',
    icon: 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Electric%20plug/3D/electric_plug_3d.png',
    name: { uz: 'Aksessuarlar va ehtiyot qismlar', ru: 'Аксессуары и запчасти' },
    shortName: { uz: 'Aksessuar', ru: 'Аксессуары' },
    subcategories: [
      { id: 'cables-adapters', name: { uz: 'Kabel va adapterlar', ru: 'Кабели и адаптеры' } },
      { id: 'filters', name: { uz: 'Filtrlar (suv, havo, changyutgich uchun)', ru: 'Фильтры (вода, воздух, пылесос)' } },
      { id: 'remotes', name: { uz: 'Masofadan boshqarish pultlari', ru: 'Пульты дистанционного управления' } },
      { id: 'spare-parts', name: { uz: 'Zaxira qismlar', ru: 'Запчасти' } },
      { id: 'batteries', name: { uz: 'Batareya va akkumulyatorlar', ru: 'Батарейки и аккумуляторы' } },
      { id: 'protective-covers', name: { uz: 'Himoya qopqoqlari', ru: 'Защитные чехлы' } },
      { id: 'mounting-parts', name: { uz: "O'rnatish qismlari", ru: 'Монтажные детали' } },
    ],
  },
  {
    id: 'security-cameras',
    icon: 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Video%20camera/3D/video_camera_3d.png',
    name: { uz: 'Kuzatuv kameralari', ru: 'Камеры видеонаблюдения' },
    shortName: { uz: 'Kameralar', ru: 'Камеры' },
    subcategories: [
      { id: 'indoor-cams', name: { uz: 'Ichki kuzatuv kameralari', ru: 'Внутренние камеры' } },
      { id: 'outdoor-cams', name: { uz: 'Tashqi kuzatuv kameralari', ru: 'Уличные камеры' } },
      { id: 'wifi-cams', name: { uz: 'Wi-Fi kuzatuv kameralari', ru: 'Wi-Fi камеры' } },
      { id: 'ip-cams', name: { uz: 'IP kameralar', ru: 'IP-камеры' } },
      { id: 'analog-cams', name: { uz: 'Analog kameralar', ru: 'Аналоговые камеры' } },
      { id: 'dvr-cams', name: { uz: 'DVR tizimli kameralar', ru: 'DVR-камеры' } },
      { id: 'nvr-cams', name: { uz: 'NVR tizimli kameralar', ru: 'NVR-камеры' } },
      { id: 'dvr-nvr-recorders', name: { uz: 'Video-yozuvchi qurilmalar (DVR/NVR)', ru: 'Видеорегистраторы (DVR/NVR)' } },
      { id: '360-cams', name: { uz: 'Aylanuvchi (360°) kameralar', ru: 'Поворотные камеры (360°)' } },
      { id: 'ptz-cams', name: { uz: 'PTZ kameralar (boshqariladigan aylanuvchi)', ru: 'PTZ-камеры (поворотные)' } },
      { id: 'hidden-cams', name: { uz: 'Yashirin kameralar', ru: 'Скрытые камеры' } },
      { id: 'ir-cams', name: { uz: "Tungi ko'rish kameralar (IR kamera)", ru: 'Камеры ночного видения (IR)' } },
      { id: 'motion-cams', name: { uz: 'Harakatni sezuvchi kameralar', ru: 'Камеры с детектором движения' } },
      { id: 'cellular-cams', name: { uz: 'SIM-karta orqali ishlaydigan kameralar (4G/5G)', ru: 'Камеры с SIM-картой (4G/5G)' } },
      { id: 'cam-kits', name: { uz: 'Kuzatuv komplektlari', ru: 'Комплекты видеонаблюдения' } },
      { id: 'cam-hdds', name: { uz: 'Kuzatuv uchun qattiq disklar', ru: 'Жесткие диски для видеонаблюдения' } },
      { id: 'cam-power', name: { uz: 'Quvvat bloklari', ru: 'Блоки питания' } },
      { id: 'poe-switches', name: { uz: 'PoE kommutatorlari', ru: 'PoE коммутаторы' } },
      { id: 'cam-cables', name: { uz: "Kabel va razyomlar", ru: 'Кабели и разъёмы' } },
      { id: 'cam-mounts', name: { uz: "Kronshteyn va o'rnatish qismlari", ru: 'Кронштейны и крепления' } },
      { id: 'access-control', name: { uz: 'Kirish nazorat tizimlari', ru: 'Системы контроля доступа' } },
      { id: 'intercoms', name: { uz: 'Domofon va video-domofonlar', ru: 'Домофоны и видеодомофоны' } },
      { id: 'alarm-systems', name: { uz: 'Xavfsizlik signalizatsiyasi', ru: 'Охранная сигнализация' } },
      { id: 'cam-accessories', name: { uz: 'Kuzatuv aksessuarlari', ru: 'Аксессуары для видеонаблюдения' } },
    ],
  },
  {
    id: 'auto-zone',
    icon: 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Automobile/3D/automobile_3d.png',
    name: { uz: 'Avtozona', ru: 'Автозона' },
    shortName: { uz: 'Avto', ru: 'Авто' },
    subcategories: [
      { id: 'auto-tuning', name: { uz: 'Tyuning va xavfsizlik', ru: 'Тюнинг и безопасность' } },
      { id: 'radar-detectors', name: { uz: 'Radar detektorlar', ru: 'Радар-детекторы' } },
      { id: 'auto-alarms', name: { uz: 'Avtosignalizatsiyalar', ru: 'Автосигнализации' } },
      { id: 'dash-cams', name: { uz: 'Video registratorlar', ru: 'Видеорегистраторы' } },
      { id: 'auto-sound', name: { uz: 'Avto ovoz tizimi', ru: 'Автозвук' } },
      { id: 'auto-speakers', name: { uz: 'Avtomobil akustikasi va kolonkalar', ru: 'Автомобильная акустика и колонки' } },
      { id: 'auto-radios', name: { uz: 'Avtomagnitolalar', ru: 'Автомагнитолы' } },
    ],
  },
  {
    id: 'tools',
    icon: 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Hammer/3D/hammer_3d.png',
    name: { uz: "Ta'mirlash uchun asboblar", ru: 'Инструменты для ремонта' },
    shortName: { uz: 'Asboblar', ru: 'Инструменты' },
    subcategories: [
      { id: 'rotary-hammers', name: { uz: 'Perforatorlar', ru: 'Перфораторы' } },
      { id: 'drills', name: { uz: 'Drelar', ru: 'Дрели' } },
      { id: 'angle-grinders', name: { uz: 'Bolgarkalar', ru: 'Болгарки' } },
      { id: 'lawn-mowers', name: { uz: "Maysazor o'rgich (gazonokosilka)", ru: 'Газонокосилки' } },
      { id: 'measuring-tapes', name: { uz: "O'lchov ruletkalari", ru: 'Измерительные рулетки' } },
      { id: 'cutting-saws', name: { uz: 'Kesuvchi va arrali asboblar', ru: 'Режущие и пильные инструменты' } },
      { id: 'tool-sets', name: { uz: "Asbob to'plamlari", ru: 'Наборы инструментов' } },
      { id: 'stabilizers', name: { uz: 'Stabilizatorlar', ru: 'Стабилизаторы' } },
      { id: 'welding-machines', name: { uz: 'Payvandlash apparatlari', ru: 'Сварочные аппараты' } },
      { id: 'screwdrivers', name: { uz: 'Shurupovertlar', ru: 'Шуруповерты' } },
      { id: 'heating-tools', name: { uz: 'Isitish asboblari', ru: 'Приборы для нагрева' } },
    ],
  },
  {
    id: 'kids',
    icon: 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Teddy%20bear/3D/teddy_bear_3d.png',
    name: { uz: 'Bolalar tovarlari', ru: 'Товары для детей' },
    shortName: { uz: 'Bolalar', ru: 'Дети' },
    subcategories: [
      { id: 'electric-cars-kids', name: { uz: 'Elektromobillar', ru: 'Электромобили' } },
      { id: 'scooters-bikes-kids', name: { uz: 'Bolalar samokati va velosipedlari', ru: 'Детские самокаты и велосипеды' } },
      { id: 'pools', name: { uz: 'Basseynlar', ru: 'Бассейны' } },
    ],
  },
  {
    id: 'kitchen-utensils',
    icon: 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Pot%20of%20food/3D/pot_of_food_3d.png',
    name: { uz: 'Oshxona buyumlari', ru: 'Товары для кухни' },
    shortName: { uz: 'Oshxona buyumlari', ru: 'Кухня (посуда)' },
    subcategories: [
      { id: 'knives', name: { uz: 'Pichoqlar', ru: 'Ножи' } },
      { id: 'cookware-sets', name: { uz: "Idish to'plamlari", ru: 'Наборы посуды' } },
      { id: 'pots', name: { uz: 'Kastryulkalar', ru: 'Кастрюли' } },
      { id: 'tea-kettles', name: { uz: 'Choynaklar', ru: 'Чайники' } },
      { id: 'cauldrons', name: { uz: 'Qozonlar', ru: 'Казаны' } },
      { id: 'cooking-sets', name: { uz: "Pishirish uchun idish to'plamlari", ru: 'Наборы посуды для приготовления' } },
      { id: 'ladles', name: { uz: "Cho'michlar", ru: 'Половники' } },
      { id: 'carafes', name: { uz: 'Grafinlar', ru: 'Графины' } },
      { id: 'frying-pans', name: { uz: 'Skovorodalar', ru: 'Сковороды' } },
    ],
  },
  {
    id: 'beauty-health',
    icon: 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Lipstick/3D/lipstick_3d.png',
    name: { uz: "Go'zallik va salomatlik", ru: 'Красота и здоровье' },
    shortName: { uz: "Go'zallik", ru: 'Красота' },
    subcategories: [
      { id: 'electric-shavers', name: { uz: 'Elektr britvalar', ru: 'Электробритвы' } },
      { id: 'curling-irons', name: { uz: "Plojkalar (sochni jingalak qiluvchi)", ru: 'Плойки' } },
      { id: 'hair-straighteners', name: { uz: "Soch to'g'rilagichlar", ru: 'Выпрямители' } },
      { id: 'trimmers', name: { uz: 'Trimmerlar', ru: 'Триммеры' } },
      { id: 'beauty-hair-dryers', name: { uz: 'Fenlar', ru: 'Фены' } },
      { id: 'hot-brushes', name: { uz: "Fen-cho'tkalar", ru: 'Фен-щетки' } },
      { id: 'epilators', name: { uz: 'Epilyatorlar', ru: 'Эпиляторы' } },
    ],
  },
  {
    id: 'gadgets',
    icon: 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Wrapped%20gift/3D/wrapped_gift_3d.png',
    name: { uz: 'Gadjetlar va aksessuarlar', ru: 'Гаджеты и аксессуары' },
    shortName: { uz: 'Gadjetlar', ru: 'Гаджеты' },
    subcategories: [
      { id: 'chargers', name: { uz: 'Zaryadlovchi qurilmalar', ru: 'Зарядные устройства' } },
      { id: 'fitness-bands', name: { uz: 'Fitnes-bilakuzuklar', ru: 'Фитнес-браслеты' } },
      { id: 'headphones', name: { uz: 'Quloqchinlar', ru: 'Наушники' } },
      { id: 'external-storage', name: { uz: 'Tashqi xotira (flesh, SSD)', ru: 'Внешние памяти' } },
      { id: 'power-banks', name: { uz: 'Akkumulyatorlar (power bank)', ru: 'Аккумуляторы' } },
      { id: 'tablets', name: { uz: 'Planshetlar', ru: 'Планшеты' } },
      { id: 'smart-watches-gadgets', name: { uz: 'Smart-soatlar', ru: 'Смарт-часы' } },
    ],
  },
  {
    id: 'used',
    icon: 'https://cdn.simpleicons.org/apple/000000',
    name: { uz: 'Foydalanilgan iPhone', ru: 'Подержанные iPhone' },
    shortName: { uz: 'Foydalanilgan iPhone', ru: 'Подержанные iPhone' },
    subcategories: [
      {
        id: 'used-ideal',
        name: { uz: 'Ideal / A+ holati', ru: 'Идеальное / A+' },
        description: {
          uz: "Deyarli yangidek, chizilmagan, ekran va korpus toza.",
          ru: 'Почти как новый, без царапин, экран и корпус чистые.',
        },
        discount: '15-25%',
      },
      {
        id: 'used-good',
        name: { uz: 'Yaxshi holat (A)', ru: 'Хорошее (A)' },
        description: {
          uz: "Kichik chiziqlar bor, lekin ekran butun, hamma narsa ishlaydi.",
          ru: 'Мелкие царапины, но экран целый, всё работает.',
        },
        discount: '30-40%',
      },
      {
        id: 'used-fair',
        name: { uz: "O'rtacha holat (B)", ru: 'Среднее (B)' },
        description: {
          uz: "Ko'rinarli chiziqlar, burchaklarida zarba izlari bo'lishi mumkin.",
          ru: 'Заметные царапины, могут быть следы ударов на углах.',
        },
        discount: '40-50%',
      },
      {
        id: 'used-poor',
        name: { uz: 'Yomon holat (C)', ru: 'Плохое (C)' },
        description: {
          uz: "Sezilarli shikastlar, ekran almashtirilgan bo'lishi mumkin. Ancha arzon, lekin xavfli.",
          ru: 'Заметные повреждения, экран мог быть заменён. Намного дешевле, но риск выше.',
        },
        discount: '50%+',
      },
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

// Muddatli to'lov ustamasi — har 3 oyga +10%
export const CREDIT_MARKUPS = { 3: 1.10, 6: 1.20, 9: 1.30, 12: 1.40 };

// Oylik to'lovni hisoblash (ustama bilan)
export const calculateMonthly = (price, months = 12) => {
  if (!months || months === 0) return 0;
  const markup = CREDIT_MARKUPS[months] ?? 1;
  return Math.round((price * markup) / months);
};

// Oy nomlari — yetkazib berish sanasini formatlash uchun
const MONTH_NAMES = {
  uz: ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'],
  ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
};

// Yetkazib berish sanasini formatlash: bugun + days = "17-may"
export const formatDeliveryDate = (days = 3, lang = 'uz') => {
  const target = new Date();
  target.setDate(target.getDate() + (Number(days) || 0));
  const day = target.getDate();
  const month = MONTH_NAMES[lang === 'ru' ? 'ru' : 'uz'][target.getMonth()];
  return `${day}-${month}`;
};
