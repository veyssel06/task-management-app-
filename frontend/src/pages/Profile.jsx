import { useState, useEffect } from 'react'
import api from '../services/api'
import Navbar from '../components/Navbar'

function Profile() {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({ total: 0, todo: 0, inProgress: 0, done: 0 })
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/user/profile')

        setUser(res.data.user)
        setStats(res.data.stats || { total: 0, todo: 0, inProgress: 0, done: 0 })

        setName(res.data.user.name || '')
        setAvatar(res.data.user.avatar || '')

      } catch (err) {
        setError('Profil yüklenemedi!')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage('')
        setError('')
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [message, error])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()

    try {
      await api.put('/user/profile', { name, avatar })

      setUser(prev => ({
        ...prev,
        name,
        avatar
      }))

      setMessage('Profil güncellendi!')

    } catch (err) {
      setError('Güncelleme başarısız!')
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()

    if (!currentPassword || !newPassword) {
      setError('Tüm alanları doldurunuz!')
      return
    }

    try {
      await api.put('/user/change-password', {
        currentPassword,
        newPassword
      })

      setMessage('Şifre başarıyla değiştirildi!')

      setCurrentPassword('')
      setNewPassword('')

    } catch (err) {
      setError('Mevcut şifre hatalı!')
    }
  }

if (loading) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center transition-colors">
      {/* Hafif mavi bir loading halkası (isteğe bağlı) */}
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400 font-medium animate-pulse">
        Profil yükleniyor...
      </p>
    </div>
  )
}

  const successRate =
    stats.total > 0
      ? Math.round((stats.done / stats.total) * 100)
      : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">

      <Navbar />

      <div className="max-w-3xl mx-auto p-8">

        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
          Profilim
        </h1>

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-xl mb-4 text-sm">
            ✅ {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* PROFİL */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-6 hover:shadow-lg transition">

          <div className="flex items-center gap-6 mb-6">

            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-4xl overflow-hidden">

              {avatar ? (
                <img
                  src={avatar}
                  alt="avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => e.target.style.display = 'none'}
                />
              ) : (
                '👤'
              )}

            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {user?.name}
              </h2>

              <p className="text-gray-500">
                {user?.email}
              </p>
            </div>

          </div>

          <form
            onSubmit={handleUpdateProfile}
            className="space-y-4"
          >

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ad Soyad
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-100 transition
                          dark:bg-gray-700 dark:text-white dark:placeholder-gray-500" // BU SATIRI EKLEYİN
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Profil Fotoğrafı URL
              </label>

              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://..."
                className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-xl hover:bg-blue-600 transition"
            >
              Güncelle
            </button>

          </form>

        </div>


        {/* İSTATİSTİK */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-6 hover:shadow-lg transition">

          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
            📊 İstatistikler
          </h3>

          <div className="grid grid-cols-4 gap-4 mb-6">

            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-gray-800">
                {stats.total}
              </p>
              <p className="text-sm text-gray-500">
                Toplam
              </p>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-blue-500">
                {stats.todo}
              </p>
              <p className="text-sm text-gray-500">
                Yapılacak
              </p>
            </div>

            <div className="bg-yellow-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-yellow-500">
                {stats.inProgress}
              </p>
              <p className="text-sm text-gray-500">
                Devam Ediyor
              </p>
            </div>

            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-500">
                {stats.done}
              </p>
              <p className="text-sm text-gray-500">
                Tamamlandı
              </p>
            </div>

          </div>


          {/* progress bar */}

          <div>

            <div className="flex justify-between mb-1">

              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Görev Tamamlama Oranı
              </span>

              <span className="text-sm font-medium text-green-500">
                %{successRate}
              </span>

            </div>

            <div className="w-full bg-gray-200 rounded-full h-3">

              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${successRate}%` }}
              />

            </div>

          </div>

        </div>



        {/* ŞİFRE */}
<div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 hover:shadow-lg transition">
  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
    🔒 Şifre Değiştir
  </h3>

  <form
    onSubmit={handleChangePassword}
    className="space-y-4"
  >
    <input
      type="password"
      placeholder="Mevcut şifre"
      value={currentPassword}
      onChange={(e) => setCurrentPassword(e.target.value)}
      /* dark:bg-gray-700 ve dark:text-white sınıfları eklendi */
      className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition placeholder-gray-400 dark:placeholder-gray-500"
    />

    <input
      type="password"
      placeholder="Yeni şifre"
      value={newPassword}
      onChange={(e) => setNewPassword(e.target.value)}
      /* Aynı sınıfları yeni şifre inputu için de ekledik */
      className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition placeholder-gray-400 dark:placeholder-gray-500"
    />

    <button
      type="submit"
      className="bg-red-500 text-white px-6 py-2 rounded-xl hover:bg-red-600 transition"
    >
      Şifreyi Değiştir
    </button>
  </form>
</div>

      </div>

    </div>
  )
}

export default Profile