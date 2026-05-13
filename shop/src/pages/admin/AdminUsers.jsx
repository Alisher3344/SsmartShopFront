import { useEffect, useState } from 'react';
import { Search, X, User as UserIcon, Phone, Lock, Save, Users as UsersIcon, AlertCircle, Check, ChevronRight } from 'lucide-react';
import { adminUsersApi } from '../../api/client';

const formatPhone = (p) => {
  if (!p) return '—';
  const d = p.replace(/\D/g, '');
  if (d.length !== 12 || !d.startsWith('998')) return p;
  return `+998 (${d.slice(3, 5)}) ${d.slice(5, 8)}-${d.slice(8, 10)}-${d.slice(10, 12)}`;
};

const checkPassword = (pwd) => ({
  length: pwd.length >= 6,
  upper:  /[A-Z]/.test(pwd),
  digit:  /\d/.test(pwd),
});
const isPasswordValid = (pwd) => {
  const c = checkPassword(pwd);
  return c.length && c.upper && c.digit;
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const refresh = async (q = debouncedSearch) => {
    setLoading(true);
    setError('');
    try {
      const list = await adminUsersApi.list(q || undefined);
      setUsers(list);
    } catch (e) {
      setError(e.message || "Yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const onUserUpdated = (updated) => {
    setUsers(prev => prev.map(u => (u.id === updated.id ? { ...u, ...updated } : u)));
    setSelected(updated);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <UsersIcon className="w-6 h-6 text-primary-600" />
        <h1 className="text-2xl font-bold">Foydalanuvchilar</h1>
        <span className="text-sm text-gray-500 ml-2">({users.length})</span>
      </div>

      {/* Search */}
      <div className="card p-4 mb-4">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ism, familiya yoki telefon raqam bo'yicha qidirish..."
            className="w-full pl-11 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:bg-white text-sm"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-md"
              aria-label="Tozalash"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="card p-12 text-center">
          <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            {debouncedSearch ? "Qidiruv bo'yicha foydalanuvchi topilmadi" : "Foydalanuvchilar yo'q"}
          </p>
        </div>
      ) : (
        <div className="card divide-y divide-gray-100">
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() => setSelected(u)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold flex-shrink-0">
                {(u.full_name || u.phone || '?')[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {u.full_name || <span className="text-gray-400 italic">Ism kiritilmagan</span>}
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3" />
                  {formatPhone(u.phone)}
                </div>
              </div>
              <span className="text-xs text-gray-400">#{u.id}</span>
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      {selected && (
        <UserDetailModal
          user={selected}
          onClose={() => setSelected(null)}
          onUpdated={onUserUpdated}
        />
      )}
    </div>
  );
}

function UserDetailModal({ user, onClose, onUpdated }) {
  const [fullName, setFullName] = useState(user.full_name || '');
  const [showPwdForm, setShowPwdForm] = useState(false);
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setFullName(user.full_name || '');
    setShowPwdForm(false);
    setPassword('');
    setError('');
    setSuccess('');
  }, [user.id]);

  const pwdChecks = checkPassword(password);

  const saveName = async () => {
    const trimmed = fullName.trim();
    if (trimmed.length < 2) {
      setError("Ism Familiya kamida 2 belgi");
      return;
    }
    if (trimmed === (user.full_name || '')) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await adminUsersApi.update(user.id, { full_name: trimmed });
      onUpdated(updated);
      setSuccess("Ism saqlandi");
      setTimeout(() => setSuccess(''), 2500);
    } catch (e) {
      setError(e.message || "Saqlab bo'lmadi");
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async () => {
    if (!isPasswordValid(password)) {
      setError("Parol talablari to'liq bajarilmagan");
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await adminUsersApi.update(user.id, { password });
      onUpdated(updated);
      setPassword('');
      setShowPwdForm(false);
      setSuccess("Parol yangilandi");
      setTimeout(() => setSuccess(''), 2500);
    } catch (e) {
      setError(e.message || "Parolni yangilab bo'lmadi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center"
          aria-label="Yopish"
        >
          <X className="w-4 h-4 text-gray-700" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-14 h-14 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xl">
            {(user.full_name || user.phone || '?')[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-gray-500">Foydalanuvchi #{user.id}</div>
            <div className="text-sm text-gray-700 flex items-center gap-1 mt-0.5">
              <Phone className="w-3.5 h-3.5" />
              {formatPhone(user.phone)}
            </div>
          </div>
        </div>

        {/* Full name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Ism Familiya</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                maxLength={255}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:bg-white text-sm"
              />
            </div>
            <button
              type="button"
              onClick={saveName}
              disabled={saving || fullName.trim().length < 2 || fullName.trim() === (user.full_name || '')}
              className="px-3 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Saqlash
            </button>
          </div>
        </div>

        {/* Password reset */}
        <div className="border-t border-gray-100 pt-4 mb-4">
          {!showPwdForm ? (
            <button
              type="button"
              onClick={() => { setShowPwdForm(true); setError(''); setSuccess(''); }}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-sm font-medium border border-amber-200"
            >
              <Lock className="w-4 h-4" />
              Parolni yangilash
            </button>
          ) : (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Yangi parol</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Yangi parolni kiriting"
                  autoFocus
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:bg-white text-sm"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                <PwdHint ok={pwdChecks.length}>Kamida 6 belgi</PwdHint>
                <PwdHint ok={pwdChecks.upper}>Kamida 1 ta katta harf (A-Z)</PwdHint>
                <PwdHint ok={pwdChecks.digit}>Kamida 1 ta raqam (0-9)</PwdHint>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowPwdForm(false); setPassword(''); setError(''); }}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  onClick={savePassword}
                  disabled={saving || !isPasswordValid(password)}
                  className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Saqlash
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 flex items-start gap-2">
            <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {success}
          </div>
        )}
      </div>
    </div>
  );
}

function PwdHint({ ok, children }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs ${ok ? 'text-green-700' : 'text-gray-500'}`}>
      <Check className={`w-3.5 h-3.5 ${ok ? 'text-green-600' : 'text-gray-300'}`} />
      <span>{children}</span>
    </div>
  );
}
