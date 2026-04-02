import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !email || !password) {
      setError('Tüm alanları doldurunuz!')
      return
    }
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/register', { name, email, password })
      navigate('/login')
    } catch (err) {
      setError('Kayıt olurken bir hata oluştu!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl">✅</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Task Manager</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Görevlerini yönet, hedeflerine ulaş</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Kayıt Ol</h2>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 p-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ad Soyad</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-xl p-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 bg-white dark:bg-gray-700 dark:text-white transition"
                placeholder="Adınız Soyadınız"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-xl p-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 bg-white dark:bg-gray-700 dark:text-white transition"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Şifre</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-xl p-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 bg-white dark:bg-gray-700 dark:text-white transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50 shadow-md"
            >
              {loading ? 'Kayıt olunuyor...' : 'Kayıt Ol'}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-500 dark:text-gray-400 text-sm">
            Hesabin var mi?{' '}
            <a href="/login" className="text-violet-600 font-medium hover:underline">
              Giris Yap
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register