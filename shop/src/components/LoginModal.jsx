import { useState, useEffect, useRef } from 'react';
import { X, Phone, ArrowLeft, ShieldCheck } from 'lucide-react';
import { authApi } from '../api/client';

// Telefon raqamini formatlash: foydalanuvchi kiritgan raqamlarni
// "+998 (90) 123-45-67" ko'rinishida ko'rsatamiz.
// Ichkarida faqat "998..." dan keyingi 9 ta raqamni saqlaymiz.
const formatPhone = (digits) => {
  const d = (digits || '').replace(/\D/g, '').slice(0, 9);
  if (d.length === 0) return '+998 ';
  if (d.length <= 2) return `+998 (${d}`;
  if (d.length <= 5) return `+998 (${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 7) return `+998 (${d.slice(0, 2)}) ${d.slice(2, 5)}-${d.slice(5)}`;
  return `+998 (${d.slice(0, 2)}) ${d.slice(2, 5)}-${d.slice(5, 7)}-${d.slice(7, 9)}`;
};

const RESEND_SECONDS = 60;

export default function LoginModal({ open, onClose, onSuccess }) {
  const [step, setStep] = useState('phone'); // 'phone' | 'code'
  const [phoneDigits, setPhoneDigits] = useState(''); // 998 dan keyingi 9 raqam
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendIn, setResendIn] = useState(0);
  const codeInputRef = useRef(null);
  const timerRef = useRef(null);

  // Modal yopilganda holatni tozalaymiz
  useEffect(() => {
    if (!open) {
      setStep('phone');
      setPhoneDigits('');
      setCode('');
      setLoading(false);
      setError('');
      setResendIn(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [open]);

  // Esc bilan yopish
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Code stepga o'tilganda inputga focus
  useEffect(() => {
    if (step === 'code' && codeInputRef.current) {
      codeInputRef.current.focus();
    }
  }, [step]);

  const startResendTimer = () => {
    setResendIn(RESEND_SECONDS);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendIn((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const fullPhone = `998${phoneDigits}`; // backend uchun: 12 ta raqam

  const handlePhoneChange = (e) => {
    // Foydalanuvchi nima yozsa ham — faqat raqamlar qoladi.
    // "+998 " prefiks bo'lgani uchun, foydalanuvchi kiritgan matndan
    // dastlabki "998" ni olib tashlaymiz (agar mavjud bo'lsa).
    let raw = e.target.value.replace(/\D/g, '');
    if (raw.startsWith('998')) raw = raw.slice(3);
    setPhoneDigits(raw.slice(0, 9));
  };

  const requestCode = async (e) => {
    e?.preventDefault();
    setError('');
    if (phoneDigits.length !== 9) {
      setError("Telefon raqamni to'liq kiriting");
      return;
    }
    setLoading(true);
    try {
      await authApi.smsOtpRequest(fullPhone);
      setStep('code');
      setCode('');
      startResendTimer();
    } catch (e) {
      setError(e.message || "SMS yuborib bo'lmadi. Birozdan keyin urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (e) => {
    e.preventDefault();
    setError('');
    if (code.length !== 4) {
      setError("4 xonali kodni to'liq kiriting");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.smsOtpVerify(fullPhone, code);
      localStorage.setItem('ssmart_user', JSON.stringify(res.user));
      localStorage.setItem('ssmart_user_token', res.access_token);
      window.dispatchEvent(new Event('ssmart-user-changed'));
      onSuccess?.();
      onClose();
    } catch (e) {
      setError(e.message || "Kod noto'g'ri yoki muddati tugagan");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md p-6 sm:p-8 relative shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
          aria-label="Yopish"
        >
          <X className="w-4 h-4 text-gray-700" />
        </button>

        <div className="flex justify-center mb-4">
          <img src="/logo.png" alt="Ssmart" className="w-14 h-14 object-contain" />
        </div>

        <h2 className="text-2xl font-bold text-center mb-2 text-gray-900">
          Ssmart ga kirish
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          {step === 'phone'
            ? 'Telefon raqamingizni kiriting, sizga 4 xonali kod yuboramiz'
            : 'SMS orqali kelgan 4 xonali kodni kiriting'}
        </p>

        {step === 'phone' && (
          <form onSubmit={requestCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon raqam
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  value={formatPhone(phoneDigits)}
                  onChange={handlePhoneChange}
                  placeholder="+998 (__) ___-__-__"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:bg-white text-base font-medium tracking-wide"
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || phoneDigits.length !== 9}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Yuborilmoqda...
                </>
              ) : (
                'Kod yuborish'
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-3 leading-relaxed">
              Davom etgan holda{' '}
              <span className="text-primary-600 underline cursor-pointer">
                shaxsiy ma'lumotlarni qayta ishlash siyosatiga
              </span>{' '}
              va{' '}
              <span className="text-primary-600 underline cursor-pointer">
                Ssmart ommaviy ofertasiga
              </span>{' '}
              rozilik bildirasiz.
            </p>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={verifyCode} className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center gap-2 text-sm">
              <ShieldCheck className="w-5 h-5 text-primary-600 flex-shrink-0" />
              <span className="text-gray-700">
                Kod yuborildi:{' '}
                <span className="font-semibold text-gray-900">{formatPhone(phoneDigits)}</span>
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                4 xonali kod
              </label>
              <input
                ref={codeInputRef}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={4}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="0000"
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:bg-white text-center text-3xl tracking-[0.6em] font-mono"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || code.length !== 4}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Tekshirilmoqda...
                </>
              ) : (
                'Tasdiqlash'
              )}
            </button>

            <div className="flex items-center justify-between text-sm pt-1">
              <button
                type="button"
                onClick={() => { setStep('phone'); setError(''); setCode(''); }}
                className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Raqamni o'zgartirish
              </button>
              {resendIn > 0 ? (
                <span className="text-gray-400">Qayta yuborish: {resendIn}s</span>
              ) : (
                <button
                  type="button"
                  onClick={requestCode}
                  disabled={loading}
                  className="text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
                >
                  Kodni qayta yuborish
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
