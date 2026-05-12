import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { useAuthGate } from '../context/AuthGateContext';
import { useAdminData } from '../context/AdminDataContext';
import { resolveImage } from '../api/client';
import MIcon from './MIcon';

// localStorage'dan joriy foydalanuvchini olish (subscriptionsiz, biroz primitiv)
const useCurrentUser = () => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ssmart_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  useEffect(() => {
    const handler = () => {
      try {
        const saved = localStorage.getItem('ssmart_user');
        setUser(saved ? JSON.parse(saved) : null);
      } catch {
        setUser(null);
      }
    };
    window.addEventListener('storage', handler);
    window.addEventListener('ssmart-user-changed', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('ssmart-user-changed', handler);
    };
  }, []);
  return user;
};

export default function Header() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount, favorites } = useShop();
  const { requireAuth } = useAuthGate();
  const { visibleCategories } = useAdminData();
  // Mega menu va mobile menu uchun — barcha mavjud kategoriyalar (B/U ham)
  const categories = visibleCategories;
  // Desktop pastki nav (5 ta tezkor) uchun — B/U alohida tugma bor, takrorlanmasin
  const topCategories = visibleCategories.filter(c => c.id !== 'used').slice(0, 5);
  const currentUser = useCurrentUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const megaRef = useRef(null);
  const megaBtnRef = useRef(null);

  const handleProfileClick = (e) => {
    e.preventDefault();
    if (currentUser) {
      navigate('/profile');
    } else {
      requireAuth(() => navigate('/profile'));
    }
  };

  const userDisplayName = currentUser?.full_name?.split(' ')[0] || currentUser?.telegram_username || '';

  const lang = i18n.language;

  // Mega menu tashqarisiga bosilganda yopish — toggle tugmasini istisno qilamiz
  useEffect(() => {
    const handler = (e) => {
      const inPanel = megaRef.current && megaRef.current.contains(e.target);
      const inToggleBtn = megaBtnRef.current && megaBtnRef.current.contains(e.target);
      if (!inPanel && !inToggleBtn) {
        setMegaOpen(false);
      }
    };
    if (megaOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [megaOpen]);

  // Sahifa o'zgarganda menyularni yopish
  useEffect(() => {
    setMegaOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  const changeLang = (lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.lang = lng;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      {/* Top thin bar - desktop only */}
      <div className="hidden md:block bg-gray-50 border-b border-gray-100 text-xs">
        <div className="container-custom flex items-center justify-between h-8">
          <div className="flex items-center gap-4 text-gray-600">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-base text-primary-600">location_on</span>
              {t('footer.addressValue')}
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-base text-primary-600">timer</span>
              {t('footer.workHoursValue')}
            </span>
          </div>
          <a href="tel:+998948080055" className="flex items-center gap-1 text-gray-700 hover:text-primary-600">
            <MIcon name="call" size={14} />
            +998 94 808 00 55
          </a>
        </div>
      </div>

      <div className="container-custom">
        {/* Main bar */}
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <img
              src="/logo.png"
              alt="Smart"
              className="h-12 sm:h-14 md:h-16 w-auto"
            />
          </Link>

          {/* "Barcha toifalar" tugmasi - desktop */}
          <button
            ref={megaBtnRef}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setMegaOpen((prev) => !prev);
            }}
            className="hidden lg:flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex-shrink-0"
          >
            <MIcon name={megaOpen ? 'close' : 'menu'} size={18} />
            <span className="text-sm">{t('nav.allCategories')}</span>
          </button>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl">
            <div className="relative w-full">
              <MIcon name="search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('nav.search')}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:bg-white transition-colors text-sm"
              />
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Language — mobil va desktop ikkalasida ham ko'rinadi */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => changeLang('uz')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  i18n.language === 'uz' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'
                }`}
              >
                UZ
              </button>
              <button
                onClick={() => changeLang('ru')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  i18n.language === 'ru' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'
                }`}
              >
                RU
              </button>
            </div>

            <Link to="/favorites" className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label={t('nav.favorites')}>
              <MIcon name="favorite" size={22} className="text-gray-700" />
              {favorites.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                  {favorites.length}
                </span>
              )}
            </Link>

            <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label={t('nav.cart')}>
              <MIcon name="shopping_cart" size={22} className="text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={handleProfileClick}
              className="hidden sm:flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={t('nav.profile')}
            >
              {currentUser?.photo_url ? (
                <img
                  src={resolveImage(currentUser.photo_url)}
                  alt=""
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  currentUser ? 'bg-primary-600 text-white text-xs font-bold' : 'bg-gray-100 text-gray-700'
                }`}>
                  {currentUser
                    ? (userDisplayName?.[0] || 'U').toUpperCase()
                    : <MIcon name="person" size={18} />}
                </div>
              )}
              {currentUser && (
                <span className="text-sm font-medium text-gray-900 truncate max-w-[100px]">
                  {userDisplayName}
                </span>
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setMobileOpen((prev) => !prev);
              }}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Menu"
            >
              <MIcon name={mobileOpen ? 'close' : 'menu'} size={22} />
            </button>
          </div>
        </div>

        {/* Bottom navigation - desktop */}
        <nav className="hidden lg:flex items-center gap-6 h-11 border-t border-gray-100 text-sm">
          <Link
            to="/"
            className={`font-medium transition-colors whitespace-nowrap ${
              location.pathname === '/' ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
            }`}
          >
            {t('nav.home')}
          </Link>
          <Link
            to="/b-u"
            className="group relative flex items-center gap-1.5 px-3 py-1.5 -my-1 rounded-full bg-gradient-to-r from-gray-900 to-black text-white font-semibold text-xs shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 ring-1 ring-black/10 whitespace-nowrap"
          >
            <img
              src="https://cdn.simpleicons.org/apple/ffffff"
              alt=""
              className="inline-block w-4 h-4 object-contain align-middle"
            />
            <span>{t('nav.bu')}</span>
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none shadow-sm">
              NEW
            </span>
          </Link>
          {/* Quick category links */}
          {topCategories.map(cat => (
            <Link
              key={cat.id}
              to={`/catalog?category=${cat.id}`}
              className="text-gray-700 hover:text-primary-600 transition-colors whitespace-nowrap"
            >
              <img src={cat.icon} alt="" className="inline-block w-5 h-5 object-contain mr-1 align-middle" />
              {cat.shortName?.[lang] || cat.name[lang]}
            </Link>
          ))}

          {/* "Ustalar" tugmasi — o'ng oxirida, 1.5x kattaroq, ko'zga tashlanadigan */}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="group relative ml-auto flex items-center gap-2 px-5 py-2.5 -my-2.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white font-bold text-sm shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 ring-2 ring-orange-300/50 whitespace-nowrap"
          >
            <MIcon name="construction" size={20} className="text-white" />
            <span>{lang === 'ru' ? 'Мастера' : 'Ustalar'}</span>
            <span className="absolute -top-1.5 -right-1.5 bg-yellow-300 text-orange-700 text-[10px] font-extrabold w-5 h-5 rounded-full leading-none shadow-sm flex items-center justify-center">
              ★
            </span>
          </button>
        </nav>
      </div>

      {/* Mega menu - desktop */}
      {megaOpen && (
        <div
          ref={megaRef}
          className="absolute left-0 right-0 bg-white border-b border-gray-200 shadow-lg animate-fade-in z-40"
        >
          <div className="container-custom py-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map(cat => (
                <div key={cat.id} className="group">
                  <Link
                    to={`/catalog?category=${cat.id}`}
                    className="flex items-center gap-2 font-semibold text-gray-900 hover:text-primary-600 mb-2"
                  >
                    <img src={cat.icon} alt="" className="w-7 h-7 object-contain" />
                    <span>{cat.name[lang]}</span>
                  </Link>
                  <ul className="space-y-1 ml-7">
                    {cat.subcategories.slice(0, 6).map(sub => (
                      <li key={sub.id}>
                        <Link
                          to={`/catalog?subcategory=${sub.id}`}
                          className="text-sm text-gray-600 hover:text-primary-600 transition-colors block py-0.5"
                        >
                          {sub.name[lang]}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 max-h-[80vh] overflow-y-auto animate-fade-in">
          <div className="container-custom py-4">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <MIcon name="search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('nav.search')}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                />
              </div>
            </form>

            {/* Quick links */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Link to="/" className="px-3 py-2.5 bg-gray-50 rounded-lg text-sm font-medium flex items-center gap-1.5">
                <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/House/3D/house_3d.png" alt="" className="w-5 h-5 object-contain" />
                <span>{t('nav.home')}</span>
              </Link>
              <Link to="/catalog" className="px-3 py-2.5 bg-gray-50 rounded-lg text-sm font-medium flex items-center gap-1.5">
                <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Package/3D/package_3d.png" alt="" className="w-5 h-5 object-contain" />
                <span>{t('nav.catalog')}</span>
              </Link>
              <Link to="/b-u" className="relative px-3 py-2.5 bg-gradient-to-r from-gray-900 to-black text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow-md ring-1 ring-black/10">
                <img src="https://cdn.simpleicons.org/apple/ffffff" alt="" className="w-5 h-5 object-contain" />
                <span>{t('nav.bu')}</span>
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">NEW</span>
              </Link>
              <Link to="/profile" className="px-3 py-2.5 bg-gray-50 rounded-lg text-sm font-medium flex items-center gap-1.5">
                <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Bust%20in%20silhouette/3D/bust_in_silhouette_3d.png" alt="" className="w-5 h-5 object-contain" />
                <span>{t('nav.profile')}</span>
              </Link>
              <Link to="/cart" className="px-3 py-2.5 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium flex items-center gap-1.5">
                <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Shopping%20cart/3D/shopping_cart_3d.png" alt="" className="w-5 h-5 object-contain" />
                <span>{t('nav.cart')}</span>
                {cartCount > 0 && (
                  <span className="ml-auto bg-primary-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Categories */}
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 px-1">
                {t('nav.allCategories')}
              </h3>
              <div className="space-y-1">
                {categories.map(cat => (
                  <details key={cat.id} className="group">
                    <summary className="flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 rounded-lg cursor-pointer list-none">
                      <span className="flex items-center gap-2 text-sm font-medium">
                        <img src={cat.icon} alt="" className="w-6 h-6 object-contain" />
                        {cat.name[lang]}
                      </span>
                      <MIcon name="expand_more" size={18} className="text-gray-400 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="ml-9 mt-1 space-y-1">
                      <Link
                        to={`/catalog?category=${cat.id}`}
                        className="block px-3 py-2 text-sm text-primary-600 hover:bg-gray-50 rounded-lg"
                      >
                        {t('common.showAll')} →
                      </Link>
                      {cat.subcategories.map(sub => (
                        <Link
                          key={sub.id}
                          to={`/catalog?subcategory=${sub.id}`}
                          className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                        >
                          {sub.name[lang]}
                        </Link>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </div>

            {/* Language */}
            <div className="flex items-center gap-2 px-3 pt-3 border-t border-gray-100">
              <MIcon name="language" size={16} className="text-gray-500" />
              <button
                onClick={() => changeLang('uz')}
                className={`px-3 py-1.5 text-sm rounded-md ${
                  i18n.language === 'uz' ? 'bg-primary-600 text-white' : 'bg-gray-100'
                }`}
              >
                O'zbekcha
              </button>
              <button
                onClick={() => changeLang('ru')}
                className={`px-3 py-1.5 text-sm rounded-md ${
                  i18n.language === 'ru' ? 'bg-primary-600 text-white' : 'bg-gray-100'
                }`}
              >
                Русский
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
