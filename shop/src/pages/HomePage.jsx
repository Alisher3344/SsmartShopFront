import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProductCard from '../components/ProductCard';
import PromoCarousel from '../components/PromoCarousel';
import SsmartCtaButtons from '../components/SsmartCtaButtons';
import { useAdminData } from '../context/AdminDataContext';
import { shuffleBySubcategory } from '../utils/productShuffle';
import MIcon from '../components/MIcon';
import FluentEmoji from '../components/FluentEmoji';

// Grid: xl=5 ustun, lg=4, md=3, mobile=2. 4 qator xl'da = 20 ta mahsulot.
const INITIAL_COUNT = 20;
const STEP = 10; // xl'da 5 × 2 = 10 (2 qator)

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { products, loading } = useAdminData();
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  // Faqat zaxirada bor mahsulotlar
  const inStockProducts = products.filter((p) => p.stock > 0);

  // "Ommabop mahsulotlar" — faqat super admin /popular orqali
  // tanlagan mahsulotlar (isPopular = true).
  // Limit yo'q — superadmin /popular orqali tanlagan barcha (zaxiradagi)
  // ommabop mahsulotlar ko'rsatiladi.
  const popularProducts = inStockProducts
    .filter((p) => p.isPopular);
  // "Chegirmalar" bo'limi — faqat super admin /sales orqali aksiyaga
  // qo'shgan mahsulotlar (onSale = true). "Aksiya" yorlig'i (badges.sale) —
  // faqat ko'rinish uchun, filterga ta'siri yo'q.
  // Limit yo'q — superadmin /sales orqali tanlagan barcha (zaxiradagi) chegirma
  // mahsulotlari ko'rsatiladi (grid responsiv, istalgancha sig'adi).
  const discountProducts = inStockProducts
    .filter(p => p.onSale);

  // 3-bo'lim — ommabop yoki chegirmali bo'limda chiqqan mahsulotlarni qaytarmaymiz
  const usedIds = new Set([
    ...popularProducts.map(p => p.id),
    ...discountProducts.map(p => p.id),
  ]);
  // Subkategoriyalar bo'yicha aralashtirib chiqaramiz — qator-qator
  // bir xil bo'limdan mahsulotlar bo'lib turmasligi uchun. useMemo
  // tartibni "Yana ko'rish" bosilganda qayta o'zgarmasligini ta'minlaydi.
  const otherProducts = useMemo(
    () => shuffleBySubcategory(inStockProducts.filter(p => !usedIds.has(p.id))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [products, popularProducts.length, discountProducts.length],
  );

  const features = [
    { icon: 'local_shipping', title: { uz: "Tez yetkazib berish", ru: "Быстрая доставка" }, desc: { uz: "1-3 kun ichida", ru: "За 1-3 дня" } },
    { icon: 'verified_user', title: { uz: "Rasmiy kafolat", ru: "Официальная гарантия" }, desc: { uz: "Barcha mahsulotlarga", ru: "На все товары" } },
    { icon: 'credit_card', title: { uz: "Muddatli to'lov", ru: "Рассрочка" }, desc: { uz: "0% foiz, 12 oygacha", ru: "0%, до 12 месяцев" } },
    { icon: 'headset_mic', title: { uz: "24/7 qo'llab-quvvatlash", ru: "Поддержка 24/7" }, desc: { uz: "Doim aloqadamiz", ru: "Всегда на связи" } },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero karusel - Apple-style */}
      <PromoCarousel />

      {/* Ssmart TV + Ustalar — faqat <1024px da (≥1024px da header'da ko'rinadi),
          reklama banneri ostida chiqadi */}
      <div className="lg:hidden container-custom pt-6">
        <SsmartCtaButtons />
      </div>

      {/* Features */}
      <section className="container-custom py-8 md:py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {features.map((feature, idx) => (
            <div key={idx} className="feature-tile rounded-2xl p-3.5 md:p-4 flex items-start gap-3">
              <div className="feature-icon w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center flex-shrink-0">
                <MIcon name={feature.icon} size={22} />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-xs md:text-sm text-gray-900 mb-0.5">
                  {feature.title[lang]}
                </h3>
                <p className="text-[11px] md:text-xs text-gray-500">{feature.desc[lang]}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Loading — premium skeleton grid (spinner o'rniga) */}
      {loading && products.length === 0 && (
        <section className="container-custom py-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5 2xl:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="skeleton aspect-[3/4] rounded-none" />
                <div className="p-2.5 space-y-2">
                  <div className="skeleton h-3 w-full" />
                  <div className="skeleton h-3 w-2/3" />
                  <div className="skeleton h-4 w-1/2 mt-1" />
                  <div className="skeleton h-8 w-full rounded-xl mt-2" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Popular — faqat ommabop mahsulot bor bo'lsa */}
      {popularProducts.length > 0 && (
        <section className="container-custom py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title text-2xl font-bold">{t('products.popular')}</h2>
            <Link to="/catalog" className="text-primary-600 text-sm font-semibold hover:text-primary-700 flex items-center gap-1 group">
              {t('products.details')} <MIcon name="arrow_forward" size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="reveal-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5 2xl:gap-6">
            {popularProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Discounts */}
      {discountProducts.length > 0 && (
        <section className="container-custom py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FluentEmoji name="fire" size={28} /> {t('products.discount')}
            </h2>
            <Link to="/catalog" className="text-primary-600 text-sm font-semibold hover:text-primary-700 flex items-center gap-1 group">
              {t('common.showAll')} <MIcon name="arrow_forward" size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="reveal-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5 2xl:gap-6">
            {discountProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Barcha mahsulotlar — nomsiz, ko'rib chiqish bilan
          (ommabop/chegirmali bo'limda bo'lganlari chiqarilmaydi) */}
      {otherProducts.length > 0 && (
        <section className="container-custom py-10">
          <div className="reveal-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5 2xl:gap-6">
            {otherProducts.slice(0, visibleCount).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {visibleCount < otherProducts.length && (
            <div className="flex justify-center mt-8">
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + STEP)}
                className="btn-ghost-brand inline-flex items-center gap-2 px-7 py-3 font-bold rounded-full"
              >
                {lang === 'ru' ? 'Показать ещё' : "Yana ko'rish"}
                <MIcon name="expand_more" size={20} />
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
