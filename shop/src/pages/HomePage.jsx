import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProductCard from '../components/ProductCard';
import PromoCarousel from '../components/PromoCarousel';
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
  const { products, saleProducts } = useAdminData();
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  // Faqat zaxirada bor mahsulotlar
  const inStockProducts = products.filter((p) => p.stock > 0);

  // "Ommabop mahsulotlar" — faqat super admin /popular orqali
  // tanlagan mahsulotlar (isPopular = true).
  const popularProducts = inStockProducts
    .filter((p) => p.isPopular)
    .slice(0, 8);
  // "Chegirmalar" bo'limi — faqat super admin /sales orqali aksiyaga
  // qo'shgan mahsulotlar (onSale = true). "Aksiya" yorlig'i (badges.sale) —
  // faqat ko'rinish uchun, filterga ta'siri yo'q.
  const discountProducts = inStockProducts
    .filter(p => p.onSale)
    .slice(0, 8);

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

      {/* Features */}
      <section className="container-custom py-8 md:py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {features.map((feature, idx) => (
            <div key={idx} className="card p-3 md:p-4 flex items-start gap-3">
              <div className="w-9 h-9 md:w-10 md:h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <MIcon name={feature.icon} size={20} className="text-primary-600" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-xs md:text-sm text-gray-900 mb-0.5">
                  {feature.title[lang]}
                </h3>
                <p className="text-[11px] md:text-xs text-gray-500">{feature.desc[lang]}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular — faqat ommabop mahsulot bor bo'lsa */}
      {popularProducts.length > 0 && (
        <section className="container-custom py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{t('products.popular')}</h2>
            <Link to="/catalog" className="text-primary-600 text-sm font-medium hover:underline flex items-center gap-1">
              {t('products.details')} <MIcon name="arrow_forward" size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5 2xl:gap-6">
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
            <Link to="/catalog" className="text-primary-600 text-sm font-medium hover:underline flex items-center gap-1">
              {t('common.showAll')} <MIcon name="arrow_forward" size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5 2xl:gap-6">
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5 2xl:gap-6">
            {otherProducts.slice(0, visibleCount).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {visibleCount < otherProducts.length && (
            <div className="flex justify-center mt-8">
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + STEP)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-primary-600 text-primary-600 font-semibold rounded-full hover:bg-primary-600 hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
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
