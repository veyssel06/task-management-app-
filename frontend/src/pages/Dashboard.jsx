import { useState, useEffect } from 'react'
import api from '../services/api'
import Navbar from '../components/Navbar'
import Swal from 'sweetalert2'
import confetti from 'canvas-confetti'

function Dashboard() {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', dueDate: '' })
  const [activeColumn, setActiveColumn] = useState(null)
  const [search, setSearch] = useState('')
  const [filterPriority, setFilterPriority] = useState('all')
  const [user, setUser] = useState(null)
  const [editTask, setEditTask] = useState(null)

  useEffect(() => {
    api.get('/tasks').then((res) => setTasks(res.data))
    api.get('/user/profile').then((res) => setUser(res.data.user))
  }, [])

  const columns = [
    { id: 'todo', title: 'Yapilacak', emoji: 'P', color: 'from-violet-500 to-purple-600' },
    { id: 'inProgress', title: 'Devam Ediyor', emoji: 'D', color: 'from-amber-500 to-orange-500' },
    { id: 'done', title: 'Tamamlandi', emoji: 'T', color: 'from-emerald-500 to-green-600' },
  ]

  const fireConfetti = () => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
  }

  const handleAddTask = async (status) => {
    if (!newTask.title) return
    const res = await api.post('/tasks', { ...newTask, status })
    setTasks([...tasks, res.data])
    setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' })
    setActiveColumn(null)
    if (status === 'done') fireConfetti()
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Emin misiniz?',
      text: 'Bu gorevi silmek istediginize emin misiniz?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'Evet, sil!',
      cancelButtonText: 'Iptal'
    })
    if (result.isConfirmed) {
      await api.delete(`/tasks/${id}`)
      setTasks(tasks.filter((t) => t._id !== id))
    }
  }

  const handleMoveTask = async (task, targetId) => {
    const targetLabel = targetId === 'inProgress' ? 'Devam Ediyor' : 'Tamamlandi'
    const result = await Swal.fire({
      title: 'Gorevi tasi',
      text: `Bu gorevi "${targetLabel}" sutununa tasimak istiyor musunuz?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'Evet, tasi!',
      cancelButtonText: 'Iptal'
    })
    if (result.isConfirmed) {
      await api.put(`/tasks/${task._id}`, { status: targetId })
      setTasks(tasks.map((t) => t._id === task._id ? { ...t, status: targetId } : t))
      if (targetId === 'done') fireConfetti()
    }
  }

  const handleEditSave = async () => {
    if (!editTask.title) return
    const res = await api.put(`/tasks/${editTask._id}`, {
      title: editTask.title,
      description: editTask.description,
      priority: editTask.priority,
      dueDate: editTask.dueDate || null,
    })
    setTasks(tasks.map((t) => t._id === editTask._id ? res.data : t))
    setEditTask(null)
  }

  const getNextStatus = (currentStatus) => {
    if (currentStatus === 'todo') return 'inProgress'
    if (currentStatus === 'inProgress') return 'done'
    return null
  }

  const isDueExpired = (dueDate) => dueDate && new Date(dueDate) < new Date()

  const priorityConfig = {
    high: { label: 'Yuksek', class: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' },
    medium: { label: 'Orta', class: 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300' },
    low: { label: 'Dusuk', class: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' },
  }

  const filteredTasks = (status) => tasks
    .filter((t) => t.status === status)
    .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
    .filter((t) => filterPriority === 'all' || t.priority === filterPriority)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {editTask && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setEditTask(null) }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 w-full max-w-md shadow-xl">
            <h2 className="text-base font-bold text-gray-800 dark:text-white mb-4">Gorevi Duzenle</h2>
            <input
              type="text"
              placeholder="Gorev basligi"
              value={editTask.title}
              onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
              className="w-full border border-gray-200 dark:border-gray-600 rounded-xl p-3 mb-3 text-sm outline-none focus:border-violet-500 bg-white dark:bg-gray-700 dark:text-white"
            />
            <input
              type="text"
              placeholder="Aciklama (opsiyonel)"
              value={editTask.description || ''}
              onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
              className="w-full border border-gray-200 dark:border-gray-600 rounded-xl p-3 mb-3 text-sm outline-none focus:border-violet-500 bg-white dark:bg-gray-700 dark:text-white"
            />
            <select
              value={editTask.priority}
              onChange={(e) => setEditTask({ ...editTask, priority: e.target.value })}
              className="w-full border border-gray-200 dark:border-gray-600 rounded-xl p-3 mb-3 text-sm outline-none bg-white dark:bg-gray-700 dark:text-white"
            >
              <option value="low">Dusuk</option>
              <option value="medium">Orta</option>
              <option value="high">Yuksek</option>
            </select>
            <input
              type="date"
              value={editTask.dueDate ? editTask.dueDate.slice(0, 10) : ''}
              onChange={(e) => setEditTask({ ...editTask, dueDate: e.target.value })}
              className="w-full border border-gray-200 dark:border-gray-600 rounded-xl p-3 mb-4 text-sm outline-none focus:border-violet-500 bg-white dark:bg-gray-700 dark:text-white"
            />
            <div className="flex gap-3">
              <button onClick={handleEditSave} className="flex-1 bg-violet-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-violet-700 transition">
                Kaydet
              </button>
              <button onClick={() => setEditTask(null)} className="flex-1 bg-gray-100 dark:bg-gray-700 dark:text-white text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200 transition">
                Iptal
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 md:p-8">

        {user && (
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-5 md:p-6 mb-6 text-white shadow-lg">
            <h1 className="text-xl md:text-2xl font-bold">Hos geldin, {user.name}!</h1>
            <p className="text-violet-200 mt-1 text-sm">
              {filteredTasks('todo').length} yapilacak, {filteredTasks('inProgress').length} devam eden gorevin var.
            </p>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div>
                <p className="text-2xl md:text-3xl font-bold">{tasks.length}</p>
                <p className="text-violet-200 text-xs md:text-sm">Toplam Gorev</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold">{tasks.filter(t => t.status === 'done').length}</p>
                <p className="text-violet-200 text-xs md:text-sm">Tamamlanan</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold">
                  {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0}%
                </p>
                <p className="text-violet-200 text-xs md:text-sm">Basari Orani</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Gorev ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600 transition"
          />
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="border border-gray-200 rounded-xl p-3 text-sm outline-none bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600"
          >
            <option value="all">Tum Oncelikler</option>
            <option value="high">Yuksek</option>
            <option value="medium">Orta</option>
            <option value="low">Dusuk</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 items-start">
          {columns.map((col) => (
            <div key={col.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden flex flex-col min-h-[150px]">
              <div className={`bg-gradient-to-r ${col.color} p-4 flex-shrink-0`}>
                <div className="flex justify-between items-center">
                  <h2 className="text-base md:text-lg font-bold text-white">{col.title}</h2>
                  <span className="bg-white/30 text-white text-sm px-2 py-1 rounded-full">
                    {filteredTasks(col.id).length}
                  </span>
                </div>
              </div>

              <div className="p-3 md:p-4 overflow-y-auto flex-1">
                {filteredTasks(col.id).map((task) => {
                  const nextStatus = getNextStatus(task.status)
                  const expired = isDueExpired(task.dueDate)
                  return (
                    <div
                      key={task._id}
                      className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 md:p-4 mb-3 border border-gray-100 dark:border-gray-600 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold text-gray-800 dark:text-white text-sm md:text-base">{task.title}</p>
                        <div className="flex gap-2 ml-2 flex-shrink-0">
                          <button onClick={() => setEditTask(task)} className="text-gray-300 hover:text-violet-500 transition text-sm">
                            edit
                          </button>
                          <button onClick={() => handleDelete(task._id)} className="text-gray-300 hover:text-red-500 transition text-sm">
                            sil
                          </button>
                        </div>
                      </div>
                      {task.description && (
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-2">{task.description}</p>
                      )}
                      {task.dueDate && (
                        <p className={`text-xs mb-2 font-medium ${expired ? 'text-red-500' : 'text-gray-400'}`}>
                          {new Date(task.dueDate).toLocaleDateString('tr-TR')} {expired && '- Suresi doldu!'}
                        </p>
                      )}
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityConfig[task.priority].class}`}>
                          {priorityConfig[task.priority].label}
                        </span>
                        {nextStatus && (
                          <button
                            onClick={() => handleMoveTask(task, nextStatus)}
                            className="text-xs bg-gray-200 dark:bg-gray-600 dark:text-gray-300 hover:bg-violet-100 hover:text-violet-600 px-3 py-1 rounded-lg transition font-medium"
                          >
                            {nextStatus === 'inProgress' ? 'Devam' : 'Bitti'}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}

                {col.id === 'todo' && (
                  activeColumn === col.id ? (
                    <div className="mt-2 bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                      <input
                        type="text"
                        placeholder="Gorev basligi"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        className="w-full border border-gray-200 dark:border-gray-600 rounded-lg p-2 mb-2 text-sm outline-none focus:border-violet-500 bg-white dark:bg-gray-800 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Aciklama (opsiyonel)"
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        className="w-full border border-gray-200 dark:border-gray-600 rounded-lg p-2 mb-2 text-sm outline-none focus:border-violet-500 bg-white dark:bg-gray-800 dark:text-white"
                      />
                      <select
                        value={newTask.priority}
                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                        className="w-full border border-gray-200 dark:border-gray-600 rounded-lg p-2 mb-2 text-sm outline-none bg-white dark:bg-gray-800 dark:text-white"
                      >
                        <option value="low">Dusuk</option>
                        <option value="medium">Orta</option>
                        <option value="high">Yuksek</option>
                      </select>
                      <input
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                        className="w-full border border-gray-200 dark:border-gray-600 rounded-lg p-2 mb-2 text-sm outline-none focus:border-violet-500 bg-white dark:bg-gray-800 dark:text-white"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleAddTask(col.id)} className="flex-1 bg-violet-500 text-white py-2 rounded-lg text-sm hover:bg-violet-600 transition">
                          Ekle
                        </button>
                        <button onClick={() => setActiveColumn(null)} className="flex-1 bg-gray-200 dark:bg-gray-600 dark:text-white py-2 rounded-lg text-sm hover:bg-gray-300 transition">
                          Iptal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveColumn(col.id)}
                      className="w-full text-gray-400 hover:text-violet-500 text-sm mt-2 py-2 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl hover:border-violet-300 transition"
                    >
                      + Gorev Ekle
                    </button>
                  )
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
