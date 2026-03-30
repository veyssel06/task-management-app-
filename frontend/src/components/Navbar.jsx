import { useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow px-8 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-blue-500">Task Manager</h1>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
      >
        Çıkış Yap
      </button>
    </nav>
  )
}

export default Navbar