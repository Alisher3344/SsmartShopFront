import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2, ShieldCheck, User as UserIcon, MapPin, Calendar,
  FileText, Phone, Mail, Globe, ArrowRight, AlertTriangle, Loader2,
} from 'lucide-react';
import {
  MYID_START_URL, parseMyIdProfile, t as tt, formatDateDisplay,
  formatGender, formatAuthMethod,
} from '../lib/myid';

// /api/users/me ni URL'dan kelgan token bilan to'g'ridan-to'g'ri so'ramiz —
// authApi.me() admin slot tokenidan o'qiydi.
async function fetchMeWithToken(accessToken) {
  const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  const res = await fetch(`${base}/api/users/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      msg = data?.detail || data?.message || msg;
    } catch { /* skip */ }
    throw new Error(msg);
  }
  return res.json();
}

export default function MyIdSuccessPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const lang = i18n.language === 'ru' ? 'ru' : 'uz';
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const accessToken = params.get('access_token');
    if (!accessToken) {
      setError(lang === 'ru'
        ? 'Токен не найден. Попробуйте снова через MyID.'
        : "Token topilmadi. MyID orqali qaytadan urinib ko'ring.");
      setLoading(false);
      return;
    }

    // URL'dan tokenni o'chiramiz — history'da qolmasin
    window.history.replaceState({}, document.title, '/auth/myid/success');

    fetchMeWithToken(accessToken)
      .then((u) => {
        // Shop user auth slot'iga yozamiz (LoginModal bilan bir xil pattern)
        localStorage.setItem('ssmart_user_token', accessToken);
        localStorage.setItem('ssmart_user', JSON.stringify(u));
        window.dispatchEvent(new Event('ssmart-user-changed'));
        setUser(u);
      })
      .catch((e) => setError(e.message || (lang === 'ru' ? 'Профиль не загружен' : 'Profil yuklanmadi')))
      .finally(() => setLoading(false));
  }, [params, lang]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">
            {lang === 'ru' ? 'Загрузка данных...' : "Ma'lumotlar yuklanmoqda..."}
          </p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {lang === 'ru' ? 'Ошибка' : 'Xatolik'}
          </h1>
          <p className="text-gray-600 mb-6">
            {error || (lang === 'ru' ? 'Пользователь не найден' : 'Foydalanuvchi topilmadi')}
          </p>
          <a
            href={MYID_START_URL}
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
          >
            {tt('retry', lang)}
          </a>
        </div>
      </div>
    );
  }

  const p = parseMyIdProfile(user);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-center border-2 border-green-100">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{tt('successTitle', lang)}</h1>
          <p className="text-gray-600 mb-1">{tt('successHint', lang)}</p>
          {p.authMethod && (
            <div className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-green-50 rounded-full text-sm text-green-700 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>{formatAuthMethod(p.authMethod, lang)}</span>
            </div>
          )}
        </div>

        {/* Profile data */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-blue-600" />
              {lang === 'ru' ? 'Подтверждённые данные' : "Tasdiqlangan ma'lumotlar"}
            </h2>
          </div>
          <div className="divide-y">
            <Field icon={UserIcon} label={tt('fio', lang)} value={p.fio} />
            <Field icon={FileText} label={tt('pinfl', lang)} value={p.pinfl} mono />
            <Field icon={FileText} label={tt('passport', lang)} value={p.passport} mono />
            <Field icon={FileText} label={tt('docType', lang)} value={p.docType} />
            <Field icon={Calendar} label={tt('issuedDate', lang)} value={p.issuedDate} />
            <Field icon={Calendar} label={tt('birthDate', lang)} value={formatDateDisplay(p.birthDate, lang)} />
            <Field icon={UserIcon} label={tt('gender', lang)} value={formatGender(p.gender, lang)} />
            <Field icon={Globe} label={tt('citizenship', lang)} value={p.citizenship} />
            <Field icon={Globe} label={tt('nationality', lang)} value={p.nationality} />
            <Field icon={MapPin} label={tt('permanentAddress', lang)} value={p.permanentAddress} />
            <Field icon={MapPin} label={tt('temporaryAddress', lang)} value={p.temporaryAddress} />
            <Field icon={Phone} label={tt('phone', lang)} value={p.phone} />
            <Field icon={Mail} label={tt('email', lang)} value={p.email} />
            {p.verifiedAt && (
              <Field
                icon={ShieldCheck}
                label={tt('verifiedAt', lang)}
                value={new Date(p.verifiedAt).toLocaleString(lang === 'ru' ? 'ru-RU' : 'uz-UZ')}
              />
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <p className="text-sm text-gray-500 mb-4">
            {lang === 'ru'
              ? 'Кредит (рассрочка) скоро будет доступен. Пока вы можете пользоваться сайтом как обычный пользователь.'
              : "Kredit (rassrochka) xizmati tez orada ulanadi. Hozircha siz oddiy foydalanuvchi sifatida sayt bilan ishlashingiz mumkin."}
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition shadow-md hover:shadow-lg"
          >
            {tt('continue', lang)}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, value, mono = false }) {
  if (!value) return null;
  return (
    <div className="px-6 py-4 flex items-start gap-4 hover:bg-gray-50">
      <Icon className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</div>
        <div className={`text-gray-900 ${mono ? 'font-mono' : ''} break-words`}>{value}</div>
      </div>
    </div>
  );
}
