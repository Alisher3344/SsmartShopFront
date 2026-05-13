import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { Package, Image as ImageIcon, LogOut, Tag, BarChart3, Home, Menu, X, MapPin, UserCog, ClipboardList, Sun, Moon, AlertTriangle, Star, Store as StoreIcon, Users as UsersIcon } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminThemeProvider, useAdminTheme } from '../../context/AdminThemeContext';

function AdminLayoutInner() {
  const { user, logout, isAdmin, isSuperAdmin, loading } = useAuth();
  const { isDark, toggle } = useAdminTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/Tty0xssmart/login" replace />;
  if (!isAdmin) return <Navigate to="/Tty0xssmart/login" replace />;

  const handleLogout = () => {
    logout();
    navigate('/Tty0xssmart/login');
  };

  const role = user.role;
  const navItems = [
    // Faqat superadmin
    { to: '/Tty0xssmart', label: 'Dashboard', icon: BarChart3, end: true, roles: ['superadmin'] },
    // Mahsulotlar — barcha admin rollar (superadmin, sotuv admin, staff)
    { to: '/Tty0xssmart/products', label: 'Mahsulotlar', icon: Package, roles: ['superadmin', 'admin', 'staff'] },
    { to: '/Tty0xssmart/low-stock', label: 'Kam qolgan', icon: AlertTriangle, roles: ['superadmin', 'admin', 'staff'] },
    { to: '/Tty0xssmart/banners', label: 'Reklama bannerlar', icon: ImageIcon, roles: ['superadmin'] },
    // Buyurtmalar — barcha admin rollar
    { to: '/Tty0xssmart/orders', label: 'Buyurtmalar', icon: ClipboardList, roles: ['superadmin', 'admin', 'staff'] },
    // Faqat staff (magazin admin) — o'z magazinining statistikasi
    { to: '/Tty0xssmart/my-stats', label: 'Statistika', icon: BarChart3, roles: ['staff'] },
    // Faqat superadmin
    { to: '/Tty0xssmart/sales', label: 'Aksiyalar', icon: Tag, roles: ['superadmin'] },
    { to: '/Tty0xssmart/popular', label: 'Ommabop', icon: Star, roles: ['superadmin'] },
    { to: '/Tty0xssmart/stores', label: 'Magazinlar', icon: StoreIcon, roles: ['superadmin'] },
    { to: '/Tty0xssmart/pickup-points', label: 'Topshirish punktlari', icon: MapPin, roles: ['superadmin'] },
    { to: '/Tty0xssmart/sales-admins', label: 'Sotuv Adminlari', icon: UserCog, roles: ['superadmin'] },
    { to: '/Tty0xssmart/users', label: 'Foydalanuvchilar', icon: UsersIcon, roles: ['superadmin'] },
  ];

  const visibleNav = navItems.filter(item => item.roles.includes(role));

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
          <NavLink to="/" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition-colors">
            <Home className="w-4 h-4" />
            <span>Saytga qaytish</span>
          </NavLink>

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
