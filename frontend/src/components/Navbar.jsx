import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [dark, setDark] = useState(false)

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [dark])

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Çıkış yapmak istediğinize emin misiniz?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'Evet, çıkış yap!',
      cancelButtonText: 'İptal'
    })

    if (result.isConfirmed) {
      localStorage.removeItem('token')
      navigate('/login')
    }
  }

  return (
    <nav className="bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-4 flex justify-between items-center shadow-lg">
      <div
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 cursor-pointer"
      >
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
          <span className="text-violet-600 font-bold text-sm">T</span>
        </div>
        <h1 className="text-xl font-bold text-white">Task Manager</h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/dashboard')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            location.pathname === '/dashboard'
              ? 'bg-white text-violet-600'
              : 'text-white hover:bg-white/20'
          }`}
        >
          📋 Board
        </button>
        <button
          onClick={() => navigate('/profile')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            location.pathname === '/profile'
              ? 'bg-white text-violet-600'
              : 'text-white hover:bg-white/20'
          }`}
        >
          👤 Profil
        </button>
        <button
          onClick={() => setDark(!dark)}
          className="w-9 h-9 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
        >
          {dark ? '☀️' : '🌙'}
        </button>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-white/20 text-white hover:bg-white/30 transition"
        >
          Çıkış →
        </button>
      </div>
    </nav>
  )
}

export default Navbar