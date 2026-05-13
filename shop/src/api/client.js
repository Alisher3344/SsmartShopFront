// Live backend API client.
// Base URL .env (VITE_API_URL) yoki default localhost:8000 dan olinadi.

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
const TOKEN_KEY = 'ssmart_admin_token';
const USER_TOKEN_KEY = 'ssmart_user_token';

export const getToken = () => sessionStorage.getItem(TOKEN_KEY);
export const setToken = (token) => sessionStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => sessionStorage.removeItem(TOKEN_KEY);

export const getUserToken = () => localStorage.getItem(USER_TOKEN_KEY);

// Backend rasm URL'ini absolyut qilib qaytaradi
export const resolveImage = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url;
  if (url.startsWith('/uploads/')) return `${API_BASE}${url}`;
  return url;
};

class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

async function request(path, { method = 'GET', body, headers = {}, isForm = false, auth = 'admin' } = {}) {
  const token = auth === 'user' ? getUserToken() : getToken();
  const finalHeaders = { ...headers };
  if (token) finalHeaders.Authorization = `Bearer ${token}`;
  if (!isForm && body !== undefined) finalHeaders['Content-Type'] = 'application/json';

  const res = await fetch(`${API_BASE}/api${path}`, {
    method,
    headers: finalHeaders,
    body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const contentType = res.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await res.json() : await res.text();

  if (!res.ok) {
    // 401 — token yaroqsiz/eskirgan: tozalaymiz va event yuboramiz
    if (res.status === 401) {
      if (auth === 'user') {
        try {
          localStorage.removeItem('ssmart_user_token');
          localStorage.removeItem('ssmart_user');
          window.dispatchEvent(new Event('ssmart-user-changed'));
        } catch { /* skip */ }
      } else {
        try {
          sessionStorage.removeItem('ssmart_admin_token');
        } catch { /* skip */ }
      }
    }
    const message = extractErrorMessage(payload, res.statusText);
    throw new ApiError(message, res.status, payload);
  }
  return payload;
}

function extractErrorMessage(payload, fallback = 'Request failed') {
  if (!payload) return fallback;
  if (typeof payload === 'string') return payload;
  const detail = payload.detail ?? payload.message;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    // FastAPI validation error: [{loc, msg, type}, ...]
    return detail
      .map((e) => (typeof e === 'string' ? e : e?.msg || JSON.stringify(e)))
      .join('; ');
  }
  if (detail && typeof detail === 'object') return JSON.stringify(detail);
  return fallback;
}

// ===== AUTH =====
export const authApi = {
  // login - username yoki email (admin)
  login: (login, password) =>
    request('/users/login', { method: 'POST', body: { login, password } }),
  me: () => request('/users/me'),
  // SMS OTP — ro'yxatdan o'tish flow'i (foydalanuvchi)
  // phone — xalqaro format raqamlari, prefiksiz: "998901234567"
  smsOtpRequest: (phone) =>
    request('/users/sms-otp/request', { method: 'POST', body: { phone } }),
  // Endi user yaratmaydi — registration_token qaytaradi
  smsOtpVerify: (phone, code) =>
    request('/users/sms-otp/verify', { method: 'POST', body: { phone, code } }),
  // Registration tokeni + parol + ism bilan ro'yxatdan o'tishni yakunlash
  registerComplete: (registration_token, password, full_name) =>
    request('/users/register/complete', {
      method: 'POST',
      body: { registration_token, password, full_name },
    }),
  // Telefon + parol bilan hisobga kirish
  phoneLogin: (phone, password) =>
    request('/users/phone-login', { method: 'POST', body: { phone, password } }),
  // Profil yangilash (ism, familiya, tug'ilgan kun, rasm)
  updateProfile: (data) =>
    request('/users/me/profile', { method: 'PATCH', body: data, auth: 'user' }),
  // Avatar yuklash — user token bilan
  uploadAvatar: async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await request('/upload/avatar', { method: 'POST', body: fd, isForm: true, auth: 'user' });
    return res.url;
  },
  // Parolni tiklash
  passwordResetRequest: (phone) =>
    request('/users/password-reset/request', { method: 'POST', body: { phone } }),
  passwordResetVerify: (phone, code) =>
    request('/users/password-reset/verify', { method: 'POST', body: { phone, code } }),
  passwordResetComplete: (reset_token, password) =>
    request('/users/password-reset/complete', {
      method: 'POST',
      body: { reset_token, password },
    }),
};

// ===== PRODUCTS =====
export const productsApi = {
  list: () => request('/products'),
  get: (id) => request(`/products/${id}`),
  create: (data) => request('/products', { method: 'POST', body: data }),
  update: (id, data) => request(`/products/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  toggleSale: (id) => request(`/products/${id}/toggle-sale`, { method: 'POST' }),
};

// ===== BANNERS =====
export const bannersApi = {
  list: () => request('/banners'),
  create: (data) => request('/banners', { method: 'POST', body: data }),
  update: (id, data) => request(`/banners/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/banners/${id}`, { method: 'DELETE' }),
  toggleActive: (id) => request(`/banners/${id}/toggle-active`, { method: 'POST' }),
};

// ===== STORES (Magazinlar) =====
export const storesApi = {
  list: (onlyActive = false) => request(`/stores${onlyActive ? '?only_active=true' : ''}`),
  create: (data) => request('/stores', { method: 'POST', body: data }),
  update: (id, data) => request(`/stores/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/stores/${id}`, { method: 'DELETE' }),
};

// ===== PICKUP POINTS =====
export const pickupPointsApi = {
  list: (onlyActive = false) => request(`/pickup-points${onlyActive ? '?only_active=true' : ''}`),
  create: (data) => request('/pickup-points', { method: 'POST', body: data }),
  update: (id, data) => request(`/pickup-points/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/pickup-points/${id}`, { method: 'DELETE' }),
  // Adminlar (ko'pchilik bo'lishi mumkin)
  listAdmins: (pointId) => request(`/pickup-points/${pointId}/admins`),
  createAdmin: (pointId, data) => request(`/pickup-points/${pointId}/admins`, { method: 'POST', body: data }),
  updateAdmin: (userId, data) => request(`/pickup-points/admins/${userId}`, { method: 'PUT', body: data }),
  deleteAdmin: (userId) => request(`/pickup-points/admins/${userId}`, { method: 'DELETE' }),
};

// ===== REVIEWS =====
export const reviewsApi = {
  myPending: () => request('/reviews/my-pending', { auth: 'user' }),
  myReviews: () => request('/reviews/my', { auth: 'user' }),
  forProduct: (productId) => request(`/reviews/product/${productId}`),
  create: (data) => request('/reviews', { method: 'POST', body: data, auth: 'user' }),
};

// ===== ORDERS =====
export const ordersApi = {
  // Foydalanuvchi tokenidan foydalanadi
  create: (data) => request('/orders', { method: 'POST', body: data, auth: 'user' }),
  myOrders: () => request('/orders/my', { auth: 'user' }),
  cancelMine: (id) => request(`/orders/${id}/cancel`, { method: 'POST', auth: 'user' }),
  // Admin tokeni
  list: (filters = {}) => {
    const qs = new URLSearchParams();
    if (filters.pickupPointId) qs.set('pickup_point_id', filters.pickupPointId);
    if (filters.status) qs.set('status', filters.status);
    const s = qs.toString();
    return request(`/orders${s ? '?' + s : ''}`);
  },
  confirm: (id) => request(`/orders/${id}/confirm`, { method: 'POST' }),
  cancel: (id) => request(`/orders/${id}/cancel`, { method: 'POST' }),
};

// ===== SALES ADMINS (faqat superadmin) =====
export const salesAdminsApi = {
  list: () => request('/sales-admins'),
  create: (data) => request('/sales-admins', { method: 'POST', body: data }),
  update: (id, data) => request(`/sales-admins/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/sales-admins/${id}`, { method: 'DELETE' }),
};

// ===== STAFF (Magazin adminlari, alohida rol) =====
export const staffApi = {
  list: (storeId) => request(`/staff${storeId ? '?store_id=' + storeId : ''}`),
  create: (data) => request('/staff', { method: 'POST', body: data }),
  update: (id, data) => request(`/staff/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/staff/${id}`, { method: 'DELETE' }),
};

// ===== ADMIN USERS (faqat superadmin) =====
export const adminUsersApi = {
  list: (search) => {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    return request(`/admin/users${qs}`);
  },
  get: (id) => request(`/admin/users/${id}`),
  update: (id, data) => request(`/admin/users/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
};

// ===== UPLOAD =====
export const uploadApi = {
  image: async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await request('/upload/image', { method: 'POST', body: fd, isForm: true });
    return res.url;
  },
};

export { ApiError, API_BASE };
