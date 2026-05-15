import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Package, Tag, Image as ImageIcon, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAdminData } from '../../context/AdminDataContext';
import { adminUsersApi } from '../../api/client';
import FluentEmoji from '../../components/FluentEmoji';

export default function AdminDashboard() {
  const { user, isSuperAdmin } = useAuth();
  const { products, banners, saleProducts, activeBanners } = useAdminData();
  const [usersCount, setUsersCount] = useState(null);

  useEffect(() => {
    if (!isSuperAdmin) return;
    adminUsersApi.list()
      .then(list => setUsersCount(Array.isArray(list) ? list.length : 0))
      .catch(() => setUsersCount(0));
  }, [isSuperAdmin]);

  // Faqat super admin Dashboard ko'radi — qolganlar (admin/staff) Mahsulotlarga
  if (!isSuperAdmin) return <Navigate to="/products" replace />;

  const lowStock = products.filter(p => p.stock < 5);
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  const stats = [
    { label: 'Jami mahsulotlar', value: products.length, icon: Package,
      color: 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 ring-1 ring-blue-200/60' },
    { label: 'Foydalanuvchilar', value: usersCount ?? '…', icon: Users,
      color: 'bg-gradient-to-br from-purple-50 to-violet-100 text-purple-700 ring-1 ring-violet-200/60' },
    { label: 'Aksiyada', value: saleProducts.length, icon: Tag,
      color: 'bg-gradient-to-br from-orange-50 to-amber-100 text-orange-700 ring-1 ring-amber-200/60' },
    { label: 'Faol bannerlar', value: activeBanners.length, icon: ImageIcon,
      color: 'bg-gradient-to-br from-green-50 to-emerald-100 text-green-700 ring-1 ring-emerald-200/60' },
    { label: 'Kam qolgan', value: lowStock.length, icon: AlertTriangle,
      color: 'bg-gradient-to-br from-red-50 to-rose-100 text-red-700 ring-1 ring-rose-200/60' },
  ];

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="card p-6 sm:p-8 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-60 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 100% 0%, rgba(106, 28, 199, 0.10), transparent 50%), radial-gradient(circle at 0% 100%, rgba(245, 158, 11, 0.06), transparent 50%)',
          }}
        />
        <div className="relative">
          <div className="text-xs uppercase tracking-[0.18em] font-semibold text-gray-500 mb-1">
            {isSuperAdmin ? 'Super Admin Panel' : 'Admin Panel'}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight inline-flex items-center gap-2">
            Salom, <span className="admin-gradient-text">{user.name}</span>
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            {isSuperAdmin
              ? "Sizda barcha imkoniyatlar mavjud — boshqaruvni davom ettiring"
              : "Sizda mahsulot va reklama bannerlari boshqaruvi imkoniyati mavjud"}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="admin-stat card p-5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-sm ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-3xl font-bold text-gray-900 tracking-tight">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Inventar qiymati */}
        <div className="card p-6 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-50 pointer-events-none"
            style={{ background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.06), transparent 60%)' }}
          />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-bold text-gray-500 mb-2">
              <TrendingUp className="w-4 h-4 text-primary-600" />
              Inventar qiymati
            </div>
            <div className="text-4xl font-bold text-gray-900 tracking-tight">
              {new Intl.NumberFormat('ru-RU').format(totalValue)}
              <span className="text-sm text-gray-400 ml-2 font-medium">so'm</span>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Barcha mahsulotlar zaxirasi umumiy qiymati
            </div>
          </div>
        </div>

        {/* Kam qolgan */}
        <div className="card p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-bold text-gray-500 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Kam qolgan mahsulotlar
          </div>
          {lowStock.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
              <FluentEmoji name="check" size={16} />
              <span>Hammasi yetarli — tashvishga o'rin yo'q</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {lowStock.slice(0, 6).map(p => (
                <div key={p.id} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-100 last:border-b-0">
                  <span className="truncate flex-1 text-gray-700">{p.name.uz}</span>
                  <span className="text-red-600 font-bold ml-2 px-2 py-0.5 rounded-full bg-red-50 text-xs">{p.stock} ta</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Role / huquqlar */}
      <div className="card p-6 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-70"
          style={{
            background: 'radial-gradient(circle at 0% 0%, rgba(106, 28, 199, 0.08), transparent 50%), radial-gradient(circle at 100% 100%, rgba(96, 165, 250, 0.05), transparent 50%)',
          }}
        />
        <div className="relative">
          <h3 className="font-bold mb-3 text-gray-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary-600" />
            Sizning huquqlaringiz
          </h3>
          <ul className="text-sm space-y-2 text-gray-700">
            <PermItem ok>Mahsulot qo'shish, tahrirlash, o'chirish</PermItem>
            <PermItem ok>Reklama bannerlarni boshqarish</PermItem>
            <PermItem ok>Buyurtmalarni qabul qilish va kuzatish</PermItem>
            {isSuperAdmin ? (
              <>
                <PermItem ok>Mahsulotlarni aksiyaga qo'yish</PermItem>
                <PermItem ok>Topshirish punktlari va sotuv adminlari</PermItem>
                <PermItem ok>Barcha statistikani ko'rish</PermItem>
              </>
            ) : (
              <>
                <PermItem>Aksiyalar (faqat super admin)</PermItem>
                <PermItem>Topshirish punktlari (faqat super admin)</PermItem>
                <PermItem>Sotuv adminlarini boshqarish (faqat super admin)</PermItem>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function PermItem({ ok, children }) {
  return (
    <li className={`flex items-center gap-2.5 ${ok ? '' : 'text-gray-400'}`}>
      <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
        ok
          ? 'bg-gradient-to-br from-green-100 to-emerald-200 ring-1 ring-emerald-300/60'
          : 'bg-gray-100'
      }`}>
        <FluentEmoji name={ok ? 'check' : 'cross'} size={12} />
      </span>
      <span>{children}</span>
    </li>
  );
}
