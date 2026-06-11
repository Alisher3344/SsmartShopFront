import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  Image as ImageIcon,
  Link2,
  Upload,
  Megaphone,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { proCarouselApi } from "../../api/client";

// Tavsiya etilgan banner rasm o'lchami
const RECOMMENDED_SIZE = "1600 × 500 px";

// Ssmart Pro (pro.ssmart.uz) bosh sahifa reklama karuseli — faqat RASM + URL.
// Slaydlar Pro backendida saqlanadi (shop backend proxy orqali).
export default function AdminProCarousel() {
  const { isSuperAdmin } = useAuth();
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null); // null | {} | {...slide}

  if (!isSuperAdmin) return <Navigate to="/" replace />;

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      const list = await proCarouselApi.list();
      setSlides(Array.isArray(list) ? list : list?.items ?? []);
    } catch (e) {
      setError(e.message || "Reklamalarni yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleDelete = async (slide) => {
    if (!confirm("Ushbu reklamani o'chirishni tasdiqlaysizmi?")) return;
    try {
      await proCarouselApi.delete(slide.id);
      await refresh();
    } catch (e) {
      alert("O'chirishda xatolik: " + (e.message || ""));
    }
  };

  const toggleActive = async (slide) => {
    try {
      await proCarouselApi.update(slide.id, { is_active: !slide.is_active });
      await refresh();
    } catch (e) {
      alert("Xatolik: " + (e.message || ""));
    }
  };

  if (editing !== null) {
    return (
      <ProCarouselForm
        slide={editing}
        onCancel={() => setEditing(null)}
        onSaved={async () => {
          setEditing(null);
          await refresh();
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-primary-600" />
            Reklama Karusel (Pro)
            <span className="text-[10px] bg-accent-500 text-white px-2 py-0.5 rounded font-bold">
              SUPER
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            pro.ssmart.uz bosh sahifasidagi reklama bannerlari — rasm + havola
          </p>
        </div>
        <button
          onClick={() => setEditing({})}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Yangi reklama
        </button>
      </div>

      {/* Rasm o'lchami yo'riqnomasi */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 flex items-start gap-2">
        <ImageIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div>
          Tavsiya etilgan rasm o'lchami: <strong>{RECOMMENDED_SIZE}</strong> (keng banner,
          nisbat ~16:5). Format: JPG / PNG / WebP, hajmi <strong>600 KB</strong> gacha.
          Yuklangan rasm avtomatik 1600px enigacha siqiladi. Banner to'liq rasmdan iborat —
          barcha yozuvlar rasmga oldindan joylangan bo'lishi kerak.
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

      {!loading && slides.length === 0 && (
        <div className="text-center py-12 text-gray-500 card">
          <Megaphone className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Hali reklama yo'q. "Yangi reklama" bilan qo'shing.</p>
        </div>
      )}

      {!loading && slides.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {slides.map((slide) => (
            <div key={slide.id} className="card overflow-hidden">
              <div className="relative bg-gray-100" style={{ aspectRatio: "16 / 5" }}>
                {slide.image ? (
                  <img src={slide.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ImageIcon className="w-10 h-10" />
                  </div>
                )}
                <button
                  onClick={() => toggleActive(slide)}
                  className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded ${
                    slide.is_active ? "bg-green-500 text-white" : "bg-gray-500 text-white"
                  }`}
                  title="Faollikni almashtirish"
                >
                  {slide.is_active ? "Faol" : "Faol emas"}
                </button>
              </div>
              <div className="p-3">
                <div className="text-xs text-gray-600 truncate flex items-center gap-1">
                  <Link2 className="w-3 h-3 flex-shrink-0" />
                  {slide.link_url || <span className="text-gray-400">— havolasiz —</span>}
                </div>
                <div className="flex items-center gap-1 pt-3 mt-2 border-t border-gray-100">
                  <button
                    onClick={() => setEditing(slide)}
                    className="flex-1 text-center text-xs font-medium py-1.5 rounded-md text-gray-600 hover:bg-primary-50 hover:text-primary-700 inline-flex items-center justify-center gap-1"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Tahrirlash
                  </button>
                  <button
                    onClick={() => handleDelete(slide)}
                    className="px-2 py-1.5 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-md"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Rasmni canvas orqali kichraytirib data URL (JPEG) ga aylantiradi (maks. eni 1600px).
function fileToResizedDataUrl(file, maxW = 1600, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Faylni o'qib bo'lmadi"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Rasmni yuklab bo'lmadi"));
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function ProCarouselForm({ slide, onCancel, onSaved }) {
  const isEdit = !!slide?.id;
  // Faqat rasm + URL. is_active/sort_order mavjud qiymati saqlanadi (yangi uchun default).
  const [image, setImage] = useState(slide?.image || "");
  const [linkUrl, setLinkUrl] = useState(slide?.link_url || "");
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const onPickImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const dataUrl = await fileToResizedDataUrl(file);
      setImage(dataUrl);
    } catch (err) {
      setError(err.message || "Rasmni yuklab bo'lmadi");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!image) {
      setError("Rasm majburiy");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        image,
        link_url: linkUrl.trim() || null,
        sort_order: slide?.sort_order ?? 0,
        is_active: slide?.is_active ?? true,
      };
      if (isEdit) {
        await proCarouselApi.update(slide.id, payload);
      } else {
        await proCarouselApi.create(payload);
      }
      onSaved();
    } catch (err) {
      setError(err.message || "Saqlashda xatolik");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-primary-600" />
          {isEdit ? "Reklamani tahrirlash" : "Yangi reklama"}
        </h1>
      </div>
      <form onSubmit={handleSubmit} className="card p-5 max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Rasm * <span className="text-gray-400 font-normal">(tavsiya: {RECOMMENDED_SIZE})</span>
          </label>
          {image && (
            <img
              src={image}
              alt=""
              className="w-full object-cover rounded-lg border border-gray-200 mb-2"
              style={{ aspectRatio: "16 / 5" }}
            />
          )}
          <label className="inline-flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer text-sm text-gray-600 hover:border-primary-500 hover:text-primary-600">
            <Upload className="w-4 h-4" />
            {uploading ? "Yuklanmoqda..." : image ? "Rasmni almashtirish" : "Rasm tanlash"}
            <input type="file" accept="image/*" onChange={onPickImage} className="hidden" />
          </label>
          <p className="text-[10px] text-gray-500 mt-1">
            Keng banner: <strong>{RECOMMENDED_SIZE}</strong> (~16:5). JPG/PNG/WebP, 600 KB gacha.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <Link2 className="w-3.5 h-3.5 inline mr-1" />
            URL (banner bosilganda o'tiladi)
          </label>
          <input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.uz yoki /usta/123"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
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
            disabled={submitting || uploading}
            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {submitting ? "Saqlanmoqda..." : isEdit ? "Saqlash" : "Qo'shish"}
          </button>
        </div>
      </form>
    </div>
  );
}
