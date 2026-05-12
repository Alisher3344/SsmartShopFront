import { useState, useRef } from 'react';
import { Upload, X, Link2, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { uploadApi, resolveImage } from '../api/client';
import FluentEmoji from './FluentEmoji';

/**
 * ImageUpload - rasmni qat'iy validatsiya bilan yuklash
 *
 * Props:
 *   value, onChange — rasm holati
 *   variant — 'product' (3:4, 1080×1440) yoki 'banner' (16:9, 1920×1080) yoki 'free' (validatsiyasiz)
 */

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
const MAX_SIZE_MB = 3;

// Variantlar uchun konfiguratsiya
const VARIANTS = {
  product: {
    width: 1080,
    height: 1440,
    ratio: 3 / 4,           // 0.75
    label: '1080×1440 (3:4 vertikal)',
    aspectClass: 'aspect-[3/4]',
    previewWidth: 'w-32',
    pngOnly: false,
    skipDimensions: false,
  },
  banner: {
    width: null,
    height: null,
    ratio: null,
    label: 'Faqat PNG (shaffof fon)',
    aspectClass: 'aspect-video',
    previewWidth: 'w-48',
    pngOnly: true,           // faqat PNG
    skipDimensions: true,    // o'lcham tekshirilmaydi
    skipSize: true,          // hajm cheklov yo'q
    skipAll: false,
  },
  slide: {
    width: 1240,
    height: 413,
    ratio: 1240 / 413,
    label: '1240×413 (JPG yoki PNG)',
    aspectClass: 'aspect-[1240/413]',
    previewWidth: 'w-full',
    pngOnly: false,
    skipDimensions: false,
  },
  free: {
    width: 800,
    height: 600,
    ratio: null,
    label: 'Har qanday o\'lcham (kamida 800px)',
    aspectClass: 'aspect-video',
    previewWidth: 'w-48',
    pngOnly: false,
    skipDimensions: false,
  },
};

const RATIO_TOLERANCE = 0.05; // 5% xatolik joiz

export default function ImageUpload({ value, onChange, variant = 'product' }) {
  const config = VARIANTS[variant] || VARIANTS.product;
  const fileInputRef = useRef(null);
  const [mode, setMode] = useState('upload');
  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const validateFile = (file) => {
    return new Promise((resolve) => {
      // Hech qanday cheklov yo'q (banner uchun)
      if (config.skipAll) {
        resolve({ valid: true });
        return;
      }

      // 1. Format
      const ext = file.name.split('.').pop()?.toLowerCase();

      // PNG-only rejim
      if (config.pngOnly) {
        if (file.type !== 'image/png' || ext !== 'png') {
          resolve({
            valid: false,
            error: `Faqat PNG format ruxsat etiladi (shaffof fon uchun). Siz: .${ext || '?'}`
          });
          return;
        }
      } else {
        // Standart format tekshiruvi
        if (!ALLOWED_TYPES.includes(file.type) || !ALLOWED_EXTENSIONS.includes(ext)) {
          resolve({
            valid: false,
            error: `Noto'g'ri format! Faqat JPEG, JPG, WebP, PNG (siz: .${ext || '?'})`
          });
          return;
        }
      }

      // 2. Hajm (skipSize bo'lsa o'tkazib yuboramiz)
      if (!config.skipSize) {
        const sizeMB = file.size / (1024 * 1024);
        if (sizeMB > MAX_SIZE_MB) {
          resolve({
            valid: false,
            error: `Hajmi ${MAX_SIZE_MB}MB dan oshmasligi kerak (joriy: ${sizeMB.toFixed(2)}MB)`
          });
          return;
        }
      }

      // 3. O'lcham
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        const img = new Image();

        img.onload = () => {
          const { width, height } = img;

          // skipDimensions rejimi (banner) - o'lcham tekshirilmaydi
          if (config.skipDimensions) {
            resolve({ valid: true });
            return;
          }

          // Free rejimda - faqat minimal kenglik tekshiruvi
          if (variant === 'free') {
            if (width < 800) {
              resolve({
                valid: false,
                error: `Rasm juda kichik. Kamida 800px kenglik kerak (joriy: ${width}×${height})`
              });
              return;
            }
            resolve({ valid: true });
            return;
          }

          const ratio = width / height;

          // Aspect ratio tekshiruvi
          if (config.ratio && Math.abs(ratio - config.ratio) > RATIO_TOLERANCE) {
            resolve({
              valid: false,
              error: `Rasm nisbati ${config.label} bo'lishi kerak (joriy: ${width}×${height}, nisbat ${ratio.toFixed(2)})`
            });
            return;
          }

          // Minimal o'lcham
          if (config.width && config.height && (width < config.width * 0.7 || height < config.height * 0.7)) {
            resolve({
              valid: false,
              error: `Rasm juda kichik. Talab: ${config.label} (joriy: ${width}×${height})`
            });
            return;
          }

          resolve({ valid: true });
        };

        img.onerror = () => {
          resolve({ valid: false, error: "Rasmni o'qib bo'lmadi - fayl buzilgan" });
        };

        img.src = dataUrl;
      };

      reader.onerror = () => {
        resolve({ valid: false, error: "Faylni o'qishda xatolik" });
      };

      reader.readAsDataURL(file);
    });
  };

  const handleFile = async (file) => {
    setError('');
    if (!file) return;

    setIsValidating(true);
    const result = await validateFile(file);
    if (!result.valid) {
      setIsValidating(false);
      setError(result.error);
      return;
    }
    try {
      const url = await uploadApi.image(file);
      onChange(url);
    } catch (e) {
      setError(e.message || "Yuklashda xatolik (backend ishlamayapti?)");
    } finally {
      setIsValidating(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const applyUrl = () => {
    if (!urlInput.trim()) return;
    setError('');
    onChange(urlInput.trim());
    setUrlInput('');
  };

  const removeImage = () => {
    onChange('');
    setError('');
  };

  return (
    <div className="space-y-2">
      {/* Talablar info */}
      {!config.skipAll && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-blue-900">
            {config.pngOnly ? (
              <>
                <div><strong>Format:</strong> faqat PNG (shaffof fonli rasm)</div>
                <div><strong>Hajm:</strong> {MAX_SIZE_MB} MB dan oshmasligi kerak</div>
                <div><strong>O'lcham:</strong> har qanday (cheklov yo'q)</div>
                <div className="text-blue-700 flex items-center gap-1.5"><FluentEmoji name="pushpin" size={14} /> Mahsulot rasmini orqa fonsiz (shaffof PNG) yuklang</div>
              </>
            ) : (
              <>
                <div><strong>Format:</strong> JPEG, JPG, WebP, PNG</div>
                <div><strong>O'lcham:</strong> {config.label}</div>
                <div><strong>Hajm:</strong> {MAX_SIZE_MB} MB dan oshmasligi kerak</div>
                {variant === 'product' && (
                  <div className="text-blue-700 flex items-center gap-1.5"><FluentEmoji name="pushpin" size={14} /> Mahsulot uchun vertikal rasm: yaqindan, professional</div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Tab tugmalari */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => { setMode('upload'); setError(''); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            mode === 'upload' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          Kompyuterdan
        </button>
        <button
          type="button"
          onClick={() => { setMode('url'); setError(''); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            mode === 'url' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Link2 className="w-3.5 h-3.5" />
          URL
        </button>
      </div>

      {/* Yuklash bo'limi */}
      {mode === 'upload' && !value && (
        <div
          onClick={() => !isValidating && fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isValidating
              ? 'border-gray-300 bg-gray-50 cursor-wait'
              : isDragging
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }`}
        >
          {isValidating ? (
            <>
              <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-700 font-medium">Tekshirilmoqda...</p>
            </>
          ) : (
            <>
              <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragging ? 'text-primary-500' : 'text-gray-400'}`} />
              <p className="text-sm text-gray-700 font-medium mb-0.5">
                Rasmni shu yerga tashlang yoki <span className="text-primary-600">tanlang</span>
              </p>
              <p className="text-xs text-gray-500">
                {config.skipAll
                  ? 'Har qanday rasm (cheklov yo\'q)'
                  : `${config.pngOnly ? 'Faqat PNG' : config.label} · max ${MAX_SIZE_MB}MB`}
              </p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={config.skipAll ? "image/*" : (config.pngOnly ? ".png,image/png" : ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp")}
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
      )}

      {/* URL kiritish */}
      {mode === 'url' && !value && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/rasm.jpg"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
          />
          <button
            type="button"
            onClick={applyUrl}
            disabled={!urlInput.trim()}
            className="btn-primary text-sm px-4 disabled:opacity-50"
          >
            Qo'shish
          </button>
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className="space-y-2">
          <div className="relative inline-block">
            <div className="bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
              <img
                src={resolveImage(value)}
                alt="Preview"
                className={`${config.previewWidth} ${config.aspectClass} object-cover`}
                onError={(e) => {
                  e.target.style.display = 'none';
                  setError("Rasmni yuklab bo'lmadi");
                }}
              />
            </div>
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
              title="O'chirish"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-1 right-1 px-2 py-1 bg-white/90 text-gray-700 rounded-md text-[10px] font-medium hover:bg-white shadow-sm"
            >
              <Upload className="w-3 h-3 inline mr-1" />
              Almashtirish
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept={config.skipAll ? "image/*" : (config.pngOnly ? ".png,image/png" : ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp")}
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-green-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Rasm muvaffaqiyatli yuklandi</span>
          </div>
        </div>
      )}

      {/* Xato */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <span className="text-red-800">{error}</span>
        </div>
      )}
    </div>
  );
}
