import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useAdminData } from '../context/AdminDataContext';
import { formatPrice, calculateMonthly } from '../data/products';

// Uzum-style fon ranglari (har slide uchun har xil)
const SLIDE_BG_COLORS = [
  { from: '#7c3aed', to: '#5b21b6', accent: '#f97316' }, // binafsha + tok sariq
  { from: '#0ea5e9', to: '#0c4a6e', accent: '#fbbf24' }, // ko'k + sariq
  { from: '#ec4899', to: '#831843', accent: '#10b981' }, // pushti + yashil
  { from: '#f59e0b', to: '#7c2d12', accent: '#3b82f6' }, // sariq + ko'k
  { from: '#10b981', to: '#064e3b', accent: '#f97316' }, // yashil + sariq
  { from: '#ef4444', to: '#7f1d1d', accent: '#fbbf24' }, // qizil + sariq
];

export default function PromoCarousel() {
  const { t, i18n } = useTranslation();
  const { activeBanners } = useAdminData();
  const slides = activeBanners;
  const lang = i18n.language;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    if (isPaused || !slides || slides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, slides]);

  if (!slides || slides.length === 0) {
    return (
      <section className="container-custom pt-4">
        <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-900 text-white p-8 md:p-12 text-center">
          <h1 className="text-2xl md:text-4xl font-bold mb-3">{t('hero.title')}</h1>
          <p className="text-base md:text-lg text-primary-100 mb-5">{t('hero.subtitle')}</p>
          <Link to="/catalog" className="inline-flex items-center gap-2 bg-white text-primary-700 px-5 py-2.5 rounded-full font-semibold">
            {t('hero.cta')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    );
  }

  const goNext = () => setActiveIndex(prev => (prev + 1) % slides.length);
  const goPrev = () => setActiveIndex(prev => (prev - 1 + slides.length) % slides.length);

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchMove = (e) => { touchEndX.current = e.touches[0].clientX; };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) diff > 0 ? goNext() : goPrev();
  };

  return (
    <section className="container-custom pt-4">
      <div
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Asosiy karusel — yumaloq burchaklar */}
        <div className="relative rounded-2xl overflow-hidden h-[280px] sm:h-[320px] md:h-[380px] lg:h-[420px]">
          {slides.map((slide, idx) => {
            const isActive = idx === activeIndex;
            const safeSalePrice = Number(slide.salePrice) || 0;
            const safeOldPrice = Number(slide.oldPrice) || 0;
            const safeCreditMonths = Number(slide.creditMonths) || 0;
            const monthly = safeCreditMonths > 0 && safeSalePrice > 0
              ? calculateMonthly(safeSalePrice, safeCreditMonths)
              : 0;

            const colors = SLIDE_BG_COLORS[idx % SLIDE_BG_COLORS.length];

            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
                style={{ background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)` }}
              >
                <div className="relative h-full flex items-center">
                  {/* CHAP - Matn */}
                  <div className="w-1/2 h-full flex items-center px-6 sm:px-10 md:px-14 lg:px-20">
                    <div className="text-white">
                      {/* Mahsulot nomi */}
                      <h2
                        className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold mb-2 leading-tight transition-all duration-700 line-clamp-2 ${
                          isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                        }`}
                        style={{
                          transitionDelay: isActive ? '300ms' : '0ms',
                          textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                        }}
                      >
                        {slide.productName?.[lang] || ''}
                      </h2>

                      {/* Qisqa tasnif (description) */}
                      {slide.description?.[lang] && (
                        <p
                          className={`text-sm sm:text-base text-white/90 mb-3 line-clamp-2 transition-all duration-700 ${
                            isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                          }`}
                          style={{
                            transitionDelay: isActive ? '400ms' : '0ms',
                            textShadow: '0 1px 6px rgba(0,0,0,0.3)',
                          }}
                        >
                          {slide.description[lang]}
                        </p>
                      )}

                      {/* Narxlar — Uzum style: katta sariq blok */}
                      {safeSalePrice > 0 && (
                        <div
                          className={`transition-all duration-700 ${
                            isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                          }`}
                          style={{ transitionDelay: isActive ? '500ms' : '0ms' }}
                        >
                          {/* Asosiy narx — katta */}
                          <div
                            className="inline-block rounded-full px-4 py-1.5 sm:px-5 sm:py-2 mb-2 shadow-lg"
                            style={{ background: colors.accent }}
                          >
                            <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white">
                              {formatPrice(safeSalePrice)}
                            </span>
                            <span className="text-sm sm:text-base text-white/90 ml-1.5">{t('common.currency')}</span>
                          </div>

                          {/* Eski narx */}
                          {safeOldPrice > 0 && (
                            <div className="text-sm md:text-base text-white/70 line-through mb-1.5">
                              {formatPrice(safeOldPrice)} {t('common.currency')}
                            </div>
                          )}

                          {/* Oylik to'lov */}
                          {monthly > 0 && (
                            <div className="text-xs sm:text-sm text-white/90 mb-3">
                              💳 {formatPrice(monthly)} {t('common.currency')} × {safeCreditMonths} oy
                            </div>
                          )}
                        </div>
                      )}

                      {/* CTA tugma */}
                      <div
                        className={`transition-all duration-700 ${
                          isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                        }`}
                        style={{ transitionDelay: isActive ? '700ms' : '0ms' }}
                      >
                        <Link
                          to={slide.link || '/catalog'}
                          className="inline-flex items-center gap-2 bg-white text-gray-900 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-bold hover:scale-105 transition-all shadow-xl text-xs sm:text-sm"
                        >
                          {t('products.buy')}
                          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* O'NG - Rasm — maksimal kattalashtirilgan */}
                  <div className="w-1/2 h-full flex items-center justify-center relative">
                    <img
                      src={slide.image}
                      alt={slide.productName?.[lang] || ''}
                      className={`object-contain transition-transform duration-700 ${
                        isActive ? 'scale-100' : 'scale-90'
                      }`}
                      style={{
                        width: '110%',
                        height: '120%',
                        maxWidth: 'none',
                        filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.4))'
                      }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Strelkalar — karusel ichida, rasmdan tashqarida */}
          {slides.length > 1 && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 bg-white/30 hover:bg-white/50 backdrop-blur rounded-full flex items-center justify-center transition-all"
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={goNext}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 bg-white/30 hover:bg-white/50 backdrop-blur rounded-full flex items-center justify-center transition-all"
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </>
          )}

          {/* Pastdagi indikatorlar */}
          {slides.length > 1 && (
            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === activeIndex
                      ? 'bg-white w-6'
                      : 'bg-white/50 hover:bg-white/70 w-1.5'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
