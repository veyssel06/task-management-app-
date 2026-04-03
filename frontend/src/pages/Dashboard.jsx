import { useState, useEffect, useRef } from 'react'
import api from '../services/api'
import Navbar from '../components/Navbar'
import Swal from 'sweetalert2'
import confetti from 'canvas-confetti'

/* ─── Design tokens & global styles ─────────────────────────────────────── */
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  :root {
    --col-todo:  #6366f1;
    --col-prog:  #f59e0b;
    --col-done:  #10b981;
    --surface:   #ffffff;
    --bg:        #f4f4f8;
    --border:    rgba(0,0,0,0.06);
    --text:      #0f172a;
    --muted:     #64748b;
    --radius:    14px;
  }
  .dark {
    --surface:   #0f172a;
    --bg:        #080812;
    --border:    rgba(255,255,255,0.07);
    --text:      #f1f5f9;
    --muted:     #64748b;
  }

  body { font-family: 'Plus Jakarta Sans', sans-serif; }

  /* Scrollbar */
  .col-scroll::-webkit-scrollbar { width: 4px; }
  .col-scroll::-webkit-scrollbar-track { background: transparent; }
  .col-scroll::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.2); border-radius: 4px; }

  /* Animations */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-10px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes cardPop {
    0%   { transform: scale(1); }
    45%  { transform: scale(1.04); }
    100% { transform: scale(1); }
  }
  @keyframes shimmer {
    from { transform: translateX(-100%); }
    to   { transform: translateX(100%); }
  }
  @keyframes progressFill {
    from { width: 0%; }
    to   { width: var(--target); }
  }
  @keyframes orbit {
    from { transform: rotate(0deg) translateX(60px) rotate(0deg); }
    to   { transform: rotate(360deg) translateX(60px) rotate(-360deg); }
  }
  @keyframes pulseRing {
    0%   { transform: scale(1); opacity: 0.4; }
    100% { transform: scale(2); opacity: 0; }
  }

  .fade-up       { animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
  .fade-up-1     { animation: fadeUp 0.45s 0.05s cubic-bezier(0.22,1,0.36,1) both; }
  .fade-up-2     { animation: fadeUp 0.45s 0.1s  cubic-bezier(0.22,1,0.36,1) both; }
  .fade-up-3     { animation: fadeUp 0.45s 0.15s cubic-bezier(0.22,1,0.36,1) both; }
  .slide-in      { animation: slideIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }
  .card-pop      { animation: cardPop 0.4s cubic-bezier(0.34,1.56,0.64,1); }

  /* Task card */
  .task-card {
    transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
    cursor: grab;
  }
  .task-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px -6px rgba(0,0,0,0.15);
  }
  .task-card:active { cursor: grabbing; }
  .task-card.dragging {
    opacity: 0.35;
    transform: rotate(3deg) scale(0.96);
  }

  /* Drop zone */
  .drop-zone { transition: background 0.2s, box-shadow 0.2s; }
  .drop-zone.is-over {
    background: rgba(99,102,241,0.04) !important;
    box-shadow: inset 0 0 0 2px rgba(99,102,241,0.35);
  }

  /* Buttons */
  .btn-primary {
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 10px;
    padding: 9px 18px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s;
    font-family: inherit;
  }
  .btn-primary:hover  { background: #4f46e5; }
  .btn-primary:active { transform: scale(0.97); }

  .btn-ghost {
    background: transparent;
    color: var(--muted);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 9px 18px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    font-family: inherit;
  }
  .btn-ghost:hover {
    background: rgba(99,102,241,0.06);
    color: #6366f1;
    border-color: rgba(99,102,241,0.3);
  }

  .btn-icon-sm {
    width: 26px; height: 26px;
    border-radius: 7px;
    border: none;
    background: transparent;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: #94a3b8;
    transition: all 0.15s;
  }
  .btn-icon-sm:hover { transform: scale(1.15); }
  .btn-icon-sm.edit:hover  { background: rgba(99,102,241,0.1);  color: #6366f1; }
  .btn-icon-sm.delete:hover{ background: rgba(239,68,68,0.1);  color: #ef4444; }

  /* Progress bar */
  .progress-track {
    height: 4px;
    background: rgba(255,255,255,0.2);
    border-radius: 99px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    border-radius: 99px;
    background: white;
    transition: width 0.9s cubic-bezier(0.4,0,0.2,1);
  }

  /* Stat card */
  .stat-pill {
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 12px;
    padding: 10px 14px;
    text-align: center;
    backdrop-filter: blur(6px);
  }

  /* Input */
  .field {
    width: 100%;
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 9px 13px;
    font-size: 13px;
    font-family: inherit;
    outline: none;
    background: var(--surface);
    color: var(--text);
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .field:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
  }
  .field::placeholder { color: #94a3b8; }

  /* Column header stripe */
  .col-stripe {
    height: 3px;
    border-radius: 0;
    flex-shrink: 0;
  }

  /* Add task button */
  .add-btn {
    width: 100%;
    border: 1.5px dashed rgba(99,102,241,0.25);
    border-radius: 11px;
    padding: 10px;
    background: transparent;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 6px;
    font-size: 12px; font-weight: 500;
    color: #94a3b8;
    transition: all 0.18s;
    font-family: inherit;
  }
  .add-btn:hover {
    border-color: #6366f1;
    color: #6366f1;
    background: rgba(99,102,241,0.04);
  }

  /* Priority badge */
  .prio-high   { background: rgba(239,68,68,0.08);  color: #ef4444;  border: 1px solid rgba(239,68,68,0.2);  border-radius: 8px; }
  .prio-medium { background: rgba(245,158,11,0.08); color: #f59e0b;  border: 1px solid rgba(245,158,11,0.2); border-radius: 8px; }
  .prio-low    { background: rgba(16,185,129,0.08); color: #10b981;  border: 1px solid rgba(16,185,129,0.2); border-radius: 8px; }

  /* Move button */
  .move-btn {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 11px; font-weight: 600;
    padding: 4px 10px;
    border-radius: 8px;
    background: rgba(99,102,241,0.08);
    color: #6366f1;
    border: 1px solid rgba(99,102,241,0.15);
    cursor: pointer;
    transition: all 0.15s;
    font-family: inherit;
  }
  .move-btn:hover {
    background: #6366f1;
    color: white;
    border-color: #6366f1;
  }

  /* Modal */
  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    z-index: 100;
    padding: 16px;
    animation: fadeUp 0.2s ease both;
  }
  .modal-box {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 24px;
    width: 100%; max-width: 440px;
    box-shadow: 0 40px 80px -20px rgba(0,0,0,0.35);
    animation: slideIn 0.28s cubic-bezier(0.34,1.56,0.64,1) both;
  }

  /* Search */
  .search-wrap { position: relative; }
  .search-wrap svg {
    position: absolute;
    left: 12px;
    top: 50%; transform: translateY(-50%);
    color: #94a3b8;
  }
  .search-wrap input { padding-left: 36px; }

  /* Hero gradient background orb */
  .hero-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(40px);
    pointer-events: none;
    opacity: 0.25;
  }
`

/* ─── Column config ──────────────────────────────────────────────────────── */
const COLUMNS = [
  {
    id: 'todo',
    title: 'Yapılacak',
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    emptyIcon: (
      <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    emptyText: 'Henüz görev eklenmedi',
  },
  {
    id: 'inProgress',
    title: 'Devam Ediyor',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    emptyIcon: (
      <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    emptyText: 'Aktif görev yok',
  },
  {
    id: 'done',
    title: 'Tamamlandı',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #06b6d4)',
    emptyIcon: (
      <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    emptyText: 'Tamamlanan görev yok',
  },
]

const PRIORITY = {
  high:   { label: 'Yüksek', cls: 'prio-high',   dot: '#ef4444' },
  medium: { label: 'Orta',   cls: 'prio-medium',  dot: '#f59e0b' },
  low:    { label: 'Düşük',  cls: 'prio-low',     dot: '#10b981' },
}

const fireConfetti = () =>
  confetti({ particleCount: 130, spread: 80, origin: { y: 0.55 }, colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899'] })

const formatDate = (d) => new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })

const isExpired = (d) => d && new Date(d) < new Date()
const isSoon    = (d) => {
  if (!d) return false
  const diff = new Date(d) - new Date()
  return diff > 0 && diff < 48 * 3600 * 1000
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
function Dashboard() {
  const [tasks,         setTasks]         = useState([])
  const [user,          setUser]           = useState(null)
  const [search,        setSearch]         = useState('')
  const [filterPriority,setFilterPriority] = useState('all')
  const [activeColumn,  setActiveColumn]   = useState(null)
  const [newTask,       setNewTask]        = useState({ title: '', description: '', priority: 'medium', dueDate: '' })
  const [editTask,      setEditTask]       = useState(null)
  const [dragging,      setDragging]       = useState(null)
  const [dragOver,      setDragOver]       = useState(null)
  const [animating,     setAnimating]      = useState(new Set())
  const dragItem = useRef(null)

  useEffect(() => {
    api.get('/tasks').then(r => setTasks(r.data))
    api.get('/user/profile').then(r => setUser(r.data.user))
  }, [])

  const popCard = (id) => {
    setAnimating(p => new Set(p).add(id))
    setTimeout(() => setAnimating(p => { const s = new Set(p); s.delete(id); return s }), 450)
  }

  const filteredTasks = (status) =>
    tasks
      .filter(t => t.status === status)
      .filter(t => t.title.toLowerCase().includes(search.toLowerCase()))
      .filter(t => filterPriority === 'all' || t.priority === filterPriority)

  const completionRate = tasks.length > 0
    ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100)
    : 0

  /* handlers */
  const handleAddTask = async (status) => {
    if (!newTask.title.trim()) return
    const res = await api.post('/tasks', {
      ...newTask,
      status,
      dueDate: newTask.dueDate || new Date().toISOString().split('T')[0],
    })
    setTasks(p => [...p, res.data])
    setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' })
    setActiveColumn(null)
    if (status === 'done') fireConfetti()
    popCard(res.data._id)
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Görevi sil?',
      text: 'Bu işlem geri alınamaz.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#374151',
      confirmButtonText: 'Evet, sil',
      cancelButtonText: 'İptal',
    })
    if (result.isConfirmed) {
      await api.delete(`/tasks/${id}`)
      setTasks(p => p.filter(t => t._id !== id))
    }
  }

  const handleMove = async (task, targetId) => {
    await api.put(`/tasks/${task._id}`, { status: targetId })
    setTasks(p => p.map(t => t._id === task._id ? { ...t, status: targetId } : t))
    if (targetId === 'done') fireConfetti()
    popCard(task._id)
  }

  const handleEditSave = async () => {
    if (!editTask.title.trim()) return
    const res = await api.put(`/tasks/${editTask._id}`, {
      title: editTask.title,
      description: editTask.description,
      priority: editTask.priority,
      dueDate: editTask.dueDate || null,
    })
    setTasks(p => p.map(t => t._id === editTask._id ? res.data : t))
    setEditTask(null)
  }

  /* drag */
  const onDragStart = (e, task) => {
    dragItem.current = task
    setDragging(task._id)
    e.dataTransfer.effectAllowed = 'move'
  }
  const onDragEnd  = () => { setDragging(null); setDragOver(null); dragItem.current = null }
  const onDrop     = async (e, colId) => {
    e.preventDefault()
    if (dragItem.current && dragItem.current.status !== colId) await handleMove(dragItem.current, colId)
    setDragOver(null)
  }

  const nextStatus = (s) => s === 'todo' ? 'inProgress' : s === 'inProgress' ? 'done' : null

  /* ─── Render ─── */
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{GLOBAL_STYLES}</style>
      <Navbar />

      {/* Edit Modal */}
      {editTask && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setEditTask(null) }}>
          <div className="modal-box">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Görevi Düzenle</h2>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Değişiklikleri yapıp kaydet</p>
              </div>
              <button
                onClick={() => setEditTask(null)}
                className="btn-icon-sm delete"
                style={{ width: 32, height: 32, fontSize: 18, borderRadius: 8 }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                className="field"
                placeholder="Görev başlığı"
                value={editTask.title}
                onChange={e => setEditTask({ ...editTask, title: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleEditSave()}
                autoFocus
              />
              <textarea
                className="field"
                placeholder="Açıklama (opsiyonel)"
                value={editTask.description || ''}
                onChange={e => setEditTask({ ...editTask, description: e.target.value })}
                rows={2}
                style={{ resize: 'none' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <select className="field" value={editTask.priority} onChange={e => setEditTask({ ...editTask, priority: e.target.value })}>
                  <option value="low">Düşük öncelik</option>
                  <option value="medium">Orta öncelik</option>
                  <option value="high">Yüksek öncelik</option>
                </select>
                <input className="field" type="date" value={editTask.dueDate ? editTask.dueDate.slice(0,10) : ''} onChange={e => setEditTask({ ...editTask, dueDate: e.target.value })} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleEditSave}>Kaydet</button>
              <button className="btn-ghost"   style={{ flex: 1 }} onClick={() => setEditTask(null)}>İptal</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 16px' }}>

        {/* ── Hero Banner ── */}
        {user && (
          <div className="fade-up" style={{
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 40%, #8b5cf6 70%, #7c3aed 100%)',
            borderRadius: 20,
            padding: '28px 28px 24px',
            marginBottom: 24,
            boxShadow: '0 20px 60px -15px rgba(99,102,241,0.45)',
            color: 'white',
          }}>
            {/* background orbs */}
            <div className="hero-orb" style={{ width: 240, height: 240, background: '#818cf8', top: -80, right: -60 }} />
            <div className="hero-orb" style={{ width: 160, height: 160, background: '#c4b5fd', bottom: -60, left: 80 }} />

            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>
                    Görev Panosu
                  </p>
                  <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>
                    Merhaba, {user.name}! 👋
                  </h1>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
                    {filteredTasks('inProgress').length > 0
                      ? `${filteredTasks('inProgress').length} görevin devam ediyor`
                      : filteredTasks('todo').length > 0
                      ? `${filteredTasks('todo').length} görev seni bekliyor`
                      : 'Harika, tüm görevler tamam! 🎉'}
                  </p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: '12px 18px', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.18)', textAlign: 'center' }}>
                  <p style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{completionRate}%</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>tamamlandı</p>
                </div>
              </div>

              {/* Progress */}
              <div style={{ marginBottom: 20 }}>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${completionRate}%` }} />
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {[
                  { label: 'Toplam', value: tasks.length },
                  { label: 'Devam Eden', value: tasks.filter(t => t.status === 'inProgress').length },
                  { label: 'Bitti', value: tasks.filter(t => t.status === 'done').length },
                ].map(s => (
                  <div key={s.label} className="stat-pill">
                    <p style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{s.value}</p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Search & Filter ── */}
        <div className="fade-up-1" style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <div className="search-wrap" style={{ flex: 1, minWidth: 200 }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input className="field" placeholder="Görev ara..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="field" style={{ minWidth: 160, flex: '0 0 auto' }} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
            <option value="all">Tüm öncelikler</option>
            <option value="high">Yüksek</option>
            <option value="medium">Orta</option>
            <option value="low">Düşük</option>
          </select>
        </div>

        {/* ── Kanban Board ── */}
        <div className="fade-up-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, alignItems: 'start' }}>
          {COLUMNS.map((col, colIdx) => {
            const colTasks = filteredTasks(col.id)
            const isOver = dragOver === col.id

            return (
              <div
                key={col.id}
                className={`drop-zone ${isOver ? 'is-over' : ''}`}
                style={{
                  background: 'var(--surface)',
                  borderRadius: 18,
                  border: '1px solid var(--border)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  animationDelay: `${colIdx * 0.06}s`,
                }}
                onDragOver={e => { e.preventDefault(); setDragOver(col.id) }}
                onDragLeave={() => setDragOver(null)}
                onDrop={e => onDrop(e, col.id)}
              >
                {/* Color stripe */}
                <div style={{ height: 3, background: col.gradient, flexShrink: 0 }} />

                {/* Column Header */}
                <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: 9,
                        background: `${col.color}18`,
                        border: `1px solid ${col.color}30`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                      </div>
                      <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{col.title}</h2>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 700,
                      background: `${col.color}14`,
                      color: col.color,
                      border: `1px solid ${col.color}25`,
                      borderRadius: 8,
                      padding: '2px 8px',
                      minWidth: 24,
                      textAlign: 'center',
                    }}>
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                {/* Tasks */}
                <div className="col-scroll" style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 80, overflowY: 'auto', maxHeight: 600 }}>

                  {colTasks.length === 0 && !activeColumn && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px 0', gap: 8 }}>
                      <div style={{ color: col.color }}>{col.emptyIcon}</div>
                      <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>{col.emptyText}</p>
                    </div>
                  )}

                  {colTasks.map(task => {
                    const next       = nextStatus(task.status)
                    const expired    = isExpired(task.dueDate)
                    const soon       = isSoon(task.dueDate)
                    const isPop      = animating.has(task._id)
                    const isDragging = dragging === task._id

                    return (
                      <div
                        key={task._id}
                        draggable
                        onDragStart={e => onDragStart(e, task)}
                        onDragEnd={onDragEnd}
                        className={`task-card${isDragging ? ' dragging' : ''}${isPop ? ' card-pop' : ''}`}
                        style={{
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          borderRadius: 12,
                          padding: '12px 12px 10px',
                        }}
                      >
                        {/* Title row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                          <p style={{
                            fontSize: 13, fontWeight: 600, lineHeight: 1.4,
                            color: task.status === 'done' ? 'var(--muted)' : 'var(--text)',
                            textDecoration: task.status === 'done' ? 'line-through' : 'none',
                            flex: 1, margin: 0,
                          }}>
                            {task.title}
                          </p>
                          <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                            <button className="btn-icon-sm edit" onClick={() => setEditTask(task)} title="Düzenle">
                              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button className="btn-icon-sm delete" onClick={() => handleDelete(task._id)} title="Sil">
                              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Description */}
                        {task.description && (
                          <p style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 8 }}>
                            {task.description}
                          </p>
                        )}

                        {/* Due date */}
                        {task.dueDate && (
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            fontSize: 11, fontWeight: 500,
                            padding: '3px 8px', borderRadius: 7, marginBottom: 8,
                            background: expired ? 'rgba(239,68,68,0.08)' : soon ? 'rgba(245,158,11,0.08)' : 'rgba(100,116,139,0.08)',
                            color:      expired ? '#ef4444'              : soon ? '#f59e0b'              : 'var(--muted)',
                            border:     expired ? '1px solid rgba(239,68,68,0.2)' : soon ? '1px solid rgba(245,158,11,0.2)' : '1px solid var(--border)',
                          }}>
                            <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(task.dueDate)}
                            {expired && ' · Süresi doldu'}
                            {soon && !expired && ' · Yaklaşıyor'}
                          </div>
                        )}

                        {/* Footer */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                          <span className={PRIORITY[task.priority].cls} style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: PRIORITY[task.priority].dot, display: 'inline-block' }} />
                            {PRIORITY[task.priority].label}
                          </span>
                          {next && (
                            <button className="move-btn" onClick={() => handleMove(task, next)}>
                              {next === 'inProgress' ? 'Başla' : 'Bitti'}
                              <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {/* Add form */}
                  {activeColumn === col.id ? (
                    <div className="slide-in" style={{
                      background: 'var(--bg)',
                      border: '1px solid rgba(99,102,241,0.3)',
                      borderRadius: 12,
                      padding: 12,
                      boxShadow: '0 4px 20px -4px rgba(99,102,241,0.15)',
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <input className="field" placeholder="Görev başlığı" value={newTask.title} autoFocus
                          onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                          onKeyDown={e => e.key === 'Enter' && handleAddTask(col.id)}
                        />
                        <input className="field" placeholder="Açıklama (opsiyonel)" value={newTask.description}
                          onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                          onKeyDown={e => e.key === 'Enter' && handleAddTask(col.id)}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          <select className="field" value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}>
                            <option value="low">Düşük</option>
                            <option value="medium">Orta</option>
                            <option value="high">Yüksek</option>
                          </select>
                          <input className="field" type="date" value={newTask.dueDate} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} />
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn-primary" style={{ flex: 1 }} onClick={() => handleAddTask(col.id)}>Ekle</button>
                          <button className="btn-ghost" style={{ flex: 1 }} onClick={() => { setActiveColumn(null); setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' }) }}>İptal</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button className="add-btn" onClick={() => setActiveColumn(col.id)}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      Görev Ekle
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
