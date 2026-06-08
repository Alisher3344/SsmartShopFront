import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  Tv,
  KeyRound,
  User as UserIcon,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { tvAdminsApi } from "../../api/client";
import FluentEmoji from "../../components/FluentEmoji";

// Ssmart TV adminlari — TV backendida yaratiladi/tahrirlanadi (Shop backend proxy orqali).
// TV admin shu login/parol bilan tv.ssmart.uz/admin ga kiradi.
export default function AdminTvAdmins() {
  const { isSuperAdmin } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null); // null=ro'yxat, {}=yangi, {...}=tahrir

  if (!isSuperAdmin) return <Navigate to="/" replace />;

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      const list = await tvAdminsApi.list();
      setAdmins(list);
    } catch (e) {
      setError(e.message || "TV adminlarini yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleDelete = async (admin) => {
    if (!confirm(`"${admin.username}" TV adminini o'chirishni tasdiqlaysizmi?`))
      return;
    try {
      await tvAdminsApi.delete(admin.id);
      await refresh();
    } catch (e) {
      alert("O'chirishda xatolik: " + (e.message || ""));
    }
  };

  if (editing !== null) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Tv className="w-6 h-6 text-primary-600" />
            {editing.id ? `TV adminini tahrirlash: ${editing.username}` : "Yangi Ssmart TV admini"}
          </h1>
        </div>
        <div className="card p-5 max-w-xl">
          <TvAdminForm
            admin={editing}
            onCancel={() => setEditing(null)}
            onSaved={async () => {
              setEditing(null);
              await refresh();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Tv className="w-6 h-6 text-primary-600" />
            Ssmart TV adminlari
            <span className="text-[10px] bg-accent-500 text-white px-2 py-0.5 rounded font-bold">
              SUPER
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            SsmartTV admin panelini boshqaruvchi hisoblar
          </p>
        </div>
        <button
          onClick={() => setEditing({})}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Yangi admin
        </button>
      </div>

      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div>
          Bu hisoblar <strong>tv.ssmart.uz/admin</strong> ga login va parol bilan
          kiradi. Tahrirlashda parolni bo'sh qoldirsangiz — eski parol saqlanadi.
          Parol o'zgartirilsa, admin qaytadan kirishi kerak bo'ladi.
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && admins.length === 0 && (
        <div className="text-center py-12 text-gray-500 card">
          <UserIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Hali TV admini yo'q</p>
        </div>
      )}

      {!loading && admins.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {admins.map((admin) => {
            const isSuper = admin.role === "superuser";
            return (
              <div key={admin.id} className="card p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 text-lg">
                    {(admin.full_name || admin.username || "?")[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">
                      {admin.full_name || "—"}
                    </div>
                    <div className="text-xs text-gray-600 truncate flex items-center gap-1">
                      <FluentEmoji name="user" size={12} /> {admin.username}
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">
                      {admin.role}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 pt-3 border-t border-gray-100">
                  <span
                    className={`flex-1 text-center text-xs font-medium py-1.5 rounded-md inline-flex items-center justify-center gap-1 ${
                      admin.is_active
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {admin.is_active ? <><FluentEmoji name="check" size={11} /> Faol</> : "Faol emas"}
                  </span>
                  {isSuper ? (
                    <span className="px-2 py-1.5 text-[10px] font-bold text-primary-700 bg-primary-50 rounded-md">
                      superuser
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditing(admin)}
                        className="p-1.5 text-gray-600 hover:bg-primary-50 hover:text-primary-700 rounded-md"
                        title="Tahrirlash (login/parol)"
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
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TvAdminForm({ admin, onCancel, onSaved }) {
  const isEdit = !!admin?.id;
  const [form, setForm] = useState({
    full_name: admin?.full_name || "",
    username: admin?.username || "",
    password: "",
    role: admin?.role && admin.role !== "superuser" ? admin.role : "admin",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.username.trim().length < 3) {
      setError("Login kamida 3 ta belgi bo'lishi kerak");
      return;
    }
    // Parol: yaratishda majburiy; tahrirlashda ixtiyoriy (bo'sh = o'zgarmaydi).
    if (form.password && form.password.length < 8) {
      setError("Parol kamida 8 ta belgi bo'lishi kerak");
      return;
    }
    if (!isEdit && form.password.length < 8) {
      setError("Parol kamida 8 ta belgi bo'lishi kerak");
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        const updates = {};
        const newUsername = form.username.trim().toLowerCase();
        if (newUsername !== admin.username) updates.username = newUsername;
        if ((form.full_name.trim() || "") !== (admin.full_name || ""))
          updates.full_name = form.full_name.trim();
        if (form.role !== admin.role) updates.role = form.role;
        if (form.password) updates.password = form.password;
        if (Object.keys(updates).length === 0) {
          onSaved();
          return;
        }
        await tvAdminsApi.update(admin.id, updates);
      } else {
        await tvAdminsApi.create({
          username: form.username.trim().toLowerCase(),
          password: form.password,
          full_name: form.full_name.trim() || null,
          role: form.role,
        });
      }
      onSaved();
    } catch (err) {
      setError(err.message || "Saqlashda xatolik");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Ism Familiya
        </label>
        <input
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          placeholder="Aliqulov Alisher"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Username (login) *
        </label>
        <input
          required
          value={form.username}
          onChange={(e) =>
            setForm({
              ...form,
              username: e.target.value.replace(/[^a-z0-9_-]/gi, ""),
            })
          }
          placeholder="tv_admin"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm font-mono"
        />
        <p className="text-[10px] text-gray-500 mt-0.5">
          Kamida 3 ta belgi — lotin harflari, raqam, _ va -
        </p>
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
          placeholder={isEdit ? "Bo'sh qoldiring — eski parol saqlanadi" : "Kamida 8 ta belgi"}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm font-mono"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Rol
        </label>
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
        >
          <option value="admin">admin (to'liq huquq)</option>
          <option value="staff">staff (kanal boshqaruvi)</option>
        </select>
      </div>

      {error && (
        <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="btn-secondary flex-1 disabled:opacity-50"
        >
          Bekor qilish
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {submitting ? "Saqlanmoqda..." : isEdit ? "Saqlash" : "Qo'shish"}
        </button>
      </div>
    </form>
  );
}
