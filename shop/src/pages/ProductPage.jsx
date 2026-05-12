import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, ShoppingCart, Check, ArrowLeft, Star, Truck, ShieldCheck, CreditCard, MessageSquare } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useAuthGate } from '../context/AuthGateContext';
import { formatPrice, calculateMonthly, findSubcategoryById } from '../data/products';
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

  useEffect(() => {
    if (product) setActiveImage(allImages[0] || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gallery */}
        <div className="flex gap-3">
          {hasMultiple && (
            <div className="flex flex-col gap-2 w-16 sm:w-20 flex-shrink-0">
              {allImages.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  onMouseEnter={() => setActiveImage(img)}
                  onClick={() => setActiveImage(img)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                    activeImage === img
                      ? 'border-primary-600'
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

          <div className="card overflow-hidden flex-1">
            <div className="aspect-[3/4] bg-gray-50 relative">
              <img
                src={resolveImage(activeImage || product.image)}
                alt={product.name[lang]}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.src = `https://placehold.co/600x600/e5e7eb/6b7280?text=${encodeURIComponent(product.name[lang])}`;
                }}
              />
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-md">
                  −{discount}%
                </div>
              )}
            </div>
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

          {/* Price */}
          <div className="card p-5 mb-4">
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(product.price)} {t('common.currency')}
              </span>
              {product.oldPrice && (
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.oldPrice)} {t('common.currency')}
                </span>
              )}
            </div>
            <div className="text-primary-600 font-medium">
              {t('products.credit')}: {formatPrice(calculateMonthly(product.price, product.creditMonths))} {t('common.currency')}{t('products.perMonth')} × {product.creditMonths} {t('products.months')}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleAddToCart}
              disabled={inCart}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                inCart
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-primary-600 text-white hover:bg-primary-700 active:scale-95'
              }`}
            >
              {inCart ? (
                <><Check className="w-5 h-5" /> {t('products.inCart')}</>
              ) : (
                <><ShoppingCart className="w-5 h-5" /> {t('products.addToCart')}</>
              )}
            </button>
            <button
              onClick={() => toggleFavorite(product)}
              className={`px-4 py-3 rounded-lg border transition-colors ${
                fav
                  ? 'bg-red-50 border-red-200 text-red-500'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
              aria-label="Favorite"
            >
              <Heart className={`w-5 h-5 ${fav ? 'fill-red-500' : ''}`} />
            </button>
          </div>

          {/* Umumiy tavsif (narx va savat tugmasidan keyin) */}
          {product.description?.[lang] && (
            <div className="card p-5 mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                {lang === 'uz' ? 'Umumiy tavsif' : 'Общее описание'}
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {product.description[lang]}
              </p>
            </div>
          )}

          {/* Xususiyatlar (specifications) */}
          <SpecificationsTable specifications={product.specifications} lang={lang} />

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
