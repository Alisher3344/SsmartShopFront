import { useState, useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Receipt, Search, CreditCard, ChevronLeft, ChevronRight, Store as StoreIcon,
  FileText, RefreshCw, AlertTriangle, Hash, Phone, User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAdminData } from '../../context/AdminDataContext';
import { instalmentApi } from '../../api/client';

// paymo_store_id'ni snake yoki camel ko'rinishda o'qiymiz
const paymoId = (s) => s?.paymo_store_id ?? s?.paymoStoreId ?? null;

// tiyin -> so'm, ming ajratuvchi bilan
const formatSom = (tiyin) => {
  if (tiyin == null) return '—';
  const som = Number(tiyin) / 100;
  return som.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " so'm";
};

const formatTime = (s) => {
  if (!s) return '—';
  return String(s).replace('T', ' ').slice(0, 19);
};

// Atmos sana diapazoni [from, to) — chetdan tashqari. to'ni inklyuziv qilish uchun +1 kun.
const addDay = (dateStr) => {
  if (!dateStr) return undefined;
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
};

// Atmos status -> rang
const statusClass = (st) => {
  const s = String(st || '').toUpperCase();
  if (['ACTIVE', 'CONFIRMED', 'CLOSED'].includes(s)) return 'bg-green-50 text-green-700 border-green-200';
  if (['CANCELLED', 'FAILED', 'REJECTED'].includes(s)) return 'bg-red-50 text-red-700 border-red-200';
  return 'bg-amber-50 text-amber-700 border-amber-200'; // NOT_CONFIRMED va boshqalar
};

const PAGE_SIZE = 20;

export default function AdminInstalments() {
  const { isSuperAdmin } = useAuth();
  const { stores } = useAdminData();

  // Faqat Atmos'ga ulangan magazinlar (paymo_store_id bor)
  const paymoStores = useMemo(
    () => (stores || []).filter((s) => paymoId(s) != null),
    [stores]
  );

  const [tab, setTab] = useState('transactions'); // 'transactions' | 'lookup'
  const [storeId, setStoreId] = useState('');

  // Birinchi Atmos-magazin tanlanadi
  useEffect(() => {
    if (!storeId && paymoStores.length > 0) {
      setStoreId(String(paymoId(paymoStores[0])));
    }
  }, [paymoStores, storeId]);

  if (!isSuperAdmin) return <Navigate to="/" replace />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-primary-600" />
          Rassrochka (Atmos)
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Atmos/Paymo orqali to'lov tranzaksiyalari va rassrochka holatlari
        </p>
      </div>

      {/* Magazin tanlovchi + tab'lar */}
      <div className="card p-4 mb-4 flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1">
            <StoreIcon className="w-3.5 h-3.5" /> Magazin (Atmos store)
          </label>
          <select
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm bg-white"
          >
            {paymoStores.length === 0 && <option value="">Atmos'ga ulangan magazin yo'q</option>}
            {paymoStores.map((s) => (
              <option key={s.id} value={paymoId(s)}>
                {s.name} — #{paymoId(s)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex rounded-lg bg-gray-100 p-1 text-sm font-medium">
          <button
            onClick={() => setTab('transactions')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
              tab === 'transactions' ? 'bg-white shadow-sm text-primary-700' : 'text-gray-600'
            }`}
          >
            <Receipt className="w-4 h-4" /> Tranzaksiyalar
          </button>
          <button
            onClick={() => setTab('lookup')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
              tab === 'lookup' ? 'bg-white shadow-sm text-primary-700' : 'text-gray-600'
            }`}
          >
            <Search className="w-4 h-4" /> Rassrochka qidirish
          </button>
        </div>
      </div>

      {paymoStores.length === 0 ? (
        <div className="card p-8 text-center text-gray-500">
          <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-amber-400" />
          <p className="font-medium">Hech bir magazin Atmos'ga ulanmagan</p>
          <p className="text-sm mt-1">
            "Magazinlar" bo'limida magazinni tahrirlab <b>Paymo store ID</b> ni kiriting.
          </p>
        </div>
      ) : tab === 'transactions' ? (
        <TransactionsTab storeId={storeId} />
      ) : (
        <LookupTab storeId={storeId} />
      )}
    </div>
  );
}

// ===== Tranzaksiyalar tab =====
function TransactionsTab({ storeId }) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  // Atmos get-transactions loan_id filtrini qo'llab-quvvatlamaydi — shuning uchun
  // bu faqat joriy sahifadagi qatorlarni client-side filterlaydi.
  const [loanFilter, setLoanFilter] = useState('');
  const [page, setPage] = useState(1);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async (toPage = page) => {
    if (!storeId) return;
    setLoading(true);
    setError('');
    try {
      const res = await instalmentApi.transactions({
        storeId,
        dateFrom: dateFrom || undefined,
        dateTo: addDay(dateTo), // to'ni inklyuziv qilamiz
        page: toPage,
        size: PAGE_SIZE,
      });
      setData(res);
      setPage(toPage);
    } catch (e) {
      setError(e.message || 'Yuklashda xato');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // Magazin almashganda 1-sahifani yuklaymiz
  useEffect(() => {
    setData(null);
    if (storeId) load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  const allPayments = data?.payments || [];
  // loan_id filtri faqat joriy sahifaga (Atmos server-side qo'llab-quvvatlamaydi)
  const payments = loanFilter
    ? allPayments.filter((p) => String(p.loan_id).includes(loanFilter))
    : allPayments;
  const totalPayments = data?.totalPayments ?? data?.total_payments;
  const totalPages = data?.totalPages ?? data?.total_pages ?? 1;
  const currentPage = data?.currentPage ?? data?.current_page ?? page;

  const applyFilters = (e) => {
    e?.preventDefault();
    load(1);
  };

  return (
    <div>
      {/* Filtrlar */}
      <form onSubmit={applyFilters} className="card p-4 mb-4 grid grid-cols-2 lg:grid-cols-5 gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Sanadan</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Sanagacha</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1">
            <Hash className="w-3 h-3" /> loan_id (joriy sahifada)
          </label>
          <input value={loanFilter} onChange={(e) => setLoanFilter(e.target.value.replace(/\D/g, ''))}
            placeholder="sahifada filtr"
            title="Atmos server-side filtrlamaydi — faqat ko'rinayotgan sahifada qidiradi"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm font-mono" />
        </div>
        <button type="submit" className="btn-primary flex items-center justify-center gap-2">
          <Search className="w-4 h-4" /> Sana bo'yicha
        </button>
        <button type="button" onClick={() => { setDateFrom(''); setDateTo(''); setLoanFilter(''); load(1); }}
          className="btn-secondary flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4" /> Tozalash
        </button>
      </form>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="py-16 flex justify-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : payments.length === 0 ? (
        <div className="card p-8 text-center text-gray-500">
          <Receipt className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p>To'lov topilmadi</p>
        </div>
      ) : (
        <>
          <div className="text-xs text-gray-500 mb-2">
            Jami <b>{totalPayments ?? '—'}</b> to'lov · {currentPage}/{totalPages} sahifa
          </div>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                  <th className="px-4 py-3 font-medium">Shartnoma</th>
                  <th className="px-4 py-3 font-medium">loan_id</th>
                  <th className="px-4 py-3 font-medium">payment_id</th>
                  <th className="px-4 py-3 font-medium text-right">Summa</th>
                  <th className="px-4 py-3 font-medium">Turi</th>
                  <th className="px-4 py-3 font-medium">Vaqti</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.payment_id} className="border-b border-gray-50 hover:bg-gray-50/60">
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-700">{p.contract_id || '—'}</td>
                    <td className="px-4 py-2.5 font-mono text-xs">{p.loan_id}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{p.payment_id}</td>
                    <td className="px-4 py-2.5 text-right font-semibold whitespace-nowrap">
                      {formatSom(p.totalAmount ?? p.amount)}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 text-[11px] font-medium">
                        {p.payment_type_label || p.payment_type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-500 whitespace-nowrap">{formatTime(p.pay_time)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <button disabled={currentPage <= 1 || loading} onClick={() => load(currentPage - 1)}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600">{currentPage} / {totalPages}</span>
            <button disabled={currentPage >= totalPages || loading} onClick={() => load(currentPage + 1)}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ===== Rassrochka qidirish tab =====
function LookupTab({ storeId }) {
  const [instId, setInstId] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = async (e) => {
    e?.preventDefault();
    if (!storeId || !instId) return;
    setLoading(true);
    setError('');
    setData(null);
    try {
      const res = await instalmentApi.getByPaymo(storeId, instId);
      setData(res);
    } catch (err) {
      setError(err.message || 'Topilmadi');
    } finally {
      setLoading(false);
    }
  };

  const fullName = data
    ? [data.first_name, data.last_name, data.middle_name].filter(Boolean).join(' ').trim() || '—'
    : '';

  return (
    <div>
      <form onSubmit={search} className="card p-4 mb-4 flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1">
            <Hash className="w-3.5 h-3.5" /> Rassrochka ID (Atmos instalment_id)
          </label>
          <input value={instId} onChange={(e) => setInstId(e.target.value.replace(/\D/g, ''))}
            placeholder="masalan 343589"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm font-mono" />
        </div>
        <button type="submit" disabled={loading || !instId}
          className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50">
          <Search className="w-4 h-4" /> {loading ? 'Qidirilmoqda...' : 'Ko\'rish'}
        </button>
      </form>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {data && (() => {
        const bal = data.balance == null ? null : Number(data.balance);
        const isDebt = bal != null && bal < 0;
        const balLabel = bal == null ? 'Balans' : bal < 0 ? 'Qolgan qarz' : bal > 0 ? 'Balans (ortiqcha)' : 'To\'liq to\'langan';
        const emptyExtra = !data.payer_work_place && !data.address_payer && !data.additional_number;
        return (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 font-bold text-lg">
              <CreditCard className="w-5 h-5 text-primary-600" />
              №{data.instalment_id}
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusClass(data.status)}`}>
              {data.status}
            </span>
          </div>

          {/* Balans bannerи — asosiy moliyaviy ko'rsatkich */}
          <div className={`rounded-xl p-4 mb-5 ${isDebt ? 'bg-red-50' : bal > 0 ? 'bg-amber-50' : 'bg-green-50'}`}>
            <div className="text-xs font-medium text-gray-500 mb-0.5">{balLabel}</div>
            <div className={`text-2xl font-extrabold tracking-tight ${isDebt ? 'text-red-600' : bal > 0 ? 'text-amber-600' : 'text-green-600'}`}>
              {bal == null ? '—' : formatSom(Math.abs(bal))}
            </div>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <Field icon={UserIcon} label="Mijoz" value={fullName} />
            <Field icon={Phone} label="Telefon" value={data.phone_number || '—'} mono />
            <Field icon={StoreIcon} label="Ish joyi" value={data.payer_work_place || '—'} />
            <Field icon={UserIcon} label="To'lovchi manzili" value={data.address_payer || '—'} />
            <Field icon={Phone} label="Qo'shimcha raqam" value={data.additional_number || '—'} mono />
          </dl>

          {emptyExtra && (
            <div className="mt-4 p-2.5 bg-gray-50 rounded-lg text-[11px] text-gray-500 flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              Bo'sh maydonlar Atmos'da kiritilmagan (masalan kassada/filialda ochilgan rassrochka). Bu Atmos qaytargan to'liq ma'lumot.
            </div>
          )}
          {data.offer && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">{data.offer}</div>
          )}
          {data.file && (
            <a href={data.file} target="_blank" rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-primary-700 font-medium hover:underline">
              <FileText className="w-4 h-4" /> Shartnoma faylini ochish
            </a>
          )}
        </div>
        );
      })()}
    </div>
  );
}

function Field({ icon: Icon, label, value, mono }) {
  return (
    <div>
      <dt className="text-xs text-gray-500 flex items-center gap-1 mb-0.5">
        <Icon className="w-3 h-3" /> {label}
      </dt>
      <dd className={`text-gray-900 ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  );
}
