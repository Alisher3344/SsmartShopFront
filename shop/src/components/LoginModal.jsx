import { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, Send, AlertTriangle, ArrowLeft, ExternalLink, CheckCircle2 } from 'lucide-react';
import { authApi } from '../api/client';

/**
 * Login modal: SMS yoki Telegram orqali kirish.
 * Telegram flow:
 *   1. Backend AuthSession yaratadi va t.me/BOT?start=TOKEN linkini qaytaradi
 *   2. Foydalanuvchi linkga o'tib, botda "Telefonni yuborish" bosadi
 *   3. Bot 6 xonali kod yuboradi
 *   4. Foydalanuvchi kodni shu modalga kiritadi
 *   5. Backend kodni tekshirib, JWT qaytaradi
 */
export default function LoginModal({ open, onClose, onSuccess }) {
  const [step, setStep] = useState('select'); // select | sms-error | tg-link | tg-code
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Telegram OTP holati
  const [tgToken, setTgToken] = useState('');
  const [tgBotLink, setTgBotLink] = useState('');
  const [tgStatus, setTgStatus] = useState('pending'); // pending | code_sent | verified | expired
  const [otp, setOtp] = useState('');
  const pollRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setStep('select');
      setError('');
      setLoading(false);
      setTgToken('');
      setTgBotLink('');
      setTgStatus('pending');
      setOtp('');
      stopPolling();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  // Status polling — bot kod yuborganini avtomatik bilish uchun
  const startPolling = (token) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const res = await authApi.telegramOtpStatus(token);
        setTgStatus(res.status);
        if (res.status === 'code_sent') {
          stopPolling();
        } else if (res.status === 'expired') {
          stopPolling();
          setError('Login sessiyasi muddati tugadi. Qaytadan boshlang.');
        }
      } catch {
        // jim - keyingi pollda qayta urinadi
      }
    }, 2500);
  };

  // Telegram step: sessiya yaratish
  const startTelegramFlow = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authApi.telegramOtpStart();
      setTgToken(res.token);
      setTgBotLink(res.bot_link);
      setStep('tg-link');
      startPolling(res.token);
    } catch (e) {
      setError(e.message || "Telegram bot ishga tushmagan. Adminga murojaat qiling.");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (e) => {
    e.preventDefault();
    setError('');
    if (otp.length !== 6) {
      setError("6 xonali kodni to'liq kiriting");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.telegramOtpVerify(tgToken, otp);
      localStorage.setItem('ssmart_user', JSON.stringify(res.user));
      localStorage.setItem('ssmart_user_token', res.access_token);
      window.dispatchEvent(new Event('ssmart-user-changed'));
      stopPolling();
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

        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
          Ssmart ga kirish
        </h2>

        {/* SELECT — usul tanlash */}
        {step === 'select' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 text-center mb-2">
              Kirish usulini tanlang
            </p>

            <button
              type="button"
              onClick={() => setStep('sms-error')}
              className="w-full flex items-center gap-3 px-4 py-3.5 bg-white border-2 border-gray-200 hover:border-primary-500 hover:bg-primary-50/30 rounded-xl transition-all"
            >
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-primary-600" />
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold text-gray-900">SMS orqali</div>
                <div className="text-xs text-gray-500">Telefon raqam + 4 xonali kod</div>
              </div>
            </button>

            <button
              type="button"
              onClick={startTelegramFlow}
              disabled={loading}
              className="w-full flex items-center gap-3 px-4 py-3.5 bg-white border-2 border-gray-200 hover:border-[#229ED9] hover:bg-[#229ED9]/5 rounded-xl transition-all disabled:opacity-50"
            >
              <div className="w-10 h-10 bg-[#229ED9]/15 rounded-lg flex items-center justify-center flex-shrink-0">
                <Send className="w-5 h-5 text-[#229ED9]" />
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold text-gray-900">Telegram orqali</div>
                <div className="text-xs text-gray-500">Bot orqali tez va xavfsiz</div>
              </div>
              {loading && (
                <div className="w-5 h-5 border-2 border-[#229ED9] border-t-transparent rounded-full animate-spin" />
              )}
            </button>

            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 text-center">
                {error}
              </div>
            )}

            <p className="text-xs text-gray-500 text-center mt-5 leading-relaxed">
              Davom etgan holda men <span className="text-primary-600 underline cursor-pointer">shaxsiy ma'lumotlarni qayta ishlash siyosatiga rozilik bildirasiz</span> va <span className="text-primary-600 underline cursor-pointer">Ssmart ommaviy oferta bilan rozi bo'laman</span>
            </p>
          </div>
        )}

        {/* SMS — texnik nosozlik */}
        {step === 'sms-error' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Texnik nosozlik</h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              SMS orqali kirish hozircha texnik nosozlik tufayli ishlamayapti.
              <br />
              Iltimos, <strong>Telegram</strong> orqali kiring.
            </p>
            <button
              type="button"
              onClick={() => setStep('select')}
              className="w-full inline-flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Orqaga
            </button>
          </div>
        )}

        {/* TELEGRAM — botga o'tish */}
        {step === 'tg-link' && (
          <div>
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-[#229ED9]/15 rounded-full flex items-center justify-center mx-auto mb-3">
                <Send className="w-8 h-8 text-[#229ED9]" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Telegram botga o'ting</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Quyidagi tugmani bosing va botda <strong>"Telefon raqamni yuborish"</strong> tugmasini bosing.
                Bot sizga 6 xonali kod yuboradi.
              </p>
            </div>

            <a
              href={tgBotLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-[#229ED9] hover:bg-[#1c87b8] text-white font-semibold rounded-xl transition-colors mb-3"
            >
              <Send className="w-5 h-5" />
              Telegram'da ochish
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Status indicator */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-3 flex items-center gap-2 text-sm">
              {tgStatus === 'pending' && (
                <>
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-gray-600">Telegram'dan kod kutilmoqda...</span>
                </>
              )}
              {tgStatus === 'code_sent' && (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-green-700 font-medium">Kod yuborildi! Pastga kiriting</span>
                </>
              )}
              {tgStatus === 'expired' && (
                <>
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-red-700">Sessiya muddati tugadi</span>
                </>
              )}
            </div>

            {error && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {error}
              </div>
            )}

            {/* Code input — har doim ko'rinadi, lekin code_sent bo'lguncha bekor */}
            <form onSubmit={verifyCode}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bot yuborgan kodni kiriting
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                disabled={tgStatus === 'expired' || loading}
                className="w-full px-4 py-3.5 mb-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 text-center text-2xl tracking-widest font-mono disabled:opacity-50"
                autoFocus
              />
              <button
                type="submit"
                disabled={otp.length !== 6 || loading || tgStatus === 'expired'}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? 'Tekshirilmoqda...' : 'Tasdiqlash'}
              </button>
              <button
                type="button"
                onClick={() => { stopPolling(); setStep('select'); }}
                className="w-full mt-2 py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Bekor qilish
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
