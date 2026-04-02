import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import api from '../services/api'
import {
  requestPermission,
  sendBrowserNotification,
  shouldShowDailySummary,
  markDailySummaryShown
} from '../services/notifications'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [dark, setDark] = useState(() => localStorage.getItem('darkMode') === 'true')
  const [notifications, setNotifications] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('darkMode', 'true')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('darkMode', 'false')
    }
  }, [dark])

  useEffect(() => {
    const runDailySummary = async () => {
      if (!shouldShowDailySummary()) return
      const res = await api.get('/tasks')
      const tasks = res.data
      const todo = tasks.filter(t => t.status === 'todo').length
      const inProgress = tasks.filter(t => t.status === 'inProgress').length
      const total = todo + inProgress
      if (total === 0) return
      const message = `${todo} yapilacak, ${inProgress} devam eden gorevin var.`
      setNotifications([{
        id: Date.now(),
        text: message,
        read: false,
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      }])
      const granted = await requestPermission()
      if (granted) sendBrowserNotification('Gunluk Gorev Ozeti', message)
      markDailySummaryShown()
    }
    runDailySummary()
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const handleBellClick = () => {
    setShowDropdown(!showDropdown)
    if (!showDropdown) setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Cikis yapmak istediginize emin misiniz?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'Evet, cikis yap!',
      cancelButtonText: 'Iptal'
    })
    if (result.isConfirmed) {
      localStorage.removeItem('token')
      navigate('/login')
    }
  }

  const navLinks = [
    { path: '/dashboard', label: 'Board', icon: '📋' },
    { path: '/history', label: 'Gecmis', icon: '📦' },
    { path: '/profile', label: 'Profil', icon: '👤' },
  ]

  return (
    <nav className="bg-gradient-to-r from-violet-600 to-indigo-600 px-4 md:px-8 py-4 shadow-lg sticky top-0 z-50">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <div onClick={() => navigate('/dashboard')} className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-violet-600 font-bold text-sm">T</span>
          </div>
          <h1 className="text-lg font-bold text-white">Task Manager</h1>
        </div>

        {/* Desktop linkler */}
        <div className="hidden md:flex items-center gap-3">
          {navLinks.map(link => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                location.pathname === link.path ? 'bg-white text-violet-600' : 'text-white hover:bg-white/20'
              }`}
            >
              {link.icon} {link.label}
            </button>
          ))}

          {/* Bildirim */}
          <div className="relative">
            <button onClick={handleBellClick} className="w-9 h-9 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition relative">
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
            {showDropdown && (
              <div className="absolute right-0 top-12 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-50">
                <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="font-semibold text-gray-800 dark:text-white text-sm">Bildirimler</p>
                </div>
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-400 text-sm">
                    <div className="text-2xl mb-2">🔕</div>
                    Bildirim yok
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      <p className="text-sm text-gray-700 dark:text-gray-200">📋 {n.text}</p>
                      <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <button onClick={() => setDark(!dark)} className="w-9 h-9 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition">
            {dark ? '☀️' : '🌙'}
          </button>
          <button onClick={handleLogout} className="px-4 py-2 rounded-lg text-sm font-medium bg-white/20 text-white hover:bg-white/30 transition">
            Cikis
          </button>
        </div>

        {/* Mobil sag butonlar */}
        <div className="flex md:hidden items-center gap-2">
          <button onClick={() => setDark(!dark)} className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
            {dark ? '☀️' : '🌙'}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-lg">
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobil menu */}
      {mobileOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-2 pb-2">
          {navLinks.map(link => (
            <button
              key={link.path}
              onClick={() => { navigate(link.path); setMobileOpen(false) }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition ${
                location.pathname === link.path ? 'bg-white text-violet-600' : 'text-white hover:bg-white/20'
              }`}
            >
              {link.icon} {link.label}
            </button>
          ))}
          <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-white hover:bg-white/20 transition">
            🚪 Cikis
          </button>
        </div>
      )}
    </nav>
  )
}

export default Navbar