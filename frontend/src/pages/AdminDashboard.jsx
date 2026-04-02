import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Swal from 'sweetalert2'

function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const adminApi = {
    get: (url) => api.get(url, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }),
    delete: (url) => api.delete(url, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }),
  }

  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        adminApi.get('/admin/stats'),
        adminApi.get('/admin/users'),
      ])
      setStats(statsRes.data)
      setUsers(usersRes.data)
    } catch {
      localStorage.removeItem('adminToken')
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) {
      navigate('/login')
      return
    }
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleDeleteUser = async (id, name) => {
    const result = await Swal.fire({
      title: `${name} silinsin mi?`,
      text: 'Kullanicinin tum gorevleri de silinecek!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Evet, sil!',
      cancelButtonText: 'Iptal'
    })
    if (result.isConfirmed) {
      await adminApi.delete(`/admin/users/${id}`)
      setUsers(users.filter(u => u._id !== id))
      setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }))
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    navigate('/login')
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">

      <nav className="bg-gray-800 px-4 md:px-6 py-4 flex justify-between items-center sticky top-0 z-50 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center text-sm">
            🛡️
          </div>
          <h1 className="font-bold text-lg">Admin Paneli</h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <span className="hidden md:block text-xs text-gray-400">
            Son guncelleme: {new Date().toLocaleTimeString('tr-TR')}
          </span>
          <button
            onClick={fetchData}
            className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg transition"
          >
            Yenile
          </button>
          <button
            onClick={handleLogout}
            className="text-xs bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition"
          >
            Cikis
          </button>
        </div>
      </nav>

      <div className="p-4 md:p-6 max-w-7xl mx-auto">

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Toplam Kullanici', value: stats.totalUsers, color: 'text-violet-400', bg: 'bg-violet-900/30 border-violet-700' },
              { label: 'Toplam Gorev', value: stats.totalTasks, color: 'text-blue-400', bg: 'bg-blue-900/30 border-blue-700' },
              { label: 'Aktif Gorev', value: stats.activeTasks, color: 'text-green-400', bg: 'bg-green-900/30 border-green-700' },
              { label: 'Arsivlenen', value: stats.archivedTasks, color: 'text-amber-400', bg: 'bg-amber-900/30 border-amber-700' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} border rounded-2xl p-5 text-center`}>
                <p className={`text-3xl md:text-4xl font-bold ${s.color} mb-1`}>{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
          <div className="p-4 md:p-5 border-b border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <h2 className="font-bold text-lg">Kullanicilar</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Toplam {users.length} kullanici
              </p>
            </div>
            <input
              type="text"
              placeholder="Kullanici ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-600 rounded-xl px-4 py-2 text-sm outline-none focus:border-red-500 bg-gray-700 text-white w-full md:w-64"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700 text-xs text-gray-400">
                  <th className="text-left p-4">Kullanici</th>
                  <th className="text-left p-4 hidden md:table-cell">Kayit Tarihi</th>
                  <th className="text-center p-4">Toplam</th>
                  <th className="text-center p-4 hidden md:table-cell">Yapilacak</th>
                  <th className="text-center p-4 hidden md:table-cell">Devam</th>
                  <th className="text-center p-4 hidden md:table-cell">Tamamlandi</th>
                  <th className="text-center p-4 hidden md:table-cell">Arsiv</th>
                  <th className="text-center p-4">Islem</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user._id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-violet-900/50 flex items-center justify-center text-lg flex-shrink-0">
                          {user.avatar && !user.avatar.startsWith('http') ? user.avatar : '👤'}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-gray-400 hidden md:table-cell">
                      {new Date(user.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                    <td className="p-4 text-center text-sm font-bold text-white">{user.stats.total}</td>
                    <td className="p-4 text-center text-sm text-violet-400 hidden md:table-cell">{user.stats.todo}</td>
                    <td className="p-4 text-center text-sm text-amber-400 hidden md:table-cell">{user.stats.inProgress}</td>
                    <td className="p-4 text-center text-sm text-green-400 hidden md:table-cell">{user.stats.done}</td>
                    <td className="p-4 text-center text-sm text-gray-400 hidden md:table-cell">{user.stats.archived}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDeleteUser(user._id, user.name)}
                        className="text-xs bg-red-900/40 hover:bg-red-600 text-red-400 hover:text-white px-3 py-1.5 rounded-lg transition"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <div className="text-3xl mb-2">👥</div>
                <p className="text-sm">Kullanici bulunamadi</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
