import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useShop } from '../context/ShopContext';
import { useAuthGate } from '../context/AuthGateContext';
import { formatPrice, calculateMonthly, findSubcategoryById } from '../data/products';
import { getBadgeById } from '../data/badges';
import { USED_GRADE_STYLES } from '../data/usedGradeStyles';
import MIcon from './MIcon';
import FluentEmoji from './FluentEmoji';

// Variant — card o'lchamlarini sahifaga moslab beradi:
//   home    → 232×465 (rasm 232×309)  [bosh sahifa]
//   catalog → 215×443 (rasm 215×287)  [katalog]
const CARD_VARIANTS = {
  home:    { maxW: 'max-w-[232px]' },
  catalog: { maxW: 'max-w-[245px]' },
};

export default function ProductCard({ product, variant = 'home' }) {
  const { t, i18n } = useTranslation();
  const { addToCart, isInCart, toggleFavorite, isFavorite } = useShop();
  const { requireAuth } = useAuthGate();

  const handleAddToCart = () => {
    requireAuth(() => addToCart(product));
  };

  const lang = i18n.language;
  const inCart = isInCart(product.id);
  const fav = isFavorite(product.id);
  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;

  // Super admin tomonidan tanlangan yorliqlar
  const productBadges = (product.badges || [])
    .map(id => getBadgeById(id))
    .filter(Boolean);

  // B/U mahsulot uchun sinf harfi (A+/A/B/C)
  const usedGrade = product.category === 'used' && product.subcategory
    ? USED_GRADE_STYLES[product.subcategory]
    : null;

  const cfg = CARD_VARIANTS[variant] || CARD_VARIANTS.home;

  return (
    <div className={`card group overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col h-full w-full ${cfg.maxW} mx-auto`}>
      {/* Image */}
      <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden flex-shrink-0">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={product.image}
            alt={product.name[lang]}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = `https://placehold.co/500x500/e5e7eb/6b7280?text=${encodeURIComponent(product.name[lang])}`;
            }}
          />
        </Link>

        {/* Chap yuqori — sinf harfi (B/U) va/yoki chegirma */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {usedGrade && (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs tracking-tight shadow-md ${usedGrade.iconBg}`}>
              {usedGrade.letter}
            </div>
          )}
          {discount > 0 && (
            <div className="bg-red-500 text-white text-[11px] font-bold px-2 py-1 rounded-md shadow-md text-center">
              −{discount}%
            </div>
          )}
        </div>

        {/* Yorliqlar — rasm PASTIDA, yonma-yon bir qatorda */}
        {productBadges.length > 0 && (
          <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1 z-10">
            {productBadges.map(badge => (
              <div
                key={badge.id}
                className={`${badge.bgClass} ${badge.textClass} text-[10px] font-bold px-2 py-1 rounded-md shadow-md flex items-center gap-1`}
                title={badge.label[lang]}
              >
                <span className="flex-shrink-0"><FluentEmoji name={badge.icon} size={12} /></span>
                <span>{badge.label[lang]}</span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => toggleFavorite(product)}
          className="absolute top-2 right-2 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm z-10"
          aria-label="Favorite"
        >
          <MIcon
            name="favorite"
            size={18}
            fill={fav}
            className={fav ? 'text-red-500' : 'text-gray-600'}
          />
        </button>
      </div>

      {/* Content - kompakt */}
      <div className="p-2.5 flex flex-col flex-1">
        {/* Nom - 2 qator joy */}
        <Link to={`/product/${product.id}`} className="block mb-1">
          <h3 className="text-[13px] font-medium text-gray-900 line-clamp-2 min-h-[36px] hover:text-primary-600 transition-colors leading-[18px]">
            {product.name[lang]}
          </h3>
        </Link>

        {/* Reyting yoki "Yangi mahsulot" */}
        <div className="mb-1.5 h-4 flex items-center">
          {product.reviewsCount > 0 ? (
            <div className="flex items-center gap-1">
              <MIcon name="star" size={12} fill className="text-yellow-400" />
              <span className="text-[11px] font-medium text-gray-900">
                {Number(product.avgRating).toFixed(1)}
              </span>
              <span className="text-[10px] text-gray-400">({product.reviewsCount})</span>
            </div>
          ) : (
            <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">
              {lang === 'ru' ? 'Новый' : 'Yangi'}
            </span>
          )}
        </div>

        {/* Narx bloki - har doim bir xil balandlikda */}
        <div className="mb-2">
          {/* Asosiy narx */}
          <div className="text-[15px] font-bold text-gray-900 leading-tight">
            {formatPrice(product.price)} {t('common.currency')}
          </div>

          {/* Eski narx - har doim joy egallaydi */}
          <div className="text-[11px] text-gray-400 line-through h-4 leading-4">
            {product.oldPrice ? `${formatPrice(product.oldPrice)} ${t('common.currency')}` : ''}
          </div>

          {/* Oylik to'lov */}
          <div className="text-[11px] text-primary-600 h-4 leading-4">
            {product.creditMonths > 0
              ? `${formatPrice(calculateMonthly(product.price, product.creditMonths))} ${t('common.currency')}${t('products.perMonth')}`
              : ''}
          </div>
        </div>

        {/* Tugma - pastda */}
        <button
          onClick={handleAddToCart}
          disabled={inCart}
          className={`mt-auto w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            inCart
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-primary-600 text-white hover:bg-primary-700 active:scale-95'
          }`}
        >
          {inCart ? (
            <>
              <MIcon name="check" size={14} />
              {t('products.inCart')}
            </>
          ) : (
            <>
              <MIcon name="shopping_cart" size={14} />
              {t('products.addToCart')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
