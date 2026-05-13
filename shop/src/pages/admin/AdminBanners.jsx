import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Plus, Trash2, X, Save, Eye, EyeOff, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAdminData } from '../../context/AdminDataContext';
import ImageUpload from '../../components/ImageUpload';
import { resolveImage } from '../../api/client';
import { categories as allCategories } from '../../data/products';

// Soddalashtirilgan banner: faqat rasm yuklash.
// 1240×413 - boshqa input kerak emas.
// Backend hali ham product_name va sale_price kutgani uchun bo'sh/0 yuboramiz.
const EMPTY_BANNER = {
  imageUz: '',
  imageRu: '',
  link: '/catalog',
  active: true,
  slot: 'home',
};

const DEFAULT_PAYLOAD = {
  productName: { uz: '', ru: '' },
  description: { uz: '', ru: '' },
  oldPrice: null,
  salePrice: 0,
  creditMonths: 0,
};

export default function AdminBanners() {
  const { isSuperAdmin } = useAuth();
  const { banners, addBanner, updateBanner, deleteBanner, toggleBannerActive, error } = useAdminData();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_BANNER);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  if (!isSuperAdmin) return <Navigate to="/" replace />;

  const openAdd = (slot = 'home') => {
    setEditingId(null);
    setForm({ ...EMPTY_BANNER, slot, link: slot === 'bu' ? '/b-u' : '/catalog' });
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (banner) => {
    setEditingId(banner.id);
    setForm({
      imageUz: banner.imageUz || banner.image || '',
      imageRu: banner.imageRu || banner.image || '',
      link: banner.link || '/catalog',
      active: !!banner.active,
      slot: banner.slot || 'home',
    });
    setFormError('');
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
    if (!form.imageUz || !form.imageRu) {
      setFormError("Iltimos, ikkala til uchun ham 1240×413 rasm yuklang (UZ va RU)");
      return;
    }
    const data = {
      image: form.imageUz, // backward-compat
      imageUz: form.imageUz,
      imageRu: form.imageRu,
      link: form.link?.trim() || '/catalog',
      active: !!form.active,
      slot: form.slot || 'home',
      ...(editingId ? {} : DEFAULT_PAYLOAD),
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

  // Banner kartochkasini render qilish — har ikkala bo'limda ishlatiladi
  const renderBannerCard = (banner) => (
          <div key={banner.id} className={`card overflow-hidden ${!banner.active && 'opacity-60'}`}>
            <div className="flex flex-col md:flex-row gap-3 p-3">
              <div className="md:w-80 flex-shrink-0 space-y-2">
                <div className="relative aspect-[1240/413] bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={resolveImage(banner.imageUz || banner.image)}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-green-600 text-white text-[10px] font-bold rounded shadow-sm">UZ</span>
                  {!banner.active && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-xs font-medium">
                        Yashirin
                      </span>
                    </div>
                  )}
                </div>
                <div className="relative aspect-[1240/413] bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={resolveImage(banner.imageRu || banner.image)}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded shadow-sm">RU</span>
                  {!banner.active && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-xs font-medium">
                        Yashirin
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-2 min-w-0">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <LinkIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="font-medium text-gray-700">Yo'naltirish:</span>
                </div>
                <code className="text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 truncate font-mono text-gray-800">
                  {banner.link || '/'}
                </code>
              </div>
              <div className="flex md:flex-col items-center md:items-stretch gap-2 md:gap-1.5 md:w-44">
                <button
                  onClick={() => toggleBannerActive(banner.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    banner.active
                      ? 'bg-green-50 text-green-700 hover:bg-green-100'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={banner.active ? 'Yashirish' : "Ko'rsatish"}
                >
                  {banner.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  {banner.active ? 'Faol' : 'Yashirin'}
                </button>
                <button
                  onClick={() => openEdit(banner)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
                  title="Rasmni almashtirish"
                >
                  <ImageIcon className="w-4 h-4" />
                  Almashtirish
                </button>
                <button
                  onClick={() => handleDelete(banner.id)}
                  className="py-2 px-3 rounded-md text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5"
                  title="O'chirish"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="md:hidden lg:inline">O'chirish</span>
                </button>
              </div>
            </div>
          </div>
  );

  const homeBanners = banners.filter(b => (b.slot || 'home') === 'home');
  const buBanners = banners.filter(b => b.slot === 'bu');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Reklama bannerlar
          <span className="text-[10px] bg-accent-500 text-white px-2 py-0.5 rounded font-bold">SUPER</span>
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Banner rasm o'lchami: <strong>1240×413</strong>
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          Backend xatosi: {error}
        </div>
      )}

      {/* 1-BO'LIM: Bosh sahifa karuseli */}
      <section className="mb-8">
        <div className="flex items-center justify-between gap-3 mb-4 pb-2 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-900">🎠 Bosh sahifa karuseli</h2>
            <p className="text-xs text-gray-500 mt-0.5">Bir necha banner aylanib ko'rsatiladi</p>
          </div>
          <button onClick={() => openAdd('home')} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" />
            Yangi karusel banner
          </button>
        </div>
        <div className="space-y-3">
          {homeBanners.length === 0 ? (
            <div className="text-center py-8 text-gray-500 card">
              <ImageIcon className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Karusel uchun banner yo'q</p>
            </div>
          ) : homeBanners.map(renderBannerCard)}
        </div>
      </section>

      {/* 2-BO'LIM: B/U sahifa banneri (iPhone) */}
      <section>
        <div className="flex items-center justify-between gap-3 mb-4 pb-2 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
              <img src="https://cdn.simpleicons.org/apple/000000" alt="" className="w-5 h-5 object-contain" />
              Foydalanilgan iPhone banneri
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              <code className="bg-gray-100 px-1 rounded">/b-u</code> sahifasi tepasida ko'rsatiladi (karusel emas — bitta rasm)
            </p>
          </div>
          <button
            onClick={() => openAdd('bu')}
            disabled={buBanners.length >= 1}
            className="btn-primary flex items-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            title={buBanners.length >= 1 ? 'B/U banneri allaqachon mavjud' : ''}
          >
            <Plus className="w-4 h-4" />
            Yangi B/U banner
          </button>
        </div>
        <div className="space-y-3">
          {buBanners.length === 0 ? (
            <div className="text-center py-8 text-gray-500 card">
              <ImageIcon className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">B/U sahifa uchun banner yo'q</p>
              <p className="text-[11px] text-gray-400 mt-1">Yuklamasangiz, /b-u sahifa eski hero ko'rinadi</p>
            </div>
          ) : buBanners.map(renderBannerCard)}
        </div>
      </section>

      {/* Form modal — faqat rasm */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold">
                {editingId ? 'Banner tahrirlash' : 'Yangi banner'}
                <span className="ml-2 text-xs font-normal text-gray-500">
                  ({form.slot === 'bu' ? 'B/U sahifa uchun' : 'Bosh karusel uchun'})
                </span>
              </h2>
              <button onClick={closeForm} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-green-100 text-green-700 text-[10px] font-bold">UZ</span>
                    O'zbekcha rasm (1240×413) *
                  </label>
                  <ImageUpload
                    value={form.imageUz}
                    onChange={(img) => setForm({ ...form, imageUz: img })}
                    variant="slide"
                  />
                  <p className="text-[11px] text-gray-500 mt-1.5">
                    O'zbek tilidagi foydalanuvchilarga ko'rsatiladi
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">RU</span>
                    Ruscha rasm (1240×413) *
                  </label>
                  <ImageUpload
                    value={form.imageRu}
                    onChange={(img) => setForm({ ...form, imageRu: img })}
                    variant="slide"
                  />
                  <p className="text-[11px] text-gray-500 mt-1.5">
                    Rus tilidagi foydalanuvchilarga ko'rsatiladi
                  </p>
                </div>
              </div>
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-[11px] text-amber-800">
                💡 Har bir banner uchun ikkala til uchun ham alohida rasm yuklang. Saytda tanlangan tilga mos rasm chiqadi.
              </div>

              {/* Bosilganda yo'naltirish */}
              {(() => {
                const catMatch = form.link?.match(/[?&]category=([^&]+)/);
                const subMatch = form.link?.match(/[?&]subcategory=([^&]+)/);
                const selectedCatId = catMatch ? catMatch[1] : '';
                const selectedSubId = subMatch ? subMatch[1] : '';
                const selectedCat = allCategories.find(c => c.id === selectedCatId);
                const isHome = form.link === '/';
                const isCatalog = form.link === '/catalog';

                return (
                  <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700">
                      Bosilganda yo'naltirish *
                    </label>

                    {/* 1-qator: Bosh sahifa va Katalog */}
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, link: '/' })}
                        className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                          isHome
                            ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-primary-50 hover:border-primary-400'
                        }`}
                      >
                        🏠 Bosh sahifa
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, link: '/catalog' })}
                        className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                          isCatalog
                            ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-primary-50 hover:border-primary-400'
                        }`}
                      >
                        📦 Katalog
                      </button>
                    </div>

                    {/* 2-qator: Kategoriya dropdown */}
                    <div>
                      <div className="text-[11px] text-gray-500 mb-1.5 font-medium">Kategoriya:</div>
                      <select
                        value={selectedCatId}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v) {
                            // Yangi kategoriya tanlandi → subkategoriya bekor qilinadi
                            setForm({ ...form, link: `/catalog?category=${v}` });
                          } else {
                            setForm({ ...form, link: '/catalog' });
                          }
                        }}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-primary-500"
                      >
                        <option value="">— tanlash —</option>
                        {allCategories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name.uz} / {cat.name.ru}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 3-qator: Subkategoriya dropdown — faqat kategoriya tanlanganda */}
                    {selectedCat && selectedCat.subcategories.length > 0 && (
                      <div>
                        <div className="text-[11px] text-gray-500 mb-1.5 font-medium">
                          Subkategoriya <span className="text-gray-400">({selectedCat.name.uz} ichida)</span>:
                        </div>
                        <select
                          value={selectedSubId}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (v) {
                              setForm({ ...form, link: `/catalog?category=${selectedCatId}&subcategory=${v}` });
                            } else {
                              // Subkategoriya tozalandi → faqat kategoriya
                              setForm({ ...form, link: `/catalog?category=${selectedCatId}` });
                            }
                          }}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-primary-500"
                        >
                          <option value="">— barchasi —</option>
                          {selectedCat.subcategories.map((sub) => (
                            <option key={sub.id} value={sub.id}>
                              {sub.name.uz} / {sub.name.ru}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* 4-qator: Custom havola */}
                    <div>
                      <div className="text-[11px] text-gray-500 mb-1.5 font-medium">Yoki to'g'ridan havola yozing:</div>
                      <input
                        required
                        type="text"
                        value={form.link}
                        onChange={(e) => setForm({ ...form, link: e.target.value })}
                        placeholder="/catalog?category=large-appliances yoki https://t.me/..."
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:border-primary-500"
                      />
                    </div>

                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      💡 Yuqoridan tanlasangiz pastdagi havola avtomatik to'ldiriladi. Tashqi sayt uchun <code className="bg-white px-1 rounded border">https://...</code> formatda yozing.
                    </p>
                  </div>
                );
              })()}

              <label className="flex items-center gap-2 text-sm select-none">
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
                <button type="submit" disabled={submitting || !form.imageUz || !form.imageRu} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
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
