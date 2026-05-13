// Admin subdomenlar va rollar mapping'i
// Bir subdomenga faqat ruxsat berilgan rol'lar kira oladi.

export const HOST_ROLES = {
  'ssmart-dashboard.ssmart.uz': ['superadmin'],
  'ssmart-sotuv.ssmart.uz':     ['admin', 'staff'],
};

// Har bir rol uchun "to'g'ri" subdomen URL'si — login muvaffaqiyatli bo'lganda
// foydalanuvchini shu yerga yo'naltiramiz.
export const ROLE_HOSTS = {
  superadmin:   'ssmart-dashboard.ssmart.uz',
  admin:        'ssmart-sotuv.ssmart.uz',
  staff:        'ssmart-sotuv.ssmart.uz',
  pickup_admin: 'ssmart-pos.ssmart.uz',
};

export function getCurrentHost() {
  return typeof window !== 'undefined' ? window.location.hostname : '';
}

// Berilgan host bu rol uchun ruxsat berilganmi?
// HOST_ROLES da yo'q subdomenlar (masalan, ssmart.uz, localhost) cheklanmaydi.
export function hostAllowsRole(host, role) {
  const allowed = HOST_ROLES[host];
  if (!allowed) return true;
  return allowed.includes(role);
}

// Berilgan rol uchun to'g'ri subdomen URL'si (https://...). Yo'q bo'lsa null.
export function urlForRole(role) {
  const host = ROLE_HOSTS[role];
  if (!host) return null;
  return `https://${host}/`;
}

// Admin roli (oddiy foydalanuvchi/yo'q emas)
export function isAdminRole(role) {
  return role === 'admin' || role === 'superadmin' || role === 'staff';
}
