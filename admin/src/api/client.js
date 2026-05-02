// Punkt admin uchun API client. JWT token localStorage'da.

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
const TOKEN_KEY = 'ssmart_pickup_admin_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

function extractError(payload, fallback) {
  if (!payload) return fallback;
  if (typeof payload === 'string') return payload;
  const detail = payload.detail ?? payload.message;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((e) => e?.msg || JSON.stringify(e)).join('; ');
  }
  return fallback;
}

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const token = getToken();
  const finalHeaders = { ...headers };
  if (token) finalHeaders.Authorization = `Bearer ${token}`;
  if (body !== undefined) finalHeaders['Content-Type'] = 'application/json';

  const res = await fetch(`${API_BASE}/api${path}`, {
    method,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const ct = res.headers.get('content-type') || '';
  const payload = ct.includes('application/json') ? await res.json() : await res.text();

  if (!res.ok) {
    throw new ApiError(extractError(payload, res.statusText), res.status);
  }
  return payload;
}

export const authApi = {
  // login - username
  login: (login, password) =>
    request('/users/login', { method: 'POST', body: { login, password } }),
  me: () => request('/users/me'),
};

export const pickupApi = {
  myPoint: () => request('/pickup-points/my'),
  myOrders: (status) => request(`/pickup-points/my/orders${status ? '?status=' + status : ''}`),
  // 1-kod (transit) bilan punktga qabul qilish — mahsulot ro'yxatga qo'shiladi va foydalanuvchiga 2-kod yuboriladi
  receiveByTransitCode: (code) => request('/pickup-points/my/receive', { method: 'POST', body: { code } }),
  // 2-kod bilan ma'lumotni ko'rish (status o'zgarmaydi)
  lookupByPickupCode: (code) => request('/pickup-points/my/lookup', { method: 'POST', body: { code } }),
  // 2-kodni tasdiqlash — mahsulot mijozga topshiriladi
  deliverByCode: (code) => request('/pickup-points/my/deliver', { method: 'POST', body: { code } }),
};

export const resolveImage = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url;
  if (url.startsWith('/uploads/')) return `${API_BASE}${url}`;
  return url;
};

export { API_BASE };
