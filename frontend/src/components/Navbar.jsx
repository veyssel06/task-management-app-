import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

function Navbar() {
  const navigate = useNavigate()
  const [dark, setDark] = useState(false)

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [dark])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow px-8 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-blue-500">Task Manager</h1>
      <div className="flex gap-3">
        <button
          onClick={() => setDark(!dark)}
          className="bg-gray-200 dark:bg-gray-600 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-300"
        >
          {dark ? '☀️ LİGHT' : '🌙 DARK'}
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Çıkış Yap
        </button>
      </div>
    </nav>
  )
}

export default Navbar