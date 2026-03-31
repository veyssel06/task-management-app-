import { useState, useEffect } from 'react'
import api from '../services/api'
import Navbar from '../components/Navbar'
import Swal from 'sweetalert2'
import confetti from 'canvas-confetti'

function Dashboard() {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' })
  const [activeColumn, setActiveColumn] = useState(null)
  const [search, setSearch] = useState('')
  const [filterPriority, setFilterPriority] = useState('all')
  const [user, setUser] = useState(null)

  useEffect(() => {
    api.get('/tasks').then((res) => setTasks(res.data))
    api.get('/user/profile').then((res) => setUser(res.data.user))
  }, [])

  const columns = [
    { id: 'todo', title: '📌 Yapılacak', color: 'from-violet-500 to-purple-600' },
    { id: 'inProgress', title: '⚙️ Devam Ediyor', color: 'from-amber-500 to-orange-500' },
    { id: 'done', title: '✅ Tamamlandı', color: 'from-emerald-500 to-green-600' },
  ]

  const fireConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
  }

  const handleAddTask = async (status) => {
    if (!newTask.title) return
    const res = await api.post('/tasks', { ...newTask, status })
    setTasks([...tasks, res.data])
    setNewTask({ title: '', description: '', priority: 'medium' })
    setActiveColumn(null)
    if (status === 'done') fireConfetti()
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Emin misiniz?',
      text: 'Bu görevi silmek istediğinize emin misiniz?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'Evet, sil!',
      cancelButtonText: 'İptal'
    })
    if (result.isConfirmed) {
      await api.delete(`/tasks/${id}`)
      setTasks(tasks.filter((t) => t._id !== id))
    }
  }

  const priorityConfig = {
    high: { label: 'Yüksek', class: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' },
    medium: { label: 'Orta', class: 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300' },
    low: { label: 'Düşük', class: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' },
  }

  const filteredTasks = (status) => tasks
    .filter((t) => t.status === status)
    .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
    .filter((t) => filterPriority === 'all' || t.priority === filterPriority)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="p-8">
        {user && (
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 mb-8 text-white shadow-lg">
            <h1 className="text-2xl font-bold">Hoş geldin, {user.name}! 👋</h1>
            <p className="text-violet-200 mt-1">
              Bugün {filteredTasks('todo').length} yapılacak, {filteredTasks('inProgress').length} devam eden görevin var.
            </p>
            <div className="flex gap-6 mt-4">
              <div>
                <p className="text-3xl font-bold">{tasks.length}</p>
                <p className="text-violet-200 text-sm">Toplam Görev</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{tasks.filter(t => t.status === 'done').length}</p>
                <p className="text-violet-200 text-sm">Tamamlanan</p>
              </div>
              <div>
                <p className="text-3xl font-bold">
                  {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0}%
                </p>
                <p className="text-violet-200 text-sm">Başarı Oranı</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="🔍 Görev ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl p-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600 transition"
          />
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="border border-gray-200 rounded-xl p-3 outline-none bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600"
          >
            <option value="all">Tüm Öncelikler</option>
            <option value="high">🔴 Yüksek</option>
            <option value="medium">🟡 Orta</option>
            <option value="low">🟢 Düşük</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {columns.map((col) => (
            <div key={col.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
              <div className={`bg-gradient-to-r ${col.color} p-4`}>
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-white">{col.title}</h2>
                  <span className="bg-white/30 text-white text-sm px-2 py-1 rounded-full">
                    {filteredTasks(col.id).length}
                  </span>
                </div>
              </div>

              <div className="p-4">
                {filteredTasks(col.id).map((task) => (
                  <div
                    key={task._id}
                    className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-3 border border-gray-100 dark:border-gray-600 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold text-gray-800 dark:text-white">{task.title}</p>
                      <button
                        onClick={() => handleDelete(task._id)}
                        className="text-gray-300 hover:text-red-500 transition ml-2"
                      >
                        ✕
                      </button>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{task.description}</p>
                    )}
                    <div className="flex justify-between items-center">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityConfig[task.priority].class}`}>
                        {priorityConfig[task.priority].label}
                      </span>
                      <div className="flex gap-1">
                        {columns
                          .filter((c) => c.id !== task.status)
                          .map((c) => (
                            <button
                              key={c.id}
                              onClick={async () => {
                                await api.put(`/tasks/${task._id}`, { status: c.id })
                                setTasks(tasks.map((t) =>
                                  t._id === task._id ? { ...t, status: c.id } : t
                                ))
                                if (c.id === 'done') fireConfetti()
                              }}
                              className="text-xs bg-gray-200 dark:bg-gray-600 dark:text-gray-300 hover:bg-violet-100 hover:text-violet-600 px-3 py-1 rounded-lg transition font-medium"
                            >
                              → {c.id === 'todo' ? 'Yapılacak' : c.id === 'inProgress' ? 'Devam' : 'Bitti'}
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                ))}

                {activeColumn === col.id ? (
                  <div className="mt-2 bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                    <input
                      type="text"
                      placeholder="Görev başlığı"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      className="w-full border border-gray-200 dark:border-gray-600 rounded-lg p-2 mb-2 text-sm outline-none focus:border-violet-500 bg-white dark:bg-gray-800 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Açıklama (opsiyonel)"
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      className="w-full border border-gray-200 dark:border-gray-600 rounded-lg p-2 mb-2 text-sm outline-none focus:border-violet-500 bg-white dark:bg-gray-800 dark:text-white"
                    />
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                      className="w-full border border-gray-200 dark:border-gray-600 rounded-lg p-2 mb-2 text-sm outline-none bg-white dark:bg-gray-800 dark:text-white"
                    >
                      <option value="low">🟢 Düşük</option>
                      <option value="medium">🟡 Orta</option>
                      <option value="high">🔴 Yüksek</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddTask(col.id)}
                        className="flex-1 bg-violet-500 text-white py-2 rounded-lg text-sm hover:bg-violet-600 transition"
                      >
                        Ekle
                      </button>
                      <button
                        onClick={() => setActiveColumn(null)}
                        className="flex-1 bg-gray-200 dark:bg-gray-600 dark:text-white py-2 rounded-lg text-sm hover:bg-gray-300 transition"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveColumn(col.id)}
                    className="w-full text-gray-400 hover:text-violet-500 text-sm mt-2 py-2 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl hover:border-violet-300 transition"
                  >
                    + Görev Ekle
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard