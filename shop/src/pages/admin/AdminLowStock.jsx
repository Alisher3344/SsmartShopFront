import { AlertTriangle, Package, RefreshCw } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { resolveImage } from '../../api/client';
import FluentEmoji from '../../components/FluentEmoji';

const STOCK_THRESHOLD = 2;

function formatPrice(n) {
  return new Intl.NumberFormat('uz-UZ').format(n);
}

export default function AdminLowStock() {
  const { products, loading, refresh } = useAdminData();

  // 2 dan kam (0 va 1) qolgan mahsulotlar
  const lowStock = (products || [])
    .filter(p => (p.stock ?? 0) < STOCK_THRESHOLD)
    .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0));

  const empty = lowStock.filter(p => (p.stock ?? 0) === 0);
  const critical = lowStock.filter(p => (p.stock ?? 0) === 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
            Kam qolgan mahsulotlar
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Zaxirasi 2 dan kam mahsulotlar — to'ldirish kerak
          </p>
        </div>
        {refresh && (
          <button onClick={refresh} className="btn-secondary flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Yangilash
          </button>
        )}
      </div>

      {/* Statistika */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card p-5">
          <div className="text-xs uppercase tracking-wider text-gray-500 font-bold">Tugagan</div>
          <div className="text-3xl font-bold mt-1 text-red-600">{empty.length}</div>
          <div className="text-xs text-gray-500 mt-0.5">stock = 0</div>
        </div>
        <div className="card p-5">
          <div className="text-xs uppercase tracking-wider text-gray-500 font-bold">Kritik</div>
          <div className="text-3xl font-bold mt-1 text-amber-600">{critical.length}</div>
          <div className="text-xs text-gray-500 mt-0.5">stock = 1</div>
        </div>
        <div className="card p-5">
          <div className="text-xs uppercase tracking-wider text-gray-500 font-bold">Jami kam</div>
          <div className="text-3xl font-bold mt-1">{lowStock.length}</div>
          <div className="text-xs text-gray-500 mt-0.5">stock &lt; {STOCK_THRESHOLD}</div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && lowStock.length === 0 && (
        <div className="card p-12 text-center text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-3 text-green-300" />
          <p className="text-lg font-medium text-green-700 flex items-center justify-center gap-2">Hammasi yetarli <FluentEmoji name="check" size={18} /></p>
          <p className="text-sm">Barcha mahsulotlar zaxirasi yetarli darajada</p>
        </div>
      )}

      {!loading && lowStock.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Mahsulot</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Kategoriya</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Narx</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Zaxira</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Holat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lowStock.map(p => {
                  const isEmpty = (p.stock ?? 0) === 0;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                            {p.image && (
                              <img src={resolveImage(p.image)} alt="" className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate max-w-[260px]">
                              {p.name?.uz || '—'}
                            </div>
                            <div className="text-xs text-gray-500 truncate max-w-[260px]">
                              {p.name?.ru || ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{p.category || '—'}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatPrice(p.price)} <span className="text-xs text-gray-400">so'm</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-bold ${isEmpty ? 'text-red-600' : 'text-amber-600'}`}>
                          {p.stock} ta
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                          isEmpty
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isEmpty ? 'TUGAGAN' : 'KRITIK'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
