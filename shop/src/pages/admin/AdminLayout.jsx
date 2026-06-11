import { Outlet, NavLink, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Package, Image as ImageIcon, LogOut, Tag, BarChart3, Home, Menu, X, MapPin, UserCog, ClipboardList, Sun, Moon, AlertTriangle, Star, Store as StoreIcon, Users as UsersIcon, Tv, Wrench, CreditCard } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminThemeProvider, useAdminTheme } from '../../context/AdminThemeContext';
import { getCurrentHost, hostAllowsRole, urlForRole } from '../../utils/adminAccess';

function AdminLayoutInner() {
  const { user, logout, isAdmin, isSuperAdmin, loading } = useAuth();
  const { isDark, toggle } = useAdminTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Foydalanuvchi noto'g'ri subdomenda bo'lsa to'g'ri joyga yo'naltirish
  useEffect(() => {
    if (loading || !user) return;
    if (!hostAllowsRole(getCurrentHost(), user.role)) {
      const correctUrl = urlForRole(user.role);
      if (correctUrl) window.location.replace(correctUrl);
    }
  }, [loading, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/login" replace />;

  // Noto'g'ri subdomen — useEffect redirect qilguncha hech narsa ko'rsatmaymiz
  if (!hostAllowsRole(getCurrentHost(), user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const role = user.role;
  // Har bir element bir mahsulot bo'limiga tegishli ('shop' yoki 'tv').
  // Switcher orqali tanlangan bo'lim elementlarigina ko'rinadi — aralashmaydi.
  const navItems = [
    // --- Ssmart Shop ---
    { to: '/', label: 'Dashboard', icon: BarChart3, end: true, roles: ['superadmin'], product: 'shop' },
    { to: '/products', label: 'Mahsulotlar', icon: Package, roles: ['superadmin', 'admin', 'staff'], product: 'shop' },
    { to: '/low-stock', label: 'Kam qolgan', icon: AlertTriangle, roles: ['superadmin', 'admin', 'staff'], product: 'shop' },
    { to: '/banners', label: 'Reklama bannerlar', icon: ImageIcon, roles: ['superadmin'], product: 'shop' },
    { to: '/orders', label: 'Buyurtmalar', icon: ClipboardList, roles: ['superadmin', 'admin', 'staff'], product: 'shop' },
    { to: '/my-stats', label: 'Statistika', icon: BarChart3, roles: ['staff'], product: 'shop' },
    { to: '/sales', label: 'Aksiyalar', icon: Tag, roles: ['superadmin'], product: 'shop' },
    { to: '/popular', label: 'Ommabop', icon: Star, roles: ['superadmin'], product: 'shop' },
    { to: '/stores', label: 'Magazinlar', icon: StoreIcon, roles: ['superadmin'], product: 'shop' },
    { to: '/instalments', label: 'Rassrochka (Atmos)', icon: CreditCard, roles: ['superadmin'], product: 'shop' },
    { to: '/pickup-points', label: 'Topshirish punktlari', icon: MapPin, roles: ['superadmin'], product: 'shop' },
    { to: '/sales-admins', label: 'Sotuv Adminlari', icon: UserCog, roles: ['superadmin'], product: 'shop' },
    { to: '/users', label: 'Foydalanuvchilar', icon: UsersIcon, roles: ['superadmin'], product: 'shop' },
    // --- Ssmart TV ---
    { to: '/tv-admins', label: 'Ssmart TV adminlari', icon: Tv, roles: ['superadmin'], product: 'tv' },
    { to: '/tv-carousel', label: 'Reklama Bannerlari', icon: ImageIcon, roles: ['superadmin'], product: 'tv' },
    // --- Ssmart Pro ---
    { to: '/pro-carousel', label: 'Reklama Karusel', icon: ImageIcon, roles: ['superadmin'], product: 'pro' },
  ];

  // Har bir bo'limning yo'llari — shu yo'llarda bo'lsak mos rejim faollashadi.
  const TV_PATHS = ['/tv-admins', '/tv-carousel'];
  const PRO_PATHS = ['/pro-carousel'];
  const activeProduct = PRO_PATHS.some(p => location.pathname.startsWith(p))
    ? 'pro'
    : TV_PATHS.some(p => location.pathname.startsWith(p))
    ? 'tv'
    : 'shop';

  const visibleNav = navItems.filter(
    item => item.roles.includes(role) && item.product === activeProduct
  );

  const linkClass = ({ isActive }) =>
    `group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'admin-nav-active'
        : 'text-gray-700 hover:bg-gray-100 hover:translate-x-0.5'
    }`;

  return (
    <div className="admin-shell min-h-screen flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        admin-sidebar fixed lg:sticky top-0 left-0 z-50 h-screen w-64 flex flex-col
        transform transition-transform duration-300 lg:transform-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(circle at 0% 0%, rgba(106, 28, 199, 0.10), transparent 60%)' }}
          />
          <div className="flex items-center gap-2.5 relative">
            <div
              className="w-11 h-11 flex items-center justify-center flex-shrink-0 rounded-2xl ring-1 ring-primary-500/20"
              style={{
                background: 'linear-gradient(135deg, rgba(138, 76, 219, 0.18), rgba(70, 0, 135, 0.08))',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 6px 16px -6px rgba(70, 0, 135, 0.4)',
              }}
            >
              <img src="/logo.png" alt="SMART" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="font-bold text-gray-900 tracking-tight">SMART <span className="admin-gradient-text">Admin</span></div>
              <div className="text-[10px] text-gray-500 uppercase tracking-[0.18em] font-semibold">
                {isSuperAdmin ? 'Super Admin' : 'Admin'}
              </div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg relative">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mahsulot switcher — logo ostida, ko'zga tashlanadigan segment-control.
            Tanlangan bo'lim menyuni filterlaydi (Shop/TV alohida). */}
        {isSuperAdmin && (
          <div className="px-3 pt-3 pb-1">
            <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-gray-100 rounded-2xl">
              {[
                { key: 'shop', label: 'Shop', icon: StoreIcon, to: '/' },
                { key: 'tv', label: 'TV', icon: Tv, to: '/tv-admins' },
                { key: 'pro', label: 'Pro', icon: Wrench, to: '/pro-carousel' },
              ].map((p) => {
                const active = activeProduct === p.key;
                return (
                  <button
                    key={p.key}
                    type="button"
                    disabled={p.disabled}
                    title={p.disabled ? 'Ssmart Pro — tez kunda' : `Ssmart ${p.label}`}
                    onClick={() => {
                      if (p.disabled) return;
                      navigate(p.to);
                      setSidebarOpen(false);
                    }}
                    className={`flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-200 ${
                      active
                        ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-md scale-[1.03]'
                        : p.disabled
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:text-primary-700 hover:bg-white'
                    }`}
                  >
                    <p.icon className="w-[18px] h-[18px]" />
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-gray-400 px-3 py-2">
            Menyu
          </div>
          {visibleNav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={linkClass}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Pastki bo'lim */}
        <div className="p-3 border-t border-gray-100 space-y-0.5">
          <a
            href="https://ssmart.uz"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Saytga qaytish</span>
          </a>

          <button
            onClick={toggle}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors w-full"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-gray-600" />}
            <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
          </button>

          {/* User card */}
          <div className="mt-2 mx-1 p-2.5 rounded-xl bg-gradient-to-br from-primary-50 to-transparent dark:from-primary-900/20 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 ring-2 ring-white shadow-md">
              {(user.name || '?')[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-gray-900 truncate">{user.name}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">{isSuperAdmin ? 'Super Admin' : 'Admin'}</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="mt-1 flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            <span>Chiqish</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile header */}
        <div className="lg:hidden bg-white/80 backdrop-blur border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold flex-1 admin-gradient-text">SMART Admin</span>
          <button onClick={toggle} className="p-1.5 hover:bg-gray-100 rounded-lg">
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <main className="p-4 md:p-6 admin-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  return (
    <AdminThemeProvider>
      <AdminLayoutInner />
    </AdminThemeProvider>
  );
}
