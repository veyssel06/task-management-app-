import { useState, useEffect } from 'react'
import api from '../services/api'
import Navbar from '../components/Navbar'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom'

function Profile() {
  const navigate = useNavigate()
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
      } catch {
        setProfileError('Profil yüklenemedi!')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  useEffect(() => {
    if (profileMessage || profileError) {
      const t = setTimeout(() => { setProfileMessage(''); setProfileError('') }, 3000)
      return () => clearTimeout(t)
    }
  }, [profileMessage, profileError])

  useEffect(() => {
    if (passwordMessage || passwordError) {
      const t = setTimeout(() => { setPasswordMessage(''); setPasswordError('') }, 3000)
      return () => clearTimeout(t)
    }
  }, [passwordMessage, passwordError])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      await api.put('/user/profile', { name, avatar })
      setUser(prev => ({ ...prev, name, avatar }))
      setProfileMessage('Profil güncellendi!')
    } catch {
      setProfileError('Güncelleme başarısız!')
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!currentPassword || !newPassword) return setPasswordError('Tüm alanları doldurunuz!')
    try {
      await api.put('/user/change-password', { currentPassword, newPassword })
      setPasswordMessage('Şifre başarıyla değiştirildi!')
      setCurrentPassword('')
      setNewPassword('')
    } catch {
      setPasswordError('Mevcut şifre hatalı!')
    }
  }

  const handleDeleteAccount = async () => {
    const result = await Swal.fire({
      title: 'Hesabını silmek istediğine emin misin?',
      text: 'Bu işlem geri alınamaz! Tüm görevlerin de silinecek.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'Evet, sil!',
      cancelButtonText: 'İptal'
    })
    if (result.isConfirmed) {
      await api.delete('/user/delete-account')
      localStorage.removeItem('token')
      navigate('/login')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400 animate-pulse">Profil yükleniyor...</p>
      </div>
    )
  }

  const successRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '-'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-4xl mx-auto p-8">

        {/* ── Hero Banner ── */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-8 mb-6 text-white shadow-lg">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-white/20 flex items-center justify-center text-5xl overflow-hidden border-2 border-white/30 flex-shrink-0">
              {avatar && avatar.startsWith('http') ? (
                <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{avatar || '👤'}</span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{user?.name}</h1>
              <p className="text-violet-200 text-sm mt-1">{user?.email}</p>
              <p className="text-violet-300 text-xs mt-1.5">📅 Katılma tarihi: {joinDate}</p>
            </div>
          </div>
        </div>

        {/* ── İstatistikler ── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-5">📊 İstatistikler</h3>
          <div className="grid grid-cols-4 gap-4 mb-5">
            {[
              { label: 'Toplam', value: stats.total, color: 'text-gray-700 dark:text-white', bg: 'bg-gray-50 dark:bg-gray-700', border: 'border-gray-200 dark:border-gray-600' },
              { label: 'Yapılacak', value: stats.todo, color: 'text-violet-600 dark:text-violet-300', bg: 'bg-violet-50 dark:bg-violet-900/40', border: 'border-violet-200 dark:border-violet-700' },
              { label: 'Devam', value: stats.inProgress, color: 'text-amber-500 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-900/40', border: 'border-amber-200 dark:border-amber-700' },
              { label: 'Tamamlandı', value: stats.done, color: 'text-green-600 dark:text-green-300', bg: 'bg-green-50 dark:bg-green-900/40', border: 'border-green-200 dark:border-green-700' },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-5 text-center`}>
                <p className={`text-5xl font-bold ${s.color} mb-1`}>{s.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-sm text-gray-600 dark:text-gray-300">Tamamlama Oranı</span>
              <span className="text-sm font-semibold text-violet-600 dark:text-violet-300">%{successRate}</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-violet-500 to-green-500 h-2.5 rounded-full transition-all duration-700"
                style={{ width: `${successRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Profil Düzenle ── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4">👤 Profili Düzenle</h3>

          {profileMessage && <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-xl mb-4 text-sm">✅ {profileMessage}</div>}
          {profileError && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-sm">⚠️ {profileError}</div>}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1.5">Ad Soyad</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-xl p-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 bg-white dark:bg-gray-700 dark:text-white transition"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">Avatar Seç</label>
              <div className="flex gap-2 flex-wrap mb-3">
                {['👨‍💻', '👩‍💻', '🧑‍💼', '👨‍🎓', '👩‍🎓', '🦊', '🐻', '🐼', '🦁', '🐯'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatar(emoji)}
                    className={`w-10 h-10 text-xl rounded-xl border-2 transition ${
                      avatar === emoji ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/40' : 'border-gray-200 dark:border-gray-600 hover:border-violet-300'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={avatar.startsWith('http') ? avatar : ''}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="ya da resim linki yapıştır (https://...)"
                className="w-full border border-gray-200 dark:border-gray-600 rounded-xl p-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 bg-white dark:bg-gray-700 dark:text-white transition"
              />
            </div>
            <button type="submit" className="bg-violet-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-violet-700 transition">
              Güncelle
            </button>
          </form>
        </div>

        {/* ── Şifre Değiştir ── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4">🔒 Şifre Değiştir</h3>

          {passwordMessage && <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-xl mb-4 text-sm">✅ {passwordMessage}</div>}
          {passwordError && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-sm">⚠️ {passwordError}</div>}

          <form onSubmit={handleChangePassword} className="space-y-3">
            <input
              type="password"
              placeholder="Mevcut şifre"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-600 rounded-xl p-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 bg-white dark:bg-gray-700 dark:text-white transition"
            />
            <input
              type="password"
              placeholder="Yeni şifre"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-600 rounded-xl p-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 bg-white dark:bg-gray-700 dark:text-white transition"
            />
            <button type="submit" className="bg-gray-800 dark:bg-gray-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-900 transition">
              Şifreyi Değiştir
            </button>
          </form>
        </div>

        {/* ── Hesabı Sil ── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-red-100 dark:border-red-900/40">
          <h3 className="text-base font-semibold text-red-600 mb-1">⚠️ Tehlikeli Bölge</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Hesabını silersen tüm görevlerin kalıcı olarak silinir, bu işlem geri alınamaz.</p>
          <button
            onClick={handleDeleteAccount}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition"
          >
            Hesabı Sil
          </button>
        </div>

      </div>
    </div>
  )
}

export default Profile