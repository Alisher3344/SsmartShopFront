import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import {
  CreditCard, Search, RefreshCw, ChevronLeft, ChevronRight, X,
  FileText, ShieldCheck, RotateCcw, Loader2, Phone, User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAdminData } from '../../context/AdminDataContext';
import { instalmentApi } from '../../api/client';

// ===== Helpers =====
const formatSom = (tiyin) => {
  if (tiyin == null) return '—';
  const som = Number(tiyin) / 100;
  return som.toLocaleString('ru-RU', { maximumFractionDigits: 0 }) + " so'm";
};

const formatTime = (iso) => {
  if (!iso) return '—';
  // "2026-06-08T12:43:00.000+0000"
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return iso;
  return `${m[3]}.${m[2]}.${m[1]} ${m[4]}:${m[5]}`;
};

// status int (ro'yxat) -> {label, cls}
const STATUS_INT = {
  1: { label: 'ACTIVE', cls: 'bg-green-50 text-green-700' },
  2: { label: 'YOPILGAN', cls: 'bg-blue-50 text-blue-700' },
  0: { label: 'TASDIQLANMAGAN', cls: 'bg-amber-50 text-amber-700' },
  '-1': { label: 'RAD ETILGAN', cls: 'bg-red-50 text-red-700' },
  '-2': { label: 'BEKOR', cls: 'bg-gray-100 text-gray-600' },
};
const statusIntInfo = (st) =>
  STATUS_INT[st] || STATUS_INT[String(st)] || { label: String(st), cls: 'bg-gray-100 text-gray-600' };

// status string (detal) -> cls
const statusStrCls = (s) => {
  const up = String(s || '').toUpperCase();
  if (['ACTIVE', 'CONFIRMED'].includes(up)) return 'bg-green-50 text-green-700';
  if (['SUCCESSFULLY_FINISHED', 'CLOSED'].includes(up)) return 'bg-blue-50 text-blue-700';
  if (['NOT_CONFIRMED', 'PENDING'].includes(up)) return 'bg-amber-50 text-amber-700';
  if (['TERMINATED', 'CANCELLED', 'REJECTED', 'FAILED'].includes(up)) return 'bg-red-50 text-red-700';
  return 'bg-gray-100 text-gray-600';
};

const fullName = (it) =>
  [it.payer_name, it.payer_lastname, it.payer_middlename]
    .map((x) => (x || '').trim())
    .filter(Boolean)
    .join(' ') || '—';

const STATUS_OPTS = [
  { v: '', label: 'Barchasi' },
  { v: '1', label: 'Faol (ACTIVE)' },
  { v: '0', label: 'Tasdiqlanmagan' },
  { v: '2', label: 'Yopilgan' },
  { v: '-2', label: 'Bekor/Terminated' },
  { v: '-1', label: 'Rad etilgan' },
];

const PAGE_SIZE = 20;

export default function AdminInstalments() {
  const { isSuperAdmin } = useAuth();
  const { stores } = useAdminData();
  const [tab, setTab] = useState('list');

  if (!isSuperAdmin) return <Navigate to="/" replace />;

  // Atmos'ga ulangan magazinlar
  const paymoStores = (stores || []).filter((s) => (s.paymo_store_id ?? s.paymoStoreId));
  const storeName = (pid) => {
    const s = paymoStores.find((x) => (x.paymo_store_id ?? x.paymoStoreId) === pid);
    return s ? s.name : `Store ${pid}`;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-primary-600" />
          Rassrochka (Atmos)
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Atmos/Paymo rassrochkalari — ro'yxat, to'lov tarixi, tasdiqlash va karta almashtirish
        </p>
      </div>

      {paymoStores.length === 0 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          Hech bir magazin Atmos'ga ulanmagan. «Magazinlar» bo'limida <b>Atmos store_id</b> kiriting.
        </div>
      )}

      {/* Tablar */}
      <div className="flex gap-1 mb-5 border-b border-gray-200">
        {[
          { k: 'list', label: 'Rassrochkalar' },
          { k: 'create', label: '+ Yangi rassrochka' },
          { k: 'tx', label: 'Tranzaksiyalar' },
          { k: 'lookup', label: 'Qidirish (ID)' },
        ].map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.k
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'list' && <ListTab paymoStores={paymoStores} storeName={storeName} />}
      {tab === 'create' && <CreateTab paymoStores={paymoStores} />}
      {tab === 'tx' && <TransactionsTab paymoStores={paymoStores} />}
      {tab === 'lookup' && <LookupTab paymoStores={paymoStores} />}
    </div>
  );
}

// ===================== Ro'yxat =====================
function ListTab({ paymoStores, storeName }) {
  const allIds = paymoStores.map((s) => s.paymo_store_id ?? s.paymoStoreId);
  const [selected, setSelected] = useState(allIds);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState(null); // ochilgan rassrochka item

  const load = useCallback(async () => {
    if (selected.length === 0) { setData({ instalments: [], totalElements: 0, totalPages: 0 }); return; }
    setLoading(true); setError('');
    try {
      const res = await instalmentApi.list({
        store_ids: selected.join(','),
        page,
        size: PAGE_SIZE,
        status: status === '' ? undefined : Number(status),
      });
      setData(res);
    } catch (e) {
      setError(e.message || 'Yuklashda xato');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [selected, status, page]);

  useEffect(() => { load(); }, [load]);

  const toggleStore = (pid) => {
    setPage(0);
    setSelected((prev) =>
      prev.includes(pid) ? prev.filter((x) => x !== pid) : [...prev, pid]
    );
  };

  const items = data?.instalments || [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  return (
    <div>
      {/* Filtrlar */}
      <div className="card p-4 mb-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {paymoStores.map((s) => {
            const pid = s.paymo_store_id ?? s.paymoStoreId;
            const on = selected.includes(pid);
            return (
              <button
                key={pid}
                onClick={() => toggleStore(pid)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  on
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                }`}
              >
                {s.name} <span className="opacity-70 font-mono">#{pid}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(0); }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
          >
            {STATUS_OPTS.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
          </select>
          <button
            onClick={() => { setPage(0); load(); }}
            disabled={loading}
            className="btn-secondary flex items-center gap-1.5 text-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Yangilash
          </button>
          {data && (
            <span className="text-xs text-gray-500 ml-auto">
              Jami: <b>{totalElements.toLocaleString('ru-RU')}</b> ta
            </span>
          )}
        </div>
      </div>

      {error && <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

      {/* Jadval */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-3 py-2.5 font-semibold">ID</th>
                <th className="text-left px-3 py-2.5 font-semibold">Mijoz</th>
                <th className="text-left px-3 py-2.5 font-semibold">Telefon</th>
                <th className="text-right px-3 py-2.5 font-semibold">Summa</th>
                <th className="text-right px-3 py-2.5 font-semibold">Oylik</th>
                <th className="text-center px-3 py-2.5 font-semibold">Holat</th>
                <th className="text-left px-3 py-2.5 font-semibold">Sana</th>
                <th className="px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin inline" /> Yuklanmoqda...
                </td></tr>
              )}
              {!loading && items.length === 0 && (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400">Rassrochka topilmadi</td></tr>
              )}
              {!loading && items.map((it) => {
                const si = statusIntInfo(it.status);
                return (
                  <tr key={it.id} className="hover:bg-primary-50/40 cursor-pointer" onClick={() => setDetail(it)}>
                    <td className="px-3 py-2.5 font-mono text-xs">
                      {it.id}
                      <div className="text-[10px] text-gray-400">{storeName(it.store_id)}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-gray-900">{fullName(it)}</div>
                      {it.contract_id && <div className="text-[10px] text-gray-400 font-mono">{it.contract_id}</div>}
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 font-mono text-xs">{it.payer_phone || '—'}</td>
                    <td className="px-3 py-2.5 text-right font-medium">{formatSom(it.total)}</td>
                    <td className="px-3 py-2.5 text-right text-gray-600">{formatSom(it.monthly)}</td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${si.cls}`}>{si.label}</span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-500">{formatTime(it.instime)}</td>
                    <td className="px-3 py-2.5 text-right">
                      <ChevronRight className="w-4 h-4 text-gray-300 inline" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginatsiya */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || loading}
            className="btn-secondary flex items-center gap-1 text-sm disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" /> Oldingi
          </button>
          <span className="text-sm text-gray-600">{page + 1} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1 || loading}
            className="btn-secondary flex items-center gap-1 text-sm disabled:opacity-40"
          >
            Keyingi <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {detail && (
        <DetailDrawer
          storeId={detail.store_id}
          instalmentId={detail.id}
          listItem={detail}
          onClose={() => setDetail(null)}
          onChanged={load}
        />
      )}
    </div>
  );
}

// ===================== Detal drawer (+ amallar) =====================
function DetailDrawer({ storeId, instalmentId, listItem, onClose, onChanged }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // amallar
  const [otp, setOtp] = useState('');
  const [cardId, setCardId] = useState('');
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState(null); // {type:'ok'|'err', text}

  const loadDetail = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await instalmentApi.getByPaymo(storeId, instalmentId);
      setData(res);
    } catch (e) {
      setError(e.message || 'Yuklashda xato');
    } finally {
      setLoading(false);
    }
  }, [storeId, instalmentId]);

  useEffect(() => { loadDetail(); }, [loadDetail]);

  const doConfirm = async () => {
    if (!/^\d{4,8}$/.test(otp)) { setMsg({ type: 'err', text: 'SMS kod 4-8 raqam bo\'lishi kerak' }); return; }
    setBusy('confirm'); setMsg(null);
    try {
      await instalmentApi.confirmBySms({ instalment_id: instalmentId, otp });
      setMsg({ type: 'ok', text: 'Tasdiqlandi ✓' });
      setOtp('');
      await loadDetail();
      onChanged?.();
    } catch (e) {
      setMsg({ type: 'err', text: e.message || 'Tasdiqlashda xato' });
    } finally {
      setBusy('');
    }
  };

  const doChangeCard = async () => {
    if (!cardId || Number.isNaN(Number(cardId))) { setMsg({ type: 'err', text: 'card_id (raqam) kiriting' }); return; }
    setBusy('card'); setMsg(null);
    try {
      await instalmentApi.changeCard({ instalment_id: instalmentId, card_id: Number(cardId), store_id: storeId });
      setMsg({ type: 'ok', text: 'Karta almashtirish so\'rovi yuborildi. SMS kod kelsa — pastda tasdiqlang.' });
      setCardId('');
      await loadDetail();
    } catch (e) {
      setMsg({ type: 'err', text: e.message || 'Karta almashtirishda xato' });
    } finally {
      setBusy('');
    }
  };

  const statusStr = data?.status || listItem?.status_label || statusIntInfo(listItem?.status).label;
  const balance = data?.balance;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end animate-fade-in" onClick={onClose}>
      <div
        className="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between z-10">
          <div>
            <div className="text-xs text-gray-400">Rassrochka</div>
            <div className="text-lg font-bold font-mono">№{instalmentId}</div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Mijoz (list item'dan) */}
          {listItem && (
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2 text-gray-900 font-medium">
                <UserIcon className="w-4 h-4 text-primary-600" /> {fullName(listItem)}
              </div>
              {listItem.payer_phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" /> {listItem.payer_phone}
                </div>
              )}
              {listItem.contract_id && (
                <div className="text-xs text-gray-500 font-mono">Shartnoma: {listItem.contract_id}</div>
              )}
              {listItem.pinfl && (
                <div className="text-xs text-gray-500 font-mono">PINFL: {listItem.pinfl}</div>
              )}
            </div>
          )}

          {/* Status + balance */}
          {loading ? (
            <div className="py-6 text-center text-gray-400"><Loader2 className="w-5 h-5 animate-spin inline" /> Yuklanmoqda...</div>
          ) : error ? (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-[10px] text-gray-400 uppercase">Holat</div>
                  <span className={`mt-1 inline-block text-xs font-bold px-2 py-0.5 rounded-full ${statusStrCls(statusStr)}`}>
                    {statusStr}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-[10px] text-gray-400 uppercase">Qoldiq balans</div>
                  <div className="mt-1 font-bold text-gray-900">{formatSom(balance)}</div>
                </div>
              </div>

              {listItem && (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-[10px] text-gray-400 uppercase">Umumiy summa</div>
                    <div className="mt-1 font-medium">{formatSom(listItem.total)}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-[10px] text-gray-400 uppercase">Oylik to'lov</div>
                    <div className="mt-1 font-medium">{formatSom(listItem.monthly)}</div>
                  </div>
                </div>
              )}

              {/* Shartnoma fayli */}
              {data?.file && (
                <a
                  href={data.file}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-3 py-2.5 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-100"
                >
                  <FileText className="w-4 h-4" /> Shartnoma faylini ochish
                </a>
              )}

              {msg && (
                <div className={`p-2.5 rounded-lg text-sm ${msg.type === 'ok' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {msg.text}
                </div>
              )}

              {/* Amal: SMS tasdiqlash */}
              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-green-600" /> SMS-kod bilan tasdiqlash
                </h3>
                <p className="text-xs text-gray-500 mb-2">
                  Karta egasiga kelgan kodni kiriting (NOT_CONFIRMED rassrochka yoki karta almashtirish uchun).
                </p>
                <div className="flex gap-2">
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    placeholder="masalan: 446708"
                    inputMode="numeric"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-primary-500"
                  />
                  <button
                    onClick={doConfirm}
                    disabled={busy === 'confirm'}
                    className="btn-primary flex items-center gap-1.5 text-sm disabled:opacity-50"
                  >
                    {busy === 'confirm' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    Tasdiqlash
                  </button>
                </div>
              </div>

              {/* Amal: Karta almashtirish */}
              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-2">
                  <RotateCcw className="w-4 h-4 text-amber-600" /> Asosiy kartani almashtirish
                </h3>
                <p className="text-xs text-gray-500 mb-2">
                  Atmos'da ro'yxatdan o'tgan yangi karta <b>card_id</b>'sini kiriting. So'rovdan keyin SMS kod kelsa — yuqorida tasdiqlang.
                </p>
                <div className="flex gap-2">
                  <input
                    value={cardId}
                    onChange={(e) => setCardId(e.target.value.replace(/\D/g, ''))}
                    placeholder="card_id (masalan: 1234567)"
                    inputMode="numeric"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-primary-500"
                  />
                  <button
                    onClick={doChangeCard}
                    disabled={busy === 'card'}
                    className="btn-secondary flex items-center gap-1.5 text-sm disabled:opacity-50"
                  >
                    {busy === 'card' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                    Almashtirish
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ===================== Tranzaksiyalar =====================
function TransactionsTab({ paymoStores }) {
  const firstId = paymoStores[0]?.paymo_store_id ?? paymoStores[0]?.paymoStoreId ?? '';
  const [storeId, setStoreId] = useState(firstId);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loanFilter, setLoanFilter] = useState('');
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Atmos date filtri [from, to) — to'ni inklyuziv qilish uchun +1 kun
  const addDay = (d) => {
    if (!d) return undefined;
    const dt = new Date(d + 'T00:00:00Z');
    dt.setUTCDate(dt.getUTCDate() + 1);
    return dt.toISOString().slice(0, 10);
  };

  const load = useCallback(async () => {
    if (!storeId) return;
    setLoading(true); setError('');
    try {
      const res = await instalmentApi.transactions({
        store_id: storeId,
        date_from: dateFrom || undefined,
        date_to: addDay(dateTo),
        page,
        size: PAGE_SIZE,
      });
      setData(res);
    } catch (e) {
      setError(e.message || 'Yuklashda xato');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [storeId, dateFrom, dateTo, page]);

  useEffect(() => { load(); }, [load]);

  let payments = data?.payments || [];
  if (loanFilter.trim()) {
    payments = payments.filter((p) => String(p.loan_id) === loanFilter.trim());
  }
  const totalPages = data?.totalPages ?? 0;

  return (
    <div>
      <div className="card p-4 mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Magazin</label>
          <select
            value={storeId}
            onChange={(e) => { setStoreId(Number(e.target.value)); setPage(0); }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
          >
            {paymoStores.map((s) => {
              const pid = s.paymo_store_id ?? s.paymoStoreId;
              return <option key={pid} value={pid}>{s.name} (#{pid})</option>;
            })}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Sanadan</label>
          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Sanagacha</label>
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">loan_id (joriy sahifada)</label>
          <input value={loanFilter} onChange={(e) => setLoanFilter(e.target.value)} placeholder="filtr"
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm w-28 focus:outline-none focus:border-primary-500" />
        </div>
        <button onClick={() => { setPage(0); load(); }} disabled={loading}
          className="btn-secondary flex items-center gap-1.5 text-sm disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Yangilash
        </button>
        {data?.totalPayments != null && (
          <span className="text-xs text-gray-500 ml-auto">Jami: <b>{data.totalPayments.toLocaleString('ru-RU')}</b></span>
        )}
      </div>

      {error && <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-3 py-2.5 font-semibold">loan_id</th>
                <th className="text-left px-3 py-2.5 font-semibold">payment_id</th>
                <th className="text-right px-3 py-2.5 font-semibold">Summa</th>
                <th className="text-left px-3 py-2.5 font-semibold">Turi</th>
                <th className="text-left px-3 py-2.5 font-semibold">Vaqt</th>
                <th className="text-left px-3 py-2.5 font-semibold">Shartnoma</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && <tr><td colSpan={6} className="text-center py-10 text-gray-400"><Loader2 className="w-5 h-5 animate-spin inline" /> Yuklanmoqda...</td></tr>}
              {!loading && payments.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-gray-400">To'lov topilmadi</td></tr>}
              {!loading && payments.map((p, i) => (
                <tr key={`${p.payment_id}-${i}`} className="hover:bg-gray-50">
                  <td className="px-3 py-2.5 font-mono text-xs">{p.loan_id}</td>
                  <td className="px-3 py-2.5 font-mono text-xs">{p.payment_id}</td>
                  <td className="px-3 py-2.5 text-right font-medium">{formatSom(p.amount)}</td>
                  <td className="px-3 py-2.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {p.payment_type_label || p.payment_type}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-500">{p.pay_time}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-500 font-mono">{p.contract_id || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0 || loading}
            className="btn-secondary flex items-center gap-1 text-sm disabled:opacity-40">
            <ChevronLeft className="w-4 h-4" /> Oldingi
          </button>
          <span className="text-sm text-gray-600">{page + 1} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1 || loading}
            className="btn-secondary flex items-center gap-1 text-sm disabled:opacity-40">
            Keyingi <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ===================== Yangi rassrochka =====================
const normPhone = (raw) => {
  let d = (raw || '').replace(/\D/g, '');
  if (d.length === 9) d = '998' + d;
  return d;
};

function CreateTab({ paymoStores }) {
  const firstId = paymoStores[0]?.paymo_store_id ?? paymoStores[0]?.paymoStoreId ?? '';
  // joriy oy YYMM (start_month default)
  const now = new Date();
  const curYYMM = String(now.getFullYear()).slice(2) + String(now.getMonth() + 1).padStart(2, '0');

  const EMPTY = {
    store_id: firstId, card_number: '', card_expiry: '',
    payer_lastname: '', payer_name: '', payer_middlename: '',
    payer_phone: '', pinfl: '',
    total_amount: '', initial_amount: '0', period: '3',
    start_month: curYYMM, pay_day: '10',
    address: '', work_place: '',
    debit_initial_amount: true, confirm_by_sms: true,
  };
  const [f, setF] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [created, setCreated] = useState(null); // {storeId, id, status}
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  // oylik to'lov preview
  const totalSom = Number(f.total_amount) || 0;
  const initSom = Number(f.initial_amount) || 0;
  const per = Number(f.period) || 1;
  const monthly = per > 0 ? Math.round((totalSom - initSom) / per) : 0;

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    const phone = normPhone(f.payer_phone);
    if (!f.store_id) return setErr('Magazin tanlang');
    if (!/^\d{16,19}$/.test(f.card_number.replace(/\s/g, ''))) return setErr("Karta raqami 16-19 raqam bo'lishi kerak");
    if (!/^\d{4}$/.test(f.card_expiry)) return setErr('Amal muddati YYMM formatda (masalan 2811)');
    if (!f.payer_name.trim() || !f.payer_lastname.trim()) return setErr('Ism va familiya majburiy');
    if (phone.length !== 12) return setErr('Telefon raqami noto\'g\'ri (998XXXXXXXXX)');
    if (totalSom <= 0) return setErr('Umumiy summa kiriting');
    if (monthly < 5000) return setErr(`Oylik to'lov ${monthly.toLocaleString('ru-RU')} so'm — minimal 5000 so'm bo'lishi kerak`);
    if (!/^\d{4}$/.test(f.start_month)) return setErr('Boshlanish oyi YYMM formatda');

    setBusy(true);
    try {
      const res = await instalmentApi.create({
        store_id: Number(f.store_id),
        card_number: f.card_number.replace(/\s/g, ''),
        card_expiry: f.card_expiry,
        payer_name: f.payer_name.trim(),
        payer_lastname: f.payer_lastname.trim(),
        payer_middlename: f.payer_middlename.trim(),
        payer_phone: phone,
        pinfl: f.pinfl.trim(),
        total_amount: Math.round(totalSom * 100),
        initial_amount: Math.round(initSom * 100),
        period: per,
        start_month: f.start_month,
        pay_day: Number(f.pay_day),
        address: f.address.trim(),
        address_payer: f.address.trim(),
        work_place: f.work_place.trim(),
        debit_initial_amount: f.debit_initial_amount,
        confirm_by_sms: f.confirm_by_sms,
      });
      const id = res?.instalment_id ?? res?.id;
      setCreated({ storeId: Number(f.store_id), id, status: res?.status });
    } catch (e2) {
      setErr(e2.message || 'Rassrochka ochishda xato');
    } finally {
      setBusy(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500';

  return (
    <div className="max-w-2xl">
      <form onSubmit={submit} className="card p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-500 mb-1">Magazin *</label>
            <select value={f.store_id} onChange={(e) => set('store_id', Number(e.target.value))} className={inputCls}>
              {paymoStores.map((s) => {
                const pid = s.paymo_store_id ?? s.paymoStoreId;
                return <option key={pid} value={pid}>{s.name} (#{pid})</option>;
              })}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Karta raqami *</label>
            <input value={f.card_number} onChange={(e) => set('card_number', e.target.value.replace(/[^\d\s]/g, ''))}
              placeholder="8600 XXXX XXXX XXXX" className={inputCls + ' font-mono'} inputMode="numeric" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Amal muddati (YYMM) *</label>
            <input value={f.card_expiry} onChange={(e) => set('card_expiry', e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="2811 (28-yil 11-oy)" className={inputCls + ' font-mono'} inputMode="numeric" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Familiya *</label>
            <input value={f.payer_lastname} onChange={(e) => set('payer_lastname', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Ism *</label>
            <input value={f.payer_name} onChange={(e) => set('payer_name', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Otasining ismi</label>
            <input value={f.payer_middlename} onChange={(e) => set('payer_middlename', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Telefon *</label>
            <input value={f.payer_phone} onChange={(e) => set('payer_phone', e.target.value)}
              placeholder="+998 90 123 45 67" className={inputCls + ' font-mono'} inputMode="tel" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-500 mb-1">PINFL (passport)</label>
            <input value={f.pinfl} onChange={(e) => set('pinfl', e.target.value.replace(/\D/g, '').slice(0, 14))}
              placeholder="14 raqamli PINFL" className={inputCls + ' font-mono'} inputMode="numeric" />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Umumiy summa (so'm) *</label>
            <input value={f.total_amount} onChange={(e) => set('total_amount', e.target.value.replace(/\D/g, ''))}
              placeholder="3000000" className={inputCls + ' font-mono'} inputMode="numeric" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Boshlang'ich to'lov (so'm)</label>
            <input value={f.initial_amount} onChange={(e) => set('initial_amount', e.target.value.replace(/\D/g, ''))}
              placeholder="0" className={inputCls + ' font-mono'} inputMode="numeric" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Muddat (oy) *</label>
            <input value={f.period} onChange={(e) => set('period', e.target.value.replace(/\D/g, '').slice(0, 2))}
              className={inputCls + ' font-mono'} inputMode="numeric" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">To'lov kuni (1-28) *</label>
            <input value={f.pay_day} onChange={(e) => set('pay_day', e.target.value.replace(/\D/g, '').slice(0, 2))}
              className={inputCls + ' font-mono'} inputMode="numeric" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-500 mb-1">Boshlanish oyi (YYMM) *</label>
            <input value={f.start_month} onChange={(e) => set('start_month', e.target.value.replace(/\D/g, '').slice(0, 4))}
              className={inputCls + ' font-mono'} inputMode="numeric" />
          </div>
        </div>

        {/* Oylik to'lov preview */}
        {totalSom > 0 && (
          <div className={`text-sm px-3 py-2 rounded-lg ${monthly < 5000 ? 'bg-red-50 text-red-700' : 'bg-primary-50 text-primary-700'}`}>
            Taxminiy oylik to'lov: <b>{monthly.toLocaleString('ru-RU')} so'm</b> × {per} oy
            {monthly < 5000 && ' — minimal 5000 so\'m!'}
          </div>
        )}

        <div className="border-t border-gray-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Manzil</label>
            <input value={f.address} onChange={(e) => set('address', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Ish joyi</label>
            <input value={f.work_place} onChange={(e) => set('work_place', e.target.value)} className={inputCls} />
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={f.debit_initial_amount} onChange={(e) => set('debit_initial_amount', e.target.checked)} className="accent-primary-600 w-4 h-4" />
            Boshlang'ichni kartadan yechish
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={f.confirm_by_sms} onChange={(e) => set('confirm_by_sms', e.target.checked)} className="accent-primary-600 w-4 h-4" />
            SMS-kod bilan tasdiqlash
          </label>
        </div>

        {err && <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{err}</div>}

        <div className="flex justify-end">
          <button type="submit" disabled={busy} className="btn-primary flex items-center gap-2 disabled:opacity-50">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
            Rassrochka ochish
          </button>
        </div>
      </form>

      <p className="text-xs text-gray-400 mt-3">
        Ochilgandan so'ng karta egasiga SMS-kod boradi — keyin chiqadigan oynada kodni kiritib tasdiqlang.
        Oylik to'lov minimal 5000 so'm.
      </p>

      {created && (
        <DetailDrawer
          storeId={created.storeId}
          instalmentId={created.id}
          listItem={null}
          onClose={() => { setCreated(null); setF(EMPTY); }}
        />
      )}
    </div>
  );
}

// ===================== Qidirish (ID bo'yicha) =====================
function LookupTab({ paymoStores }) {
  const firstId = paymoStores[0]?.paymo_store_id ?? paymoStores[0]?.paymoStoreId ?? '';
  const [storeId, setStoreId] = useState(firstId);
  const [iid, setIid] = useState('');
  const [open, setOpen] = useState(null); // {storeId, id}

  const submit = (e) => {
    e.preventDefault();
    if (!storeId || !iid.trim()) return;
    setOpen({ storeId: Number(storeId), id: iid.trim() });
  };

  return (
    <div>
      <form onSubmit={submit} className="card p-4 mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Magazin</label>
          <select value={storeId} onChange={(e) => setStoreId(Number(e.target.value))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500">
            {paymoStores.map((s) => {
              const pid = s.paymo_store_id ?? s.paymoStoreId;
              return <option key={pid} value={pid}>{s.name} (#{pid})</option>;
            })}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Rassrochka ID</label>
          <input value={iid} onChange={(e) => setIid(e.target.value.replace(/\D/g, ''))} placeholder="masalan: 343589"
            inputMode="numeric"
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-primary-500" />
        </div>
        <button type="submit" className="btn-primary flex items-center gap-1.5 text-sm">
          <Search className="w-4 h-4" /> Ko'rish
        </button>
      </form>

      <p className="text-xs text-gray-400">
        ID bo'yicha to'g'ridan-to'g'ri Atmos'dan ochiladi (kassada ochilganlar ham). Detal oynasida tasdiqlash/karta almashtirish mavjud.
      </p>

      {open && (
        <DetailDrawer
          storeId={open.storeId}
          instalmentId={open.id}
          listItem={null}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}
