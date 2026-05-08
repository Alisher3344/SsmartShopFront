import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, X, Save, Eye, EyeOff, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAdminData } from '../../context/AdminDataContext';
import { formatPrice, calculateMonthly } from '../../data/products';
import ImageUpload from '../../components/ImageUpload';
import FluentEmoji from '../../components/FluentEmoji';
import { resolveImage } from '../../api/client';

const EMPTY_BANNER = {
  image: '',
  productName: { uz: '', ru: '' },
  description: { uz: '', ru: '' }, // qisqa tasnif
  oldPrice: '',
  salePrice: '',
  creditMonths: 12,
  link: '/catalog',
  active: true,
};

export default function AdminBanners() {
  const { isSuperAdmin } = useAuth();
  const { banners, addBanner, updateBanner, deleteBanner, toggleBannerActive, error } = useAdminData();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_BANNER);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  if (!isSuperAdmin) return <Navigate to="/Tty0xssmart" replace />;

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_BANNER);
    setShowForm(true);
  };

  const openEdit = (banner) => {
    setEditingId(banner.id);
    setForm({
      ...banner,
      oldPrice: banner.oldPrice || '',
      salePrice: banner.salePrice || '',
      description: banner.description || { uz: '', ru: '' }, // eski bannerlarda yo'q
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_BANNER);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const data = {
      image: form.image,
      productName: form.productName,
      description: form.description,
      link: form.link || '/catalog',
      active: !!form.active,
      oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
      salePrice: Number(form.salePrice),
      creditMonths: Number(form.creditMonths) || 12,
    };

    setSubmitting(true);
    try {
      if (editingId) {
        await updateBanner(editingId, data);
      } else {
        await addBanner(data);
      }
      closeForm();
    } catch (err) {
      setFormError(err.message || 'Saqlashda xatolik');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Bannerni o'chirishni tasdiqlaysizmi?")) return;
    try {
      await deleteBanner(id);
    } catch (err) {
      alert("O'chirishda xatolik: " + (err.message || ''));
    }
  };

  // Preview hisoblovi
  const monthlyPreview = form.salePrice && form.creditMonths
    ? calculateMonthly(Number(form.salePrice), Number(form.creditMonths))
    : 0;
  const discountPreview = form.oldPrice && form.salePrice
    ? Math.round((1 - Number(form.salePrice) / Number(form.oldPrice)) * 100)
    : 0;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Reklama bannerlar
            <span className="text-[10px] bg-accent-500 text-white px-2 py-0.5 rounded font-bold">SUPER</span>
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Bosh sahifa Hero karuselida ko'rsatiladi (har biri aniq mahsulot)
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Yangi banner
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          Backend xatosi: {error}
        </div>
      )}

      {/* Banners grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {banners.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 card">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Banner mavjud emas</p>
          </div>
        ) : banners.map(banner => {
          const monthly = banner.creditMonths
            ? calculateMonthly(banner.salePrice, banner.creditMonths)
            : 0;
          const discount = banner.oldPrice
            ? Math.round((1 - banner.salePrice / banner.oldPrice) * 100)
            : 0;

          return (
            <div key={banner.id} className={`card overflow-hidden ${!banner.active && 'opacity-60'}`}>
              <div className="relative aspect-[4/3] bg-gradient-to-br from-primary-600 to-primary-900 overflow-hidden">
                <img
                  src={resolveImage(banner.image)}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => e.target.style.display = 'none'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                {discount > 0 && (
                  <div className="absolute top-3 left-3 bg-accent-500 text-white px-2 py-1 rounded-md font-bold text-xs shadow-lg">
                    −{discount}%
                  </div>
                )}
                {!banner.active && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-xs font-medium">
                      Faol emas
                    </span>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 right-2 text-white">
                  <div className="text-sm font-semibold truncate">{banner.productName?.uz}</div>
                </div>
              </div>

              <div className="p-3">
                <div className="text-base font-bold text-gray-900 mb-0.5">
                  {formatPrice(banner.salePrice)} so'm
                </div>
                {banner.oldPrice && (
                  <div className="text-xs text-gray-400 line-through">
                    {formatPrice(banner.oldPrice)} so'm
                  </div>
                )}
                {monthly > 0 && (
                  <div className="text-xs text-primary-600 mt-1 mb-2 flex items-center gap-1">
                    <FluentEmoji name="card" size={12} /> {formatPrice(monthly)} so'm / {banner.creditMonths} oy
                  </div>
                )}

                <div className="flex items-center gap-1 mt-2">
                  <button
                    onClick={() => toggleBannerActive(banner.id)}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      banner.active
                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={banner.active ? "Yashirish" : "Ko'rsatish"}
                  >
                    {banner.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    {banner.active ? 'Faol' : 'Yashirin'}
                  </button>
                  <button
                    onClick={() => openEdit(banner)}
                    className="p-1.5 text-gray-600 hover:bg-primary-50 hover:text-primary-700 rounded-md transition-colors"
                    title="Tahrirlash"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="p-1.5 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
                    title="O'chirish"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold">
                {editingId ? 'Bannerni tahrirlash' : 'Yangi banner'}
              </h2>
              <button onClick={closeForm} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Rasm */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mahsulot rasmi (PNG, shaffof fonli) *
                </label>
                <ImageUpload
                  value={form.image}
                  onChange={(img) => setForm({ ...form, image: img })}
                  variant="banner"
                />
              </div>

              {/* Mahsulot nomi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Mahsulot nomi (UZ) *
                  </label>
                  <input
                    required
                    value={form.productName.uz}
                    onChange={(e) => setForm({ ...form, productName: { ...form.productName, uz: e.target.value } })}
                    placeholder="iPhone 17 Pro 256GB"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Mahsulot nomi (RU) *
                  </label>
                  <input
                    required
                    value={form.productName.ru}
                    onChange={(e) => setForm({ ...form, productName: { ...form.productName, ru: e.target.value } })}
                    placeholder="iPhone 17 Pro 256GB"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                  />
                </div>
              </div>

              {/* Qisqa tasnif */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Qisqa tasnif (UZ)
                  </label>
                  <textarea
                    rows={2}
                    value={form.description?.uz || ''}
                    onChange={(e) => setForm({ ...form, description: { ...form.description, uz: e.target.value } })}
                    placeholder="Yangi flagman, A18 Pro chip, 48MP kamera"
                    maxLength={120}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm resize-none"
                  />
                  <p className="text-[10px] text-gray-500 mt-0.5">Karuselda nomdan keyin ko'rinadi (max 120 belgi)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Qisqa tasnif (RU)
                  </label>
                  <textarea
                    rows={2}
                    value={form.description?.ru || ''}
                    onChange={(e) => setForm({ ...form, description: { ...form.description, ru: e.target.value } })}
                    placeholder="Новый флагман, чип A18 Pro, 48MP камера"
                    maxLength={120}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm resize-none"
                  />
                  <p className="text-[10px] text-gray-500 mt-0.5">В каруселе после названия (макс 120 знаков)</p>
                </div>
              </div>

              {/* Narxlar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Eski narx (so'm)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.oldPrice}
                    onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
                    placeholder="16500000"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                  />
                  <p className="text-[10px] text-gray-500 mt-0.5">Chegirma uchun (ixtiyoriy)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Aksiya narxi (so'm) *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={form.salePrice}
                    onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                    placeholder="14500000"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                  />
                  <p className="text-[10px] text-gray-500 mt-0.5">Hozirgi sotuv narxi</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Muddatli to'lov (oy) *
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="36"
                    value={form.creditMonths}
                    onChange={(e) => setForm({ ...form, creditMonths: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                  />
                  <p className="text-[10px] text-gray-500 mt-0.5">Misol: 12 oy</p>
                </div>
              </div>

              {/* Preview */}
              {form.salePrice && form.creditMonths && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                  <div className="text-xs text-blue-700 font-medium mb-1">Avto-hisoblangan:</div>
                  <div className="space-y-0.5 text-blue-900">
                    {discountPreview > 0 && (
                      <div className="flex items-center gap-1.5"><FluentEmoji name="fire" size={14} /> Chegirma: <strong>−{discountPreview}%</strong></div>
                    )}
                    <div className="flex items-center gap-1.5"><FluentEmoji name="card" size={14} /> Oylik to'lov: <strong>{formatPrice(monthlyPreview)} so'm / {form.creditMonths} oy</strong></div>
                  </div>
                </div>
              )}

              {/* Havola */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Bosilganda havola
                </label>
                <input
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="/catalog?subcategory=ac"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                />
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Mijoz "Sotib olish" tugmasini bosganda qaerga olib boradi
                </p>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="accent-primary-600 w-4 h-4"
                />
                <span>Faol (saytda ko'rsatish)</span>
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
    </div>
  );
}
