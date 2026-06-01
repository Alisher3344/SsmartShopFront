// MyID ma'lumotlarini ko'rsatuvchi shared komponent.
//
// Foydalanish:
//   <MyIdCard user={user} lang={lang} />                  // o'z profili — to'liq
//   <MyIdCard user={user} lang={lang} compact />          // oddiy user uchun 6 maydon
//   <MyIdCard user={user} hideUnverified />               // tasdiqlanmagan bo'lsa hech narsa
//   <MyIdCard user={user} isOwn={false} />                // admin ko'rinishi — "Yangilash" tugma yo'q
//
//   <MyIdBadge user={user} size="sm" />                   // kichik tasdiqlangan shield
//
// Default: isOwn=true, compact=false, hideUnverified=false.

import {
  ShieldCheck, User as UserIcon, MapPin, Calendar, FileText,
  Phone as PhoneIcon, Mail, Globe, RefreshCcw,
} from 'lucide-react';
import {
  MYID_START_URL, parseMyIdProfile, isMyIdVerified,
  t as myidT, formatDateDisplay, formatGender,
} from '../lib/myid';

// Oddiy user uchun ko'rsatiladigan asosiy 6 maydon
const COMPACT_FIELDS = ['fio', 'pinfl', 'passport', 'birthDate', 'permanentAddress', 'phone'];

// Field meta: helper to get icon + display value for each field key
function fieldMeta(key, profile, lang) {
  switch (key) {
    case 'fio':              return { icon: UserIcon,  value: profile.fio };
    case 'pinfl':            return { icon: FileText,  value: profile.pinfl, mono: true };
    case 'passport':         return { icon: FileText,  value: profile.passport, mono: true };
    case 'docType':          return { icon: FileText,  value: profile.docType };
    case 'issuedDate':       return { icon: Calendar,  value: profile.issuedDate };
    case 'birthDate':        return { icon: Calendar,  value: formatDateDisplay(profile.birthDate, lang) };
    case 'gender':           return { icon: UserIcon,  value: formatGender(profile.gender, lang) };
    case 'citizenship':      return { icon: Globe,     value: profile.citizenship };
    case 'nationality':      return { icon: Globe,     value: profile.nationality };
    case 'permanentAddress': return { icon: MapPin,    value: profile.permanentAddress };
    case 'temporaryAddress': return { icon: MapPin,    value: profile.temporaryAddress };
    case 'phone':            return { icon: PhoneIcon, value: profile.phone };
    case 'email':            return { icon: Mail,      value: profile.email };
    default:                 return { icon: FileText,  value: null };
  }
}

export default function MyIdCard({
  user,
  lang = 'uz',
  compact = false,
  hideUnverified = false,
  isOwn = true,
}) {
  const profile = parseMyIdProfile(user);

  // Tasdiqlanmagan ko'rinish
  if (!profile?.verified) {
    if (hideUnverified) return null;
    // O'z profilida — CTA banner
    return (
      <div className="card p-5 mb-4 border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 mb-1 flex items-center gap-2 flex-wrap">
              <span>{lang === 'ru' ? 'MyID идентификация' : 'MyID identifikatsiya'}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                {lang === 'ru' ? 'опционально' : 'ixtiyoriy'}
              </span>
            </div>
            <p className="text-xs text-gray-600 mb-3 leading-relaxed">{myidT('verifyHint', lang)}</p>
            {isOwn && (
              <a
                href={MYID_START_URL}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
              >
                <ShieldCheck className="w-4 h-4" />
                {myidT('verifyCTA', lang)}
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Tasdiqlangan — qaysi maydonlar ko'rsatilishini compact aniqlaydi
  const keys = compact
    ? COMPACT_FIELDS
    : ['fio', 'pinfl', 'passport', 'docType', 'issuedDate', 'birthDate',
       'gender', 'citizenship', 'nationality', 'permanentAddress',
       'temporaryAddress', 'phone', 'email'];

  return (
    <div className="card mb-4 overflow-hidden">
      <div className="px-5 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 flex items-center gap-1.5 flex-wrap">
              <span>{myidT('verified', lang)}</span>
              {profile.authMethod && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-green-100 text-green-800 rounded">
                  {profile.authMethod}
                </span>
              )}
            </div>
            {profile.verifiedAt && (
              <div className="text-xs text-gray-500 mt-0.5">
                {myidT('verifiedAt', lang)}: {new Date(profile.verifiedAt).toLocaleString(lang === 'ru' ? 'ru-RU' : 'uz-UZ')}
              </div>
            )}
          </div>
        </div>
        {isOwn && (
          <a
            href={MYID_START_URL}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-medium rounded-lg transition flex-shrink-0"
            title={myidT('reverify', lang)}
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{myidT('reverify', lang)}</span>
          </a>
        )}
      </div>

      <div className="divide-y">
        {keys.map((k) => {
          const { icon, value, mono } = fieldMeta(k, profile, lang);
          if (!value) return null;
          return <Row key={k} icon={icon} label={myidT(k, lang)} value={value} mono={mono} />;
        })}
      </div>

      {!compact && (
        <div className="px-5 py-3 bg-gray-50 border-t text-xs text-gray-500 leading-relaxed">
          {lang === 'ru'
            ? 'Эти данные получены напрямую из государственной системы MyID. Чтобы их изменить — пройдите идентификацию заново.'
            : "Bu ma'lumotlar to'g'ridan-to'g'ri MyID davlat tizimidan olingan. O'zgartirish uchun qayta identifikatsiyadan o'ting."}
        </div>
      )}
    </div>
  );
}

function Row({ icon: Icon, label, value, mono = false }) {
  return (
    <div className="px-5 py-3 flex items-start gap-3">
      <Icon className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="text-[11px] text-gray-500 uppercase tracking-wide mb-0.5">{label}</div>
        <div className={`text-sm text-gray-900 ${mono ? 'font-mono' : ''} break-words`}>{value}</div>
      </div>
    </div>
  );
}

// ===== MyIdBadge — kichik shield ikon (Header, AdminUsers list, AdminOrders) =====
export function MyIdBadge({ user, size = 'sm', tooltip = true }) {
  if (!isMyIdVerified(user)) return null;
  const dim = size === 'xs' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <span
      className="inline-flex items-center justify-center"
      title={tooltip ? "MyID orqali tasdiqlangan" : undefined}
      aria-label="MyID verified"
    >
      <ShieldCheck className={`${dim} text-blue-600 fill-blue-100`} strokeWidth={2.5} />
    </span>
  );
}
