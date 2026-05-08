import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useShop } from '../context/ShopContext';
import { useAuthGate } from '../context/AuthGateContext';
import { formatPrice, calculateMonthly } from '../data/products';
import { getBadgeById } from '../data/badges';
import MIcon from './MIcon';
import FluentEmoji from './FluentEmoji';

export default function ProductCard({ product }) {
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

  return (
    <div className="card group overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col h-full">
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

        {/* Chegirma — chap yuqori burchakda */}
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[11px] font-bold px-2 py-1 rounded-md shadow-md z-10">
            −{discount}%
          </div>
        )}

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

      {/* Content - flex-col with fixed sections */}
      <div className="p-3 flex flex-col flex-1">
        {/* Nom - har doim 2 qator joy egallaydi */}
        <Link to={`/product/${product.id}`} className="block mb-1.5">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[40px] hover:text-primary-600 transition-colors leading-5">
            {product.name[lang]}
          </h3>
        </Link>

        {/* Reyting yoki "Yangi mahsulot" */}
        <div className="mb-2 h-5 flex items-center">
          {product.reviewsCount > 0 ? (
            <div className="flex items-center gap-1">
              <MIcon name="star" size={14} fill className="text-yellow-400" />
              <span className="text-xs font-medium text-gray-900">
                {Number(product.avgRating).toFixed(1)}
              </span>
              <span className="text-[10px] text-gray-400">({product.reviewsCount})</span>
            </div>
          ) : (
            <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">
              Yangi mahsulot
            </span>
          )}
        </div>

        {/* Narx bloki - har doim bir xil balandlikda */}
        <div className="mb-3">
          {/* Asosiy narx */}
          <div className="text-base font-bold text-gray-900 mb-0.5">
            {formatPrice(product.price)} {t('common.currency')}
          </div>

          {/* Eski narx - har doim joy egallaydi (bo'sh bo'lsa ham) */}
          <div className="text-xs text-gray-400 line-through h-4">
            {product.oldPrice ? `${formatPrice(product.oldPrice)} ${t('common.currency')}` : ''}
          </div>

          {/* Oylik to'lov - har doim joy egallaydi */}
          <div className="text-xs text-primary-600 mt-1 h-4">
            {product.creditMonths > 0
              ? `${formatPrice(calculateMonthly(product.price, product.creditMonths))} ${t('common.currency')}${t('products.perMonth')}`
              : ''}
          </div>
        </div>

        {/* Tugma - har doim pastda turadi */}
        <button
          onClick={handleAddToCart}
          disabled={inCart}
          className={`mt-auto w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
            inCart
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-primary-600 text-white hover:bg-primary-700 active:scale-95'
          }`}
        >
          {inCart ? (
            <>
              <MIcon name="check" size={16} />
              {t('products.inCart')}
            </>
          ) : (
            <>
              <MIcon name="shopping_cart" size={16} />
              {t('products.addToCart')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
