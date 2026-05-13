import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, ShoppingCart, Check, ArrowLeft, Star, Truck, ShieldCheck, CreditCard, MessageSquare, ChevronRight, ChevronLeft } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useAuthGate } from '../context/AuthGateContext';
import { formatPrice, calculateMonthly, findSubcategoryById, formatDeliveryDate } from '../data/products';
import { useAdminData } from '../context/AdminDataContext';
import { reviewsApi, resolveImage } from '../api/client';
import { USED_GRADE_STYLES } from '../data/usedGradeStyles';

export default function ProductPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const { products, loading } = useAdminData();
  const navigate = useNavigate();
  const { addToCart, isInCart, toggleFavorite, isFavorite } = useShop();
  const { requireAuth } = useAuthGate();

  const product = products.find(p => p.id === parseInt(id));
  const lang = i18n.language;

  // Hooks shartli return'dan oldin chaqirilishi shart
  const allImages = product
    ? (product.images && product.images.length > 0
        ? product.images
        : (product.image ? [product.image] : []))
    : [];
  const [activeImage, setActiveImage] = useState('');
  const [creditTerm, setCreditTerm] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (product) setActiveImage(allImages[0] || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  // Carousel: 2+ rasmlar bo'lsa avto-aylantirish (har 3.5s, hover'da to'xtaydi)
  useEffect(() => {
    if (allImages.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setActiveImage(prev => {
        const idx = allImages.indexOf(prev);
        return allImages[(idx + 1) % allImages.length];
      });
    }, 3500);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allImages.length, isPaused, product?.id]);

  // Mahsulot creditMonths'iga qarab tab'larni belgilash (eng katta termni default)
  useEffect(() => {
    if (!product) return;
    const max = product.creditMonths || 0;
    const terms = [3, 6, 12, 24].filter(t => t <= max);
    setCreditTerm(terms.length ? terms[terms.length - 1] : 0);
  }, [product?.id, product?.creditMonths]);

  const handleAddToCart = () => {
    requireAuth(() => addToCart(product));
  };

  if (loading) {
    return (
      <div className="container-custom py-20 flex justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-custom py-20 text-center">
        <p className="text-gray-500 mb-4">{t('products.notFound')}</p>
        <Link to="/catalog" className="btn-primary inline-block">
          {t('nav.catalog')}
        </Link>
      </div>
    );
  }

  const inCart = isInCart(product.id);
  const fav = isFavorite(product.id);
  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;
  const hasMultiple = allImages.length > 1;

  // B/U mahsulot — subkategoriya holati + admin yozgan tasnif
  const isUsed = product.category === 'used';
  const usedSub = isUsed && product.subcategory ? findSubcategoryById(product.subcategory) : null;
  const conditionNote = product.conditionNote;
  const usedStyle = usedSub ? USED_GRADE_STYLES[usedSub.id] : null;

  return (
    <div className="container-custom py-6 animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('common.back')}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,620px)_1fr] gap-8">
        {/* Gallery */}
        <div className="flex gap-3 items-start">
          {hasMultiple && (
            <div className="flex flex-col gap-2 w-[80px] flex-shrink-0">
              {allImages.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  onMouseEnter={() => setActiveImage(img)}
                  onClick={() => setActiveImage(img)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === img
                      ? 'border-primary-600 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={resolveImage(img)}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://placehold.co/100x100/e5e7eb/6b7280?text=${idx + 1}`;
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          <div
            className="flex-1 min-w-0 relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {allImages.length > 1 ? (
              <div className="relative overflow-hidden rounded-xl h-[620px] group">
                <div
                  className="flex h-full transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${Math.max(0, allImages.indexOf(activeImage)) * 100}%)` }}
                >
                  {allImages.map((img, idx) => (
                    <div key={`${img}-${idx}`} className="w-full h-full flex-shrink-0 flex items-center justify-center">
                      <img
                        src={resolveImage(img)}
                        alt={product.name[lang]}
                        className="block max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.target.src = `https://placehold.co/600x800/e5e7eb/6b7280?text=${encodeURIComponent(product.name[lang])}`;
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Prev tugma */}
                <button
                  type="button"
                  onClick={() => {
                    const idx = Math.max(0, allImages.indexOf(activeImage));
                    setActiveImage(allImages[(idx - 1 + allImages.length) % allImages.length]);
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>

                {/* Next tugma */}
                <button
                  type="button"
                  onClick={() => {
                    const idx = Math.max(0, allImages.indexOf(activeImage));
                    setActiveImage(allImages[(idx + 1) % allImages.length]);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>

                {/* Dots indicator */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {allImages.map((img, idx) => {
                    const isActive = idx === Math.max(0, allImages.indexOf(activeImage));
                    return (
                      <button
                        key={`dot-${idx}`}
                        type="button"
                        onClick={() => setActiveImage(allImages[idx])}
                        className={`h-1.5 rounded-full transition-all ${
                          isActive ? 'w-6 bg-primary-600' : 'w-1.5 bg-gray-300'
                        }`}
                        aria-label={`Image ${idx + 1}`}
                      />
                    );
                  })}
                </div>
              </div>
            ) : (
              <img
                src={resolveImage(activeImage || product.image)}
                alt={product.name[lang]}
                className="block w-full max-h-[620px] object-contain rounded-xl"
                onError={(e) => {
                  e.target.src = `https://placehold.co/600x800/e5e7eb/6b7280?text=${encodeURIComponent(product.name[lang])}`;
                }}
              />
            )}
            {discount > 0 && (
              <div className="absolute top-3 left-3 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-md z-10">
                −{discount}%
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            {product.reviewsCount > 0 ? (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{product.avgRating?.toFixed(1)}</span>
                <span className="text-xs text-gray-400">({product.reviewsCount})</span>
              </div>
            ) : (
              <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">
                Yangi mahsulot
              </span>
            )}
            <span className="text-sm text-gray-500 ml-2">
              {product.stock} {t('products.stock')}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold mb-3">
            {product.name[lang]}
          </h1>

          {/* B/U holat banner — subkategoriyaga qarab rang va harf */}
          {isUsed && (usedSub || conditionNote) && (
            <div className={`mb-6 rounded-xl border-2 p-5 ${usedStyle?.container || 'border-gray-300 bg-gray-50'}`}>
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center font-black text-xl tracking-tight ${usedStyle?.iconBg || 'bg-gray-500 text-white ring-4 ring-gray-100'}`}>
                  {usedStyle?.letter || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  {usedSub && (
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={`text-lg font-bold ${usedStyle?.title || 'text-gray-900'}`}>
                        {usedSub.name[lang]}
                      </span>
                      {usedSub.discount && (
                        <span className={`text-sm font-bold px-2 py-0.5 rounded-md ${usedStyle?.discount || 'text-gray-700 bg-gray-100'}`}>
                          −{usedSub.discount}
                        </span>
                      )}
                    </div>
                  )}
                  {usedSub?.description?.[lang] && (
                    <p className={`text-sm mb-2 ${usedStyle?.body || 'text-gray-700'}`}>
                      {usedSub.description[lang]}
                    </p>
                  )}
                  {conditionNote && (
                    <div className={`mt-3 pt-3 border-t ${usedStyle?.divider || 'border-gray-300/60'}`}>
                      <div className={`text-xs uppercase tracking-wider font-bold mb-1 ${usedStyle?.noteLabel || 'text-gray-700'}`}>
                        Holat tasnifi
                      </div>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">
                        {conditionNote}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Price + Credit + Actions — SSMART brand style */}
          <div className="card p-5 mb-6">
            {/* Narx */}
            <div className="flex items-baseline gap-3 mb-3">
              <span className="text-3xl font-extrabold text-primary-700 tracking-tight">
                {formatPrice(product.price)} {t('common.currency')}
              </span>
            </div>
            {product.oldPrice && (
              <div className="text-base text-gray-400 line-through mb-4">
                {formatPrice(product.oldPrice)} {t('common.currency')}
              </div>
            )}

            {/* Kredit — Variant A: Kalkulyator stili */}
            {(() => {
              const terms = [3, 6, 12, 24];
              return (
                <div className="rounded-2xl border border-gray-200 p-4 bg-gradient-to-br from-primary-50/40 to-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs uppercase tracking-wider text-gray-500 font-medium">
                      {lang === 'uz' ? "Oyiga to'lov" : 'В месяц'}
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-primary-700 bg-primary-100 px-2 py-0.5 rounded-full">
                      0%
                    </span>
                  </div>
                  <div className="mb-4">
                    <span className="text-3xl font-extrabold text-primary-700 tracking-tight">
                      {formatPrice(calculateMonthly(product.price, creditTerm))} {t('common.currency')}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {terms.map(m => {
                      const isActive = creditTerm === m;
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setCreditTerm(m)}
                          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                            isActive
                              ? 'text-white shadow-md'
                              : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                          style={isActive ? { background: 'linear-gradient(135deg, #6a1cc7 0%, #460087 100%)' } : undefined}
                        >
                          {m} {lang === 'uz' ? 'oy' : 'мес'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Actions — Savatga qo'shish (delivery date subtitle) + Favorite */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleAddToCart}
              disabled={inCart}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                inCart
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'text-white active:scale-[0.98] shadow-md hover:shadow-lg'
              }`}
              style={!inCart ? { background: 'linear-gradient(135deg, #6a1cc7 0%, #460087 100%)' } : undefined}
            >
              {inCart ? (
                <span className="flex items-center justify-center gap-2">
                  <Check className="w-5 h-5" /> {t('products.inCart')}
                </span>
              ) : (
                <>
                  <div className="text-base leading-tight">{t('products.addToCart')}</div>
                  <div className="text-xs font-normal opacity-90 mt-0.5">
                    {formatDeliveryDate(product.deliveryDays ?? product.delivery_days ?? 3, lang)} {lang === 'uz' ? 'yetkazib beramiz' : 'доставим'}
                  </div>
                </>
              )}
            </button>
            <button
              onClick={() => toggleFavorite(product)}
              className={`w-12 rounded-xl border transition-colors flex items-center justify-center ${
                fav
                  ? 'bg-red-50 border-red-200 text-red-500'
                  : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-600'
              }`}
              aria-label="Favorite"
            >
              <Heart className={`w-5 h-5 ${fav ? 'fill-red-500' : ''}`} />
            </button>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center">
                <Truck className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <div className="font-medium">{lang === 'uz' ? "Tez yetkazib berish" : 'Быстрая доставка'}</div>
                <div className="text-gray-500 text-xs">{lang === 'uz' ? "1-3 kun ichida" : 'За 1-3 дня'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <div className="font-medium">{lang === 'uz' ? "Rasmiy kafolat" : 'Официальная гарантия'}</div>
                <div className="text-gray-500 text-xs">{lang === 'uz' ? "12 oygacha" : 'До 12 месяцев'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <div className="font-medium">{lang === 'uz' ? "0% Muddatli to'lov" : 'Рассрочка под 0%'}</div>
                <div className="text-gray-500 text-xs">{lang === 'uz' ? "Hujjatlarsiz" : 'Без документов'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Umumiy tavsif va Xususiyatlar — pastga ko'chirildi (to'liq kenglikda) */}
      <div className="mt-8 space-y-4">
        {product.description?.[lang] && (
          <div className="card p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              {lang === 'uz' ? 'Umumiy tavsif' : 'Общее описание'}
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {product.description[lang]}
            </p>
          </div>
        )}
        <SpecificationsTable specifications={product.specifications} lang={lang} />
      </div>

      {/* Sharhlar bo'limi */}
      <ProductReviews productId={product.id} />
    </div>
  );
}

function SpecificationsTable({ specifications, lang }) {
  if (!specifications || specifications.length === 0) return null;

  const pick = (s) => {
    const v1 = lang === 'uz' ? (s.valueUz ?? s.value_uz ?? '') : (s.valueRu ?? s.value_ru ?? '');
    const isDual = Boolean(s.isDual ?? s.is_dual ?? false);
    const v2 = lang === 'uz' ? (s.value2Uz ?? s.value2_uz ?? '') : (s.value2Ru ?? s.value2_ru ?? '');
    return { v1, v2, isDual };
  };

  return (
    <div className="card p-5 mb-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        {lang === 'uz' ? 'Xususiyatlar' : 'Характеристики'}
      </h3>
      <table className="w-full text-sm">
        <tbody className="divide-y divide-gray-100">
          {specifications.map((s, idx) => {
            const { v1, v2, isDual } = pick(s);
            if (!v1 && !v2) return null;
            return (
              <tr key={idx}>
                {isDual ? (
                  <td className="py-2 text-gray-900">
                    <span className="text-gray-500">{v1}</span>
                    <span className="text-gray-400 font-mono mx-2">———</span>
                    <span className="font-medium">{v2}</span>
                  </td>
                ) : (
                  <td className="py-2 text-gray-900">{v1}</td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    reviewsApi.forProduct(productId)
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [productId]);

  const avg = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="mt-12">
      <div className="flex items-center gap-3 mb-5">
        <MessageSquare className="w-6 h-6 text-gray-700" />
        <h2 className="text-2xl font-bold">Mahsulot sharhlari</h2>
        {reviews.length > 0 && (
          <div className="ml-2 flex items-center gap-1.5">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="font-bold">{avg.toFixed(1)}</span>
            <span className="text-gray-500 text-sm">({reviews.length})</span>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && reviews.length === 0 && (
        <div className="card p-8 text-center text-gray-500">
          <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Hozircha sharhlar yo'q</p>
          <p className="text-xs text-gray-400 mt-1">Birinchi bo'lib sharh qoldiring</p>
        </div>
      )}

      {!loading && reviews.length > 0 && (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex items-start gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                  {(r.userName || '?')[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{r.userName}</div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className="w-3.5 h-3.5"
                          fill={n <= r.rating ? "#f59e0b" : "none"}
                          stroke={n <= r.rating ? "#f59e0b" : "#9ca3af"}
                          strokeWidth={1.5}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString('uz-UZ')}
                    </span>
                  </div>
                </div>
              </div>
              {r.text && (
                <p className="text-sm text-gray-700 ml-13" style={{ marginLeft: '52px' }}>
                  {r.text}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
