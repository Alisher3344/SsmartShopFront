import { useState } from 'react'
import { Lock, User, AlertCircle, MapPin, Sun, Moon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function LoginPage() {
  const { login } = useAuth()
  const { isDark, toggle } = useTheme()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(form.username.trim().toLowerCase(), form.password)
    if (!result.success) {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <div
      className="pickup-shell min-h-screen flex items-center justify-center p-4 relative"
      style={{
        background: isDark
          ? 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124, 58, 237, 0.30), transparent), radial-gradient(ellipse 60% 50% at 80% 120%, rgba(109, 40, 217, 0.22), transparent), #0b0d12'
          : 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(139, 92, 246, 0.12), transparent), radial-gradient(ellipse 60% 50% at 90% 110%, rgba(245, 158, 11, 0.07), transparent), #f9fafb',
      }}
    >
      <button
        onClick={toggle}
        className="absolute top-4 right-4 p-2.5 rounded-full bg-white/80 backdrop-blur border border-gray-200 hover:bg-white shadow-md transition-colors z-10"
        title={isDark ? 'Light mode' : 'Dark mode'}
      >
        {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
      </button>
      <div className="w-full max-w-md pickup-fade-in">
        <div className="pickup-login-card rounded-2xl p-6 sm:p-8">
          <div
            className="w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center ring-1 ring-primary-500/20"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.18), rgba(106, 28, 199, 0.06))',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), 0 8px 24px -8px rgba(106, 28, 199, 0.4)',
            }}
          >
            <MapPin className="w-8 h-8 text-primary-600" />
          </div>

          <h1 className="text-2xl font-bold text-center mb-1">
            <span className="pickup-gradient-text">Punkt admin</span>
          </h1>
          <p className="text-center text-gray-500 text-sm mb-6">
            Username va parolni kiriting
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  required
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="qarshi_admin"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Parol</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  required
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Kirilmoqda...' : 'Kirish'}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-5">
            Login ma'lumotlarini super admin beradi
          </p>
        </div>
      </div>
    </div>
  )
}
