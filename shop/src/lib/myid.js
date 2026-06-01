// MyID (Uzinfocom biometric ID) frontend integratsiyasi uchun yordamchilar.
//
// Backend `users.myid_raw` JSONB ni shu shaklda qaytaradi:
//   { profile: {
//       common_data: { first_name, last_name, middle_name?, pinfl, gender, birth_date, citizenship, nationality?, sdk_hash, birth_place?, birth_country? },
//       doc_data:    { pass_data, doc_type, issued_date, expiry_date?, issued_by? },
//       contacts:    { phone?, email? },
//       address:     { permanent_address?, temporary_address? },
//       authentication_method: 'simple' | 'strong',
//   } }
//
// Bu fayl shu strukturani **flat** obyektga aylantiradi va UI uchun
// tayyor matn/format'ni qaytaradi (sana, jinsi, badge text, va h.k.).

// Backend boshlash endpoint'i — frontend route emas (302 redirect MyID'ga)
export const MYID_START_URL =
  `${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/auth/myid/start`;

// User MyID orqali tasdiqlanganmi
export const isMyIdVerified = (user) => Boolean(user?.myid_verified_at);

// MyID `DD.MM.YYYY` formatdan `YYYY-MM-DD` ga (yoki teskari) o'tkazadi
export const normalizeMyIdDate = (raw) => {
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const m = /^(\d{2})\.(\d{2})\.(\d{4})/.exec(raw);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return raw;
};

// `2003-11-29` → `29.11.2003` (UI uchun ko'rinish)
export const formatDateDisplay = (raw, lang = 'uz') => {
  const iso = normalizeMyIdDate(raw);
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return raw || '';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return lang === 'ru' ? `${d}.${m}.${y}` : `${d}.${m}.${y}`;
};

// MyID gender kodini (`1`/`2`) matnga
export const formatGender = (raw, lang = 'uz') => {
  const code = String(raw || '').trim();
  if (code === '1') return lang === 'ru' ? 'Мужской' : 'Erkak';
  if (code === '2') return lang === 'ru' ? 'Женский' : 'Ayol';
  return '';
};

// `users.myid_raw` + `user` dan flat profil qurish.
// Hech qaysi field majburiy emas — UI null'larni o'zi tekshiradi.
export const parseMyIdProfile = (user) => {
  if (!user) return null;
  const raw = user.myid_raw || null;
  const profile = raw?.profile || raw || {};
  const common = profile.common_data || {};
  const doc = profile.doc_data || {};
  const contacts = profile.contacts || {};
  const address = profile.address || {};

  const fioParts = [common.last_name, common.first_name, common.middle_name].filter(Boolean);
  const fio = fioParts.length > 0 ? fioParts.join(' ') : user.full_name || null;

  return {
    verified: isMyIdVerified(user),
    verifiedAt: user.myid_verified_at || null,
    authMethod: profile.authentication_method || profile.auth_method || null,
    // Identifikatsiya
    fio,
    firstName: common.first_name || null,
    lastName: common.last_name || null,
    middleName: common.middle_name || null,
    pinfl: common.pinfl || user.passport || null,
    gender: common.gender || null,
    birthDate: common.birth_date || user.birth_date || null,
    birthPlace: common.birth_place || null,
    citizenship: common.citizenship || null,
    nationality: common.nationality || null,
    // Hujjat
    passport: doc.pass_data || user.myid_passport_serial || null,
    docType: doc.doc_type || null,
    issuedDate: doc.issued_date || null,
    expiryDate: doc.expiry_date || null,
    issuedBy: doc.issued_by || null,
    // Kontakt
    phone: contacts.phone || user.phone || null,
    email: contacts.email || user.email || null,
    // Manzil
    permanentAddress: address.permanent_address || user.address || null,
    temporaryAddress: address.temporary_address || null,
    // Xom JSON (debug yoki kelajakda ko'rsatish uchun)
    raw,
  };
};

// Sayt UI matnlari (uz/ru) — bir joyda
export const MYID_LABELS = {
  // Umumiy
  brand:           { uz: 'MyID',                              ru: 'MyID' },
  verified:        { uz: 'MyID orqali tasdiqlangan',          ru: 'Подтверждено через MyID' },
  notVerified:     { uz: 'Tasdiqlanmagan',                    ru: 'Не подтверждён' },
  verifyCTA:       { uz: 'MyID orqali tasdiqlash',            ru: 'Подтвердить через MyID' },
  reverify:        { uz: "Ma'lumotlarni yangilash",           ru: 'Обновить данные' },
  loginWithMyId:   { uz: 'MyID orqali kirish',                ru: 'Войти через MyID' },
  authStrong:      { uz: 'Strong (yuz skani)',                ru: 'Strong (распознавание лица)' },
  authSimple:      { uz: 'Simple',                            ru: 'Simple' },
  verifyHint:      {
    uz: "Ixtiyoriy. Kredit (rassrochka) yoki limit so'raganingizda bir martalik biometrik identifikatsiya talab qilinadi.",
    ru: 'Опционально. Одноразовая биометрическая идентификация требуется только при оформлении рассрочки или лимита.',
  },
  // Sahifa sarlavhalari
  successTitle:    { uz: 'Identifikatsiya muvaffaqiyatli!',   ru: 'Идентификация прошла успешно!' },
  successHint:     {
    uz: "MyID orqali shaxsingiz tasdiqlandi va siz ro'yxatdan o'tdingiz.",
    ru: 'MyID подтвердил вашу личность и зарегистрировал вас.',
  },
  failTitle:       { uz: "Identifikatsiya o'tmadi",           ru: 'Идентификация не пройдена' },
  retry:           { uz: 'Qaytadan urinish',                  ru: 'Попробовать снова' },
  goHome:          { uz: 'Bosh sahifa',                       ru: 'Главная' },
  continue:        { uz: "Bosh sahifaga o'tish",              ru: 'Перейти на главную' },
  // Maydon nomlari
  fio:             { uz: 'F.I.SH.',                           ru: 'Ф.И.О.' },
  pinfl:           { uz: 'PINFL (JSHSHIR)',                   ru: 'ПИНФЛ' },
  passport:        { uz: 'Pasport seriyasi va raqami',        ru: 'Серия и номер паспорта' },
  docType:         { uz: 'Hujjat turi',                       ru: 'Тип документа' },
  issuedDate:      { uz: 'Berilgan sana',                     ru: 'Дата выдачи' },
  expiryDate:      { uz: 'Amal qilish muddati',               ru: 'Срок действия' },
  issuedBy:        { uz: 'Kim tomonidan berilgan',            ru: 'Кем выдан' },
  birthDate:       { uz: "Tug'ilgan sana",                    ru: 'Дата рождения' },
  birthPlace:      { uz: "Tug'ilgan joy",                     ru: 'Место рождения' },
  gender:          { uz: 'Jinsi',                             ru: 'Пол' },
  citizenship:     { uz: 'Fuqaroligi',                        ru: 'Гражданство' },
  nationality:     { uz: 'Millati',                           ru: 'Национальность' },
  permanentAddress:{ uz: 'Doimiy manzil',                     ru: 'Постоянный адрес' },
  temporaryAddress:{ uz: 'Vaqtinchalik manzil',               ru: 'Временный адрес' },
  phone:           { uz: 'Telefon',                           ru: 'Телефон' },
  email:           { uz: 'Email',                             ru: 'Email' },
  verifiedAt:      { uz: 'Tasdiqlangan vaqt',                 ru: 'Дата подтверждения' },
  authMethod:      { uz: 'Identifikatsiya usuli',             ru: 'Метод идентификации' },
};

// Helper — locale tanlab matn olish: t('fio', 'ru') → 'Ф.И.О.'
export const t = (key, lang = 'uz') => {
  const entry = MYID_LABELS[key];
  if (!entry) return key;
  return entry[lang] || entry.uz || key;
};

// Authentication method label
export const formatAuthMethod = (method, lang = 'uz') => {
  if (!method) return '';
  if (method === 'strong') return t('authStrong', lang);
  if (method === 'simple') return t('authSimple', lang);
  return method;
};
