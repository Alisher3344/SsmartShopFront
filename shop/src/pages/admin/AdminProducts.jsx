import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, Tag, X, Save, ListPlus } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { useAuth } from '../../context/AuthContext';
import { categories, formatPrice } from '../../data/products';
import { PRODUCT_BADGES } from '../../data/badges';
import ImageUpload from '../../components/ImageUpload';
import FluentEmoji from '../../components/FluentEmoji';
import { resolveImage } from '../../api/client';

const EMPTY_PRODUCT = {
  name: { uz: '', ru: '' },
  description: { uz: '', ru: '' },
  price: '',
  oldPrice: '',
  category: 'large-appliances',
  subcategory: '',
  conditionNote: '',
  image: '',
  images: [],
  stock: '',
  rating: 4.5,
  creditMonths: 12,
  badges: [],
  isPopular: false,
  specifications: [],
};

const EMPTY_SPEC = {
  valueUz: '',
  valueRu: '',
  isDual: false,
  value2Uz: '',
  value2Ru: '',
};

const normalizeSpec = (s) => ({
  valueUz: s.valueUz ?? s.value_uz ?? '',
  valueRu: s.valueRu ?? s.value_ru ?? '',
  isDual: Boolean(s.isDual ?? s.is_dual ?? false),
  value2Uz: s.value2Uz ?? s.value2_uz ?? '',
  value2Ru: s.value2Ru ?? s.value2_ru ?? '',
});

export default function AdminProducts() {
  const { products, stores, addProduct, updateProduct, deleteProduct, toggleSale, loading, error } = useAdminData();
  const { user, isSuperAdmin } = useAuth();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formLang, setFormLang] = useState('uz');

  // Staff (magazin admin): faqat o'z magazinining mahsulotlari
  // Admin (sotuv admin): faqat magazinga bog'lanmagan (default) mahsulotlar
  // Superadmin: hammasi
  const myStoreId = user?.storeId ?? user?.store_id;
  const isStaff = user?.role === 'staff';
  const baseProducts = isStaff
    ? products.filter(p => (p.storeId ?? p.store_id) === myStoreId)
    : isSuperAdmin
      ? products
      : products.filter(p => !(p.storeId ?? p.store_id));

  const filtered = baseProducts
    .filter(p => filterCategory === 'all' || p.category === filterCategory)
    .filter(p => !search || p.name.uz.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_PRODUCT);
    setShowForm(true);
  };

  const openEdit = (product) => {
    setEditingId(product.id);
    setForm({
      ...product,
      oldPrice: product.oldPrice || '',
      images: product.images?.length ? product.images : (product.image ? [product.image] : []),
      badges: product.badges || [],
      isPopular: product.isPopular || false,
      conditionNote: product.conditionNote || '',
      storeId: product.storeId ?? product.store_id ?? null,
      store_id: product.storeId ?? product.store_id ?? null,
      specifications: (product.specifications || []).map(normalizeSpec),
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_PRODUCT);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const allImages = (form.images && form.images.length > 0)
      ? form.images
      : (form.image ? [form.image] : []);
    const cleanedSpecs = (form.specifications || [])
      .map(normalizeSpec)
      .filter(s => s.valueUz.trim() || s.valueRu.trim() || s.value2Uz.trim() || s.value2Ru.trim())
      .map(s => ({
        valueUz: s.valueUz.trim(),
        valueRu: s.valueRu.trim(),
        isDual: s.isDual,
        value2Uz: s.isDual ? s.value2Uz.trim() : null,
        value2Ru: s.isDual ? s.value2Ru.trim() : null,
      }));
    const productData = {
      name: form.name,
      description: form.description,
      category: form.category,
      subcategory: form.subcategory || null,
      conditionNote: form.conditionNote?.trim() || null,
      image: allImages[0] || form.image,
      images: allImages,
      badges: form.badges || [],
      price: Number(form.price),
      oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
      stock: Number(form.stock),
      rating: Number(form.rating) || 4.5,
      creditMonths: Number(form.creditMonths) || 12,
      onSale: form.onSale || false,
      specifications: cleanedSpecs,
    };
    // Super admin magazin tanlagan bo'lsa — yuboramiz (NULL ham mumkin)
    // Sotuv admin (admin) — magazinga bog'lanmagan default
    // Staff uchun backend avto-belgilaydi (uning store_id'si)
    if (isSuperAdmin) {
      const sid = form.storeId ?? form.store_id ?? null;
      productData.storeId = sid;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await updateProduct(editingId, productData);
      } else {
        await addProduct(productData);
      }
      closeForm();
    } catch (err) {
      setFormError(err.message || 'Saqlashda xatolik');
    } finally {
      setSubmitting(false);
    }
  };

  const addSpec = () => {
    setForm(prev => ({ ...prev, specifications: [...(prev.specifications || []), { ...EMPTY_SPEC }] }));
  };

  const updateSpec = (idx, patch) => {
    setForm(prev => ({
      ...prev,
      specifications: (prev.specifications || []).map((s, i) => i === idx ? { ...s, ...patch } : s),
    }));
  };

  const removeSpec = (idx) => {
    setForm(prev => ({
      ...prev,
      specifications: (prev.specifications || []).filter((_, i) => i !== idx),
    }));
  };

  const toggleBadge = (badgeId) => {
    setForm(prev => {
      const current = prev.badges || [];
      const exists = current.includes(badgeId);
      return {
        ...prev,
        badges: exists ? current.filter(id => id !== badgeId) : [...current, badgeId],
      };
    });
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`"${name}" mahsulotini o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await deleteProduct(id);
    } catch (err) {
      alert("O'chirishda xatolik: " + (err.message || ''));
    }
  };

  // Sub-categories for selected category
  const selectedCat = categories.find(c => c.id === form.category);
  const subcategoryOptions = selectedCat?.subcategories || [];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Mahsulotlar</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Jami: {products.length} ta {loading && '· yuklanmoqda...'}
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Yangi mahsulot
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          Backend xatosi: {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Mahsulot nomi bo'yicha qidirish..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
        >
          <option value="all">Barcha kategoriyalar</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name.uz}</option>
          ))}
        </select>
      </div>

      {/* Products table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Mahsulot</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">Kategoriya</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">Narx</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700 hidden sm:table-cell">Zaxira</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Aksiya</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    Mahsulot topilmadi
                  </td>
                </tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                        {p.image && <img src={resolveImage(p.image)} alt="" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">{p.name.uz}</div>
                        <div className="text-xs text-gray-500 truncate">{p.name.ru}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                    {categories.find(c => c.id === p.category)?.name.uz || '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="font-semibold">{formatPrice(p.price)}</div>
                    {p.oldPrice && (
                      <div className="text-xs text-gray-400 line-through">{formatPrice(p.oldPrice)}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell">
                    <span className={p.stock < 5 ? 'text-red-600 font-medium' : 'text-gray-700'}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {isSuperAdmin ? (
                      <button
                        onClick={() => toggleSale(p.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          p.onSale
                            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <Tag className="w-3 h-3" />
                        {p.onSale ? 'Aksiyada' : "Qo'yish"}
                      </button>
                    ) : (
                      <span className={`text-xs inline-flex items-center gap-1 ${p.onSale ? 'text-orange-600 font-medium' : 'text-gray-400'}`}>
                        {p.onSale ? <><FluentEmoji name="fire" size={12} /> Aksiyada</> : '—'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-2 text-gray-600 hover:bg-primary-50 hover:text-primary-700 rounded-md transition-colors"
                        title="Tahrirlash"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name.uz)}
                        className="p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {editingId ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot qo\'shish'}
              </h2>
              <button onClick={closeForm} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nom (UZ) *
                  </label>
                  <input
                    required
                    value={form.name.uz}
                    onChange={(e) => setForm({ ...form, name: { ...form.name, uz: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nom (RU) *
                  </label>
                  <input
                    required
                    value={form.name.ru}
                    onChange={(e) => setForm({ ...form, name: { ...form.name, ru: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                  />
                </div>
              </div>

              {/* Umumiy tavsif (UZ/RU toggle) */}
              <div>
                <div className="flex items-center justify-between mb-1.5 gap-3 flex-wrap">
                  <label className="block text-sm font-medium text-gray-700">
                    Umumiy tavsif <span className="text-gray-400 font-normal">(ixtiyoriy)</span>
                  </label>
                  <div className="inline-flex bg-gray-100 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => setFormLang('uz')}
                      className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${formLang === 'uz' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      O'zbekcha
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormLang('ru')}
                      className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${formLang === 'ru' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      Русский
                    </button>
                  </div>
                </div>
                <textarea
                  rows={3}
                  value={formLang === 'uz' ? (form.description?.uz || '') : (form.description?.ru || '')}
                  onChange={(e) => setForm({
                    ...form,
                    description: { ...form.description, [formLang]: e.target.value },
                  })}
                  placeholder={formLang === 'uz' ? "Mahsulot holati haqida qo'shimcha ma'lumot..." : 'Дополнительная информация о состоянии товара...'}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm resize-y"
                />
              </div>

              {/* Category + Subcategory */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Kategoriya *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value, subcategory: '' })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name.uz}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Subkategoriya
                  </label>
                  <select
                    value={form.subcategory}
                    onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                  >
                    <option value="">— tanlang —</option>
                    {subcategoryOptions.map(s => (
                      <option key={s.id} value={s.id}>{s.name.uz}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Condition note — faqat B/U kategoriyasi uchun */}
              {form.category === 'used' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Holat tasnifi <span className="text-gray-400 font-normal">(ixtiyoriy)</span>
                  </label>
                  <textarea
                    value={form.conditionNote || ''}
                    onChange={(e) => setForm({ ...form, conditionNote: e.target.value })}
                    placeholder="Masalan: Ekranda kichik chiziq bor, lekin ishlashga ta'sir qilmaydi. Akkumulyator 85%."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm resize-y"
                  />
                  <p className="text-xs text-gray-500 mt-1">Mahsulot sahifasida holat haqida qo'shimcha izoh sifatida ko'rinadi.</p>
                </div>
              )}

              {/* Price + OldPrice */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Narx (so'm) *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Eski narx (chegirma)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.oldPrice}
                    onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Zaxira (dona) *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                  />
                </div>
              </div>

              {/* Magazin biriktirish (faqat super admin) */}
              {isSuperAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Magazin
                    <span className="text-xs text-gray-500 font-normal ml-2">
                      (orphan mahsulotni qayta biriktirish uchun)
                    </span>
                  </label>
                  <select
                    value={form.storeId ?? form.store_id ?? ''}
                    onChange={(e) => {
                      const v = e.target.value === '' ? null : Number(e.target.value);
                      setForm({ ...form, storeId: v, store_id: v });
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                  >
                    <option value="">— Magazin yo'q (default) —</option>
                    {stores.map(s => (
                      <option key={s.id} value={s.id}>{s.name}{!s.active && ' (yopiq)'}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Mahsulot rasmlari (max 5 ta) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mahsulot rasmlari * <span className="text-xs text-gray-500 font-normal">
                    (birinchi rasm asosiy bo'ladi · {form.images?.length || 0}/5)
                  </span>
                </label>

                {/* Mavjud rasmlar gallery */}
                {form.images && form.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {form.images.map((img, idx) => (
                      <div key={`${img}-${idx}`} className="relative group">
                        <div className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                          idx === 0 ? 'border-primary-500' : 'border-gray-200'
                        } bg-gray-50`}>
                          <img src={resolveImage(img)} alt="" className="w-full h-full object-cover" />
                        </div>
                        {idx === 0 && (
                          <span className="absolute top-0.5 left-0.5 bg-primary-600 text-white text-[8px] font-bold px-1 py-0.5 rounded">
                            ASOSIY
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const arr = [...form.images];
                                [arr[0], arr[idx]] = [arr[idx], arr[0]];
                                setForm({ ...form, images: arr, image: arr[0] });
                              }}
                              className="w-6 h-6 bg-white text-gray-700 rounded text-[9px] font-bold hover:bg-primary-50 flex items-center justify-center"
                              title="Asosiy qilish"
                            >
                              <FluentEmoji name="star" size={12} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const arr = form.images.filter((_, i) => i !== idx);
                              setForm({ ...form, images: arr, image: arr[0] || '' });
                            }}
                            className="w-6 h-6 bg-red-500 text-white rounded flex items-center justify-center hover:bg-red-600"
                            title="O'chirish"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Yangi rasm qo'shish (5 ta limit) */}
                {(form.images?.length || 0) < 5 ? (
                  <ImageUpload
                    key={form.images?.length || 0}
                    value=""
                    onChange={(img) => {
                      if (!img) return;
                      const next = [...(form.images || []), img].slice(0, 5);
                      setForm({ ...form, images: next, image: next[0] });
                    }}
                  />
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                    Maksimal 5 ta rasm qo'shildi. Yangisini qo'shish uchun avval bittasini o'chiring.
                  </div>
                )}
              </div>

              {/* Credit + Rating */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Muddatli to'lov (oy)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="36"
                    value={form.creditMonths}
                    onChange={(e) => setForm({ ...form, creditMonths: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Reyting (1-5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                  />
                </div>
              </div>


              {/* Tasniflar (specifications) */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tasniflar (xususiyatlar)
                  </label>
                  <button
                    type="button"
                    onClick={addSpec}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-md"
                  >
                    <ListPlus className="w-3.5 h-3.5" />
                    Tasnif qo'shish
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  "Dual" katakchasi bosilganda har bir tilda 2 ta input chiqadi (chap = nom, o'ng = qiymat),
                  va mahsulot sahifasida <span className="font-mono">"nom ——— qiymat"</span> ko'rinishida chiqadi.
                </p>

                {(form.specifications || []).length === 0 ? (
                  <div className="p-3 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-center text-xs text-gray-500">
                    Hozircha tasniflar yo'q. "Tasnif qo'shish" tugmasini bosing.
                  </div>
                ) : (
                  <div>
                    <div className="inline-flex bg-gray-100 rounded-lg p-0.5 mb-2">
                      <button
                        type="button"
                        onClick={() => setFormLang('uz')}
                        className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${formLang === 'uz' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                      >
                        O'zbekcha
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormLang('ru')}
                        className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${formLang === 'ru' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                      >
                        Русский
                      </button>
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-gray-500 border-b border-gray-100">
                          <th className="text-center px-2 py-2 font-medium w-16">Dual</th>
                          <th className="text-left px-2 py-2 font-medium">{formLang === 'uz' ? "O'zbekcha" : 'Ruscha'}</th>
                          <th className="px-2 py-2 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {(form.specifications || []).map((spec, idx) => {
                          const valKey = formLang === 'uz' ? 'valueUz' : 'valueRu';
                          const val2Key = formLang === 'uz' ? 'value2Uz' : 'value2Ru';
                          const ph1 = formLang === 'uz'
                            ? (spec.isDual ? 'masalan: protsessor' : 'masalan: Intel i3')
                            : (spec.isDual ? 'например: процессор' : 'например: Intel i3');
                          const ph2 = formLang === 'uz' ? 'masalan: Intel i3' : 'например: Intel i3';
                          return (
                            <tr key={idx}>
                              <td className="px-2 py-2 text-center align-middle">
                                <input
                                  type="checkbox"
                                  checked={spec.isDual}
                                  onChange={(e) => updateSpec(idx, { isDual: e.target.checked })}
                                  className="w-4 h-4 accent-primary-600 cursor-pointer"
                                  title="Dual rejimi (nom + qiymat)"
                                />
                              </td>
                              <td className="px-2 py-2 align-middle">
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    value={spec[valKey] || ''}
                                    onChange={(e) => updateSpec(idx, { [valKey]: e.target.value })}
                                    placeholder={ph1}
                                    className="flex-1 min-w-0 px-2 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:border-primary-500 text-sm"
                                  />
                                  {spec.isDual && (
                                    <>
                                      <span className="text-gray-400 select-none font-mono text-xs">———</span>
                                      <input
                                        type="text"
                                        value={spec[val2Key] || ''}
                                        onChange={(e) => updateSpec(idx, { [val2Key]: e.target.value })}
                                        placeholder={ph2}
                                        className="flex-1 min-w-0 px-2 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:border-primary-500 text-sm"
                                      />
                                    </>
                                  )}
                                </div>
                              </td>
                              <td className="px-2 py-2 text-center align-middle">
                                <button
                                  type="button"
                                  onClick={() => removeSpec(idx)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                  title="Qatorni o'chirish"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Yorliqlar (badges) — har ikkala admin uchun */}
              <div className="border-t border-gray-100 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Yorliqlar
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Mahsulot kartasida ko'rsatiladigan yorliqlar (bir nechtasini tanlash mumkin)
                </p>
                <div className="flex flex-wrap gap-2">
                  {PRODUCT_BADGES.map(badge => {
                    const isSelected = (form.badges || []).includes(badge.id);
                    return (
                      <button
                        key={badge.id}
                        type="button"
                        onClick={() => toggleBadge(badge.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                          isSelected
                            ? `${badge.bgClass} ${badge.textClass} border-transparent shadow-md scale-105`
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <FluentEmoji name={badge.icon} size={14} />
                        <span>{badge.label.uz}</span>
                        {isSelected && <FluentEmoji name="check" size={12} />}
                      </button>
                    );
                  })}
                </div>
                {(form.badges || []).length > 0 && (
                  <p className="text-xs text-green-700 mt-2 flex items-center gap-1">
                    <FluentEmoji name="check" size={12} /> Tanlangan: {form.badges.length} ta yorliq
                  </p>
                )}
              </div>

              {/* Submit buttons */}
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
                  {submitting ? 'Saqlanmoqda...' : editingId ? 'Saqlash' : "Qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
