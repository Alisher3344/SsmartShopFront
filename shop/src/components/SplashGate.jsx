import { useEffect } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import { resolveImage } from '../api/client';

/**
 * Boshlang'ich yuklash ekranini (index.html'dagi #app-splash) boshqaradi.
 * Splash quyidagilar tayyor bo'lgach yo'qoladi:
 *   1) AdminDataContext ma'lumoti yuklandi (mahsulot/banner/store) — `loading === false`
 *   2) Yuqoridagi (above-the-fold) KRITIK rasmlar — hero bannerlar + birinchi
 *      mahsulotlar — orqa fonda yuklanib bo'ldi (splash ketgach rasm "sakramasin")
 *   3) Shriftlar tayyor (document.fonts.ready) — matn sakramasligi uchun
 *   4) Minimal ko'rinish vaqti (350ms) — splash bir lahzada "yiltirab" o'tmasligi uchun
 * Rasm/promise osilib qolsa — 5s ichki + index.html'dagi 7s xavfsizlik chegarasi yopadi.
 */

// Rasmni orqa fonda yuklaydi; load/error/dekod bo'lganda hal bo'ladi (hech qachon
// rejekt qilmaydi — bitta buzuq rasm splash'ni osib qo'ymasligi uchun).
function preloadImage(url) {
  return new Promise((resolve) => {
    if (!url) return resolve();
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = url;
    if (img.decode) {
      img.decode().then(() => resolve()).catch(() => {});
    }
  });
}

export default function SplashGate() {
  const { loading, banners, products } = useAdminData();

  useEffect(() => {
    if (loading) return; // ma'lumot hali kelmadi — kutamiz

    let done = false;
    const hide = () => {
      if (done) return;
      done = true;
      if (typeof window !== 'undefined' && typeof window.__hideSplash === 'function') {
        window.__hideSplash();
      }
    };

    // Kritik (yuqoridagi) rasm URL'lari — hero bannerlar (til variantlari bilan)
    // + birinchi ~12 mahsulot. Shular yuklangach orqa fon "tayyor" bo'ladi.
    const urls = new Set();
    (banners || []).forEach((b) => {
      if (b.image) urls.add(b.image);
      if (b.imageUz) urls.add(resolveImage(b.imageUz));
      if (b.imageRu) urls.add(resolveImage(b.imageRu));
    });
    (products || []).slice(0, 12).forEach((p) => {
      if (p.image) urls.add(p.image);
    });

    const imagesReady = Promise.all([...urls].map(preloadImage));
    const minDelay = new Promise((r) => setTimeout(r, 350));
    const fontsReady =
      typeof document !== 'undefined' && document.fonts && document.fonts.ready
        ? document.fonts.ready
        : Promise.resolve();

    Promise.all([minDelay, fontsReady, imagesReady]).then(hide);

    // Rasmlar/shriftlar osilib qolsa ham — 5s dan keyin baribir yopamiz
    const safety = setTimeout(hide, 5000);
    return () => clearTimeout(safety);
  }, [loading, banners, products]);

  return null;
}
