import { useState, useEffect } from 'react'
import api from '../services/api'
import Navbar from '../components/Navbar'

function History() {
  const [tasks, setTasks] = useState([])
  const [search, setSearch] = useState('')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterDate, setFilterDate] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/tasks/history')
      .then((res) => setTasks(res.data))
      .finally(() => setLoading(false))
  }, [])

  const priorityConfig = {
    high: { label: 'Yuksek', class: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' },
    medium: { label: 'Orta', class: 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300' },
    low: { label: 'Dusuk', class: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' },
  }

  const getDateFilter = (task) => {
    if (filterDate === 'all') return true
    const completed = new Date(task.completedAt)
    const now = new Date()
    const diff = (now - completed) / (1000 * 60 * 60 * 24)
    if (filterDate === '7') return diff <= 7
    if (filterDate === '30') return diff <= 30
    if (filterDate === 'year') return completed.getFullYear() === now.getFullYear()
    return true
  }

  const filteredTasks = tasks
    .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
    .filter((t) => filterPriority === 'all' || t.priority === filterPriority)
    .filter(getDateFilter)

  const firstArchiveDate = tasks.length > 0
    ? new Date(tasks[tasks.length - 1].completedAt).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
    : '-'

  const highCount = tasks.filter((t) => t.priority === 'high').length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="p-4 md:p-8">

        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-5 md:p-6 mb-6 text-white shadow-lg">
          <h1 className="text-xl md:text-2xl font-bold">Arsiv Gecmisi</h1>
          <p className="text-violet-200 mt-1 text-sm">Tamamlanip arsivlenen gorevlerin burada listelenir.</p>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div>
              <p className="text-2xl md:text-3xl font-bold">{tasks.length}</p>
              <p className="text-violet-200 text-xs md:text-sm">Toplam Arsiv</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold">{highCount}</p>
              <p className="text-violet-200 text-xs md:text-sm">Yuksek Oncelikli</p>
            </div>
            <div>
              <p className="text-lg md:text-2xl font-bold">{firstArchiveDate}</p>
              <p className="text-violet-200 text-xs md:text-sm">Ilk Arsiv</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Arsivde ara..."
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
          <select
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border border-gray-200 rounded-xl p-3 text-sm outline-none bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600"
          >
            <option value="all">Tum Zamanlar</option>
            <option value="7">Son 7 gun</option>
            <option value="30">Son 30 gun</option>
            <option value="year">Bu yil</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Yukleniyor...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-lg font-medium">Arsivde gorev bulunamadi</p>
            <p className="text-sm mt-1">Tamamlanan gorevler gece yarisi otomatik olarak arsivlenir.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredTasks.map((task) => (
              <div
                key={task._id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-5 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2 gap-2">
                  <p className="font-semibold text-gray-800 dark:text-white text-sm md:text-base">{task.title}</p>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${priorityConfig[task.priority].class}`}>
                    {priorityConfig[task.priority].label}
                  </span>
                </div>
                {task.description && (
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-3">{task.description}</p>
                )}
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <span className="text-xs bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300 px-2 py-1 rounded-full font-medium">
                    Arsivlendi
                  </span>
                  <span className="text-xs text-gray-400">
                    {task.completedAt
                      ? new Date(task.completedAt).toLocaleDateString('tr-TR', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })
                      : '-'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default History
