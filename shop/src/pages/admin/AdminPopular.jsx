import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Star, X, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAdminData } from '../../context/AdminDataContext';
import { categories, formatPrice } from '../../data/products';
import { resolveImage } from '../../api/client';
import FluentEmoji from '../../components/FluentEmoji';

export default function AdminPopular() {
  const { isSuperAdmin } = useAuth();
  const { products, stores, popularProducts, togglePopular } = useAdminData();
  const [search, setSearch] = useState('');
  const [filterStore, setFilterStore] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [busyId, setBusyId] = useState(null);

  if (!isSuperAdmin) return <Navigate to="/" replace />;

  const handleToggle = async (id) => {
    setBusyId(id);
    try {
      await togglePopular(id);
    } catch (e) {
      alert("Xato: " + (e.message || ''));
    } finally {
      setBusyId(null);
    }
  };

  const matchStore = (p) => {
    if (filterStore === 'all') return true;
    const sid = p.storeId ?? p.store_id ?? null;
    if (filterStore === 'none') return sid === null;
    return sid === Number(filterStore);
  };

  const otherProducts = products.filter(p =>
    !p.isPopular &&
    matchStore(p) &&
    (filterCategory === 'all' || p.category === filterCategory) &&
    (!search || (p.name?.uz || '').toLowerCase().includes(search.toLowerCase()))
  );

  const storeName = (sid) => stores.find(s => s.id === sid)?.name || '—';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Star className="w-6 h-6 text-amber-500" fill="#f59e0b" />
          Ommabop mahsulotlar
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Mahsulotlarni ommabop ro'yxatiga qo'shing — bosh sahifaning "Ommabop mahsulotlar" bo'limida ko'rsatiladi
        </p>
      </div>

      {/* Faol ommabop */}
      <div>
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
          <FluentEmoji name="star" size={16} />
          Ommabop ro'yxatdagilar ({popularProducts.length})
        </h2>

        {popularProducts.length === 0 ? (
          <div className="card p-8 text-center text-gray-500">
            <Star className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Hozircha ommabop mahsulotlar yo'q</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Pastdagi ro'yxatdan tanlab "Ommabopga qo'shish" tugmasini bosing
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {popularProducts.map(p => {
              const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
              return (
                <div key={p.id} className="card overflow-hidden flex flex-col group relative">
                  <button
                    onClick={() => handleToggle(p.id)}
                    disabled={busyId === p.id}
                    className="absolute top-2 right-2 z-10 w-8 h-8 bg-white text-red-600 rounded-full shadow-md hover:bg-red-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    title="Ommabop ro'yxatdan olib tashlash"
                  >
                    {busyId === p.id ? <span className="text-xs">...</span> : <X className="w-4 h-4" />}
                  </button>

                  <div className="aspect-square bg-gray-50 relative">
                    {p.image && (
                      <img src={resolveImage(p.image)} alt="" className="w-full h-full object-cover" onError={(e) => (e.target.style.display = 'none')} />
                    )}
                    {discount > 0 && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-[11px] font-bold px-2 py-1 rounded-md shadow-md">
                        −{discount}%
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md flex items-center gap-1">
                      <FluentEmoji name="star" size={11} /> OMMABOP
                    </div>
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <div className="text-sm font-medium line-clamp-2 min-h-[40px] mb-2">
                      {p.name?.uz}
                    </div>
                    <div className="mt-auto">
                      <div className="text-base font-bold">{formatPrice(p.price)} so'm</div>
                      {p.oldPrice && (
                        <div className="text-xs text-gray-400 line-through">{formatPrice(p.oldPrice)} so'm</div>
                      )}
                    </div>
                    <button
                      onClick={() => handleToggle(p.id)}
                      disabled={busyId === p.id}
                      className="mt-2 w-full px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      {busyId === p.id ? 'Olinmoqda...' : "Ro'yxatdan olish"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Qo'shish — qolganlar */}
      <div>
        <div className="mb-3">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2 mb-3">
            Ommabopga qo'shish ({otherProducts.length})
          </h2>

          {/* Filterlar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Mahsulot nomi..."
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
              />
            </div>
            <select
              value={filterStore}
              onChange={(e) => setFilterStore(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
            >
              <option value="all">Barcha magazinlar</option>
              <option value="none">— Magazinsiz (default) —</option>
              {stores.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
            >
              <option value="all">Barcha kategoriyalar</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name?.uz || c.name?.ru || c.id}</option>
              ))}
            </select>
          </div>
        </div>

        {otherProducts.length === 0 ? (
          <div className="card p-8 text-center text-gray-500 text-sm">
            {search || filterStore !== 'all' || filterCategory !== 'all'
              ? "Filterga mos mahsulot topilmadi"
              : "Barcha mahsulotlar ommabop ro'yxatda"}
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Mahsulot</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Magazin</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Reyting</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Narx</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">Amal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {otherProducts.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                            {p.image && <img src={resolveImage(p.image)} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <span className="font-medium truncate max-w-[260px]">{p.name?.uz}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                        {(p.storeId ?? p.store_id)
                          ? <span className="text-xs px-2 py-0.5 bg-primary-50 text-primary-700 rounded">{storeName(p.storeId ?? p.store_id)}</span>
                          : <span className="text-xs text-gray-400">— default —</span>}
                      </td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell">
                        {p.reviewsCount > 0 ? (
                          <span className="inline-flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-400" fill="#f59e0b" />
                            <span className="font-medium">{Number(p.avgRating).toFixed(1)}</span>
                            <span className="text-xs text-gray-400">({p.reviewsCount})</span>
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Sharh yo'q</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatPrice(p.price)} <span className="text-xs text-gray-400">so'm</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggle(p.id)}
                          disabled={busyId === p.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-full text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          <Star className="w-3 h-3" />
                          {busyId === p.id ? '...' : "Ommabopga qo'shish"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
