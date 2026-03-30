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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold text-center mb-6">Kayıt Ol</h1>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Ad Soyad</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg p-2 outline-none focus:border-blue-500"
              placeholder="Adınız Soyadınız"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg p-2 outline-none focus:border-blue-500"
              placeholder="email@example.com"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg p-2 outline-none focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Kayıt olunuyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          Hesabın var mı?{' '}
          <a href="/login" className="text-blue-500 hover:underline">
            Giriş Yap
          </a>
        </p>
      </div>
    </div>
  )
}

export default Register