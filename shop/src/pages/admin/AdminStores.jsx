import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, X, Save, Store as StoreIcon, Eye, EyeOff, KeyRound, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAdminData } from '../../context/AdminDataContext';
import { staffApi } from '../../api/client';
import FluentEmoji from '../../components/FluentEmoji';

const EMPTY = {
  name: '', address: '', phone: '', description: '', active: true,
  // Bog'langan admin/staff
  full_name: '', username: '', password: '',
};

const formatPhone = (raw) => {
  const digits = (raw || '').replace(/\D/g, '').replace(/^998/, '').slice(0, 9);
  if (!digits) return '';
  let out = '+998 ' + digits.slice(0, 2);
  if (digits.length > 2) out += ' ' + digits.slice(2, 5);
  if (digits.length > 5) out += '-' + digits.slice(5, 7);
  if (digits.length > 7) out += '-' + digits.slice(7, 9);
  return out;
};
const phoneToDigits = (raw) => (raw || '').replace(/\D/g, '').replace(/^998/, '');

export default function AdminStores() {
  const { isSuperAdmin } = useAuth();
  const { stores, addStore, updateStore, deleteStore, products } = useAdminData();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Magazin staff'lari (sales_admin) — har magazinning login'i
  const [staffs, setStaffs] = useState([]);
  const refreshStaffs = async () => {
    try {
      const list = await staffApi.list();
      setStaffs(list);
    } catch { /* skip */ }
  };
  useEffect(() => { refreshStaffs(); }, []);

  const getStaff = (storeId) =>
    staffs.find(s => (s.storeId ?? s.store_id) === storeId);

  if (!isSuperAdmin) return <Navigate to="/" replace />;

  const openAdd = () => { setEditingId(null); setForm(EMPTY); setError(''); setShowForm(true); };
  const openEdit = (s) => {
    const staff = getStaff(s.id);
    setEditingId(s.id);
    setForm({
      name: s.name || '',
      address: s.address || '',
      phone: s.phone || '',
      description: s.description || '',
      active: s.active,
      // Mavjud staffning ma'lumotlari
      full_name: staff?.full_name || '',
      username: staff?.username || '',
      password: '',
      _staffId: staff?.id || null,
    });
    setError('');
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditingId(null); setForm(EMPTY); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!editingId) {
      // Yangi magazin: login + parol majburiy
      if (!form.full_name?.trim()) { setError("Magazin admin ism familiyasini kiriting"); return; }
      if (!form.username?.trim()) { setError("Username kiriting"); return; }
      if (!form.password || form.password.length < 6) { setError("Parol kamida 6 ta belgi"); return; }
    }
    if (form.password && form.password.length < 6) {
      setError("Parol kamida 6 ta belgi");
      return;
    }
    setSubmitting(true);
    try {
      const storeData = {
        name: form.name,
        address: form.address || null,
        phone: form.phone || null,
        description: form.description || null,
        active: !!form.active,
      };
      let storeId = editingId;
      if (editingId) {
        await updateStore(editingId, storeData);
      } else {
        const created = await addStore(storeData);
        storeId = created.id;
      }

      // Staff (magazin admin)
      const phoneDigits = phoneToDigits(form.phone);
      const staffPhone = phoneDigits.length === 9 ? '+998' + phoneDigits : null;
      if (editingId && form._staffId) {
        // Mavjud staffni yangilash
        const updates = {};
        if (form.full_name) updates.full_name = form.full_name.trim();
        if (form.username) updates.username = form.username.trim().toLowerCase();
        if (form.password) updates.password = form.password;
        if (staffPhone) updates.phone = staffPhone;
        if (Object.keys(updates).length > 0) {
          await staffApi.update(form._staffId, updates);
        }
      } else if (!editingId) {
        // Yangi magazin uchun staff yaratish
        await staffApi.create({
          full_name: form.full_name.trim(),
          username: form.username.trim().toLowerCase(),
          password: form.password,
          phone: staffPhone,
          store_id: storeId,
        });
      }

      await refreshStaffs();
      closeForm();
    } catch (err) {
      setError(err.message || 'Saqlashda xato');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (s) => {
    if (s.is_main || s.isMain) {
      alert("Asosiy magazinni o'chirib bo'lmaydi");
      return;
    }
    const staff = getStaff(s.id);
    const msg = staff
      ? `"${s.name}" magazinini va uning admini "@${staff.username}" ni o'chirishni tasdiqlaysizmi?`
      : `"${s.name}" magazinini o'chirishni tasdiqlaysizmi?`;
    if (!confirm(msg)) return;
    try {
      // Avval staff'ni o'chiramiz (FK SET NULL bo'ladi, lekin user qoladi → username band qoladi)
      if (staff) {
        try { await staffApi.delete(staff.id); } catch { /* davom */ }
      }
      await deleteStore(s.id);
      await refreshStaffs();
    } catch (e) {
      alert("Xato: " + (e.message || ''));
    }
  };

  const productsCount = (storeId) => products.filter(p => p.storeId === storeId || p.store_id === storeId).length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <StoreIcon className="w-6 h-6 text-primary-600" />
            Magazinlar
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Har magazinga alohida sotuv admini biriktiriladi va ular faqat o'z magazinining mahsulotlarini boshqaradi
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Yangi magazin
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stores.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 card">
            <StoreIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Hozircha magazin yo'q</p>
          </div>
        ) : stores.map(s => {
          const isMain = s.is_main || s.isMain;
          return (
          <div key={s.id} className={`card p-4 relative ${!s.active && 'opacity-60'} ${isMain ? 'ring-2 ring-primary-500 ring-offset-1' : ''}`}>
            {isMain && (
              <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                ASOSIY
              </span>
            )}
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <StoreIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-gray-900 truncate">{s.name}</div>
                {s.address && <div className="text-xs text-gray-500 truncate flex items-center gap-1"><FluentEmoji name="pin" size={11} /> {s.address}</div>}
                {s.phone && <div className="text-xs text-gray-500 flex items-center gap-1"><FluentEmoji name="phone" size={11} /> {s.phone}</div>}
              </div>
            </div>
            {s.description && (
              <p className="text-xs text-gray-600 mb-3 line-clamp-2">{s.description}</p>
            )}
            {/* Bog'langan staff (magazin admini) */}
            {(() => {
              const staff = getStaff(s.id);
              return staff ? (
                <div className="mt-2 mb-3 px-3 py-2 bg-primary-50 rounded-lg flex items-center gap-2 text-xs">
                  <div className="w-7 h-7 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                    {(staff.full_name || staff.username || '?')[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 truncate">{staff.full_name || '—'}</div>
                    <div className="text-gray-500 font-mono truncate">@{staff.username}</div>
                  </div>
                </div>
              ) : (
                <div className="mt-2 mb-3 px-3 py-2 bg-amber-50 rounded-lg text-xs text-amber-800 flex items-center gap-1.5">
                  <FluentEmoji name="warning" size={12} /> Bog'langan staff yo'q (tahrirlab qo'shing)
                </div>
              );
            })()}

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500 flex items-center gap-1"><FluentEmoji name="package" size={12} /> {productsCount(s.id)} ta mahsulot</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                s.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {s.active ? <><FluentEmoji name="check" size={10} /> FAOL</> : 'YOPIQ'}
              </span>
            </div>
            <div className="flex gap-1 mt-3">
              <button
                onClick={() => !isMain && updateStore(s.id, { active: !s.active })}
                disabled={isMain}
                title={isMain ? "Asosiy magazin doim faol" : ''}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  s.active ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } ${isMain ? 'opacity-60 cursor-not-allowed hover:bg-green-50' : ''}`}
              >
                {s.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {s.active ? 'Faol' : 'Yopiq'}
              </button>
              <button onClick={() => openEdit(s)} className="p-1.5 hover:bg-primary-50 hover:text-primary-700 rounded-md" title="Tahrirlash">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              {!isMain && (
                <button onClick={() => handleDelete(s)} className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-md" title="O'chirish">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          );
        })}
      </div>

      {/* Forma modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{editingId ? "Magazinni tahrirlash" : "Yangi magazin"}</h2>
              <button onClick={closeForm} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nomi *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Smart Qarshi"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Manzil</label>
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Qarshi sh., I.Karimov ko'chasi"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefon</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+998948080055"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tavsif</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm resize-none"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="accent-primary-600 w-4 h-4"
                />
                Faol
              </label>

              {/* Magazin admin (staff) */}
              <div className="border-t border-gray-100 pt-4 mt-2">
                <h3 className="font-bold text-sm text-gray-900 mb-1 flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-primary-600" />
                  Magazin admini (staff)
                </h3>
                <p className="text-xs text-gray-500 mb-3">
                  {editingId
                    ? "Mavjud staff. Parolni o'zgartirish uchun yangisini kiriting."
                    : "Yangi staff yaratiladi — u dashboard/login orqali kiradi va faqat shu magazinning mahsulotlarini boshqaradi."}
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Ism Familiya *</label>
                    <input
                      required={!editingId}
                      value={form.full_name}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      placeholder="Aliqulov Alisher"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Username (login) *</label>
                    <input
                      required={!editingId}
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value.replace(/[^a-z0-9_-]/gi, '') })}
                      placeholder="qarshi_admin"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm font-mono"
                    />
                    <p className="text-[10px] text-gray-500 mt-0.5">Faqat lotin harflari, raqam, _ va -</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <KeyRound className="w-3.5 h-3.5 inline mr-1" />
                      Parol {editingId ? "(o'zgartirmasangiz bo'sh qoldiring)" : "*"}
                    </label>
                    <input
                      type="text"
                      required={!editingId}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder={editingId ? "Bo'sh qoldiring" : "Kamida 6 ta belgi"}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm font-mono"
                    />
                  </div>
                </div>
              </div>
              {error && <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{error}</div>}
              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button type="button" onClick={closeForm} disabled={submitting} className="btn-secondary flex-1 disabled:opacity-50">
                  Bekor qilish
                </button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
                  <Save className="w-4 h-4" />
                  {submitting ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
