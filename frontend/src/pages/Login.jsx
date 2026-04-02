import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [logoClickCount, setLogoClickCount] = useState(0)
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminError, setAdminError] = useState('')
  const navigate = useNavigate()

  const handleLogoClick = () => {
    setLogoClickCount(prev => {
      const newCount = prev + 1
      if (newCount >= 5) {
        setShowAdminModal(true)
        return 0
      }
      return newCount
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return setError('Email ve sifre alanlari bos birakilamaz!')
    setLoading(true)
    setError('')
    try {
      const response = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', response.data.token)
      navigate('/dashboard')
    } catch {
      setError('Email veya sifre hatali!')
    } finally {
      setLoading(false)
    }
  }

  const handleAdminLogin = async (e) => {
    e.preventDefault()
    setAdminError('')
    try {
      const res = await api.post('/admin/login', { email: adminEmail, password: adminPassword })
      localStorage.setItem('adminToken', res.data.token)
      setShowAdminModal(false)
      navigate('/admin/dashboard')
    } catch {
      setAdminError('Gecersiz bilgiler!')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">

      {showAdminModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={(e) => { if (e.target === e.currentTarget) setShowAdminModal(false) }}
        >
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-white font-bold mb-4 text-lg">Admin</h2>
            {adminError && (
              <div className="bg-red-900/30 border border-red-700 text-red-400 p-2 rounded-lg mb-3 text-xs">
                {adminError}
              </div>
            )}
            <form onSubmit={handleAdminLogin} className="space-y-3">
              <input
                type="email"
                placeholder="Email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full border border-gray-600 rounded-xl p-3 text-sm outline-none bg-gray-700 text-white"
              />
              <input
                type="password"
                placeholder="Sifre"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full border border-gray-600 rounded-xl p-3 text-sm outline-none bg-gray-700 text-white"
              />
              <button
                type="submit"
                className="w-full bg-gray-600 hover:bg-gray-500 text-white py-2.5 rounded-xl text-sm transition"
              >
                Giris
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div
            onClick={handleLogoClick}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl mb-4 shadow-lg cursor-pointer select-none"
          >
            <span className="text-3xl">✅</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Task Manager</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Gorevlerini yonet, hedeflerine ulas</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Tekrar hos geldin</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Hesabina giris yap</p>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 p-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-xl p-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 bg-white dark:bg-gray-700 dark:text-white transition"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Sifre</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-xl p-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 bg-white dark:bg-gray-700 dark:text-white transition pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? 'Gizle' : 'Goster'}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50 shadow-md"
            >
              {loading ? 'Giris yapiliyor...' : 'Giris Yap'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-xs text-gray-400">
              <span className="bg-white dark:bg-gray-800 px-3">hesabin yok mu?</span>
            </div>
          </div>

          <a
            href="/register"
            className="block w-full text-center border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-xl text-sm font-medium hover:border-violet-400 hover:text-violet-600 transition"
          >
            Kayit Ol
          </a>
        </div>
      </div>
    </div>
  )
}

export default Login
