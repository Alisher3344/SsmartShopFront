import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { XCircle, ArrowLeft, RefreshCcw } from 'lucide-react';
import { MYID_START_URL, t as tt } from '../lib/myid';

export default function MyIdFailPage() {
  const [params] = useSearchParams();
  const { i18n } = useTranslation();
  const lang = i18n.language === 'ru' ? 'ru' : 'uz';
  const reason = params.get('reason')
    || params.get('reason_code')
    || (lang === 'ru' ? 'Неизвестная ошибка' : "Noma'lum xatolik");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
          <XCircle className="w-12 h-12 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{tt('failTitle', lang)}</h1>
        <p className="text-gray-600 mb-2">
          {lang === 'ru' ? 'Ответ MyID:' : 'MyID javobi:'}
        </p>
        <p className="text-sm bg-red-50 text-red-700 rounded-lg px-4 py-3 mb-6 font-medium">{reason}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={MYID_START_URL}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
          >
            <RefreshCcw className="w-4 h-4" />
            {tt('retry', lang)}
          </a>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition"
          >
            <ArrowLeft className="w-4 h-4" />
            {tt('goHome', lang)}
          </Link>
        </div>
      </div>
    </div>
  );
}
