import { useTranslation } from 'react-i18next';
import MIcon from './MIcon';

// Tashqi subdomenlar (Header.jsx bilan bir xil — Cloudflare tunnel orqali)
const SSMART_TV_URL = 'https://tty0x.tv.ssmart.uz';        // Ssmart TV (IPTV+VOD)
const SSMART_MASTER_URL = 'https://pro.ssmart.uz';   // Ustalar (pro/master paneli)

/**
 * Ssmart TV + Ustalar CTA tugmalari — faqat bosh sahifada, reklama banneri
 * ostida (<1024px da) ishlatiladi. Header'dagi animatsiya class'larini
 * (`btn-nav-cta` ...) qayta ishlatadi. Mobilda ixcham — yonma-yon, kichik.
 */
export default function SsmartCtaButtons({ className = '' }) {
  const { t } = useTranslation();

  return (
    <div
      className={`flex flex-row items-center justify-center gap-2.5 sm:gap-4 ${className}`}
    >
      {/* Ssmart TV */}
      <a
        href={SSMART_TV_URL}
        className="btn-nav-cta btn-nav-tv group relative flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 py-2.5 sm:px-6 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white font-bold text-[13px] sm:text-base shadow-md hover:shadow-lg transition-all duration-200 ring-2 ring-violet-300/50 whitespace-nowrap flex-1 sm:flex-initial sm:min-w-[200px]"
      >
        <MIcon name="live_tv" className="text-white text-[18px] sm:text-[22px]" />
        <span>{t('nav.tv')}</span>
        <span className="badge-live absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded-full leading-none shadow-sm">
          LIVE
        </span>
      </a>

      {/* Ustalar */}
      <a
        href={SSMART_MASTER_URL}
        className="btn-nav-cta btn-nav-master group relative flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 py-2.5 sm:px-6 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white font-bold text-[13px] sm:text-base shadow-md hover:shadow-lg transition-all duration-200 ring-2 ring-orange-300/50 whitespace-nowrap flex-1 sm:flex-initial sm:min-w-[200px]"
      >
        <MIcon name="construction" className="text-white text-[18px] sm:text-[22px]" />
        <span>{t('nav.ustalar')}</span>
        <span className="badge-star absolute -top-1.5 -right-1.5 bg-yellow-300 text-orange-700 text-[10px] sm:text-[11px] font-extrabold w-4 h-4 sm:w-5 sm:h-5 rounded-full leading-none shadow-sm flex items-center justify-center">
          ★
        </span>
      </a>
    </div>
  );
}
