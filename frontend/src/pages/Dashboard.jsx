import { useState, useEffect } from 'react'
import api from '../services/api'
import Navbar from '../components/Navbar'
import Swal from 'sweetalert2'

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
  // Tatlı bir uyarı penceresi açıyoruz
  Swal.fire({
    title: 'Emin misiniz?',
    text: "Bu görev kalıcı olarak silinecek!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444', // Tailwind red-500 (Sil butonu)
    cancelButtonColor: '#6b7280',  // Tailwind gray-500 (Vazgeç butonu)
    confirmButtonText: 'Evet, sil!',
    cancelButtonText: 'Vazgeç',
    background: '#1f2937',        // Koyu tema arka planı
    color: '#ffffff',             // Beyaz yazı rengi
    iconColor: '#f87171'          // Uyarı ikonunun rengi
  }).then(async (result) => {
    // Eğer kullanıcı "Evet, sil!" butonuna bastıysa
    if (result.isConfirmed) {
      try {
        // Senin orijinal silme mantığın:
        await api.delete(`/tasks/${id}`)
        setTasks(tasks.filter((t) => t._id !== id))

        // Silme başarılı olduktan sonra küçük bir bildirim (isteğe bağlı)
        Swal.fire({
          title: 'Silindi!',
          text: 'Görev başarıyla silindi.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: '#1f2937',
          color: '#ffffff'
        })
      } catch (error) {
        // Bir hata oluşursa kullanıcıyı bilgilendir
        Swal.fire({
          title: 'Hata!',
          text: 'Görev silinirken bir sorun oluştu.',
          icon: 'error',
          background: '#1f2937',
          color: '#ffffff'
        })
      }
    }
  })
}

  return (
    // dark:bg-gray-900 eklendi, min-h-screen tüm sayfayı kapsar
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      <div className="p-8">
        {/* Başlık rengi dinamik yapıldı */}
        <h1 className="text-3xl font-bold mb-8 dark:text-white">Task Board</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {columns.map((col) => (
            // Kolon kartları dark:bg-gray-800 yapıldı
            <div key={col.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg border dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4 dark:text-gray-100">{col.title}</h2>
              
              {tasks
                .filter((task) => task.status === col.id)
                .map((task) => (
                  // Görev kartları dark:bg-gray-700 yapıldı
                  <div key={task._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-2 border dark:border-gray-600 shadow-sm">
                    <div className="flex justify-between items-start">
                      <p className="font-medium dark:text-white">{task.title}</p>
                    <button
                      onClick={() => handleDelete(task._id)} // Burada sadece fonksiyonu çağır, başka bir şey yazma
                      className="text-red-400 hover:text-red-600 text-sm ml-2"
                    >
                      ✕
                    </button>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{task.description}</p>
                    
                    {/* Priority Badge düzenlendi */}
                    <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block font-semibold ${
                      task.priority === 'high' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                      'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {task.priority.toUpperCase()}
                    </span>

                    {/* Taşıma butonları dark uyumlu hale getirildi */}
                    <div className="flex flex-wrap gap-1 mt-3">
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
                            className="text-[10px] bg-gray-200 dark:bg-gray-600 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 px-2 py-1 rounded transition"
                          >
                            → {c.title.split(' ')[1]} {/* Sadece metni al (opsiyonel) */}
                          </button>
                        ))}
                    </div>
                  </div>
                ))}

              {activeColumn === col.id ? (
                <div className="mt-2 space-y-2">
                  <input
                    type="text"
                    placeholder="Görev başlığı"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full border dark:border-gray-600 rounded p-2 text-sm outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Açıklama"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full border dark:border-gray-600 rounded p-2 text-sm outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full border dark:border-gray-600 rounded p-2 text-sm outline-none dark:bg-gray-700 dark:text-white"
                  >
                    <option value="low">Düşük</option>
                    <option value="medium">Orta</option>
                    <option value="high">Yüksek</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddTask(col.id)}
                      className="flex-1 bg-blue-500 text-white py-1 rounded text-sm hover:bg-blue-600 font-medium"
                    >
                      Ekle
                    </button>
                    <button
                      onClick={() => setActiveColumn(null)}
                      className="flex-1 bg-gray-200 dark:bg-gray-600 dark:text-white py-1 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setActiveColumn(col.id)}
                  className="w-full text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-sm mt-2 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded hover:border-gray-400 transition"
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