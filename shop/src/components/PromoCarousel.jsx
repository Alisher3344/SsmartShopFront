import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAdminData } from '../context/AdminDataContext';
import { resolveImage } from '../api/client';

// Cheksiz slide karusel (1240×413). O'ngdan chapga doimiy aylanish.
// Texnika: oxiriga birinchi slide nusxasi qo'shiladi. Tasma oxirgi nusxaga yetganda
// transitionsiz boshiga sakraydi — foydalanuvchi orqaga qaytayotganini sezmaydi.
const AUTOPLAY_MS = 3000;
const TRANSITION_MS = 600;

export default function PromoCarousel() {
  const { i18n } = useTranslation();
  const { activeBanners } = useAdminData();
  const lang = i18n.language === 'ru' ? 'ru' : 'uz';
  const allSlides = activeBanners || [];
  // Faqat 'home' slot bannerlari karuselda chiqadi
  const slides = allSlides
    .filter((b) => (b.slot || 'home') === 'home')
    .filter((b) => {
      const img = lang === 'ru' ? (b.imageRu || b.image) : (b.imageUz || b.image);
      return !!img;
    });
  const len = slides.length;
  const hasClone = len > 1;
  // Renderlash uchun: ortiqcha bitta nusxa oxirida
  const renderSlides = hasClone ? [...slides, slides[0]] : slides;

  const [visualIndex, setVisualIndex] = useState(0);
  const [withTransition, setWithTransition] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const jumpTimerRef = useRef(null);
  const reenableTimerRef = useRef(null);

  // Slidelar o'zgarsa indexni nolga qaytaramiz
  useEffect(() => {
    setVisualIndex(0);
    setWithTransition(true);
  }, [len, lang]);

  // Auto-play
  useEffect(() => {
    if (isPaused || len <= 1) return;
    const interval = setInterval(() => {
      setWithTransition(true);
      setVisualIndex((prev) => prev + 1);
    }, AUTOPLAY_MS);
    return () => clearInterval(interval);
  }, [isPaused, len]);

  // Klonga (visualIndex === len) yetganda: transitsiya tugagandan keyin
  // transitionsiz holatda boshiga (0) sakraymiz
  useEffect(() => {
    if (!hasClone || visualIndex !== len) return;
    jumpTimerRef.current = setTimeout(() => {
      setWithTransition(false);
      setVisualIndex(0);
      // Keyingi frame'da transition'ni yana yoqamiz, aks holda 0 ga sakrash animatsiyali bo'lib qoladi
      reenableTimerRef.current = setTimeout(() => setWithTransition(true), 50);
    }, TRANSITION_MS);
    return () => {
      clearTimeout(jumpTimerRef.current);
      clearTimeout(reenableTimerRef.current);
    };
  }, [visualIndex, len, hasClone]);

  if (len === 0) return null;

  const realIndex = visualIndex % len;

  const goNext = () => {
    setWithTransition(true);
    setVisualIndex((prev) => (prev >= len ? 1 : prev + 1));
  };

  const goPrev = () => {
    if (visualIndex === 0) {
      // Boshida turibmiz — transitionsiz klonga (len) sakraymiz,
      // keyin oddiy transitsiya bilan oxirgi haqiqiy slidega (len-1) suriladi.
      setWithTransition(false);
      setVisualIndex(len);
      requestAnimationFrame(() => {
        setWithTransition(true);
        setVisualIndex(len - 1);
      });
    } else {
      setWithTransition(true);
      setVisualIndex((prev) => prev - 1);
    }
  };

  const handleDotClick = (idx) => {
    setWithTransition(true);
    setVisualIndex(idx);
  };

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchMove = (e) => { touchEndX.current = e.touches[0].clientX; };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) (diff > 0 ? goNext : goPrev)();
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  return (
    <section className="container-custom pt-3 sm:pt-4">
      <div
        className="relative group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative rounded-xl sm:rounded-2xl overflow-hidden aspect-[1240/413] bg-gray-100 shadow-sm">
          {/* Slidelar tasmasi — gorizontal, transform bilan suriladi */}
          <div
            className="absolute inset-0 flex"
            style={{
              transform: `translateX(-${visualIndex * 100}%)`,
              transition: withTransition ? `transform ${TRANSITION_MS}ms ease-in-out` : 'none',
            }}
          >
            {renderSlides.map((slide, idx) => {
              const link = slide.link || '';
              const isExternal = /^https?:\/\//i.test(link);
              const imgSrc = lang === 'ru'
                ? (slide.imageRu || slide.image)
                : (slide.imageUz || slide.image);
              const Img = (
                <img
                  src={resolveImage(imgSrc)}
                  alt=""
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  draggable={false}
                  className="w-full h-full object-cover select-none"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              );
              const slideClass = 'relative flex-shrink-0 w-full h-full';
              const key = `${slide.id}-${idx}`;

              if (!link) {
                return <div key={key} className={slideClass}>{Img}</div>;
              }
              if (isExternal) {
                return (
                  <a key={key} href={link} target="_blank" rel="noopener noreferrer" className={slideClass} aria-label={`Slide ${idx + 1}`}>
                    {Img}
                  </a>
                );
              }
              return (
                <Link key={key} to={link} className={slideClass} aria-label={`Slide ${idx + 1}`}>
                  {Img}
                </Link>
              );
            })}
          </div>

          {/* Prev/Next tugmalari */}
          {len > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous slide"
                className="absolute left-2 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 bg-white/70 hover:bg-white text-gray-900 backdrop-blur-md rounded-full flex items-center justify-center transition-all shadow-md ring-1 ring-black/5 opacity-90 md:opacity-0 md:group-hover:opacity-100 hover:scale-110"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next slide"
                className="absolute right-2 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 bg-white/70 hover:bg-white text-gray-900 backdrop-blur-md rounded-full flex items-center justify-center transition-all shadow-md ring-1 ring-black/5 opacity-90 md:opacity-0 md:group-hover:opacity-100 hover:scale-110"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
              </button>
            </>
          )}

          {/* Dot indikatorlar — haqiqiy slide soni */}
          {len > 1 && (
            <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/30 backdrop-blur-md">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleDotClick(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === realIndex
                      ? 'bg-white w-6 sm:w-7'
                      : 'bg-white/50 hover:bg-white/80 w-1.5'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
