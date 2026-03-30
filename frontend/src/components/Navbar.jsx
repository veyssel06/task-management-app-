import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // 1. Başlangıç değerini LocalStorage'dan alıyoruz
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark'
  })

  const isProfilePage = location.pathname === '/profile'

  // 2. Tema değişimini hem HTML class'ına hem de LocalStorage'a işliyoruz
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow px-8 py-4 flex justify-between items-center transition-colors duration-300">
      <h1 className="text-xl font-bold text-blue-500">Task Manager</h1>

      <div className="flex gap-3 items-center">
        <Link
          to={isProfilePage ? "/dashboard" : "/profile"}
          className="bg-gray-200 dark:bg-gray-700 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          {isProfilePage ? '📊 Dashboard' : '👤 Profile'}
        </Link>

        <button
          onClick={() => setDark(!dark)}
          className="bg-gray-200 dark:bg-gray-700 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          {dark ? '☀️ LIGHT' : '🌙 DARK'}
        </button>

        <button
          onClick={handleLogout}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          Çıkış Yap
        </button>
      </div>
    </nav>
  )
}

export default Navbar