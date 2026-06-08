import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useShop } from '../context/ShopContext';
import { useAuthGate } from '../context/AuthGateContext';
import MIcon from './MIcon';

// Mobil pastki navigatsiya — faqat md dan past ekranlarda ko'rinadi
export default function MobileBottomNav() {
  const { t } = useTranslation();
  const { cartCount, favorites } = useShop();
  const location = useLocation();
  const navigate = useNavigate();
  const { requireAuth } = useAuthGate();

  const items = [
    { to: '/', icon: 'home', label: t('nav.home', 'Bosh sahifa'), exact: true },
    { to: '/catalog', icon: 'apps', label: t('nav.catalog', 'Katalog') },
    { to: '/cart', icon: 'shopping_cart', label: t('nav.cart', 'Savat'), badge: cartCount },
    { to: '/favorites', icon: 'favorite', label: t('nav.favorites', 'Sevimli'), badge: favorites.length },
    { to: '/profile', icon: 'person', label: t('nav.profile', 'Kabinet'), gated: true },
  ];

  const handleClick = (item) => (e) => {
    if (!item.gated) return;
    e.preventDefault();
    if (localStorage.getItem('ssmart_user')) {
      navigate(item.to);
    } else {
      requireAuth(() => navigate(item.to));
    }
  };

  return (
    <>
      {/* Pastki navbar uchun joy (kontent ostida qoplanmasin) */}
      <div className="md:hidden h-16" aria-hidden />

      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/85 backdrop-blur-xl border-t border-gray-200/80 shadow-[0_-6px_24px_-18px_rgba(16,17,23,0.35)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
      >
        <div className="flex items-stretch justify-around h-16">
          {items.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={handleClick(item)}
                className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 text-[10px] font-semibold transition-colors ${
                  isActive ? 'text-primary-700' : 'text-gray-500'
                }`}
              >
                {/* Active — yuqorida brand aksent chizig'i */}
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-b-full bg-gradient-to-r from-primary-500 to-primary-700" />
                )}
                <div className="relative">
                  {/* Active icon ortida yumshoq pelena */}
                  <span
                    className={`absolute inset-0 -m-1.5 rounded-xl transition-all duration-200 ${
                      isActive ? 'bg-primary-50 scale-100 opacity-100' : 'scale-50 opacity-0'
                    }`}
                  />
                  <MIcon
                    name={item.icon}
                    size={24}
                    fill={isActive}
                    className={`relative transition-transform duration-200 ${isActive ? 'text-primary-700 -translate-y-px' : 'text-gray-600'}`}
                  />
                  {item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}
