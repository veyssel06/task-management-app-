import { useState, useEffect } from 'react'
import api from '../services/api'
import Navbar from '../components/Navbar'

function Dashboard() {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' })
  const [activeColumn, setActiveColumn] = useState(null)

  useEffect(() => {
    api.get('/tasks').then((res) => setTasks(res.data))
  }, [])

  const columns = [
    { id: 'todo', title: '📌 Yapılacak' },
    { id: 'inProgress', title: '⚙️ Devam Ediyor' },
    { id: 'done', title: '✅ Tamamlandı' },
  ]

  const handleAddTask = async (status) => {
    if (!newTask.title) return
    const res = await api.post('/tasks', { ...newTask, status })
    setTasks([...tasks, res.data])
    setNewTask({ title: '', description: '', priority: 'medium' })
    setActiveColumn(null)
  }

  const handleDelete = async (id) => {
    await api.delete(`/tasks/${id}`)
    setTasks(tasks.filter((t) => t._id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Task Board</h1>
        <div className="grid grid-cols-3 gap-6">
          {columns.map((col) => (
            <div key={col.id} className="bg-white rounded-lg p-4 shadow">
              <h2 className="text-lg font-semibold mb-4">{col.title}</h2>
              {tasks
                .filter((task) => task.status === col.id)
                .map((task) => (
                  <div key={task._id} className="bg-gray-50 rounded-lg p-3 mb-2 border">
                    <div className="flex justify-between items-start">
                      <p className="font-medium">{task.title}</p>
                      <button
                        onClick={() => handleDelete(task._id)}
                        className="text-red-400 hover:text-red-600 text-sm ml-2"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-sm text-gray-500">{task.description}</p>
                    <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${task.priority === 'high' ? 'bg-red-100 text-red-600' : task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                      {task.priority}
                    </span>
                    <div className="flex gap-1 mt-2">
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
                            }}
                            className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                          >
                            → {c.title}
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              {activeColumn === col.id ? (
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Görev başlığı"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full border rounded p-2 mb-2 text-sm outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Açıklama (opsiyonel)"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full border rounded p-2 mb-2 text-sm outline-none focus:border-blue-500"
                  />
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full border rounded p-2 mb-2 text-sm outline-none"
                  >
                    <option value="low">Düşük</option>
                    <option value="medium">Orta</option>
                    <option value="high">Yüksek</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddTask(col.id)}
                      className="flex-1 bg-blue-500 text-white py-1 rounded text-sm hover:bg-blue-600"
                    >
                      Ekle
                    </button>
                    <button
                      onClick={() => setActiveColumn(null)}
                      className="flex-1 bg-gray-200 py-1 rounded text-sm hover:bg-gray-300"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setActiveColumn(col.id)}
                  className="w-full text-gray-400 hover:text-gray-600 text-sm mt-2 py-1 border border-dashed rounded hover:border-gray-400"
                >
                  + Görev Ekle
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard