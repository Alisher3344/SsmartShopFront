import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Minus, Trash2, ShoppingBag, Check, MapPin } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useAdminData } from '../context/AdminDataContext';
import { useAuthGate } from '../context/AuthGateContext';
import { formatPrice } from '../data/products';
import { ordersApi } from '../api/client';
import FluentEmoji from '../components/FluentEmoji';

export default function CartPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { cart, updateQty, removeFromCart, cartTotal, clearCart } = useShop();
  const { activePickupPoints, products } = useAdminData();
  const { requireAuth } = useAuthGate();
  const lang = i18n.language;

  const [pickupPointId, setPickupPointId] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [payment, setPayment] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [comment, setComment] = useState('');
  const [address, setAddress] = useState('');
  const [user, setUser] = useState(null);

  // Foydalanuvchi ma'lumotlarini localStorage'dan o'qib turamiz
  useEffect(() => {
    const sync = () => {
      try {
        const saved = localStorage.getItem('ssmart_user');
        setUser(saved ? JSON.parse(saved) : null);
      } catch {
        setUser(null);
      }
    };
    sync();
    window.addEventListener('ssmart-user-changed', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('ssmart-user-changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const deliveryFee = delivery === 'courier' ? 25000 : 0;
  const total = cartTotal + deliveryFee;
  const selectedPoint = activePickupPoints.find(p => p.id === pickupPointId);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const placeOrder = async () => {
    setSubmitError('');
    setSubmitting(true);
    try {
      await ordersApi.create({
        items: cart.map(i => ({ productId: i.id, qty: i.qty })),
        deliveryType: delivery,
        pickupPointId: delivery === 'pickup' ? pickupPointId : null,
        deliveryAddress: delivery === 'courier' ? address : null,
        paymentMethod: payment,
        comment: comment || null,
      });
      setOrderSuccess(true);
      setTimeout(() => {
        clearCart();
        navigate('/profile');
      }, 2000);
    } catch (e) {
      setSubmitError(e.message || "Buyurtma yuborilmadi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = () => {
    if (!delivery) {
      alert("Iltimos, yetkazib berish turini tanlang");
      return;
    }
    if (delivery === 'pickup' && !pickupPointId) {
      alert("Iltimos, topshirish punktini tanlang");
      return;
    }
    if (!payment) {
      alert("Iltimos, to'lov usulini tanlang");
      return;
    }
    requireAuth(() => {
      // Login tekshiruvi tugagandan keyin user state'ni yangilab buyurtmani beramiz
      try {
        const saved = localStorage.getItem('ssmart_user');
        const u = saved ? JSON.parse(saved) : null;
        setUser(u);
        if (!u) {
          alert("Tizimga kiring");
          return;
        }
        placeOrder();
      } catch {
        alert("Xatolik yuz berdi");
      }
    });
  };

  if (orderSuccess) {
    return (
      <div className="container-custom py-20 text-center animate-fade-in">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{t('checkout.success')}</h2>
        <p className="text-gray-500">{t('checkout.successDesc')}</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container-custom py-20 text-center animate-fade-in">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold mb-2">{t('cart.empty')}</h2>
        <p className="text-gray-500 mb-6">{t('cart.emptyDesc')}</p>
        <Link to="/catalog" className="btn-primary inline-block">
          {t('cart.goShopping')}
        </Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-6 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">{t('cart.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {cart.map(item => {
            const liveProduct = products.find(p => p.id === item.id);
            const stock = liveProduct?.stock ?? item.stock ?? 0;
            const reachedMax = item.qty >= stock;
            return (
              <div key={item.id} className="card p-4 flex gap-3 sm:gap-4">
                <Link to={`/product/${item.id}`} className="flex-shrink-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-lg overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name[lang]}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://placehold.co/200x200/e5e7eb/6b7280?text=${item.id}`;
                      }}
                    />
                  </div>
                </Link>

                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.id}`}>
                    <h3 className="font-medium text-sm sm:text-base mb-1 hover:text-primary-600 transition-colors line-clamp-2">
                      {item.name[lang]}
                    </h3>
                  </Link>
                  <div className="text-base sm:text-lg font-bold mb-2">
                    {formatPrice(item.price * item.qty)} {t('common.currency')}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
                      <button
                        onClick={() => updateQty(item.id, -1, stock)}
                        disabled={item.qty <= 1}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-md hover:bg-white disabled:opacity-40 transition-colors flex items-center justify-center"
                      >
                        <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <span className="px-2 text-sm font-medium min-w-[24px] text-center">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, 1, stock)}
                        disabled={reachedMax}
                        title={reachedMax ? `Faqat ${stock} ta mavjud` : ''}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-md hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      aria-label={t('cart.remove')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {reachedMax && (
                    <div className="text-[11px] text-amber-700 mt-1.5 flex items-center gap-1">
                      <FluentEmoji name="warning" size={12} /> Maksimal {stock} ta mavjud
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          {/* Topshirish punkti — faqat olib ketish tanlanganda ko'rinadi */}
          {delivery === 'pickup' && (
            <div className="card p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-600" />
                Topshirish punkti
              </h3>
              {activePickupPoints.length === 0 ? (
                <p className="text-sm text-gray-500">Topshirish punktlari mavjud emas</p>
              ) : (
                <div className="space-y-2">
                  {activePickupPoints.map(point => (
                    <label
                      key={point.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        pickupPointId === point.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        checked={pickupPointId === point.id}
                        onChange={() => setPickupPointId(point.id)}
                        className="mt-1 accent-primary-600"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm">{point.name[lang] || point.name.uz}</div>
                        <div className="text-xs text-gray-600 mt-0.5">
                          {point.address[lang] || point.address.uz}
                        </div>
                        {point.work_hours && (
                          <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1"><FluentEmoji name="clock" size={12} /> {point.work_hours}</div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Delivery */}
          <div className="card p-4">
            <h3 className="font-semibold mb-3">{t('cart.delivery')}</h3>
            <div className="space-y-2">
              {[
                { id: 'pickup', label: t('cart.pickup'), desc: t('cart.pickupDesc'), disabled: false },
                { id: 'courier', label: t('cart.courier'), desc: t('cart.courierDesc'), disabled: true },
              ].map(opt => (
                <label
                  key={opt.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                    opt.disabled
                      ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                      : delivery === opt.id
                        ? 'border-primary-500 bg-primary-50 cursor-pointer'
                        : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                  }`}
                >
                  <input
                    type="radio"
                    checked={delivery === opt.id}
                    disabled={opt.disabled}
                    onChange={() => !opt.disabled && setDelivery(opt.id)}
                    className="mt-1 accent-primary-600"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm flex items-center gap-2">
                      {opt.label}
                      {opt.disabled && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                          TEZ KUNDA
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {opt.disabled ? "Hozircha kuryer xizmati qo'shilmagan" : opt.desc}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div className="card p-4">
            <h3 className="font-semibold mb-3">{t('cart.payment')}</h3>
            <div className="space-y-2">
              {[
                { id: 'card', label: t('cart.card'), desc: t('cart.cardDesc'), disabled: true },
                { id: 'cash', label: t('cart.cash'), desc: t('cart.cashDesc'), disabled: false },
              ].map(opt => (
                <label
                  key={opt.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                    opt.disabled
                      ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                      : payment === opt.id
                        ? 'border-primary-500 bg-primary-50 cursor-pointer'
                        : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                  }`}
                >
                  <input
                    type="radio"
                    checked={payment === opt.id}
                    disabled={opt.disabled}
                    onChange={() => !opt.disabled && setPayment(opt.id)}
                    className="mt-1 accent-primary-600"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm flex items-center gap-2">
                      {opt.label}
                      {opt.disabled && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                          TEZ KUNDA
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {opt.disabled ? "Hozircha karta orqali to'lash qo'shilmagan" : opt.desc}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="card p-4">
            <div className="space-y-2 mb-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('cart.products')}</span>
                <span>{formatPrice(cartTotal)} {t('common.currency')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('cart.deliveryFee')}</span>
                <span>{deliveryFee === 0 ? t('cart.free') : `${formatPrice(deliveryFee)} ${t('common.currency')}`}</span>
              </div>
            </div>
            <div className="border-t pt-3 flex justify-between font-bold text-lg mb-4">
              <span>{t('cart.total')}</span>
              <span>{formatPrice(total)} {t('common.currency')}</span>
            </div>

            {/* Foydalanuvchi ma'lumotlari (login bo'lgan bo'lsa) - readonly */}
            {user && (
              <div className="mb-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-700 space-y-1">
                <div>
                  <span className="text-gray-500">Buyurtmani qabul qiluvchi:</span>{' '}
                  <strong>{user.full_name || user.telegram_username}</strong>
                </div>
                {user.phone && (
                  <div>
                    <span className="text-gray-500">Telefon:</span> <strong>{user.phone}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Izoh - ixtiyoriy */}
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('checkout.comment') || "Izoh (ixtiyoriy)"}
              rows={2}
              className="w-full px-3 py-2.5 mb-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 resize-none text-sm"
            />

            {submitError && (
              <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {submitError}
              </div>
            )}

            <button
              onClick={handleConfirm}
              disabled={submitting}
              className="btn-primary w-full disabled:opacity-50"
            >
              {submitting ? "Yuborilmoqda..." : (t('checkout.confirm') || "Tasdiqlash")}
            </button>

            {!user && (
              <p className="text-xs text-gray-500 text-center mt-2">
                Buyurtma berish uchun avval ro'yxatdan o'ting
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
