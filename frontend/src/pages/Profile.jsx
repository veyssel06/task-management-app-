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
  const [profileMessage, setProfileMessage] = useState('')
  const [profileError, setProfileError] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')
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
        setProfileError('Profil yüklenemedi!')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  useEffect(() => {
    if (profileMessage || profileError) {
      const timer = setTimeout(() => {
        setProfileMessage('')
        setProfileError('')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [profileMessage, profileError])

  useEffect(() => {
    if (passwordMessage || passwordError) {
      const timer = setTimeout(() => {
        setPasswordMessage('')
        setPasswordError('')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [passwordMessage, passwordError])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      await api.put('/user/profile', { name, avatar })
      setUser(prev => ({ ...prev, name, avatar }))
      setProfileMessage('Profil güncellendi!')
    } catch (err) {
      setProfileError('Güncelleme başarısız!')
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!currentPassword || !newPassword) {
      setPasswordError('Tüm alanları doldurunuz!')
      return
    }
    try {
      await api.put('/user/change-password', { currentPassword, newPassword })
      setPasswordMessage('Şifre başarıyla değiştirildi!')
      setCurrentPassword('')
      setNewPassword('')
    } catch (err) {
      setPasswordError('Mevcut şifre hatalı!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400 font-medium animate-pulse">Profil yükleniyor...</p>
      </div>
    )
  }

  const successRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Profilim</h1>

        {/* PROFİL */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-6 hover:shadow-lg transition">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center text-4xl overflow-hidden border-4 border-violet-200">
              {avatar && avatar.startsWith('http') ? (
                <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{avatar || '👤'}</span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{user?.name}</h2>
              <p className="text-gray-500">{user?.email}</p>
            </div>
          </div>

          {profileMessage && (
            <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-xl mb-4 text-sm">
              ✅ {profileMessage}
            </div>
          )}
          {profileError && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-sm">
              ⚠️ {profileError}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ad Soyad</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-xl p-3 outline-none focus:ring-2 focus:ring-violet-100 transition dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profil Fotoğrafı</label>
              <p className="text-xs text-gray-500 mb-2">Hazır avatar seç:</p>
              <div className="flex gap-2 mb-3 flex-wrap">
                {['👨‍💻', '👩‍💻', '🧑‍💼', '👨‍🎓', '👩‍🎓', '🦊', '🐻', '🐼', '🦁', '🐯'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatar(emoji)}
                    className={`w-10 h-10 text-xl rounded-xl border-2 transition ${
                      avatar === emoji ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-violet-300'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mb-2">Ya da resim linki yapıştır:</p>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="https://..."
              />
            </div>

            <button type="submit" className="bg-violet-500 text-white px-6 py-2 rounded-xl hover:bg-violet-600 transition">
              Güncelle
            </button>
          </form>
        </div>

        {/* İSTATİSTİK */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-6 hover:shadow-lg transition">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">📊 İstatistikler</h3>
          <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.total}</p>
            <p className="text-sm text-gray-500 dark:text-gray-300">Toplam</p>
          </div>
          <div className="bg-violet-50 dark:bg-violet-800 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-violet-500 dark:text-violet-200">{stats.todo}</p>
            <p className="text-sm text-gray-500 dark:text-violet-200">Yapılacak</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-800 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-amber-500 dark:text-amber-200">{stats.inProgress}</p>
            <p className="text-sm text-gray-500 dark:text-amber-200">Devam Ediyor</p>
          </div>
          <div className="bg-green-50 dark:bg-green-800 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-500 dark:text-green-200">{stats.done}</p>
            <p className="text-sm text-gray-500 dark:text-green-200">Tamamlandı</p>
          </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Görev Tamamlama Oranı</span>
              <span className="text-sm font-medium text-green-500">%{successRate}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-violet-500 to-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${successRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* ŞİFRE */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 hover:shadow-lg transition">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">🔒 Şifre Değiştir</h3>

          {passwordMessage && (
            <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-xl mb-4 text-sm">
              ✅ {passwordMessage}
            </div>
          )}
          {passwordError && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-sm">
              ⚠️ {passwordError}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <input
              type="password"
              placeholder="Mevcut şifre"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl p-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition"
            />
            <input
              type="password"
              placeholder="Yeni şifre"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl p-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition"
            />
            <button type="submit" className="bg-red-500 text-white px-6 py-2 rounded-xl hover:bg-red-600 transition">
              Şifreyi Değiştir
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Profile