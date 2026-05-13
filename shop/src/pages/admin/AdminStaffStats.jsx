import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Package, TrendingUp, ShoppingBag, Wallet, BarChart3, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAdminData } from '../../context/AdminDataContext';
import { ordersApi, resolveImage } from '../../api/client';
import FluentEmoji from '../../components/FluentEmoji';

function formatPrice(n) {
  return new Intl.NumberFormat('uz-UZ').format(n || 0);
}

export default function AdminStaffStats() {
  const { user } = useAuth();
  const { products } = useAdminData();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Faqat staff (magazin admin) uchun — boshqalar boshqa joyga
  if (user?.role !== 'staff') return <Navigate to="/" replace />;

  const myStoreId = user?.storeId ?? user?.store_id;

  // Faqat o'z magazinining mahsulotlari
  const myProducts = (products || []).filter(
    p => (p.storeId ?? p.store_id) === myStoreId
  );

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      const list = await ordersApi.list();
      setOrders(list || []);
    } catch (e) {
      setError(e.message || "Buyurtmalarni yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  // Statistika hisoblash
  const totalProducts = myProducts.length;
  const totalStock = myProducts.reduce((s, p) => s + (p.stock || 0), 0);
  const inventoryValue = myProducts.reduce((s, p) => s + (p.price || 0) * (p.stock || 0), 0);
  const lowStock = myProducts.filter(p => (p.stock || 0) < 5);

  // Buyurtmalar (faqat o'z magazinning — backend allaqachon filterlaydi)
  const delivered = orders.filter(o => o.status === 'delivered');
  const totalRevenue = delivered.reduce((s, o) => s + (o.total || 0), 0);
  const totalSoldUnits = delivered.reduce(
    (s, o) => s + (o.items || []).reduce((ss, i) => ss + (i.qty || 0), 0),
    0
  );

  // Bugungi sotilgan
  const isToday = (iso) => {
    if (!iso) return false;
    const d = new Date(iso); const t = new Date();
    return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
  };
  const todayDelivered = delivered.filter(o => isToday(o.deliveredAt));
  const todayRevenue = todayDelivered.reduce((s, o) => s + (o.total || 0), 0);

  // Mavjud mahsulot ID'lari to'plami — o'chirilganlarni filterlash uchun
  const existingIds = new Set(myProducts.map(p => p.id));

  // Eng ko'p sotilgan mahsulot (top 5) — faqat hali mavjud bo'lganlari
  const productSales = {};
  for (const o of delivered) {
    for (const it of (o.items || [])) {
      const pid = it.product_id ?? it.productId;
      if (!pid) continue;
      // O'chirilgan mahsulotlar ko'rsatilmaydi
      if (!existingIds.has(pid)) continue;
      if (!productSales[pid]) {
        productSales[pid] = { qty: 0, revenue: 0, name: it.name?.uz || '—', image: it.image };
      }
      productSales[pid].qty += it.qty || 0;
      productSales[pid].revenue += (it.qty || 0) * (it.price || 0);
    }
  }
  const topSales = Object.entries(productSales)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary-600" />
            Mening statistikam
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Magazin mahsulotlari, zaxira va buyurtmalar bo'yicha hisobot
          </p>
        </div>
        <button onClick={refresh} className="btn-secondary flex items-center gap-2" disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Yangilash
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {/* Asosiy 4 ta statistika */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={Package} label="Mahsulot turlari" value={totalProducts}
          color="bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 ring-1 ring-blue-200/60"
        />
        <StatCard
          icon={Package} label="Jami zaxira (dona)" value={formatPrice(totalStock)}
          color="bg-gradient-to-br from-violet-50 to-purple-100 text-violet-700 ring-1 ring-violet-200/60"
        />
        <StatCard
          icon={Wallet} label="Inventar qiymati" value={formatPrice(inventoryValue)} suffix="so'm"
          color="bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700 ring-1 ring-amber-200/60"
        />
        <StatCard
          icon={TrendingUp} label="Umumiy aylanma" value={formatPrice(totalRevenue)} suffix="so'm"
          color="bg-gradient-to-br from-green-50 to-emerald-100 text-green-700 ring-1 ring-emerald-200/60"
        />
      </div>

      {/* Bugungi va sotilgan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="card p-5">
          <div className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-1">Bugun topshirilgan</div>
          <div className="text-2xl font-bold">{todayDelivered.length} ta</div>
          <div className="text-xs text-gray-500 mt-0.5">
            Aylanma: {formatPrice(todayRevenue)} so'm
          </div>
        </div>
        <div className="card p-5">
          <div className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-1">Jami buyurtmalar</div>
          <div className="text-2xl font-bold">{orders.length} ta</div>
          <div className="text-xs text-gray-500 mt-0.5">
            Topshirilgan: {delivered.length} ta
          </div>
        </div>
        <div className="card p-5">
          <div className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-1">Sotilgan dona</div>
          <div className="text-2xl font-bold">{formatPrice(totalSoldUnits)}</div>
          <div className="text-xs text-gray-500 mt-0.5">
            Barcha buyurtmalar bo'yicha
          </div>
        </div>
      </div>

      {/* Eng ko'p sotilgan top 5 */}
      <div className="card p-5">
        <h2 className="font-bold mb-3 flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-primary-600" />
          Eng ko'p sotilgan mahsulotlar
        </h2>
        {topSales.length === 0 ? (
          <div className="text-sm text-gray-500 py-4 text-center">Hozircha topshirilgan buyurtma yo'q</div>
        ) : (
          <div className="space-y-2">
            {topSales.map((p, idx) => (
              <div key={p.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-b-0">
                <div className="w-6 text-center font-bold text-gray-400">{idx + 1}</div>
                <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  {p.image && <img src={resolveImage(p.image)} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.qty} dona sotilgan</div>
                </div>
                <div className="text-sm font-bold text-right">
                  {formatPrice(p.revenue)} <span className="text-xs text-gray-400">so'm</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mahsulotlar to'liq jadval */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="font-bold flex items-center gap-2">
            <Package className="w-4 h-4 text-primary-600" />
            Mening mahsulotlarim ({myProducts.length})
          </h2>
        </div>
        {myProducts.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            Hozircha mahsulot qo'shilmagan
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Mahsulot</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Narx</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Zaxira</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Qiymati</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {myProducts.map(p => {
                  const value = (p.price || 0) * (p.stock || 0);
                  const isLow = (p.stock || 0) < 5;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                            {p.image && <img src={resolveImage(p.image)} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <span className="font-medium truncate max-w-[260px]">{p.name?.uz}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatPrice(p.price)} <span className="text-xs text-gray-400">so'm</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-bold ${isLow ? 'text-amber-600' : 'text-gray-900'}`}>
                          {p.stock} ta
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatPrice(value)} <span className="text-xs text-gray-400">so'm</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50 dark:bg-white/5 border-t border-gray-100 font-bold">
                <tr>
                  <td className="px-4 py-3" colSpan={2}>Jami</td>
                  <td className="px-4 py-3 text-right">{formatPrice(totalStock)} ta</td>
                  <td className="px-4 py-3 text-right">{formatPrice(inventoryValue)} so'm</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {lowStock.length > 0 && (
        <div className="card p-5 border-l-4 border-amber-500">
          <div className="flex items-center gap-2 mb-2">
            <FluentEmoji name="warning" size={22} />
            <h3 className="font-bold text-gray-900">Kam qolgan mahsulotlar ({lowStock.length})</h3>
          </div>
          <p className="text-xs text-gray-500 mb-3">5 dan kam qolganlar — to'ldirish kerak</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {lowStock.map(p => (
              <div key={p.id} className="flex items-center justify-between text-sm bg-amber-50 dark:bg-amber-900/10 rounded-lg px-3 py-2">
                <span className="truncate flex-1">{p.name?.uz}</span>
                <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
                  {p.stock} ta
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, suffix, color }) {
  return (
    <div className="card p-5 admin-stat">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-sm ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-bold text-gray-900 tracking-tight">
        {value}
        {suffix && <span className="text-xs text-gray-400 ml-1 font-normal">{suffix}</span>}
      </div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}
