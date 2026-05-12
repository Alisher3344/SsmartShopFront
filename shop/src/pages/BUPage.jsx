import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProductCard from '../components/ProductCard';
import { useAdminData } from '../context/AdminDataContext';
import { resolveImage } from '../api/client';
import MIcon from '../components/MIcon';
import FluentEmoji from '../components/FluentEmoji';

const BU_INFO_SEEN_KEY = 'ssmart-bu-info-seen-v1';

export default function BUPage() {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language || 'uz').toLowerCase().startsWith('ru') ? 'ru' : 'uz';
  const { products, activeBanners } = useAdminData();
  const [infoOpen, setInfoOpen] = useState(false);
  const [infoStep, setInfoStep] = useState(0);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(BU_INFO_SEEN_KEY);
      if (!seen) {
        setInfoStep(0);
        setInfoOpen(true);
      }
    } catch {
      setInfoStep(0);
      setInfoOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!infoOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') closeInfo(false); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [infoOpen]);

  const closeInfo = (completed = false) => {
    if (completed) {
      try { localStorage.setItem(BU_INFO_SEEN_KEY, '1'); } catch {}
    }
    setInfoOpen(false);
  };
  const openInfo = () => {
    setInfoStep(0);
    setInfoOpen(true);
  };
  const handleNext = () => {
    if (infoStep < infoSteps.length - 1) setInfoStep((s) => s + 1);
    else closeInfo(true);
  };

  const infoSteps = [
    {
      icon: 'warning',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      headerBg: 'from-red-50 to-white',
      badge: { ru: 'Внимание', uz: 'Diqqat' },
      badgeColor: 'bg-red-100 text-red-700',
      title: {
        ru: 'Как купить б/у iPhone',
        uz: 'Ishlatilgan iPhone qanday sotib olish kerak',
      },
      body: {
        ru: 'Покупка бывшего в употреблении iPhone может быть выгодной, но требует внимательности. При выборе устройства на онлайн-площадках важно учитывать риски: подделка, блокировка или скрытые дефекты.',
        uz: "Foydalanilgan iPhone sotib olish foydali bo'lishi mumkin, ammo ehtiyotkorlik talab etadi. Onlayn platformalarda xarid qilishda qalbaki, bloklangan yoki nuqsonli qurilma xavfi mavjud.",
      },
    },
    {
      icon: 'lightbulb',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      headerBg: 'from-amber-50 to-white',
      title: { ru: 'Основные рекомендации', uz: 'Asosiy tavsiyalar' },
      items: {
        ru: [
          'Внимательно изучайте объявление и фотографии.',
          'Проверяйте соответствие модели, памяти и состояния устройства.',
          'Убедитесь в наличии всех сторонних фото телефона.',
          'Проверяйте состояние аккумулятора (желательно от 80% и выше).',
          'Используйте только официальные чаты и безопасные способы оплаты.',
        ],
        uz: [
          "E'lon va rasmlarni diqqat bilan tekshiring.",
          'Model, xotira va holat mosligini aniqlang.',
          'Telefonning barcha tomondan olingan rasmlarini tekshiring.',
          "Batareya holati 80% dan yuqori bo'lishi tavsiya etiladi.",
          "Faqat rasmiy chat va xavfsiz to'lov usullaridan foydalaning.",
        ],
      },
    },
    {
      icon: 'local_shipping',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      headerBg: 'from-blue-50 to-white',
      title: { ru: 'При покупке с доставкой', uz: 'Yetkazib berish orqali xarid' },
      items: {
        ru: [
          'Используйте только проверенные службы доставки.',
          'Проверяйте устройство в пункте выдачи.',
          'Не подтверждайте получение до полной проверки.',
        ],
        uz: [
          'Ishonchli yetkazib berish xizmatlaridan foydalaning.',
          'Tovarni qabul qilish punktida tekshiring.',
          "To'liq tekshirmasdan qabulni tasdiqlamang.",
        ],
      },
    },
    {
      icon: 'fact_check',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      headerBg: 'from-green-50 to-white',
      title: { ru: 'Проверка устройства', uz: 'Qurilmani tekshirish' },
      items: {
        ru: [
          'Серийный номер — через сайт Apple.',
          'Проверка iCloud — устройство не должно быть привязано к чужому аккаунту.',
          'Тест всех функций: камера, звук, Face ID/Touch ID, связь и Wi-Fi.',
        ],
        uz: [
          'Seriya raqamini Apple saytida tekshirish.',
          "iCloud ulanishini tekshirish (boshqa akkauntga bog'lanmagan bo'lishi kerak).",
          'Barcha funksiyalarni sinash: kamera, ovoz, Face ID/Touch ID, aloqa va Wi-Fi.',
        ],
      },
    },
  ];

  // Admin yuklagan B/U banner (slot==='bu'), agar bor bo'lsa karusel rasmi o'rniga shu ko'rsatiladi
  const buBanner = (activeBanners || []).find((b) => b.slot === 'bu');
  const buBannerImage = buBanner
    ? (lang === 'ru' ? (buBanner.imageRu || buBanner.image) : (buBanner.imageUz || buBanner.image))
    : null;

  // Faqat B/U (ishlatilgan) va zaxirada bor mahsulotlar
  const buProducts = products.filter((p) => p.category === 'used' && p.stock > 0);

  const popularProducts = buProducts
    .filter((p) => p.isPopular)
    .slice(0, 8);
  const discountProducts = buProducts
    .filter((p) => p.onSale)
    .slice(0, 8);
  const allBUProducts = buProducts.slice(0, 12);

  const features = [
    { icon: 'verified', title: { uz: "Tekshirilgan holat", ru: "Проверенное состояние" }, desc: { uz: "Har bir mahsulot diagnostikadan o'tgan", ru: "Каждый товар прошёл диагностику" } },
    { icon: 'savings', title: { uz: "Arzon narx", ru: "Низкая цена" }, desc: { uz: "Yangiga nisbatan -30% gacha", ru: "До -30% по сравнению с новым" } },
    { icon: 'verified_user', title: { uz: "Kafolat", ru: "Гарантия" }, desc: { uz: "Cheklangan kafolat bilan", ru: "С ограниченной гарантией" } },
    { icon: 'headset_mic', title: { uz: "24/7 qo'llab-quvvatlash", ru: "Поддержка 24/7" }, desc: { uz: "Doim aloqadamiz", ru: "Всегда на связи" } },
  ];

  return (
    <div className="animate-fade-in">
      {/* Banner: admin yuklagan rasm (slot='bu') yoki default hero */}
      {buBannerImage ? (
        <section className="container-custom pt-3 sm:pt-4">
          {buBanner.link ? (
            /^https?:\/\//i.test(buBanner.link) ? (
              <a
                href={buBanner.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block relative rounded-xl sm:rounded-2xl overflow-hidden aspect-[1240/413] bg-gray-100 shadow-sm"
              >
                <img
                  src={resolveImage(buBannerImage)}
                  alt=""
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </a>
            ) : (
              <Link
                to={buBanner.link}
                className="block relative rounded-xl sm:rounded-2xl overflow-hidden aspect-[1240/413] bg-gray-100 shadow-sm"
              >
                <img
                  src={resolveImage(buBannerImage)}
                  alt=""
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </Link>
            )
          ) : (
            <div className="relative rounded-xl sm:rounded-2xl overflow-hidden aspect-[1240/413] bg-gray-100 shadow-sm">
              <img
                src={resolveImage(buBannerImage)}
                alt=""
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>
          )}
        </section>
      ) : (
        <section className="relative overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black text-white">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="container-custom relative py-12 md:py-20 flex flex-col md:flex-row items-center gap-6 md:gap-10">
            <div className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20 flex items-center justify-center shadow-2xl">
              <img
                src="https://cdn.simpleicons.org/apple/ffffff"
                alt=""
                className="w-14 h-14 md:w-20 md:h-20 object-contain"
              />
            </div>
            <div className="text-center md:text-left flex-1">
              <span className="inline-block px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full mb-3 tracking-wider uppercase shadow-md">
                {lang === 'ru' ? 'Новое' : 'YANGI'}
              </span>
              <h1 className="text-3xl md:text-5xl font-bold mb-2 tracking-tight">
                {t('bu.title')}
              </h1>
              <p className="text-sm md:text-lg text-gray-300 max-w-xl">
                {t('bu.subtitle')}
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-5 text-xs md:text-sm">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full backdrop-blur-sm">
                  <MIcon name="verified" size={14} className="text-green-400" />
                  {lang === 'ru' ? 'Проверено' : 'Tekshirilgan'}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full backdrop-blur-sm">
                  <MIcon name="savings" size={14} className="text-yellow-400" />
                  {lang === 'ru' ? 'До -30%' : '−30% gacha'}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full backdrop-blur-sm">
                  <MIcon name="verified_user" size={14} className="text-blue-400" />
                  {lang === 'ru' ? 'Гарантия' : 'Kafolat'}
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

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

      {/* "Tanishish uchun" qayta ochish tugmasi (modal yopilgandan keyin ham mavjud) */}
      <section className="container-custom pt-4">
        <button
          type="button"
          onClick={openInfo}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-50 text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100 transition-colors text-sm font-medium"
        >
          <MIcon name="info" size={18} />
          {lang === 'ru' ? 'Как безопасно купить б/у iPhone' : "B/U iPhone'ni xavfsiz sotib olish"}
        </button>
      </section>

      {/* Popular B/U */}
      {popularProducts.length > 0 && (
        <section className="container-custom py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{t('products.popular')}</h2>
            <Link to="/catalog?category=used" className="text-primary-600 text-sm font-medium hover:underline flex items-center gap-1">
              {t('products.details')} <MIcon name="arrow_forward" size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {popularProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Discount B/U */}
      {discountProducts.length > 0 && (
        <section className="container-custom py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FluentEmoji name="fire" size={28} /> {t('products.discount')}
            </h2>
            <Link to="/catalog?category=used" className="text-primary-600 text-sm font-medium hover:underline flex items-center gap-1">
              {t('common.showAll')} <MIcon name="arrow_forward" size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {discountProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Barcha B/U mahsulotlar */}
      {allBUProducts.length > 0 ? (
        <section className="container-custom py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{t('bu.allProducts')}</h2>
            <Link to="/catalog?category=used" className="text-primary-600 text-sm font-medium hover:underline flex items-center gap-1">
              {t('common.showAll')} <MIcon name="arrow_forward" size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {allBUProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : (
        <section className="container-custom py-20 text-center">
          <img
            src="https://cdn.simpleicons.org/apple/000000"
            alt=""
            className="w-20 h-20 mx-auto opacity-50 mb-4"
          />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {t('bu.empty')}
          </h3>
          <p className="text-gray-500">{t('bu.emptyDesc')}</p>
        </section>
      )}

      {/* Modal: 4 bosqichli qo'llanma (Diqqat → Tavsiyalar → Yetkazib berish → Tekshirish) */}
      {infoOpen && (() => {
        const step = infoSteps[infoStep];
        const isLast = infoStep === infoSteps.length - 1;
        return (
          <div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md animate-fade-in"
            role="dialog"
            aria-modal="true"
          >
            <div
              key={infoStep}
              className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[88vh] flex flex-col overflow-hidden animate-slide-up"
            >
              {/* Mobile drag-handle */}
              <div className="sm:hidden flex justify-center pt-2.5 pb-1">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>

              {/* Step progress bar */}
              <div className="px-5 sm:px-6 pt-3 sm:pt-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    {(lang === 'ru' ? 'Шаг' : 'Bosqich') + ` ${infoStep + 1} / ${infoSteps.length}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => closeInfo(false)}
                    aria-label="close"
                    className="w-8 h-8 -mr-1 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <MIcon name="close" size={20} />
                  </button>
                </div>
                <div className="flex gap-1.5">
                  {infoSteps.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        i < infoStep
                          ? 'bg-gray-900'
                          : i === infoStep
                          ? 'bg-gray-900'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Hero — gorizontal: ikonka chap, badge+title o'ng */}
              <div className={`px-5 sm:px-6 pt-4 pb-4 bg-gradient-to-br ${step.headerBg}`}>
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${step.iconBg} flex items-center justify-center shadow-sm ring-1 ring-black/5 flex-shrink-0`}
                  >
                    <MIcon name={step.icon} size={28} className={step.iconColor} />
                  </div>
                  <div className="min-w-0 flex-1">
                    {step.badge && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 mb-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${step.badgeColor || 'bg-gray-100 text-gray-700'}`}>
                        <MIcon name="priority_high" size={11} />
                        {step.badge[lang]}
                      </span>
                    )}
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight leading-snug">
                      {step.title[lang]}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 sm:py-5">
                {step.body && (
                  <p className="text-[15px] text-gray-700 leading-relaxed">
                    {step.body[lang]}
                  </p>
                )}
                {step.items && (
                  <ul className="space-y-2.5">
                    {step.items[lang].map((item, i) => (
                      <li
                        key={i}
                        className="flex gap-3 items-start p-3 rounded-xl bg-gray-50 hover:bg-gray-100/70 transition-colors"
                      >
                        <div className={`w-6 h-6 rounded-full ${step.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <span className={`text-[11px] font-bold ${step.iconColor}`}>{i + 1}</span>
                        </div>
                        <span className="text-[14px] sm:text-[15px] text-gray-800 leading-relaxed flex-1">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 sm:px-6 py-4 sm:py-5 bg-white border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full px-6 py-3.5 rounded-2xl bg-gradient-to-r from-gray-900 to-black text-white font-semibold text-[15px] hover:opacity-95 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {isLast ? (
                    <>
                      <MIcon name="check_circle" size={20} />
                      {lang === 'ru' ? 'Понятно, начать покупки' : "Tushundim, xaridni boshlash"}
                    </>
                  ) : (
                    <>
                      {lang === 'ru' ? 'Понятно' : 'Tushundim'}
                      <MIcon name="arrow_forward" size={20} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
