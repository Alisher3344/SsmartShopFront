import { useState, useEffect, useRef } from 'react';
import { X, Phone, ArrowLeft, ShieldCheck, Lock, User, Check, AlertCircle } from 'lucide-react';
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

// Parol kuchi tekshiruvi
const checkPassword = (pwd) => ({
  length:  pwd.length >= 6,
  upper:   /[A-Z]/.test(pwd),
  digit:   /\d/.test(pwd),
});
const isPasswordValid = (pwd) => {
  const c = checkPassword(pwd);
  return c.length && c.upper && c.digit;
};

// Steps:
//   'choose'           — Kirish | Ro'yxatdan o'tish tanlash
//   'login'            — phone + password
//   'register-phone'   — phone input → OTP yuborish
//   'register-otp'     — OTP kod
//   'register-pass'    — parol kiritish
//   'register-name'    — Assalomu Alaykum + ism familiya
//   'reset-phone'      — parolni tiklash: telefon
//   'reset-otp'        — parolni tiklash: SMS kod
//   'reset-pass'       — parolni tiklash: yangi parol

export default function LoginModal({ open, onClose, onSuccess }) {
  const [step, setStep] = useState('choose');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [registrationToken, setRegistrationToken] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorAction, setErrorAction] = useState(null); // {label, onClick}
  const [resendIn, setResendIn] = useState(0);
  const codeInputRef = useRef(null);
  const timerRef = useRef(null);

  // Modal yopilganda holatni tozalaymiz
  useEffect(() => {
    if (!open) {
      setStep('choose');
      setPhoneDigits('');
      setCode('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setRegistrationToken('');
      setResetToken('');
      setLoading(false);
      setError('');
      setErrorAction(null);
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

  // OTP step'iga o'tilganda inputga focus
  useEffect(() => {
    if ((step === 'register-otp' || step === 'reset-otp') && codeInputRef.current) {
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

  const fullPhone = `998${phoneDigits}`;

  const handlePhoneChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '');
    if (raw.startsWith('998')) raw = raw.slice(3);
    setPhoneDigits(raw.slice(0, 9));
  };

  const persistAndFinish = (res) => {
    localStorage.setItem('ssmart_user', JSON.stringify(res.user));
    localStorage.setItem('ssmart_user_token', res.access_token);
    window.dispatchEvent(new Event('ssmart-user-changed'));
    onSuccess?.();
    onClose();
  };

  // ===== Register: OTP yuborish =====
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
      setStep('register-otp');
      setCode('');
      startResendTimer();
    } catch (e) {
      setError(e.message || "SMS yuborib bo'lmadi. Birozdan keyin urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  // ===== Register: OTP tasdiqlash =====
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
      setRegistrationToken(res.registration_token);
      setStep('register-pass');
    } catch (e) {
      setError(e.message || "Kod noto'g'ri yoki muddati tugagan");
    } finally {
      setLoading(false);
    }
  };

  // ===== Register: parol o'rnatish (saqlash) =====
  const savePassword = (e) => {
    e.preventDefault();
    setError('');
    if (!isPasswordValid(password)) {
      setError("Parol kamida 6 belgi, 1 katta harf va 1 raqam o'z ichiga olishi kerak");
      return;
    }
    // Bu yerda hali backendga so'rov yubormaymiz — keyingi qadamda ism bilan birga yuboramiz
    setStep('register-name');
  };

  // ===== Register: ism saqlash va yakunlash =====
  const completeRegistration = async (e) => {
    e.preventDefault();
    setError('');
    const first = firstName.trim();
    const last = lastName.trim();
    if (first.length < 2) {
      setError("Ismni kiriting (kamida 2 belgi)");
      return;
    }
    if (last.length < 2) {
      setError("Familiyani kiriting (kamida 2 belgi)");
      return;
    }
    const fullName = `${first} ${last}`;
    setLoading(true);
    try {
      const res = await authApi.registerComplete(registrationToken, password, fullName);
      persistAndFinish(res);
    } catch (e) {
      setError(e.message || "Ro'yxatdan o'tib bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  // ===== Login: phone + password =====
  const phoneLogin = async (e) => {
    e.preventDefault();
    setError('');
    setErrorAction(null);
    if (phoneDigits.length !== 9) {
      setError("Telefon raqamni to'liq kiriting");
      return;
    }
    if (password.length < 1) {
      setError("Parolni kiriting");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.phoneLogin(fullPhone, password);
      persistAndFinish(res);
    } catch (e) {
      const msg = e.message || "Telefon yoki parol noto'g'ri";
      setError(msg);
      // 404 — hisob yo'q → "Ro'yxatdan o'tish" tugmasi
      if (e.status === 404) {
        setErrorAction({
          label: "Ro'yxatdan o'tish",
          onClick: () => {
            setError('');
            setErrorAction(null);
            setPassword('');
            setStep('register-phone');
          },
        });
      } else if (e.status === 401) {
        // 401 — hisob bor lekin parol noto'g'ri → "Parolni unutdingizmi? Tiklash"
        setErrorAction({
          label: "Parolni unutdingizmi? Tiklash",
          onClick: startReset,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // ===== Parolni tiklash: SMS yuborish =====
  const startReset = () => {
    // Login step'da kiritilgan telefonni saqlab qolamiz, parolni tashlaymiz
    setStep('reset-phone');
    setError('');
    setErrorAction(null);
    setPassword('');
  };

  const requestResetCode = async (e) => {
    e?.preventDefault();
    setError('');
    setErrorAction(null);
    if (phoneDigits.length !== 9) {
      setError("Telefon raqamni to'liq kiriting");
      return;
    }
    setLoading(true);
    try {
      await authApi.passwordResetRequest(fullPhone);
      setStep('reset-otp');
      setCode('');
      startResendTimer();
    } catch (e) {
      const msg = e.message || "SMS yuborib bo'lmadi";
      setError(msg);
      if (e.status === 404) {
        setErrorAction({
          label: "Ro'yxatdan o'tish",
          onClick: () => {
            setError('');
            setErrorAction(null);
            setStep('register-phone');
          },
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // ===== Parolni tiklash: OTP tasdiqlash =====
  const verifyResetCode = async (e) => {
    e.preventDefault();
    setError('');
    setErrorAction(null);
    if (code.length !== 4) {
      setError("4 xonali kodni to'liq kiriting");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.passwordResetVerify(fullPhone, code);
      setResetToken(res.reset_token);
      setPassword('');
      setStep('reset-pass');
    } catch (e) {
      setError(e.message || "Kod noto'g'ri yoki muddati tugagan");
    } finally {
      setLoading(false);
    }
  };

  // ===== Parolni tiklash: yangi parol saqlash =====
  const completeReset = async (e) => {
    e.preventDefault();
    setError('');
    setErrorAction(null);
    if (!isPasswordValid(password)) {
      setError("Parol kamida 6 belgi, 1 katta harf va 1 raqam o'z ichiga olishi kerak");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.passwordResetComplete(resetToken, password);
      persistAndFinish(res);
    } catch (e) {
      setError(e.message || "Parolni tiklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const goBackToChoose = () => {
    setStep('choose');
    setError('');
    setErrorAction(null);
    setCode('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setRegistrationToken('');
    setResetToken('');
    setPhoneDigits('');
  };

  const pwdChecks = checkPassword(password);

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

        {/* ============ STEP: CHOOSE ============ */}
        {step === 'choose' && (
          <>
            <h2 className="text-2xl font-bold text-center mb-2 text-gray-900">
              Ssmart ga xush kelibsiz
            </h2>
            <p className="text-sm text-gray-500 text-center mb-6">
              Davom etish uchun usulni tanlang
            </p>

            <div className="space-y-3">
              <button
                onClick={() => { setStep('login'); setError(''); }}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Hisobga kirish
              </button>
              <button
                onClick={() => { setStep('register-phone'); setError(''); }}
                className="w-full bg-white border-2 border-primary-600 text-primary-700 hover:bg-primary-50 font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                Ro'yxatdan o'tish
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-5 leading-relaxed">
              Davom etgan holda{' '}
              <span className="text-primary-600 underline cursor-pointer">
                shaxsiy ma'lumotlarni qayta ishlash siyosatiga
              </span>{' '}
              rozilik bildirasiz.
            </p>
          </>
        )}

        {/* ============ STEP: LOGIN ============ */}
        {step === 'login' && (
          <>
            <BackHeader onBack={goBackToChoose} title="Hisobga kirish" />
            <p className="text-sm text-gray-500 text-center mb-6">
              Telefon raqam va parolni kiriting
            </p>

            <form onSubmit={phoneLogin} className="space-y-4">
              <PhoneField value={phoneDigits} onChange={handlePhoneChange} />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parol</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="Parolni kiriting"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:bg-white text-base"
                  />
                </div>
              </div>

              <ErrorBox text={error} action={errorAction} />

              <SubmitBtn loading={loading} disabled={phoneDigits.length !== 9 || password.length < 1}>
                Kirish
              </SubmitBtn>
            </form>
          </>
        )}

        {/* ============ STEP: REGISTER — PHONE ============ */}
        {step === 'register-phone' && (
          <>
            <BackHeader onBack={goBackToChoose} title="Ro'yxatdan o'tish" />
            <p className="text-sm text-gray-500 text-center mb-6">
              Telefon raqamingizni kiriting, sizga 4 xonali kod yuboramiz
            </p>

            <form onSubmit={requestCode} className="space-y-4">
              <PhoneField value={phoneDigits} onChange={handlePhoneChange} />
              <ErrorBox text={error} action={errorAction} />
              <SubmitBtn loading={loading} disabled={phoneDigits.length !== 9}>
                Kod yuborish
              </SubmitBtn>
            </form>
          </>
        )}

        {/* ============ STEP: REGISTER — OTP ============ */}
        {step === 'register-otp' && (
          <>
            <BackHeader
              onBack={() => { setStep('register-phone'); setError(''); setCode(''); }}
              title="SMS kod"
            />
            <p className="text-sm text-gray-500 text-center mb-6">
              SMS orqali kelgan 4 xonali kodni kiriting
            </p>

            <form onSubmit={verifyCode} className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center gap-2 text-sm">
                <ShieldCheck className="w-5 h-5 text-primary-600 flex-shrink-0" />
                <span className="text-gray-700">
                  Kod yuborildi:{' '}
                  <span className="font-semibold text-gray-900">{formatPhone(phoneDigits)}</span>
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">4 xonali kod</label>
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

              <ErrorBox text={error} action={errorAction} />

              <SubmitBtn loading={loading} disabled={code.length !== 4}>
                Tasdiqlash
              </SubmitBtn>

              <div className="flex items-center justify-between text-sm pt-1">
                <span className="text-gray-400">
                  {resendIn > 0 ? `Qayta yuborish: ${resendIn}s` : ''}
                </span>
                {resendIn === 0 && (
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
          </>
        )}

        {/* ============ STEP: REGISTER — PASSWORD ============ */}
        {step === 'register-pass' && (
          <>
            <BackHeader
              onBack={() => { setStep('register-otp'); setError(''); }}
              title="Parol yarating"
            />
            <p className="text-sm text-gray-500 text-center mb-6">
              Hisobingiz uchun ishonchli parol o'rnating
            </p>

            <form onSubmit={savePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parol</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="Yangi parol"
                    autoFocus
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:bg-white text-base"
                  />
                </div>
              </div>

              {/* Parol talablari ko'rsatkichlari */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
                <PwdHint ok={pwdChecks.length}>Kamida 6 belgi</PwdHint>
                <PwdHint ok={pwdChecks.upper}>Kamida 1 ta katta harf (A-Z)</PwdHint>
                <PwdHint ok={pwdChecks.digit}>Kamida 1 ta raqam (0-9)</PwdHint>
              </div>

              <ErrorBox text={error} action={errorAction} />

              <SubmitBtn loading={false} disabled={!isPasswordValid(password)}>
                Saqlash
              </SubmitBtn>
            </form>
          </>
        )}

        {/* ============ STEP: REGISTER — NAME (welcome) ============ */}
        {step === 'register-name' && (
          <>
            <h2 className="text-xl font-bold text-center mb-1 text-gray-900">
              Assalomu Alaykum, hurmatli mijoz!
            </h2>
            <p className="text-base text-primary-700 font-medium text-center mb-1">
              Ssmart ga xush kelibsiz
            </p>
            <p className="text-sm text-gray-500 text-center mb-6">
              Iltimos, ism va familiyangizni kiriting
            </p>

            <form onSubmit={completeRegistration} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ism</label>
                <div className="relative">
                  <User className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoComplete="given-name"
                    placeholder="Ali"
                    autoFocus
                    maxLength={120}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:bg-white text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Familiya</label>
                <div className="relative">
                  <User className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    autoComplete="family-name"
                    placeholder="Aliyev"
                    maxLength={120}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:bg-white text-base"
                  />
                </div>
              </div>

              <ErrorBox text={error} action={errorAction} />

              <SubmitBtn
                loading={loading}
                disabled={firstName.trim().length < 2 || lastName.trim().length < 2}
              >
                Saqlash
              </SubmitBtn>
            </form>
          </>
        )}

        {/* ============ STEP: RESET — PHONE ============ */}
        {step === 'reset-phone' && (
          <>
            <BackHeader
              onBack={() => { setStep('login'); setError(''); setErrorAction(null); }}
              title="Parolni tiklash"
            />
            <p className="text-sm text-gray-500 text-center mb-6">
              Telefon raqamingizni kiriting, sizga 4 xonali kod yuboramiz
            </p>

            <form onSubmit={requestResetCode} className="space-y-4">
              <PhoneField value={phoneDigits} onChange={handlePhoneChange} />
              <ErrorBox text={error} action={errorAction} />
              <SubmitBtn loading={loading} disabled={phoneDigits.length !== 9}>
                Kod yuborish
              </SubmitBtn>
            </form>
          </>
        )}

        {/* ============ STEP: RESET — OTP ============ */}
        {step === 'reset-otp' && (
          <>
            <BackHeader
              onBack={() => { setStep('reset-phone'); setError(''); setErrorAction(null); setCode(''); }}
              title="SMS kod"
            />
            <p className="text-sm text-gray-500 text-center mb-6">
              SMS orqali kelgan 4 xonali kodni kiriting
            </p>

            <form onSubmit={verifyResetCode} className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center gap-2 text-sm">
                <ShieldCheck className="w-5 h-5 text-primary-600 flex-shrink-0" />
                <span className="text-gray-700">
                  Kod yuborildi:{' '}
                  <span className="font-semibold text-gray-900">{formatPhone(phoneDigits)}</span>
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">4 xonali kod</label>
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

              <ErrorBox text={error} action={errorAction} />

              <SubmitBtn loading={loading} disabled={code.length !== 4}>
                Tasdiqlash
              </SubmitBtn>

              <div className="flex items-center justify-between text-sm pt-1">
                <span className="text-gray-400">
                  {resendIn > 0 ? `Qayta yuborish: ${resendIn}s` : ''}
                </span>
                {resendIn === 0 && (
                  <button
                    type="button"
                    onClick={requestResetCode}
                    disabled={loading}
                    className="text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
                  >
                    Kodni qayta yuborish
                  </button>
                )}
              </div>
            </form>
          </>
        )}

        {/* ============ STEP: RESET — PASSWORD ============ */}
        {step === 'reset-pass' && (
          <>
            <BackHeader
              onBack={() => { setStep('reset-otp'); setError(''); setErrorAction(null); }}
              title="Yangi parol"
            />
            <p className="text-sm text-gray-500 text-center mb-6">
              Hisobingiz uchun yangi parol o'rnating
            </p>

            <form onSubmit={completeReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Yangi parol</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="Yangi parol"
                    autoFocus
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:bg-white text-base"
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
                <PwdHint ok={pwdChecks.length}>Kamida 6 belgi</PwdHint>
                <PwdHint ok={pwdChecks.upper}>Kamida 1 ta katta harf (A-Z)</PwdHint>
                <PwdHint ok={pwdChecks.digit}>Kamida 1 ta raqam (0-9)</PwdHint>
              </div>

              <ErrorBox text={error} action={errorAction} />

              <SubmitBtn loading={loading} disabled={!isPasswordValid(password)}>
                Saqlash va kirish
              </SubmitBtn>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ============ Helper componentlar ============

function BackHeader({ onBack, title }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <button
        type="button"
        onClick={onBack}
        className="p-1.5 -ml-1 hover:bg-gray-100 rounded-lg text-gray-600"
        aria-label="Orqaga"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <h2 className="text-xl font-bold text-gray-900 flex-1 text-center pr-7">{title}</h2>
    </div>
  );
}

function PhoneField({ value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Telefon raqam</label>
      <div className="relative">
        <Phone className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          value={formatPhone(value)}
          onChange={onChange}
          placeholder="+998 (__) ___-__-__"
          autoFocus
          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:bg-white text-base font-medium tracking-wide"
        />
      </div>
    </div>
  );
}

function ErrorBox({ text, action }) {
  if (!text) return null;
  return (
    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
      <div className="flex items-start gap-2">
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span className="flex-1">{text}</span>
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-2 text-xs font-semibold text-primary-700 hover:text-primary-800 underline"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

function SubmitBtn({ loading, disabled, children }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          Yuborilmoqda...
        </>
      ) : (
        children
      )}
    </button>
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
