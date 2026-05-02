import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, X, Save, MapPin, Eye, EyeOff, UserCog, KeyRound, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAdminData } from '../../context/AdminDataContext';
import { pickupPointsApi } from '../../api/client';

const EMPTY_POINT = {
  name: { uz: '', ru: '' },
  address: { uz: '', ru: '' },
  phone: '',
  work_hours: '',
  active: true,
};

// Telefon maska: +998 XX XXX-XX-XX
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

export default function AdminPickupPoints() {
  const { isSuperAdmin } = useAuth();
  const { pickupPoints, addPickupPoint, updatePickupPoint, deletePickupPoint, error } = useAdminData();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_POINT);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [adminPoint, setAdminPoint] = useState(null);

  if (!isSuperAdmin) return <Navigate to="/dashboard" replace />;

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_POINT);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (point) => {
    setEditingId(point.id);
    setForm({
      name: point.name || { uz: '', ru: '' },
      address: point.address || { uz: '', ru: '' },
      phone: point.phone || '',
      work_hours: point.workHours || point.work_hours || '',
      active: point.active,
    });
    setFormError('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_POINT);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const data = {
      name: form.name,
      address: form.address,
      phone: form.phone || null,
      workHours: form.work_hours || null,
      active: !!form.active,
    };
    setSubmitting(true);
    try {
      if (editingId) {
        await updatePickupPoint(editingId, data);
      } else {
        await addPickupPoint(data);
      }
      closeForm();
    } catch (err) {
      setFormError(err.message || 'Saqlashda xatolik');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`"${name}" punktini o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await deletePickupPoint(id);
    } catch (err) {
      alert("O'chirishda xatolik: " + (err.message || ''));
    }
  };

  const toggleActive = async (point) => {
    try {
      await updatePickupPoint(point.id, { active: !point.active });
    } catch (err) {
      alert("Yangilashda xatolik: " + (err.message || ''));
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Topshirish punktlari
            <span className="text-[10px] bg-accent-500 text-white px-2 py-0.5 rounded font-bold">SUPER</span>
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Har punktga bir nechta admin biriktirish mumkin
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Yangi punkt
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          Backend xatosi: {error}
        </div>
      )}

      {/* Points grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pickupPoints.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 card">
            <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Topshirish punkti mavjud emas</p>
          </div>
        ) : pickupPoints.map(point => (
          <div
            key={point.id}
            onClick={() => setAdminPoint(point)}
            className={`card p-4 cursor-pointer hover:shadow-md transition-shadow ${!point.active && 'opacity-60'}`}
          >
            <div className="flex items-start gap-2 mb-3">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{point.name?.uz}</div>
                <div className="text-xs text-gray-500 truncate">{point.name?.ru}</div>
              </div>
            </div>

            <div className="text-sm text-gray-700 mb-1">📍 {point.address?.uz}</div>
            {point.phone && <div className="text-xs text-gray-600 mb-1">📞 {point.phone}</div>}
            {(point.workHours || point.work_hours) && (
              <div className="text-xs text-gray-600 mb-3">🕐 {point.workHours || point.work_hours}</div>
            )}

            <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => toggleActive(point)}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  point.active
                    ? 'bg-green-50 text-green-700 hover:bg-green-100'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {point.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {point.active ? 'Faol' : 'Yashirin'}
              </button>
              <button
                onClick={() => setAdminPoint(point)}
                className="p-1.5 text-gray-600 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors"
                title="Adminlar"
              >
                <UserCog className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => openEdit(point)}
                className="p-1.5 text-gray-600 hover:bg-primary-50 hover:text-primary-700 rounded-md transition-colors"
                title="Tahrirlash"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(point.id, point.name?.uz)}
                className="p-1.5 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
                title="O'chirish"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center mt-2">
              Adminlarni boshqarish uchun bosing
            </p>
          </div>
        ))}
      </div>

      {/* Punkt form modali */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold">
                {editingId ? 'Punktni tahrirlash' : 'Yangi punkt'}
              </h2>
              <button onClick={closeForm} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom (UZ) *</label>
                  <input
                    required
                    value={form.name.uz}
                    onChange={(e) => setForm({ ...form, name: { ...form.name, uz: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom (RU) *</label>
                  <input
                    required
                    value={form.name.ru}
                    onChange={(e) => setForm({ ...form, name: { ...form.name, ru: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Manzil (UZ) *</label>
                  <input
                    required
                    value={form.address.uz}
                    onChange={(e) => setForm({ ...form, address: { ...form.address, uz: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Manzil (RU) *</label>
                  <input
                    required
                    value={form.address.ru}
                    onChange={(e) => setForm({ ...form, address: { ...form.address, ru: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefon</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+998987770727"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Ish vaqti</label>
                  <input
                    value={form.work_hours}
                    onChange={(e) => setForm({ ...form, work_hours: e.target.value })}
                    placeholder="09:00 - 21:00"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="accent-primary-600 w-4 h-4"
                />
                <span>Faol</span>
              </label>

              {formError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                  {formError}
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-100">
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

      {/* Adminlar modali */}
      {adminPoint && (
        <PickupAdminsModal
          point={adminPoint}
          onClose={() => setAdminPoint(null)}
        />
      )}
    </div>
  );
}

// ============== Adminlar ro'yxati va boshqaruvi modali ==============

function PickupAdminsModal({ point, onClose }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingAdmin, setEditingAdmin] = useState(null); // null=ro'yxat, {}=yangi, {...}=tahrir

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      const list = await pickupPointsApi.listAdmins(point.id);
      setAdmins(list);
    } catch (e) {
      setError(e.message || "Adminlarni yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [point.id]);

  const handleDelete = async (admin) => {
    if (!confirm(`"${admin.username}" adminni o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await pickupPointsApi.deleteAdmin(admin.id);
      await refresh();
    } catch (e) {
      alert("O'chirishda xatolik: " + (e.message || ''));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between z-10">
          <div className="min-w-0">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <UserCog className="w-5 h-5 text-blue-600" />
              Punkt adminlari
            </h2>
            <p className="text-xs text-gray-500 truncate">{point.name?.uz} — {point.address?.uz}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {editingAdmin !== null ? (
            <PickupAdminForm
              point={point}
              admin={editingAdmin}
              onCancel={() => setEditingAdmin(null)}
              onSaved={async () => { setEditingAdmin(null); await refresh(); }}
            />
          ) : (
            <>
              {loading && (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {error && (
                <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                  {error}
                </div>
              )}

              {!loading && admins.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <UserIcon className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Hali admin biriktirilmagan</p>
                </div>
              )}

              {!loading && admins.length > 0 && (
                <div className="space-y-2 mb-4">
                  {admins.map(admin => (
                    <div key={admin.id} className="card p-3 flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        {(admin.full_name || admin.username || '?')[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold truncate">{admin.full_name || '—'}</div>
                        <div className="text-xs text-gray-600 flex items-center gap-2 flex-wrap">
                          <span>👤 {admin.username}</span>
                          {admin.phone && <span>📞 {admin.phone}</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => setEditingAdmin(admin)}
                        className="p-1.5 text-gray-600 hover:bg-primary-50 hover:text-primary-700 rounded-md"
                        title="Tahrirlash"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(admin)}
                        className="p-1.5 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-md"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setEditingAdmin({})}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Yangi admin qo'shish
              </button>

              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                Adminlar <code className="bg-white px-1.5 py-0.5 rounded">http://localhost:5174</code> orqali username + parol bilan kira oladi
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============== Yangi/eski admin formasi ==============

function PickupAdminForm({ point, admin, onCancel, onSaved }) {
  const isEdit = !!admin?.id;
  const [form, setForm] = useState({
    full_name: admin?.full_name || '',
    username: admin?.username || '',
    password: '',
    phone: admin?.phone ? formatPhone(admin.phone) : '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const phoneDigits = phoneToDigits(form.phone);
    if (!isEdit && phoneDigits.length !== 9) {
      setError("Telefon raqamni to'liq kiriting");
      return;
    }
    if (form.password && form.password.length < 6) {
      setError("Parol kamida 6 ta belgi bo'lishi kerak");
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        const updates = {};
        if (form.full_name && form.full_name !== admin.full_name) updates.full_name = form.full_name;
        if (form.username && form.username !== admin.username) updates.username = form.username.trim().toLowerCase();
        if (form.password) updates.password = form.password;
        if (phoneDigits.length === 9) {
          const newPhone = '+998' + phoneDigits;
          if (newPhone !== admin.phone) updates.phone = newPhone;
        }
        await pickupPointsApi.updateAdmin(admin.id, updates);
      } else {
        await pickupPointsApi.createAdmin(point.id, {
          full_name: form.full_name.trim(),
          username: form.username.trim().toLowerCase(),
          password: form.password,
          phone: '+998' + phoneDigits,
        });
      }
      onSaved();
    } catch (err) {
      setError(err.message || 'Saqlashda xatolik');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="font-semibold text-gray-900 mb-2">
        {isEdit ? `${admin.full_name || admin.username}'ni tahrirlash` : 'Yangi admin'}
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Ism Familiya *</label>
        <input
          required
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          placeholder="Aliqulov Alisher"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Username (login) *</label>
        <input
          required
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
          Parol {isEdit ? "(o'zgartirmasangiz bo'sh qoldiring)" : "*"}
        </label>
        <input
          type="text"
          required={!isEdit}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder={isEdit ? "Bo'sh qoldiring" : "Kamida 6 ta belgi"}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm font-mono"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefon raqam *</label>
        <input
          type="tel"
          required={!isEdit}
          inputMode="numeric"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
          placeholder="+998 90 123-45-67"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm font-mono"
        />
      </div>

      {error && (
        <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-3 border-t border-gray-100">
        <button type="button" onClick={onCancel} disabled={submitting} className="btn-secondary flex-1 disabled:opacity-50">
          Bekor qilish
        </button>
        <button type="submit" disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
          <Save className="w-4 h-4" />
          {submitting ? 'Saqlanmoqda...' : isEdit ? 'Yangilash' : "Qo'shish"}
        </button>
      </div>
    </form>
  );
}
