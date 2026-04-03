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
      const message = `${todo} yapılacak, ${inProgress} devam eden görevin var.`
      setNotifications([{
        id: Date.now(),
        text: message,
        read: false,
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      }])
      const granted = await requestPermission()
      if (granted) sendBrowserNotification('Günlük Görev Özeti', message)
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
      title: 'Çıkış yapmak istediğinize emin misiniz?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6366f1',
      cancelButtonColor: '#374151',
      confirmButtonText: 'Evet, çıkış yap',
      cancelButtonText: 'İptal',
      background: dark ? '#111827' : '#fff',
      color: dark ? '#f9fafb' : '#111827',
    })
    if (result.isConfirmed) {
      localStorage.removeItem('token')
      navigate('/login')
    }
  }

  const navLinks = [
    {
      path: '/dashboard',
      label: 'Board',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
      )
    },
    {
      path: '/history',
      label: 'Arşiv',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      )
    },
    {
      path: '/profile',
      label: 'Profil',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
  ]

  return (
    <>
      <style>{`
        .nav-root {
          background: rgba(10, 10, 20, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(99, 102, 241, 0.15);
        }
        .dark .nav-root {
          background: rgba(6, 6, 12, 0.9);
        }
        .nav-root:not(.dark .nav-root) {
          background: rgba(255, 255, 255, 0.9);
          border-bottom: 1px solid rgba(99, 102, 241, 0.12);
        }
        .nav-logo-ring {
          position: relative;
          width: 36px; height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 20px rgba(99,102,241,0.4);
        }
        .nav-logo-ring::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 11px;
          background: linear-gradient(135deg, #6366f1, #c4b5fd, #6366f1);
          z-index: -1;
          animation: logoSpin 4s linear infinite;
        }
        @keyframes logoSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .nav-link {
          position: relative;
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 14px;
          border-radius: 10px;
          font-size: 13px; font-weight: 500;
          color: rgba(99,102,241,0.7);
          transition: all 0.2s ease;
          cursor: pointer;
          border: 1px solid transparent;
        }
        .nav-link:hover {
          background: rgba(99,102,241,0.08);
          color: #6366f1;
          border-color: rgba(99,102,241,0.15);
        }
        .nav-link.active {
          background: rgba(99,102,241,0.12);
          color: #6366f1;
          border-color: rgba(99,102,241,0.25);
        }
        .dark .nav-link { color: rgba(148,163,184,0.8); }
        .dark .nav-link:hover { color: #a5b4fc; background: rgba(99,102,241,0.12); }
        .dark .nav-link.active { color: #a5b4fc; background: rgba(99,102,241,0.18); border-color: rgba(99,102,241,0.3); }
        .nav-icon-btn {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: transparent;
          border: 1px solid rgba(99,102,241,0.15);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #6366f1;
        }
        .nav-icon-btn:hover {
          background: rgba(99,102,241,0.1);
          border-color: rgba(99,102,241,0.3);
          transform: scale(1.05);
        }
        .dark .nav-icon-btn { color: #a5b4fc; border-color: rgba(99,102,241,0.2); }
        .notif-dropdown {
          position: absolute;
          right: 0; top: calc(100% + 10px);
          width: 300px;
          background: white;
          border: 1px solid rgba(99,102,241,0.15);
          border-radius: 16px;
          box-shadow: 0 20px 60px -10px rgba(0,0,0,0.15);
          overflow: hidden;
          animation: dropIn 0.2s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        .dark .notif-dropdown {
          background: #0f172a;
          border-color: rgba(99,102,241,0.2);
          box-shadow: 0 20px 60px -10px rgba(0,0,0,0.5);
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .mobile-menu {
          background: white;
          border-top: 1px solid rgba(99,102,241,0.1);
          animation: slideDown 0.25s ease forwards;
        }
        .dark .mobile-menu {
          background: #0a0a14;
          border-color: rgba(99,102,241,0.15);
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .mobile-nav-link {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 20px;
          font-size: 14px; font-weight: 500;
          color: #64748b;
          transition: all 0.15s;
          cursor: pointer;
          border-left: 3px solid transparent;
        }
        .mobile-nav-link:hover { background: rgba(99,102,241,0.05); color: #6366f1; border-left-color: rgba(99,102,241,0.4); }
        .mobile-nav-link.active { background: rgba(99,102,241,0.08); color: #6366f1; border-left-color: #6366f1; }
        .dark .mobile-nav-link { color: #94a3b8; }
        .dark .mobile-nav-link:hover { color: #a5b4fc; background: rgba(99,102,241,0.1); }
        .dark .mobile-nav-link.active { color: #a5b4fc; background: rgba(99,102,241,0.15); }
        .badge-pulse {
          animation: badgePulse 2s infinite;
        }
        @keyframes badgePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
          50% { box-shadow: 0 0 0 4px rgba(239,68,68,0); }
        }
      `}</style>

      <nav className="nav-root sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-14">

            {/* Logo */}
            <div
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="nav-logo-ring">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <span className="text-sm font-bold tracking-tight text-gray-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                TaskFlow
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                >
                  {link.icon}
                  {link.label}
                </button>
              ))}
            </div>

            {/* Right Controls */}
            <div className="hidden md:flex items-center gap-2">
              {/* Notifications */}
              <div className="relative">
                <button onClick={handleBellClick} className="nav-icon-btn">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="badge-pulse absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showDropdown && (
                  <div className="notif-dropdown">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">Bildirimler</p>
                      {notifications.length > 0 && (
                        <span className="text-xs text-indigo-500 font-medium">Tümü okundu</span>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="py-10 text-center">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                        </div>
                        <p className="text-xs text-gray-400">Bildirim yok</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed">{n.text}</p>
                              <p className="text-[11px] text-gray-400 mt-1">{n.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Dark Mode */}
              <button onClick={() => setDark(!dark)} className="nav-icon-btn">
                {dark ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="nav-icon-btn"
                title="Çıkış Yap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>

            {/* Mobile Right */}
            <div className="flex md:hidden items-center gap-2">
              <button onClick={() => setDark(!dark)} className="nav-icon-btn">
                {dark ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              <button onClick={() => setMobileOpen(!mobileOpen)} className="nav-icon-btn">
                {mobileOpen ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="mobile-menu md:hidden py-2">
            {navLinks.map(link => (
              <button
                key={link.path}
                onClick={() => { navigate(link.path); setMobileOpen(false) }}
                className={`mobile-nav-link w-full ${location.pathname === link.path ? 'active' : ''}`}
              >
                {link.icon}
                {link.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="mobile-nav-link w-full text-red-500 dark:text-red-400 hover:!text-red-500 hover:!bg-red-50 dark:hover:!bg-red-950/20 hover:!border-l-red-400"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Çıkış Yap
            </button>
          </div>
        )}
      </nav>
    </>
  )
}

export default Navbar
