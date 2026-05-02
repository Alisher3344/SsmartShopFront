import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useShop } from '../context/ShopContext';
import MIcon from './MIcon';

// Mobil pastki navigatsiya — faqat md dan past ekranlarda ko'rinadi
export default function MobileBottomNav() {
  const { t } = useTranslation();
  const { cartCount, favorites } = useShop();
  const location = useLocation();

  const items = [
    { to: '/', icon: 'home', label: t('nav.home', 'Bosh sahifa'), exact: true },
    { to: '/catalog', icon: 'apps', label: t('nav.catalog', 'Katalog') },
    { to: '/cart', icon: 'shopping_cart', label: t('nav.cart', 'Savat'), badge: cartCount },
    { to: '/favorites', icon: 'favorite', label: t('nav.favorites', 'Sevimli'), badge: favorites.length },
    { to: '/profile', icon: 'person', label: t('nav.profile', 'Kabinet') },
  ];

  return (
    <>
      {/* Pastki navbar uchun joy (kontent ostida qoplanmasin) */}
      <div className="md:hidden h-16" aria-hidden />

      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200"
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
                className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-primary-600' : 'text-gray-500'
                }`}
              >
                <div className="relative">
                  <MIcon
                    name={item.icon}
                    size={24}
                    fill={isActive}
                    className={isActive ? 'text-primary-600' : 'text-gray-600'}
                  />
                  {item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
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
