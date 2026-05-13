import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  UserCog,
  KeyRound,
  User as UserIcon,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { salesAdminsApi } from "../../api/client";
import FluentEmoji from "../../components/FluentEmoji";

const formatPhone = (raw) => {
  const digits = (raw || "").replace(/\D/g, "").replace(/^998/, "").slice(0, 9);
  if (!digits) return "";
  let out = "+998 " + digits.slice(0, 2);
  if (digits.length > 2) out += " " + digits.slice(2, 5);
  if (digits.length > 5) out += "-" + digits.slice(5, 7);
  if (digits.length > 7) out += "-" + digits.slice(7, 9);
  return out;
};
const phoneToDigits = (raw) =>
  (raw || "").replace(/\D/g, "").replace(/^998/, "");

export default function AdminSalesAdmins() {
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
      const list = await salesAdminsApi.list();
      setAdmins(list);
    } catch (e) {
      setError(e.message || "Adminlarni yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleDelete = async (admin) => {
    if (!confirm(`"${admin.username}" adminni o'chirishni tasdiqlaysizmi?`))
      return;
    try {
      await salesAdminsApi.delete(admin.id);
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
            <UserCog className="w-6 h-6 text-primary-600" />
            {editing.id ? "Sotuv adminini tahrirlash" : "Yangi sotuv admini"}
          </h1>
        </div>
        <div className="card p-5 max-w-xl">
          <SalesAdminForm
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
            Sotuv Adminlari
            <span className="text-[10px] bg-accent-500 text-white px-2 py-0.5 rounded font-bold">
              SUPER
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Mahsulot va reklama bannerlari boshqaruvchi adminlar
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
          Sotuv adminlari faqat <strong>Mahsulotlar</strong> va{" "}
          <strong>Reklama bannerlari</strong> bo'limlariga kira oladi. Ular{" "}
          <code className="bg-white px-1.5 py-0.5 rounded">
            /login
          </code>{" "}
          orqali username va parol bilan kiradi.
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
          <p>Hali sotuv admini yo'q</p>
        </div>
      )}

      {!loading && admins.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {admins.map((admin) => (
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
                  {admin.phone && (
                    <div className="text-xs text-gray-600 truncate flex items-center gap-1">
                      <FluentEmoji name="phone" size={12} /> {admin.phone}
                    </div>
                  )}
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
                <button
                  onClick={() => setEditing(admin)}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SalesAdminForm({ admin, onCancel, onSaved }) {
  const isEdit = !!admin?.id;
  const [form, setForm] = useState({
    full_name: admin?.full_name || "",
    username: admin?.username || "",
    password: "",
    phone: admin?.phone ? formatPhone(admin.phone) : "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password && form.password.length < 6) {
      setError("Parol kamida 6 ta belgi bo'lishi kerak");
      return;
    }
    const phoneDigits = phoneToDigits(form.phone);

    setSubmitting(true);
    try {
      if (isEdit) {
        const updates = {};
        if (form.full_name && form.full_name !== admin.full_name)
          updates.full_name = form.full_name;
        if (form.username && form.username !== admin.username)
          updates.username = form.username.trim().toLowerCase();
        if (form.password) updates.password = form.password;
        const newPhone = phoneDigits.length === 9 ? "+998" + phoneDigits : "";
        if (newPhone !== (admin.phone || "")) updates.phone = newPhone || null;
        await salesAdminsApi.update(admin.id, updates);
      } else {
        await salesAdminsApi.create({
          full_name: form.full_name.trim(),
          username: form.username.trim().toLowerCase(),
          password: form.password,
          phone: phoneDigits.length === 9 ? "+998" + phoneDigits : null,
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
          Ism Familiya *
        </label>
        <input
          required
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
          placeholder="sotuv_admin"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm font-mono"
        />
        <p className="text-[10px] text-gray-500 mt-0.5">
          Faqat lotin harflari, raqam, _ va -
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
          placeholder={isEdit ? "Bo'sh qoldiring" : "Kamida 6 ta belgi"}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm font-mono"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Telefon raqam
        </label>
        <input
          type="tel"
          inputMode="numeric"
          value={form.phone}
          onChange={(e) =>
            setForm({ ...form, phone: formatPhone(e.target.value) })
          }
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
          {submitting ? "Saqlanmoqda..." : isEdit ? "Yangilash" : "Qo'shish"}
        </button>
      </div>
    </form>
  );
}
