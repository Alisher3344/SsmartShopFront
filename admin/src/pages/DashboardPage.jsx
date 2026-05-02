import { useEffect, useState } from 'react'
import {
  LogOut, MapPin, Phone, Clock, Package, KeyRound, CheckCircle2, AlertCircle,
  RefreshCw, User as UserIcon, PackageCheck, PackageOpen, X, Sun, Moon,
  LayoutDashboard, ClipboardList, Settings, Menu, TrendingUp, Truck,
  Calendar, ChevronRight, BarChart3
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { pickupApi, resolveImage } from '../api/client'

const STATUS_BADGE = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  ready: 'bg-green-50 text-green-700 border-green-200',
  delivered: 'bg-gray-100 text-gray-700 border-gray-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
}
const STATUS_LABEL = {
  pending: 'Kutilmoqda',
  confirmed: 'Yo\'lda',
  ready: 'Tayyor',
  delivered: 'Topshirilgan',
  cancelled: 'Bekor qilingan',
}

function formatPrice(n) { return new Intl.NumberFormat('uz-UZ').format(n) }
function formatDate(s) {
  try {
    return new Date(s).toLocaleString('uz-UZ', {
      day: '2-digit', month: '2-digit',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return s }
}
function isToday(iso) {
  if (!iso) return false
  const d = new Date(iso); const t = new Date()
  return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear()
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const { isDark, toggle } = useTheme()
  const [activeNav, setActiveNav] = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [point, setPoint] = useState(null)
  const [pointLoading, setPointLoading] = useState(true)
  const [allOrders, setAllOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  // Punkt + barcha statuslar bo'yicha buyurtmalar
  useEffect(() => {
    setPointLoading(true)
    pickupApi.myPoint().then(setPoint).catch(() => {}).finally(() => setPointLoading(false))
  }, [])

  const refreshAll = async () => {
    setOrdersLoading(true)
    try {
      const statuses = ['pending', 'confirmed', 'ready', 'delivered']
      const lists = await Promise.all(statuses.map((s) => pickupApi.myOrders(s).catch(() => [])))
      setAllOrders(lists.flat())
    } finally {
      setOrdersLoading(false)
    }
  }
  useEffect(() => { refreshAll() }, [])

  // Statistika
  const counts = {
    pending: allOrders.filter(o => o.status === 'pending').length,
    confirmed: allOrders.filter(o => o.status === 'confirmed').length,
    ready: allOrders.filter(o => o.status === 'ready').length,
    delivered: allOrders.filter(o => o.status === 'delivered').length,
    deliveredToday: allOrders.filter(o => o.status === 'delivered' && isToday(o.deliveredAt)).length,
    revenueToday: allOrders
      .filter(o => o.status === 'delivered' && isToday(o.deliveredAt))
      .reduce((s, o) => s + (o.total || 0), 0),
  }

  const handleNav = (id) => {
    setActiveNav(id)
    setSidebarOpen(false)
  }

  const NAV = [
    { id: 'home', label: 'Bosh sahifa', icon: LayoutDashboard },
    { id: 'orders', label: 'Buyurtmalar', icon: ClipboardList, badge: counts.ready },
    { id: 'history', label: 'Tarix', icon: BarChart3 },
    { id: 'settings', label: 'Sozlamalar', icon: Settings },
  ]

  return (
    <div className="pickup-shell flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        pickup-sidebar fixed lg:sticky top-0 left-0 z-50 h-screen w-64 flex flex-col
        transform transition-transform duration-300 lg:transform-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(circle at 0% 0%, rgba(124, 58, 237, 0.10), transparent 60%)' }}
          />
          <div className="flex items-center gap-2.5 relative">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center ring-1 ring-primary-500/20"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.18), rgba(106, 28, 199, 0.06))',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), 0 6px 16px -6px rgba(106, 28, 199, 0.4)',
              }}
            >
              <MapPin className="w-5 h-5 text-primary-600" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-gray-900 tracking-tight">
                Punkt <span className="pickup-gradient-text">admin</span>
              </div>
              <div className="text-[10px] text-gray-500 uppercase tracking-[0.18em] truncate max-w-[140px] font-semibold">
                {point?.name?.uz || '—'}
              </div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg relative">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-gray-400 px-3 py-2">
            Menyu
          </div>
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`group w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeNav === item.id
                  ? 'pickup-nav-active'
                  : 'text-gray-700 hover:bg-gray-100 hover:translate-x-0.5'
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge > 0 && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeNav === item.id
                    ? 'bg-white text-primary-700'
                    : 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-sm'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100 space-y-0.5">
          <button
            onClick={toggle}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
          </button>

          <div className="mt-2 mx-1 p-2.5 rounded-xl bg-gradient-to-br from-primary-50 to-transparent dark:from-primary-900/20 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 ring-2 ring-white shadow-md">
              {(user?.full_name || user?.username || '?')[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-gray-900 truncate">{user?.full_name || user?.username}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">Pickup admin</div>
            </div>
          </div>

          <button
            onClick={logout}
            className="mt-1 w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Chiqish</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center gap-3 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 truncate tracking-tight">
              {NAV.find(n => n.id === activeNav)?.label}
            </h1>
            {point && (
              <div className="text-xs text-gray-500 truncate flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />
                {point.address?.uz}
              </div>
            )}
          </div>
          <button
            onClick={refreshAll}
            disabled={ordersLoading}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            title="Yangilash"
          >
            <RefreshCw className={`w-4 h-4 ${ordersLoading ? 'animate-spin' : ''}`} />
          </button>
        </header>

        <main className="flex-1 p-4 lg:p-6 pickup-fade-in">
          {activeNav === 'home' && (
            <HomeView
              point={point} pointLoading={pointLoading}
              counts={counts} allOrders={allOrders}
              onRefresh={refreshAll}
              onNavigate={handleNav}
            />
          )}
          {activeNav === 'orders' && <OrdersView allOrders={allOrders} loading={ordersLoading} />}
          {activeNav === 'history' && <HistoryView allOrders={allOrders} />}
          {activeNav === 'settings' && <SettingsView point={point} user={user} />}
        </main>
      </div>
    </div>
  )
}

// ====================== HOME ======================
function HomeView({ point, pointLoading, counts, allOrders, onRefresh, onNavigate }) {
  const recentReady = allOrders.filter(o => o.status === 'ready').slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Statistika kartalari */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Truck} label="Yo'lda kelmoqda"
          value={counts.confirmed}
          color="bg-blue-50 text-blue-600"
          onClick={() => onNavigate('orders')}
        />
        <StatCard
          icon={PackageCheck} label="Punktda tayyor"
          value={counts.ready}
          color="bg-green-50 text-green-600"
          highlight={counts.ready > 0}
          onClick={() => onNavigate('orders')}
        />
        <StatCard
          icon={CheckCircle2} label="Bugun topshirilgan"
          value={counts.deliveredToday}
          color="bg-primary-50 text-primary-600"
        />
        <StatCard
          icon={TrendingUp} label="Bugungi aylanma"
          value={`${formatPrice(counts.revenueToday)}`}
          suffix="so'm"
          color="bg-amber-50 text-amber-600"
        />
      </div>

      {/* 2 kolonkada: 1) Punkt info  2) Yaqin tayyor buyurtmalar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Asosiy ish — 2 ta kod input */}
        <div className="lg:col-span-2 space-y-4">
          <ReceiveSection onDone={onRefresh} />
          <DeliverSection onDone={onRefresh} />
        </div>

        {/* O'ng ustun: punkt + yaqin tayyor */}
        <div className="space-y-4">
          {/* Punkt karti */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-primary-600" />
              <h3 className="font-semibold text-gray-900 text-sm">Mening punktim</h3>
            </div>
            {pointLoading && (
              <div className="flex justify-center py-4">
                <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {point && !pointLoading && (
              <div className="space-y-2 text-xs">
                <div className="font-bold text-gray-900 text-sm">{point.name?.uz}</div>
                <div className="text-gray-600">{point.address?.uz}</div>
                {point.phone && (
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Phone className="w-3 h-3" />
                    <span>{point.phone}</span>
                  </div>
                )}
                {(point.workHours || point.work_hours) && (
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Clock className="w-3 h-3" />
                    <span>{point.workHours || point.work_hours}</span>
                  </div>
                )}
                <div className="pt-2 mt-2 border-t border-gray-100">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    point.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {point.active ? '✓ FAOL' : 'YOPIQ'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Yaqin tayyor */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-green-600" />
                <h3 className="font-semibold text-gray-900 text-sm">Tayyor (yaqin)</h3>
              </div>
              {counts.ready > 3 && (
                <button onClick={() => onNavigate('orders')} className="text-[10px] text-primary-600 hover:underline">
                  Barchasi ({counts.ready})
                </button>
              )}
            </div>
            {recentReady.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400">
                Hozircha tayyor buyurtmalar yo'q
              </div>
            ) : (
              <div className="space-y-2">
                {recentReady.map(o => (
                  <div key={o.id} className="border border-gray-100 rounded-lg p-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-gray-500">#{o.id}</span>
                      {o.pickupCode && (
                        <code className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-mono">
                          {o.pickupCode}
                        </code>
                      )}
                    </div>
                    <div className="text-xs font-medium truncate">{o.customerName}</div>
                    <div className="text-[10px] text-gray-500 truncate">
                      {o.items?.map(i => i.name?.uz).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color, suffix, onClick, highlight }) {
  const Comp = onClick ? 'button' : 'div'
  return (
    <Comp
      onClick={onClick}
      className={`card p-4 text-left w-full relative overflow-hidden group ${
        onClick ? 'hover:-translate-y-0.5 transition-transform cursor-pointer' : ''
      } ${highlight ? 'pickup-pulse-ring ring-2 ring-green-400/60' : ''}`}
    >
      {/* Subtle gradient accent */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.04), transparent 60%)' }}
      />
      <div className="flex items-center justify-between mb-3 relative">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} ring-1 ring-black/5 shadow-sm`}>
          <Icon className="w-5 h-5" />
        </div>
        {onClick && <ChevronRight className="w-4 h-4 text-gray-300 group-hover:translate-x-0.5 group-hover:text-gray-500 transition-all" />}
      </div>
      <div className="text-2xl font-bold text-gray-900 leading-tight tracking-tight relative">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5 relative">{label}{suffix && <span className="text-gray-400 ml-1">{suffix}</span>}</div>
    </Comp>
  )
}

// ====================== RECEIVE (1-kod) ======================
function ReceiveSection({ onDone }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setResult(null)
    if (code.length !== 8) { setError("Kod 8 ta raqamdan iborat bo'lishi kerak"); return }
    setLoading(true)
    try {
      const order = await pickupApi.receiveByTransitCode(code)
      setResult(order); setCode(''); await onDone()
    } catch (e) { setError(e.message || "Qabul qilinmadi") }
    finally { setLoading(false) }
  }

  return (
    <div className="card p-5 border-l-4 border-blue-500">
      <div className="flex items-center gap-2 mb-3">
        <PackageOpen className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-gray-900">Mahsulot qabul qilish</h3>
        <span className="ml-auto text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">1-KOD</span>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        Sotuv adminidan kelgan mahsulot ustidagi 8 xonali kodni kiriting.
      </p>
      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text" inputMode="numeric" maxLength={8}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
          placeholder="12345678"
          className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono text-2xl tracking-[0.4em] text-center"
        />
        <button
          type="submit"
          disabled={loading || code.length !== 8}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <PackageCheck className="w-5 h-5" />
          {loading ? "..." : "Qabul"}
        </button>
      </form>
      {error && (
        <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /><span>{error}</span>
        </div>
      )}
      {result && (
        <div className="mt-3 p-3 bg-blue-50 border-2 border-blue-300 rounded-lg text-sm">
          <div className="flex items-center gap-2 text-blue-800 font-bold mb-1">
            <CheckCircle2 className="w-4 h-4" />
            Qabul qilindi: {result.customerName}
          </div>
          <div className="text-xs text-blue-900">
            Mijozga yuborilgan kod: <code className="bg-white px-1.5 rounded font-mono font-bold">{result.pickupCode}</code>
          </div>
        </div>
      )}
    </div>
  )
}

// ====================== DELIVER (2-kod) ======================
function DeliverSection({ onDone }) {
  const [code, setCode] = useState('')
  const [lookupLoading, setLookupLoading] = useState(false)
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [delivering, setDelivering] = useState(false)
  const [done, setDone] = useState(false)

  const lookup = async (e) => {
    e.preventDefault()
    setError(''); setOrder(null); setDone(false)
    if (code.length !== 8) { setError("Kod 8 ta raqamdan iborat bo'lishi kerak"); return }
    setLookupLoading(true)
    try {
      const o = await pickupApi.lookupByPickupCode(code)
      setOrder(o)
    } catch (e) { setError(e.message || "Topilmadi") }
    finally { setLookupLoading(false) }
  }

  const deliver = async () => {
    if (!order) return
    setDelivering(true)
    try {
      await pickupApi.deliverByCode(code)
      setDone(true); await onDone()
    } catch (e) { alert("Xato: " + (e.message || '')) }
    finally { setDelivering(false) }
  }

  const reset = () => { setOrder(null); setCode(''); setDone(false); setError('') }

  return (
    <div className="card p-5 border-l-4 border-green-500">
      <div className="flex items-center gap-2 mb-3">
        <KeyRound className="w-5 h-5 text-green-600" />
        <h3 className="font-bold text-gray-900">Buyurtmani topshirish</h3>
        <span className="ml-auto text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-bold">2-KOD</span>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        Mijoz aytadigan 8 xonali kodni kiriting.
      </p>

      {!order && (
        <form onSubmit={lookup} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text" inputMode="numeric" maxLength={8}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
            placeholder="87654321"
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 font-mono text-2xl tracking-[0.4em] text-center"
          />
          <button
            type="submit"
            disabled={lookupLoading || code.length !== 8}
            className="px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {lookupLoading ? "..." : "Tekshirish"}
          </button>
        </form>
      )}

      {error && (
        <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /><span>{error}</span>
        </div>
      )}

      {order && !done && (
        <div className="mt-3 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
          <div className="flex items-start justify-between mb-3">
            <div className="font-bold text-green-900">Buyurtma topildi #{order.id}</div>
            <button onClick={reset} className="text-green-700 hover:bg-green-100 p-1 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1 text-sm mb-3">
            <div className="flex items-center gap-2"><UserIcon className="w-4 h-4 text-gray-500" />{order.customerName}</div>
            {order.customerPhone && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <a href={`tel:${order.customerPhone}`} className="text-primary-600">{order.customerPhone}</a>
              </div>
            )}
          </div>
          <div className="space-y-2 mb-3 pt-3 border-t border-green-200">
            {order.items.map((it, i) => (
              <div key={i} className="flex items-center gap-3">
                {it.image && <img src={resolveImage(it.image)} alt="" className="w-12 h-12 rounded object-cover bg-white" />}
                <div className="flex-1">
                  <div className="text-sm font-medium">{it.name?.uz}</div>
                  <div className="text-xs text-gray-600">{it.qty} × {formatPrice(it.price)} so'm</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm pt-3 border-t border-green-200 mb-1">
            <span className="text-gray-600">To'lov:</span>
            <span className="font-bold">{order.paymentMethod === 'card' ? '💳 Karta' : '💵 Naqd'}</span>
          </div>
          <div className="flex justify-between text-base font-bold mb-3">
            <span>Jami:</span><span>{formatPrice(order.total)} so'm</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={reset} disabled={delivering}
              className="flex-1 px-3 py-2.5 bg-white border border-red-200 hover:bg-red-50 text-red-700 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              Buyurtmani qaytarish
            </button>
            <button
              onClick={deliver} disabled={delivering}
              className="flex-1 px-3 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {delivering ? "..." : "Topshirildi"}
            </button>
          </div>
        </div>
      )}

      {done && (
        <div className="mt-3 p-3 bg-green-100 border-2 border-green-400 rounded-lg flex items-center gap-2 text-green-900 font-bold text-sm">
          <CheckCircle2 className="w-5 h-5" />
          Muvaffaqiyatli topshirildi!
          <button onClick={reset} className="ml-auto text-xs underline font-normal">Yangi</button>
        </div>
      )}
    </div>
  )
}

// ====================== ORDERS ======================
function OrdersView({ allOrders, loading }) {
  const [tab, setTab] = useState('ready')
  const [search, setSearch] = useState('')

  const TABS = [
    { id: 'ready', label: 'Tayyor', color: 'green', count: allOrders.filter(o => o.status === 'ready').length },
    { id: 'confirmed', label: 'Yo\'lda', color: 'blue', count: allOrders.filter(o => o.status === 'confirmed').length },
    { id: 'delivered', label: 'Topshirilgan', color: 'gray', count: allOrders.filter(o => o.status === 'delivered').length },
  ]

  const filtered = allOrders
    .filter(o => o.status === tab)
    .filter(o => !search ||
      String(o.id).includes(search) ||
      o.pickupCode?.includes(search) ||
      o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone?.includes(search)
    )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="flex gap-1.5 overflow-x-auto pb-1 flex-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap flex items-center gap-2 ${
                tab === t.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t.label}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                tab === t.id ? 'bg-white text-primary-700' : 'bg-gray-100 text-gray-700'
              }`}>{t.count}</span>
            </button>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Qidirish: id, kod, mijoz..."
          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm w-full sm:w-64"
        />
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="card p-12 text-center text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">Bu turdagi buyurtmalar yo'q</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map(o => <OrderCard key={o.id} order={o} />)}
        </div>
      )}
    </div>
  )
}

function OrderCard({ order }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded border ${STATUS_BADGE[order.status]}`}>
            #{order.id}
          </span>
          {order.pickupCode && (
            <code className="text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-mono font-bold">
              {order.pickupCode}
            </code>
          )}
        </div>
        <span className="text-[10px] text-gray-500">{formatDate(order.createdAt)}</span>
      </div>

      <div className="flex items-center gap-2 text-sm mb-2">
        <UserIcon className="w-3.5 h-3.5 text-gray-400" />
        <span className="font-medium truncate">{order.customerName}</span>
        {order.customerPhone && (
          <a href={`tel:${order.customerPhone}`} className="text-primary-600 text-xs ml-auto">
            {order.customerPhone}
          </a>
        )}
      </div>

      <div className="space-y-1 mb-3 text-xs text-gray-600">
        {order.items?.slice(0, 3).map((it, i) => (
          <div key={i} className="flex items-center gap-2">
            {it.image && <img src={resolveImage(it.image)} alt="" className="w-6 h-6 rounded object-cover bg-gray-50" />}
            <span className="truncate">{it.name?.uz} × {it.qty}</span>
          </div>
        ))}
        {order.items?.length > 3 && <div className="text-[10px] text-gray-400">+{order.items.length - 3} ta yana</div>}
      </div>

      <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-sm">
        <span className="text-xs text-gray-500">{order.paymentMethod === 'card' ? '💳 Karta' : '💵 Naqd'}</span>
        <span className="font-bold">{formatPrice(order.total)} so'm</span>
      </div>
    </div>
  )
}

// ====================== HISTORY ======================
function HistoryView({ allOrders }) {
  const delivered = allOrders.filter(o => o.status === 'delivered')
    .sort((a, b) => new Date(b.deliveredAt || 0) - new Date(a.deliveredAt || 0))

  const totalRevenue = delivered.reduce((s, o) => s + (o.total || 0), 0)

  // Sanaga ko'ra guruhlash
  const groups = {}
  for (const o of delivered) {
    const d = o.deliveredAt ? new Date(o.deliveredAt).toLocaleDateString('uz-UZ') : '—'
    if (!groups[d]) groups[d] = []
    groups[d].push(o)
  }

  return (
    <div className="space-y-4">
      {/* Umumiy statistika */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card p-4">
          <div className="text-xs text-gray-500">Jami topshirilgan</div>
          <div className="text-2xl font-bold mt-1">{delivered.length} ta</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-gray-500">Umumiy aylanma</div>
          <div className="text-2xl font-bold mt-1">{formatPrice(totalRevenue)} <span className="text-xs text-gray-400">so'm</span></div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-gray-500">O'rtacha buyurtma</div>
          <div className="text-2xl font-bold mt-1">
            {delivered.length > 0 ? formatPrice(Math.round(totalRevenue / delivered.length)) : '0'}
            <span className="text-xs text-gray-400 ml-1">so'm</span>
          </div>
        </div>
      </div>

      {/* Sanalar bo'yicha */}
      {delivered.length === 0 ? (
        <div className="card p-12 text-center text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">Tarix bo'sh</p>
        </div>
      ) : (
        Object.entries(groups).map(([date, items]) => (
          <div key={date}>
            <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              <span className="font-medium">{date}</span>
              <span>—</span>
              <span>{items.length} ta · {formatPrice(items.reduce((s, o) => s + (o.total || 0), 0))} so'm</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
              {items.map(o => <OrderCard key={o.id} order={o} />)}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

// ====================== SETTINGS ======================
function SettingsView({ point, user }) {
  return (
    <div className="space-y-4 max-w-2xl">
      <div className="card p-5">
        <h3 className="font-bold text-gray-900 mb-3">Mening hisobim</h3>
        <Field label="Ism familiya" value={user?.full_name || '—'} />
        <Field label="Username" value={user?.username || '—'} mono />
        <Field label="Telefon" value={user?.phone || '—'} />
        <Field label="Rol" value="Pickup admin" />
      </div>

      <div className="card p-5">
        <h3 className="font-bold text-gray-900 mb-3">Punkt ma'lumotlari</h3>
        {!point ? (
          <div className="text-sm text-gray-500">Yuklanmadi</div>
        ) : (
          <>
            <Field label="Nomi (UZ)" value={point.name?.uz} />
            <Field label="Nomi (RU)" value={point.name?.ru} />
            <Field label="Manzil (UZ)" value={point.address?.uz} />
            <Field label="Manzil (RU)" value={point.address?.ru} />
            <Field label="Telefon" value={point.phone || '—'} />
            <Field label="Ish vaqti" value={point.workHours || point.work_hours || '—'} />
            <Field label="Holat" value={point.active ? '✓ Faol' : 'Yopiq'} />
          </>
        )}
      </div>

      <div className="card p-5 bg-blue-50 border-blue-200">
        <h3 className="font-bold text-gray-900 mb-2 text-sm">ℹ️ Eslatma</h3>
        <p className="text-xs text-gray-700">
          Punkt ma'lumotlarini faqat super admin o'zgartirishi mumkin. Username yoki parolni
          o'zgartirish uchun super admin bilan bog'laning.
        </p>
      </div>
    </div>
  )
}

function Field({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-b-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-medium text-gray-900 text-right ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}
