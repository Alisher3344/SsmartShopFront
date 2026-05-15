import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle2, XCircle, MapPin, Phone, User as UserIcon, RefreshCw, Check, X as XIcon, Info } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { ordersApi, resolveImage } from '../../api/client';
import FluentEmoji from '../../components/FluentEmoji';

const STATUS_TABS = [
  { id: 'pending', label: "Kutilmoqda (qabul qilish kerak)", color: 'amber' },
  { id: 'confirmed', label: 'Tasdiqlangan (Punktga jo\'natish)', color: 'blue' },
  { id: 'ready', label: 'Punktda tayyor', color: 'green' },
  { id: 'delivered', label: 'Topshirilgan', color: 'gray' },
  { id: 'cancelled', label: 'Bekor qilingan', color: 'red' },
];

const STATUS_META = {
  pending: { icon: Clock, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  confirmed: { icon: CheckCircle2, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  ready: { icon: CheckCircle2, color: 'bg-green-50 text-green-700 border-green-200' },
  delivered: { icon: CheckCircle2, color: 'bg-gray-100 text-gray-700 border-gray-200' },
  cancelled: { icon: XCircle, color: 'bg-red-50 text-red-700 border-red-200' },
};

function formatPrice(n) {
  return new Intl.NumberFormat('uz-UZ').format(n);
}

function formatDate(s) {
  try {
    return new Date(s).toLocaleString('uz-UZ', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return s;
  }
}

export default function AdminOrders() {
  const { pickupPoints } = useAdminData();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [pickupFilter, setPickupFilter] = useState('all');
  const [actionId, setActionId] = useState(null);
  const [cancelFormId, setCancelFormId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      const filters = { status: activeTab };
      if (pickupFilter !== 'all') filters.pickupPointId = pickupFilter;
      const list = await ordersApi.list(filters);
      setOrders(list);
    } catch (e) {
      setError(e.message || "Buyurtmalarni yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [activeTab, pickupFilter]);

  const handleConfirm = async (id) => {
    setActionId(id);
    try {
      await ordersApi.confirm(id);
      await refresh();
    } catch (e) {
      alert("Tasdiqlashda xato: " + (e.message || ''));
    } finally {
      setActionId(null);
    }
  };

  const openCancelForm = (id) => {
    setCancelFormId(id);
    setCancelReason('');
  };

  const closeCancelForm = () => {
    setCancelFormId(null);
    setCancelReason('');
  };

  const submitCancel = async (id) => {
    setActionId(id);
    try {
      const reason = cancelReason.trim();
      await ordersApi.cancel(id, reason || undefined);
      closeCancelForm();
      await refresh();
    } catch (e) {
      alert("Bekor qilishda xato: " + (e.message || ''));
    } finally {
      setActionId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 text-primary-600" />
            Buyurtmalar
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Foydalanuvchilardan kelgan buyurtmalarni boshqaring
          </p>
        </div>
        <button
          onClick={refresh}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Yangilash
        </button>
      </div>

      {/* Punkt filtri */}
      {pickupPoints.length > 1 && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600">Punkt:</span>
          <button
            onClick={() => setPickupFilter('all')}
            className={`text-xs px-3 py-1.5 rounded-full font-medium ${
              pickupFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200'
            }`}
          >
            Barchasi
          </button>
          {pickupPoints.map(p => (
            <button
              key={p.id}
              onClick={() => setPickupFilter(p.id)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                pickupFilter === p.id ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200'
              }`}
            >
              {p.name?.uz}
            </button>
          ))}
        </div>
      )}

      {/* Status tablari */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="card p-12 text-center text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Bu turdagi buyurtmalar yo'q</p>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {orders.map(order => {
            const meta = STATUS_META[order.status] || STATUS_META.pending;
            const Icon = meta.icon;
            return (
              <div key={order.id} className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`px-2.5 py-1 rounded-md border text-xs font-semibold ${meta.color} flex items-center gap-1`}>
                    <Icon className="w-3.5 h-3.5" />
                    #{order.id}
                  </div>
                  <span className="text-xs text-gray-500">{formatDate(order.createdAt)}</span>
                </div>

                <div className="space-y-1 text-sm mb-3 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-medium">{order.customerName || '—'}</span>
                  </div>
                  {order.customerPhone && (
                    <a
                      href={`tel:${order.customerPhone}`}
                      className="flex items-center gap-2 text-primary-600 hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{order.customerPhone}</span>
                    </a>
                  )}
                  {order.deliveryType === 'pickup' && order.pickupPointName && (
                    <div className="flex items-start gap-2 text-gray-600 text-xs">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span>{order.pickupPointName.uz} — {order.pickupPointAddress?.uz}</span>
                    </div>
                  )}
                  {order.deliveryType === 'courier' && (
                    <div className="text-xs text-gray-600 flex items-center gap-1.5"><FluentEmoji name="package" size={12} /> {order.deliveryAddress}</div>
                  )}
                </div>

                <div className="space-y-1.5 mb-3">
                  {order.items.map((it, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      {it.image && (
                        <img
                          src={resolveImage(it.image)}
                          alt=""
                          className="w-10 h-10 rounded object-cover bg-gray-50 flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{it.name?.uz || it.name?.ru}</div>
                        <div className="text-xs text-gray-500">
                          {it.qty} × {formatPrice(it.price)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {order.comment && (
                  <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded mb-3 flex items-start gap-1.5">
                    <FluentEmoji name="speech" size={12} /> {order.comment}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="font-bold text-lg">{formatPrice(order.total)} so'm</span>
                  <span className="text-xs text-gray-500">
                    {order.paymentMethod === 'card' ? 'Karta' : 'Naqd'}
                  </span>
                </div>

                {order.status === 'confirmed' && order.transitCode && (
                  <div className="mt-3 p-3 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg">
                    <div className="text-xs text-blue-700 mb-1 font-medium flex items-center gap-1.5">
                      <FluentEmoji name="package" size={12} /> Mahsulot kodi (yorliq) — punktga jo'natish uchun:
                    </div>
                    <div className="font-mono text-2xl font-bold text-blue-900 tracking-[0.3em] text-center py-1">
                      {order.transitCode}
                    </div>
                    <div className="text-[10px] text-blue-600 text-center">
                      Bu kodni mahsulotga yopishtirib punktga yuboring
                    </div>
                  </div>
                )}

                {order.status === 'cancelled' && order.cancelReason && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <Info className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-red-800 mb-0.5">Bekor qilish sababi</div>
                      <div className="text-sm text-red-900 break-words">{order.cancelReason}</div>
                    </div>
                  </div>
                )}

                {order.status === 'pending' && cancelFormId !== order.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                    <button
                      onClick={() => handleConfirm(order.id)}
                      disabled={actionId === order.id}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      Qabul qilish
                    </button>
                    <button
                      onClick={() => openCancelForm(order.id)}
                      disabled={actionId === order.id}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-red-200 hover:bg-red-50 text-red-700 rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      <XIcon className="w-4 h-4" />
                      Bekor qilish
                    </button>
                  </div>
                )}

                {order.status === 'pending' && cancelFormId === order.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                    <label className="block text-xs font-medium text-gray-700">
                      Sabab <span className="text-gray-400 font-normal">(ixtiyoriy)</span>
                    </label>
                    <textarea
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Masalan: mahsulot tugagan, mijoz qo'ng'iroqqa javob bermayapti..."
                      maxLength={500}
                      rows={2}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:bg-white resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={closeCancelForm}
                        disabled={actionId === order.id}
                        className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium disabled:opacity-50"
                      >
                        Yopish
                      </button>
                      <button
                        onClick={() => submitCancel(order.id)}
                        disabled={actionId === order.id}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                      >
                        <XIcon className="w-4 h-4" />
                        Bekor qilishni tasdiqlash
                      </button>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
