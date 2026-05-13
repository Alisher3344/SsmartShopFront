import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Package, MessageSquare, Info, Tag, LogOut, Clock, CheckCircle2, XCircle, MapPin, Star, Send, X, Mail, Globe, ChevronRight, ArrowLeft, CreditCard, ArrowDownLeft, ArrowUpRight, Trash2, Camera, Save, AlertCircle, Check } from 'lucide-react';
import { resolveImage, ordersApi, reviewsApi, authApi } from '../api/client';
import FluentEmoji from '../components/FluentEmoji';

const TABS = {
  orders:    { id: 'orders',    label: { uz: 'Buyurtmalarim',           ru: 'Мои заказы' },           icon: Package },
  payment:   { id: 'payment',   label: { uz: "Qulay to'lov",            ru: 'Удобная оплата' },       icon: CreditCard },
  favorites: { id: 'favorites', label: { uz: 'Sevimlilar',              ru: 'Избранное' },            icon: Star },
  reviews:   { id: 'reviews',   label: { uz: 'Sharhlar',                ru: 'Отзывы' },               icon: MessageSquare },
  contact:   { id: 'contact',   label: { uz: "Biz bilan bog'lanish",    ru: 'Связаться с нами' },     icon: Mail },
  info:      { id: 'info',      label: { uz: "Ma'lumotlarim",           ru: 'Мои данные' },           icon: Info },
};

// Telefon raqamini maskalash: oxirgi 4 raqam ko'rinadi, qolgani nuqta.
// Masalan "998908999209" → "•••••••• 92 09"
const maskPhone = (p) => {
  const d = (p || '').replace(/\D/g, '');
  if (d.length < 4) return p || '';
  const last4 = d.slice(-4);
  return `•••••••• ${last4.slice(0, 2)} ${last4.slice(2)}`;
};

// Kichik translation helper'lar (i18n locales fayllariga qo'shilmagan matnlar uchun)
const TR = {
  cabinet:    { uz: 'Kabinet',                    ru: 'Кабинет' },
  logout:     { uz: 'Akkauntdan chiqish',         ru: 'Выйти из аккаунта' },
  logoutConfirm: { uz: "Akkountdan chiqishni tasdiqlaysizmi?", ru: 'Вы действительно хотите выйти?' },
  loginRequired: { uz: 'Akkountga kiring',        ru: 'Войдите в аккаунт' },
  // Orders
  ordersTitle: { uz: 'Buyurtmalarim',             ru: 'Мои заказы' },
  fAll:       { uz: 'Barcha buyurtmalar',         ru: 'Все заказы' },
  fPending:   { uz: 'Kutilmoqda',                 ru: 'В ожидании' },
  fConfirmed: { uz: 'Tasdiqlangan',               ru: 'Подтверждён' },
  fReady:     { uz: 'Tayyor',                     ru: 'Готов к выдаче' },
  fDelivered: { uz: 'Topshirilgan',               ru: 'Доставлен' },
  fCancelled: { uz: 'Bekor qilingan',             ru: 'Отменён' },
  noOrders:   { uz: "Buyurtmalar yo'q",           ru: 'Заказов нет' },
  noOrdersHint: { uz: "Hozircha bu turdagi buyurtmangiz yo'q", ru: 'Заказов этого типа пока нет' },
  cancel:     { uz: 'Bekor qilish',               ru: 'Отменить' },
  cancelConfirm: { uz: "Buyurtmani bekor qilishni tasdiqlaysizmi?", ru: 'Отменить заказ?' },
  pickupCodeLabel: { uz: "Olib ketish kodi (punkt admin'ga ko'rsating):", ru: 'Код выдачи (покажите администратору ПВЗ):' },
  // Statuses
  sPending:   { uz: 'Buyurtmangiz tasdiqlanmoqda', ru: 'Ваш заказ обрабатывается' },
  sConfirmed: { uz: "Tasdiqlandi — punktga jo'natilmoqda", ru: 'Подтверждён — отправляется в пункт' },
  sReady:     { uz: 'Mahsulot punktda tayyor — olib ketishingiz mumkin', ru: 'Товар готов — можно забрать' },
  sDelivered: { uz: 'Buyurtma topshirildi',       ru: 'Заказ выдан' },
  sCancelled: { uz: 'Buyurtmangiz bekor qilindi', ru: 'Заказ отменён' },
  // Reviews
  reviewsTitle: { uz: 'Sharhlar',                 ru: 'Отзывы' },
  rUnwritten: { uz: 'Yozilmaganlar',              ru: 'Не написанные' },
  rMine:      { uz: 'Mening sharhlarim',          ru: 'Мои отзывы' },
  rNoUnwritten: { uz: "Sharh yozilmagan mahsulotlar yo'q", ru: 'Нет товаров без отзыва' },
  rNoUnwrittenHint: { uz: "Punktdan olib ketgan mahsulotlaringiz shu yerda chiqadi", ru: 'Товары, которые вы получили, появятся здесь' },
  rNoMine:    { uz: "Hozircha sharh yozmagansiz", ru: 'Вы пока не оставили отзывов' },
  rWrite:     { uz: '+ Sharh yozish',             ru: '+ Написать отзыв' },
  rTitle:     { uz: 'Sharh yozish',               ru: 'Написать отзыв' },
  rRating:    { uz: 'Bahoyingiz',                 ru: 'Ваша оценка' },
  rText:      { uz: 'Sharh matni (ixtiyoriy)',    ru: 'Текст отзыва (необязательно)' },
  rPlaceholder: { uz: 'Mahsulot haqida fikringizni yozing...', ru: 'Напишите ваше мнение о товаре...' },
  rSelectStar: { uz: 'Iltimos, yulduz tanlang',   ru: 'Пожалуйста, выберите оценку' },
  rSubmit:    { uz: 'Yuborish',                   ru: 'Отправить' },
  rSubmitting: { uz: 'Yuborilmoqda...',           ru: 'Отправка...' },
  cancel2:    { uz: 'Bekor qilish',               ru: 'Отмена' },
  // Info
  infoTitle:  { uz: "Ma'lumotlarim",              ru: 'Мои данные' },
  fullName:   { uz: 'Ism Familiya',               ru: 'Имя и Фамилия' },
  phone:      { uz: 'Telefon',                    ru: 'Телефон' },
  telegram:   { uz: 'Telegram',                   ru: 'Telegram' },
  email:      { uz: 'Email',                      ru: 'Email' },
  // Pickup
  pickupTitle: { uz: 'Topshirish punkti',         ru: 'Пункт выдачи' },
  mainOffice: { uz: 'Asosiy ofis',                ru: 'Главный офис' },
  // Contact
  contactTitle: { uz: "Biz bilan bog'lanish",     ru: 'Связаться с нами' },
  // Favorites
  favTitle:   { uz: 'Sevimlilar',                 ru: 'Избранное' },
  favHint:    { uz: 'Sevimlilarni alohida sahifada ko\'ring', ru: 'Просмотрите избранное на отдельной странице' },
  favPage:    { uz: 'Sevimlilar sahifasi',        ru: 'Страница избранного' },
};

const tr = (key, lang) => (TR[key] && (TR[key][lang] || TR[key].uz)) || key;

export default function ProfilePage() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith('ru') ? 'ru' : 'uz';
  // Mobil: null = menu list ko'rinadi, tab tanlansa shu content ekraniga o'tadi
  // Desktop: default 'orders' (sidebar bor)
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches) {
      return null;
    }
    return 'orders';
  });
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ssmart_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handler = () => {
      try {
        const saved = localStorage.getItem('ssmart_user');
        setUser(saved ? JSON.parse(saved) : null);
      } catch {
        setUser(null);
      }
    };
    window.addEventListener('ssmart-user-changed', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('ssmart-user-changed', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => {
    if (!confirm(tr('logoutConfirm', lang))) return;
    localStorage.removeItem('ssmart_user');
    localStorage.removeItem('ssmart_user_token');
    window.dispatchEvent(new Event('ssmart-user-changed'));
    navigate('/');
  };

  const displayName = user.full_name || user.telegram_username || user.phone || (lang === 'ru' ? 'Пользователь' : 'Foydalanuvchi');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'orders': return <OrdersTab lang={lang} />;
      case 'payment': return <PaymentTab user={user} lang={lang} />;
      case 'favorites': return <FavoritesTab navigate={navigate} lang={lang} />;
      case 'reviews': return <ReviewsTab lang={lang} />;
      case 'contact': return <ContactTab lang={lang} />;
      case 'info': return <InfoTab user={user} setUser={setUser} lang={lang} />;
      default: return null;
    }
  };

  // ==================== MOBILE LAYOUT ====================
  // Mobil: agar tab tanlanmagan bo'lsa (activeTab=null) — menyu ro'yxati
  //        tab tanlangan bo'lsa — content + back tugma
  return (
    <>
      {/* MOBILE */}
      <div className="lg:hidden">
        {activeTab === null ? (
          <div className="bg-gray-50 min-h-[60vh]">
            {/* Header: foydalanuvchi nomi */}
            <div className="px-4 py-4 flex items-center justify-end gap-2 border-b border-gray-100 bg-white">
              {user.photo_url ? (
                <img src={resolveImage(user.photo_url)} alt="" className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold">
                  {displayName[0]?.toUpperCase()}
                </div>
              )}
              <span className="font-medium text-sm text-gray-900 truncate max-w-[180px]">{displayName}</span>
            </div>

            {/* Menu list — Uzum stilida */}
            <div className="bg-white">
              {Object.values(TABS).map((tab, i) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-gray-50 ${
                      i !== 0 ? 'border-t border-gray-100' : ''
                    }`}
                  >
                    <Icon className="w-5 h-5 text-gray-700 flex-shrink-0" />
                    <span className="flex-1 text-[15px] text-gray-900">{tab.label[lang] || tab.label.uz}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                );
              })}
            </div>

            {/* Logout */}
            <div className="bg-white mt-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-primary-600 hover:bg-gray-50 font-medium"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1 text-[15px]">{tr('logout', lang)}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white min-h-[60vh]">
            {/* Back header */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
              <button
                onClick={() => setActiveTab(null)}
                className="p-1 -ml-1 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="font-semibold text-base flex-1 truncate">{TABS[activeTab]?.label?.[lang] || TABS[activeTab]?.label?.uz}</h2>
            </div>

            <div className="p-4">
              {renderTabContent()}
            </div>
          </div>
        )}
      </div>

      {/* DESKTOP — eski layout */}
      <div className="hidden lg:block container-custom py-6 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Sidebar */}
          <aside>
            <div className="card p-4 mb-4 flex items-center gap-3">
              {user.photo_url ? (
                <img src={resolveImage(user.photo_url)} alt="" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {displayName[0]?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 truncate">{displayName}</div>
                {user.phone && (
                  <div className="text-xs text-gray-500 truncate font-mono tracking-wider">
                    {maskPhone(user.phone)}
                  </div>
                )}
              </div>
            </div>

            <nav className="card p-2 space-y-1">
              {Object.values(TABS).map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 text-left">{tab.label[lang] || tab.label.uz}</span>
                  </button>
                );
              })}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-2 border-t border-gray-100 pt-3"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">{tr('logout', lang)}</span>
              </button>
            </nav>
          </aside>

          <main>
            {renderTabContent()}
          </main>
        </div>
      </div>
    </>
  );
}

const STATUS_META = {
  pending:   { trKey: 'sPending',   color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  confirmed: { trKey: 'sConfirmed', color: 'bg-blue-50 text-blue-700 border-blue-200',    icon: Clock },
  ready:     { trKey: 'sReady',     color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle2 },
  delivered: { trKey: 'sDelivered', color: 'bg-gray-100 text-gray-700 border-gray-200',   icon: CheckCircle2 },
  cancelled: { trKey: 'sCancelled', color: 'bg-red-50 text-red-700 border-red-200',       icon: XCircle },
};

function formatPrice(n) {
  return new Intl.NumberFormat('uz-UZ').format(n);
}

function OrdersTab({ lang = 'uz' }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      const list = await ordersApi.myOrders();
      setOrders(list);
    } catch (e) {
      setError(e.message || (lang === 'ru' ? "Не удалось загрузить заказы" : "Buyurtmalarni yuklab bo'lmadi"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const handleCancel = async (id) => {
    if (!confirm(tr('cancelConfirm', lang))) return;
    try {
      await ordersApi.cancelMine(id);
      await refresh();
    } catch (e) {
      alert((lang === 'ru' ? 'Ошибка при отмене: ' : "Bekor qilishda xato: ") + (e.message || ''));
    }
  };

  const filtered = orders.filter(o => {
    if (filter === 'all') return true;
    if (filter === 'active') return o.status === 'pending' || o.status === 'confirmed';
    return o.status === filter;
  });

  const filters = [
    { id: 'all',       label: tr('fAll', lang) },
    { id: 'pending',   label: tr('fPending', lang) },
    { id: 'confirmed', label: tr('fConfirmed', lang) },
    { id: 'cancelled', label: tr('fCancelled', lang) },
  ];

  return (
    <div>
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-5 hidden lg:block">{tr('ordersTitle', lang)}</h1>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f.id
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">{tr('noOrders', lang)}</h3>
          <p className="text-sm text-gray-500">{tr('noOrdersHint', lang)}</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map(order => {
            const meta = STATUS_META[order.status] || STATUS_META.pending;
            const Icon = meta.icon;
            return (
              <div key={order.id} className="card p-4">
                <div className={`mb-3 px-3 py-2 rounded-lg border ${meta.color} flex items-center gap-2 text-sm font-medium`}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{tr(meta.trKey, lang)}</span>
                  <span className="text-xs opacity-75">#{order.id}</span>
                </div>

                {order.status === 'ready' && order.pickupCode && (
                  <div className="mb-3 p-3 bg-green-50 border-2 border-dashed border-green-300 rounded-lg text-center">
                    <div className="text-xs text-green-700 mb-1 font-medium flex items-center justify-center gap-1.5">
                      <FluentEmoji name="numbers" size={14} /> {tr('pickupCodeLabel', lang)}
                    </div>
                    <div className="font-mono text-2xl font-bold text-green-900 tracking-[0.3em] py-1">
                      {order.pickupCode}
                    </div>
                  </div>
                )}

                <div className="space-y-2 mb-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      {item.image && (
                        <img
                          src={resolveImage(item.image)}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover bg-gray-50 flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {item.name?.[lang] || item.name?.uz || item.name?.ru || '—'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.qty} × {formatPrice(item.price)} so'm
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-gray-600 space-y-1 pt-3 border-t border-gray-100">
                  {order.deliveryType === 'pickup' && order.pickupPointName && (
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span>{order.pickupPointName.uz} — {order.pickupPointAddress?.uz}</span>
                    </div>
                  )}
                  {order.deliveryType === 'courier' && (
                    <div className="flex items-center gap-1.5"><FluentEmoji name="package" size={12} /> Yetkazib berish: {order.deliveryAddress}</div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="font-bold text-lg">{formatPrice(order.total)} so'm</span>
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(order.id)}
                      className="text-sm text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors"
                    >
                      {tr('cancel', lang)}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StarRow({ value, onChange, size = 6 }) {
  const cls = `w-${size} h-${size}`;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          className={onChange ? "transition-transform hover:scale-110" : ""}
          disabled={!onChange}
        >
          <Star
            className={cls}
            fill={n <= value ? "#f59e0b" : "none"}
            stroke={n <= value ? "#f59e0b" : "#9ca3af"}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewsTab({ lang = 'uz' }) {
  const [tab, setTab] = useState('pending'); // 'pending' | 'mine'
  const [pending, setPending] = useState([]);
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingItem, setEditingItem] = useState(null); // {productId, orderId, name, image}

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      const [p, m] = await Promise.all([
        reviewsApi.myPending(),
        reviewsApi.myReviews(),
      ]);
      setPending(p);
      setMine(m);
    } catch (e) {
      setError(e.message || "Yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  return (
    <div>
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-5 hidden lg:block">{tr('reviewsTitle', lang)}</h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('pending')}
          className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
            tab === 'pending'
              ? 'bg-gray-900 text-white'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {tr('rUnwritten', lang)} {pending.length > 0 && (
            <span className={`ml-1.5 inline-block min-w-[20px] px-1.5 rounded-full text-xs ${
              tab === 'pending' ? 'bg-white text-gray-900' : 'bg-primary-600 text-white'
            }`}>{pending.length}</span>
          )}
        </button>
        <button
          onClick={() => setTab('mine')}
          className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
            tab === 'mine'
              ? 'bg-gray-900 text-white'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {tr('rMine', lang)}
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {!loading && tab === 'pending' && (
        pending.length === 0 ? (
          <div className="card p-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">{tr('rNoUnwritten', lang)}</p>
            <p className="text-xs text-gray-400 mt-1">{tr('rNoUnwrittenHint', lang)}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pending.map((item) => (
              <div key={`${item.productId}-${item.orderId}`} className="card p-3 flex gap-3">
                <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                  {item.image && (
                    <img
                      src={resolveImage(item.image)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="font-medium text-sm line-clamp-2">{item.name?.[lang] || item.name?.uz || item.name?.ru}</div>
                  <button
                    onClick={() => setEditingItem(item)}
                    className="mt-auto self-start text-xs px-3 py-1.5 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-full font-medium transition-colors"
                  >
                    {tr('rWrite', lang)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {!loading && tab === 'mine' && (
        mine.length === 0 ? (
          <div className="card p-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">{tr('rNoMine', lang)}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {mine.map((r) => (
              <div key={r.id} className="card p-4">
                <div className="flex gap-3 mb-3">
                  <div className="w-14 h-14 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                    {r.productImage && (
                      <img src={resolveImage(r.productImage)} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{r.productName?.[lang] || r.productName?.uz || '—'}</div>
                    <StarRow value={r.rating} size={4} />
                  </div>
                </div>
                {r.text && <p className="text-sm text-gray-700">{r.text}</p>}
                <div className="text-xs text-gray-400 mt-2">
                  {new Date(r.createdAt).toLocaleDateString('uz-UZ')}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {editingItem && (
        <ReviewModal
          item={editingItem}
          lang={lang}
          onClose={() => setEditingItem(null)}
          onSaved={async () => { setEditingItem(null); await refresh(); }}
        />
      )}
    </div>
  );
}

function ReviewModal({ item, lang = 'uz', onClose, onSaved }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (rating < 1) {
      setError(tr('rSelectStar', lang));
      return;
    }
    setSubmitting(true);
    try {
      await reviewsApi.create({
        productId: item.productId,
        orderId: item.orderId,
        rating,
        text: text.trim() || null,
      });
      onSaved();
    } catch (e) {
      setError(e.message || (lang === 'ru' ? "Не удалось отправить" : "Yuborib bo'lmadi"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{tr('rTitle', lang)}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="flex gap-3 items-center">
            <div className="w-14 h-14 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
              {item.image && (
                <img src={resolveImage(item.image)} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="font-medium text-sm">{item.name?.[lang] || item.name?.uz || item.name?.ru}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tr('rRating', lang)}</label>
            <StarRow value={rating} onChange={setRating} size={8} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {tr('rText', lang)}
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={tr('rPlaceholder', lang)}
              rows={4}
              maxLength={2000}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm resize-none"
            />
            <div className="text-[10px] text-gray-400 text-right mt-1">{text.length} / 2000</div>
          </div>

          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{error}</div>
          )}

          <div className="flex gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn-secondary flex-1 disabled:opacity-50"
            >
              {tr('cancel2', lang)}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {submitting ? tr('rSubmitting', lang) : tr('rSubmit', lang)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Ism/Familiya auto-mask: faqat harflar + apostrof + tire + probel.
// Birinchi harfni katta qiladi.
const formatNamePart = (raw) => {
  const cleaned = (raw || '').replace(/[^A-Za-zА-Яа-яЁёҲҳҒғҚқЎўҶҷ'\- ]/g, '').replace(/\s+/g, ' ');
  if (!cleaned) return '';
  return cleaned
    .split(' ')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ''))
    .join(' ');
};

function InfoTab({ user, setUser, lang = 'uz' }) {
  const initialParts = (user.full_name || '').split(' ');
  const [firstName, setFirstName] = useState(initialParts[0] || '');
  const [lastName, setLastName] = useState(initialParts.slice(1).join(' ') || '');
  const [birthDate, setBirthDate] = useState(user.birth_date || '');
  const [photoUrl, setPhotoUrl] = useState(user.photo_url || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onPickPhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    setSuccess('');
    setUploading(true);
    try {
      const url = await authApi.uploadAvatar(file);
      // Profilga darhol yozib qo'yamiz — backend eski faylni o'chiradi
      const updated = await authApi.updateProfile({ photo_url: url });
      setPhotoUrl(updated.photo_url || url);
      // localStorage va sahifadagi user obyektini yangilaymiz
      const newUser = { ...user, photo_url: updated.photo_url || url };
      localStorage.setItem('ssmart_user', JSON.stringify(newUser));
      window.dispatchEvent(new Event('ssmart-user-changed'));
      if (setUser) setUser(newUser);
      setSuccess(lang === 'ru' ? 'Фото обновлено' : 'Rasm yangilandi');
      setTimeout(() => setSuccess(''), 2000);
    } catch (e) {
      setError(e.message || (lang === 'ru' ? 'Ошибка загрузки' : "Rasm yuklab bo'lmadi"));
    } finally {
      setUploading(false);
    }
  };

  const saveProfile = async () => {
    setError('');
    setSuccess('');
    if (firstName.trim().length < 2) {
      setError(lang === 'ru' ? 'Введите имя (мин. 2 символа)' : 'Ismni kiriting (kamida 2 belgi)');
      return;
    }
    if (lastName.trim().length < 2) {
      setError(lang === 'ru' ? 'Введите фамилию (мин. 2 символа)' : 'Familiyani kiriting (kamida 2 belgi)');
      return;
    }
    setSaving(true);
    try {
      const updated = await authApi.updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        birth_date: birthDate || null,
      });
      const newUser = { ...user, full_name: updated.full_name, birth_date: updated.birth_date };
      localStorage.setItem('ssmart_user', JSON.stringify(newUser));
      window.dispatchEvent(new Event('ssmart-user-changed'));
      if (setUser) setUser(newUser);
      setSuccess(lang === 'ru' ? 'Сохранено' : 'Saqlandi');
      setTimeout(() => setSuccess(''), 2000);
    } catch (e) {
      setError(e.message || (lang === 'ru' ? 'Не удалось сохранить' : "Saqlab bo'lmadi"));
    } finally {
      setSaving(false);
    }
  };

  const initial = (firstName || lastName || user.full_name || user.phone || '?')[0]?.toUpperCase();

  return (
    <div>
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-5 hidden lg:block">{tr('infoTitle', lang)}</h1>

      {/* Avatar + foto upload */}
      <div className="card p-5 mb-4 flex items-center gap-4">
        <div className="relative flex-shrink-0">
          {photoUrl ? (
            <img src={resolveImage(photoUrl)} alt="" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary-600 text-white flex items-center justify-center text-2xl font-bold">
              {initial}
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <label className="inline-flex items-center gap-2 px-3 py-2 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg text-sm font-medium cursor-pointer">
            <Camera className="w-4 h-4" />
            {lang === 'ru' ? 'Загрузить фото' : 'Rasm yuklash'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPickPhoto}
              disabled={uploading}
            />
          </label>
          <p className="text-xs text-gray-500 mt-1.5">
            {lang === 'ru'
              ? 'JPG, PNG, WEBP. Макс. 5 МБ. Старое фото удаляется автоматически.'
              : 'JPG, PNG, WEBP. Maksimum 5 MB. Eski rasm avtomatik o\'chadi.'}
          </p>
        </div>
      </div>

      {/* Ism / Familiya / Tug'ilgan kun */}
      <div className="card p-5 mb-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {lang === 'ru' ? 'Имя' : 'Ism'}
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(formatNamePart(e.target.value))}
              autoComplete="given-name"
              maxLength={120}
              placeholder="Ali"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:bg-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {lang === 'ru' ? 'Фамилия' : 'Familiya'}
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(formatNamePart(e.target.value))}
              autoComplete="family-name"
              maxLength={120}
              placeholder="Aliyev"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:bg-white text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {lang === 'ru' ? 'Дата рождения' : "Tug'ilgan kun"}
          </label>
          <input
            type="date"
            value={birthDate || ''}
            onChange={(e) => setBirthDate(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
            min="1920-01-01"
            className="w-full sm:max-w-[240px] px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:bg-white text-sm"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 flex items-start gap-2">
            <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {success}
          </div>
        )}

        <button
          type="button"
          onClick={saveProfile}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {lang === 'ru' ? 'Сохранить' : 'Saqlash'}
        </button>
      </div>

      {/* Limit — Tez kunda */}
      <div className="card p-5 flex items-center justify-between gap-3 opacity-90">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-gray-900">Limit</div>
            <div className="text-xs text-gray-500">
              {lang === 'ru' ? 'Кредитный лимит для покупок' : "Xaridlar uchun kredit limiti"}
            </div>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-amber-100 text-amber-800 rounded-full whitespace-nowrap">
          {lang === 'ru' ? 'Скоро' : 'Tez kunda'}
        </span>
      </div>
    </div>
  );
}

function FavoritesTab({ navigate, lang = 'uz' }) {
  return (
    <div>
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-5 hidden lg:block">{tr('favTitle', lang)}</h1>
      <div className="card p-12 text-center">
        <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500 mb-4">{tr('favHint', lang)}</p>
        <button
          onClick={() => navigate('/favorites')}
          className="btn-primary"
        >
          {tr('favPage', lang)}
        </button>
      </div>
    </div>
  );
}

function PickupTab({ lang = 'uz' }) {
  return (
    <div>
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-5 hidden lg:block">{tr('pickupTitle', lang)}</h1>
      <div className="card p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <MapPin className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">{tr('mainOffice', lang)}</div>
            <div className="text-sm text-gray-600">{lang === 'ru' ? 'г. Карши, ул. И.Каримова 276' : "Qarshi sh., I.Karimov ko'chasi 276-uy"}</div>
            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1"><FluentEmoji name="clock" size={12} /> {lang === 'ru' ? 'Ежедневно' : 'Har kuni'} 09:00 - 21:00</div>
            <div className="text-xs text-gray-500 flex items-center gap-1"><FluentEmoji name="phone" size={12} /> +998 94 808 00 55</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactTab({ lang = 'uz' }) {
  return (
    <div>
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-5 hidden lg:block">{tr('contactTitle', lang)}</h1>
      <div className="space-y-3">
        <a
          href="tel:+998948080055"
          className="card p-4 flex items-center gap-3 hover:bg-gray-50"
        >
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
            <FluentEmoji name="phone" size={22} />
          </div>
          <div>
            <div className="text-xs text-gray-500">{tr('phone', lang)}</div>
            <div className="font-medium">+998 94 808 00 55</div>
          </div>
        </a>

        <a
          href="https://t.me/ssmart_uz"
          target="_blank"
          rel="noopener noreferrer"
          className="card p-4 flex items-center gap-3 hover:bg-gray-50"
        >
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <Send className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500">Telegram</div>
            <div className="font-medium">@ssmart_uz</div>
          </div>
        </a>

        <a
          href="mailto:info@ssmart.uz"
          className="card p-4 flex items-center gap-3 hover:bg-gray-50"
        >
          <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500">Email</div>
            <div className="font-medium">info@ssmart.uz</div>
          </div>
        </a>
      </div>
    </div>
  );
}

function LanguageTab() {
  const [current, setCurrent] = useState(() => {
    try { return localStorage.getItem('i18nextLng') || 'uz'; } catch { return 'uz'; }
  });
  const langs = [
    { id: 'uz', label: "O'zbekcha", flag: 'flag-uz' },
    { id: 'ru', label: 'Русский', flag: 'flag-ru' },
  ];
  const change = (id) => {
    setCurrent(id);
    try {
      localStorage.setItem('i18nextLng', id);
      document.documentElement.lang = id;
      window.location.reload();
    } catch { /* skip */ }
  };
  return (
    <div>
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-5 hidden lg:block">Sayt tili</h1>
      <div className="card divide-y divide-gray-100">
        {langs.map(l => (
          <button
            key={l.id}
            onClick={() => change(l.id)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 ${
              current === l.id ? 'text-primary-600 font-semibold' : 'text-gray-900'
            }`}
          >
            <FluentEmoji name={l.flag} size={28} />
            <span className="flex-1">{l.label}</span>
            {current === l.id && <FluentEmoji name="check" size={18} />}
          </button>
        ))}
      </div>
    </div>
  );
}

// ========================================================================
// "Qulay to'lov" — sun'iy plastik karta + 12 oylik tranzaksiya tarixi
// ========================================================================

const cardStorageKey = (userId) => `ssmart_card_${userId}`;

// Karta raqamini "XXXX XXXX XXXX XXXX" formatga keltirish
const formatCardNumber = (digits) => {
  const d = (digits || '').replace(/\D/g, '').slice(0, 16);
  return d.match(/.{1,4}/g)?.join(' ') || '';
};
const maskCardNumber = (digits) => {
  const d = (digits || '').replace(/\D/g, '');
  if (d.length < 4) return d;
  const last4 = d.slice(-4);
  return `•••• •••• •••• ${last4}`;
};

// Muddat MM/YY ko'rinishi
const formatExpiry = (digits) => {
  const d = (digits || '').replace(/\D/g, '').slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
};

// Karta amal qilish muddati: MM 01-12, YY 26-35 (joriy yil va 9 yildan oshmasin)
const validateExpiry = (digits) => {
  const d = (digits || '').replace(/\D/g, '');
  if (d.length !== 4) return false;
  const mm = parseInt(d.slice(0, 2), 10);
  const yy = parseInt(d.slice(2, 4), 10);
  if (mm < 1 || mm > 12) return false;
  const now = new Date();
  const curYY = now.getFullYear() % 100;
  if (yy < curYY || yy > curYY + 10) return false;
  // joriy oydan oldin bo'lmasin
  if (yy === curYY && mm < (now.getMonth() + 1)) return false;
  return true;
};

const validateCardNumber = (digits) => {
  const d = (digits || '').replace(/\D/g, '');
  return d.length === 16;
};

// Deterministik PRNG (mulberry32) — karta raqami so'nggi 8 raqami seed
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const fmtPriceUZS = (n) => new Intl.NumberFormat('uz-UZ').format(Math.round(n));

const MONTHS_UZ = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
const MONTHS_RU = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

const CATEGORIES = [
  { uz: 'Ssmart Shop',          ru: 'Ssmart Shop',         icon: 'cart',       kind: 'spend', minAmt: 80000,  maxAmt: 1800000 },
  { uz: 'Korzinka',             ru: 'Korzinka',            icon: 'shopping',   kind: 'spend', minAmt: 50000,  maxAmt: 600000 },
  { uz: 'Yandex Taxi',          ru: 'Яндекс Такси',        icon: 'taxi',       kind: 'spend', minAmt: 15000,  maxAmt: 90000 },
  { uz: 'Beeline / Ucell',      ru: 'Beeline / Ucell',     icon: 'phone',      kind: 'spend', minAmt: 20000,  maxAmt: 200000 },
  { uz: 'Kommunal to\'lov',     ru: 'Коммунальные',        icon: 'home',       kind: 'spend', minAmt: 80000,  maxAmt: 450000 },
  { uz: 'Internet (UzOnline)',  ru: 'Интернет',            icon: 'internet',   kind: 'spend', minAmt: 60000,  maxAmt: 250000 },
  { uz: 'Click / Payme P2P',    ru: 'Click / Payme P2P',   icon: 'transfer',   kind: 'spend', minAmt: 50000,  maxAmt: 800000 },
  { uz: 'Bankomatdan yechildi', ru: 'Снятие наличных',     icon: 'cash',       kind: 'spend', minAmt: 200000, maxAmt: 2000000 },
  { uz: 'Ish haqi',             ru: 'Зарплата',            icon: 'salary',     kind: 'income', minAmt: 3500000, maxAmt: 8500000 },
  { uz: 'P2P o\'tkazma',        ru: 'P2P перевод',         icon: 'inbox',      kind: 'income', minAmt: 100000, maxAmt: 1500000 },
];

// Karta raqamidan oxirgi 8 raqamni seedga aylantiramiz, so'ng 12 oylik history yasaymiz
function generateHistory(cardDigits) {
  const seedStr = (cardDigits || '0').slice(-8) || '0';
  const seed = parseInt(seedStr, 10) || 123456;
  const rng = mulberry32(seed);

  const now = new Date();
  const months = [];
  let runningBalance = Math.floor(rng() * 5000000) + 800000; // boshlang'ich balans

  // 12 oylik (eng yangi oy birinchi)
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabelUz = `${MONTHS_UZ[d.getMonth()]} ${d.getFullYear()}`;
    const monthLabelRu = `${MONTHS_RU[d.getMonth()]} ${d.getFullYear()}`;

    const txCount = 6 + Math.floor(rng() * 10); // 6..15
    const txs = [];
    let monthIncome = 0;
    let monthSpend = 0;

    for (let j = 0; j < txCount; j++) {
      const cat = CATEGORIES[Math.floor(rng() * CATEGORIES.length)];
      const amt = Math.floor(cat.minAmt + rng() * (cat.maxAmt - cat.minAmt));
      // Sanasi shu oy ichida
      const day = 1 + Math.floor(rng() * 28);
      const dateObj = new Date(d.getFullYear(), d.getMonth(), day);
      txs.push({
        id: `${i}-${j}`,
        category: cat,
        amount: amt,
        kind: cat.kind,
        date: dateObj,
      });
      if (cat.kind === 'income') monthIncome += amt;
      else monthSpend += amt;
    }
    // Har oy uchun bitta ish haqi qo'shamiz (agar yo'q bo'lsa)
    if (!txs.some(t => t.kind === 'income')) {
      const salary = 4000000 + Math.floor(rng() * 3000000);
      txs.push({
        id: `${i}-salary`,
        category: CATEGORIES.find(c => c.uz === 'Ish haqi'),
        amount: salary,
        kind: 'income',
        date: new Date(d.getFullYear(), d.getMonth(), 5),
      });
      monthIncome += salary;
    }
    txs.sort((a, b) => b.date - a.date);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      labelUz: monthLabelUz,
      labelRu: monthLabelRu,
      income: monthIncome,
      spend: monthSpend,
      txs,
    });
    runningBalance += (monthIncome - monthSpend);
  }
  return { months, balance: runningBalance };
}

function loadCard(userId) {
  try {
    const raw = localStorage.getItem(cardStorageKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.digits || parsed.digits.length !== 16) return null;
    return parsed;
  } catch { return null; }
}

function PaymentTab({ user, lang = 'uz' }) {
  const [card, setCard] = useState(() => loadCard(user.id));
  const [showSetup, setShowSetup] = useState(false);

  // Setup form state
  const [digits, setDigits] = useState('');
  const [expiryDigits, setExpiryDigits] = useState('');
  const [error, setError] = useState('');

  const isCardValid = validateCardNumber(digits);
  const isExpiryValid = validateExpiry(expiryDigits);

  const saveCard = () => {
    setError('');
    if (!isCardValid) {
      setError(lang === 'ru' ? 'Введите 16-значный номер карты' : "16 xonali karta raqamini kiriting");
      return;
    }
    if (!isExpiryValid) {
      setError(lang === 'ru' ? 'Неверный срок (MM/YY)' : "Karta muddati noto'g'ri (MM/YY)");
      return;
    }
    const data = {
      digits,
      expiry: expiryDigits,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(cardStorageKey(user.id), JSON.stringify(data));
    setCard(data);
    setShowSetup(false);
    setDigits('');
    setExpiryDigits('');
  };

  const removeCard = () => {
    if (!confirm(lang === 'ru' ? 'Удалить карту?' : "Kartani o'chirishni tasdiqlaysizmi?")) return;
    localStorage.removeItem(cardStorageKey(user.id));
    setCard(null);
  };

  if (!card || showSetup) {
    return (
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 hidden lg:block">
          {lang === 'ru' ? 'Удобная оплата' : "Qulay to'lov"}
        </h1>
        <p className="text-sm text-gray-500 mb-5">
          {lang === 'ru'
            ? 'Привяжите карту, чтобы видеть ваши расходы и поступления за последний год.'
            : "O'tgan bir yillik xarajatlar va kirimlar tarixini ko'rish uchun kartani bog'lang."}
        </p>

        <div className="card max-w-md p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {lang === 'ru' ? 'Номер карты' : 'Karta raqami'}
            </label>
            <div className="relative">
              <CreditCard className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                inputMode="numeric"
                autoComplete="cc-number"
                value={formatCardNumber(digits)}
                onChange={(e) => setDigits(e.target.value.replace(/\D/g, '').slice(0, 16))}
                placeholder="8600 0000 0000 0000"
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:bg-white text-base font-mono tracking-wider"
              />
            </div>
          </div>

          <div className="max-w-[160px]">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {lang === 'ru' ? 'Срок (MM/YY)' : 'Muddat (MM/YY)'}
            </label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="cc-exp"
              value={formatExpiry(expiryDigits)}
              onChange={(e) => setExpiryDigits(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="MM/YY"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:bg-white text-base font-mono text-center tracking-wider"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{error}</div>
          )}

          <div className="flex gap-2 pt-1">
            {showSetup && card && (
              <button
                type="button"
                onClick={() => { setShowSetup(false); setDigits(''); setExpiryDigits(''); setError(''); }}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
              >
                {lang === 'ru' ? 'Отмена' : 'Bekor qilish'}
              </button>
            )}
            <button
              type="button"
              onClick={saveCard}
              disabled={!isCardValid || !isExpiryValid}
              className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {lang === 'ru' ? 'Сохранить' : 'Saqlash'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Karta saqlangan — plastik karta + tranzaksiyalar
  const { months, balance } = generateHistory(card.digits);
  const holder = (user.full_name || user.phone || 'CARDHOLDER').toUpperCase();

  return (
    <div>
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-5 hidden lg:block">
        {lang === 'ru' ? 'Удобная оплата' : "Qulay to'lov"}
      </h1>

      {/* Plastik karta */}
      <div className="relative max-w-md mb-5">
        <div
          className="rounded-2xl p-5 text-white shadow-xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 45%, #db2777 100%)',
            minHeight: '200px',
          }}
        >
          <div
            className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #fff, transparent 70%)' }}
          />
          <div className="flex items-start justify-between mb-7 relative">
            <div className="text-xs uppercase tracking-wider opacity-80">SSMART Card</div>
            <CreditCard className="w-7 h-7 opacity-80" />
          </div>
          <div className="font-mono text-lg sm:text-xl tracking-[0.18em] mb-5 relative">
            {maskCardNumber(card.digits)}
          </div>
          <div className="flex items-end justify-between text-xs relative">
            <div className="min-w-0">
              <div className="opacity-70 text-[10px] uppercase tracking-wider mb-0.5">
                {lang === 'ru' ? 'Владелец' : 'Egasi'}
              </div>
              <div className="font-semibold truncate">{holder}</div>
            </div>
            <div>
              <div className="opacity-70 text-[10px] uppercase tracking-wider mb-0.5">
                {lang === 'ru' ? 'Срок' : 'Muddat'}
              </div>
              <div className="font-mono font-semibold">{formatExpiry(card.expiry)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Balans */}
      <div className="card p-4 mb-5 max-w-md flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">
            {lang === 'ru' ? 'Баланс' : 'Joriy balans'}
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {fmtPriceUZS(balance)} <span className="text-sm text-gray-500 font-normal">so'm</span>
          </div>
        </div>
        <button
          type="button"
          onClick={removeCard}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
          title={lang === 'ru' ? 'Удалить' : "O'chirish"}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Oylik tranzaksiyalar */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-gray-900">
          {lang === 'ru' ? 'История за 12 месяцев' : "12 oylik tarix"}
        </h2>
        {months.map((m) => (
          <details key={m.key} className="card overflow-hidden group">
            <summary className="px-4 py-3 cursor-pointer list-none flex items-center justify-between hover:bg-gray-50">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900">
                  {lang === 'ru' ? m.labelRu : m.labelUz}
                </div>
                <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-3">
                  <span className="text-green-700 flex items-center gap-0.5">
                    <ArrowDownLeft className="w-3 h-3" /> +{fmtPriceUZS(m.income)}
                  </span>
                  <span className="text-red-700 flex items-center gap-0.5">
                    <ArrowUpRight className="w-3 h-3" /> −{fmtPriceUZS(m.spend)}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform" />
            </summary>
            <div className="divide-y divide-gray-100 border-t border-gray-100">
              {m.txs.map((tx) => (
                <div key={tx.id} className="px-4 py-2.5 flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                      tx.kind === 'income'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {tx.kind === 'income'
                      ? <ArrowDownLeft className="w-4 h-4" />
                      : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {lang === 'ru' ? tx.category.ru : tx.category.uz}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {tx.date.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'uz-UZ', { day: '2-digit', month: 'short' })}
                    </div>
                  </div>
                  <div className={`text-sm font-semibold ${tx.kind === 'income' ? 'text-green-700' : 'text-gray-900'}`}>
                    {tx.kind === 'income' ? '+' : '−'}{fmtPriceUZS(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
