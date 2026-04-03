import { useState, useEffect } from 'react'
import api from '../services/api'
import Navbar from '../components/Navbar'

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  body { font-family: 'Plus Jakarta Sans', sans-serif; }

  :root {
    --surface: #ffffff;
    --bg: #f4f4f8;
    --border: rgba(0,0,0,0.06);
    --text: #0f172a;
    --muted: #64748b;
  }
  .dark {
    --surface: #0f172a;
    --bg: #080812;
    --border: rgba(255,255,255,0.07);
    --text: #f1f5f9;
    --muted: #64748b;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    from { background-position: -200% center; }
    to   { background-position: 200% center; }
  }
  .fade-up   { animation: fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both; }
  .fade-up-1 { animation: fadeUp 0.4s 0.06s cubic-bezier(0.22,1,0.36,1) both; }
  .fade-up-2 { animation: fadeUp 0.4s 0.12s cubic-bezier(0.22,1,0.36,1) both; }

  .archive-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 16px 18px;
    transition: box-shadow 0.18s, transform 0.18s;
    position: relative;
    overflow: hidden;
  }
  .archive-card::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    background: linear-gradient(180deg, #6366f1, #8b5cf6);
    border-radius: 3px 0 0 3px;
  }
  .archive-card:hover {
    box-shadow: 0 8px 28px -6px rgba(0,0,0,0.12);
    transform: translateY(-2px);
  }

  .field {
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

  .search-wrap { position: relative; }
  .search-wrap svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
  .search-wrap input { padding-left: 36px; }

  .skeleton {
    background: linear-gradient(90deg, var(--border) 25%, rgba(99,102,241,0.06) 50%, var(--border) 75%);
    background-size: 200% auto;
    animation: shimmer 1.4s infinite;
    border-radius: 10px;
  }

  .prio-high   { background: rgba(239,68,68,0.08);  color: #ef4444;  border: 1px solid rgba(239,68,68,0.2);  border-radius: 8px; }
  .prio-medium { background: rgba(245,158,11,0.08); color: #f59e0b;  border: 1px solid rgba(245,158,11,0.2); border-radius: 8px; }
  .prio-low    { background: rgba(16,185,129,0.08); color: #10b981;  border: 1px solid rgba(16,185,129,0.2); border-radius: 8px; }

  .stat-pill {
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 12px;
    padding: 12px 16px;
    backdrop-filter: blur(6px);
  }

  .meta-tag {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    color: var(--muted);
    background: rgba(0,0,0,0.03);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 3px 8px;
    white-space: nowrap;
  }
  .dark .meta-tag {
    background: rgba(255,255,255,0.04);
  }
  .meta-tag.overdue {
    color: #ef4444;
    background: rgba(239,68,68,0.06);
    border-color: rgba(239,68,68,0.2);
  }
  .meta-divider {
    height: 1px;
    background: var(--border);
    margin: 10px 0 10px 32px;
  }
`

const PRIORITY = {
  high:   { label: 'Yüksek', cls: 'prio-high' },
  medium: { label: 'Orta',   cls: 'prio-medium' },
  low:    { label: 'Düşük',  cls: 'prio-low' },
}

// Tarih + saat formatlayıcı
const fmtDateTime = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleString('tr-TR', {
    day:    'numeric',
    month:  'long',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  })
}

// Kaç günde tamamlandı
const calcDuration = (createdAt, completedAt) => {
  if (!createdAt || !completedAt) return null
  const diff = new Date(completedAt) - new Date(createdAt)
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days  = Math.floor(hours / 24)
  if (days > 0)  return `${days} günde tamamlandı`
  if (hours > 0) return `${hours} saatte tamamlandı`
  if (mins > 0)  return `${mins} dakikada tamamlandı`
  return 'Az önce tamamlandı'
}

function History() {
  const [tasks,          setTasks]          = useState([])
  const [search,         setSearch]         = useState('')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterDate,     setFilterDate]     = useState('all')
  const [loading,        setLoading]        = useState(true)

  useEffect(() => {
    api.get('/tasks/history')
      .then(r => setTasks(r.data))
      .finally(() => setLoading(false))
  }, [])

  const getDateFilter = (task) => {
    if (filterDate === 'all') return true
    const archived = new Date(task.archivedAt || task.completedAt)
    const now = new Date()
    const diff = (now - archived) / (1000 * 60 * 60 * 24)
    if (filterDate === '7')    return diff <= 7
    if (filterDate === '30')   return diff <= 30
    if (filterDate === 'year') return archived.getFullYear() === now.getFullYear()
    return true
  }

  const filteredTasks = tasks
    .filter(t => t.title.toLowerCase().includes(search.toLowerCase()))
    .filter(t => filterPriority === 'all' || t.priority === filterPriority)
    .filter(getDateFilter)

  const firstArchiveDate = tasks.length > 0
    ? new Date(tasks[tasks.length - 1].archivedAt || tasks[tasks.length - 1].completedAt)
        .toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
    : '—'

  const highCount = tasks.filter(t => t.priority === 'high').length

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{GLOBAL_STYLES}</style>
      <Navbar />

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px' }}>

        {/* Hero */}
        <div className="fade-up" style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #7c3aed 100%)',
          borderRadius: 20,
          padding: '28px 28px 24px',
          marginBottom: 24,
          color: 'white',
          boxShadow: '0 20px 60px -15px rgba(99,102,241,0.45)',
        }}>
          <div style={{ position: 'absolute', width: 200, height: 200, background: 'rgba(255,255,255,0.06)', borderRadius: '50%', top: -70, right: -50, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: 140, height: 140, background: 'rgba(255,255,255,0.04)', borderRadius: '50%', bottom: -40, left: 60, pointerEvents: 'none' }} />

          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" fill="none" stroke="white" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Arşiv</p>
                <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Tamamlanan Görevler</h1>
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 20 }}>
              Tamamlanıp arşivlenen görevler burada listelenir. Gece yarısı otomatik arşivleme aktif.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                { label: 'Toplam Arşiv',      value: tasks.length },
                { label: 'Yüksek Öncelikli',  value: highCount },
                { label: 'İlk Arşiv',         value: firstArchiveDate },
              ].map(s => (
                <div key={s.label} className="stat-pill">
                  <p style={{ fontSize: typeof s.value === 'number' ? 22 : 14, fontWeight: 800, lineHeight: 1, margin: 0 }}>{s.value}</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="fade-up-1" style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <div className="search-wrap" style={{ flex: 1, minWidth: 200 }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input className="field" style={{ width: '100%' }} placeholder="Arşivde ara..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="field" style={{ minWidth: 150 }} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
            <option value="all">Tüm Öncelikler</option>
            <option value="high">Yüksek</option>
            <option value="medium">Orta</option>
            <option value="low">Düşük</option>
          </select>
          <select className="field" style={{ minWidth: 150 }} value={filterDate} onChange={e => setFilterDate(e.target.value)}>
            <option value="all">Tüm Zamanlar</option>
            <option value="7">Son 7 gün</option>
            <option value="30">Son 30 gün</option>
            <option value="year">Bu yıl</option>
          </select>
        </div>

        {/* Content */}
        <div className="fade-up-2">
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton" style={{ height: 110, opacity: 0.6 - i * 0.1 }} />
              ))}
            </div>
          ) : filteredTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--surface)', borderRadius: 18, border: '1px solid var(--border)' }}>
              <div style={{ width: 60, height: 60, borderRadius: 18, background: 'rgba(99,102,241,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="28" height="28" fill="none" stroke="#6366f1" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Arşivde görev bulunamadı</p>
              <p style={{ fontSize: 13, color: 'var(--muted)', maxWidth: 300, margin: '0 auto' }}>
                Tamamlanan görevler gece yarısı otomatik olarak arşivlenir.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredTasks.map((task, i) => {
                const duration  = calcDuration(task.createdAt, task.completedAt)
                const isOverdue = task.dueDate && new Date(task.completedAt) > new Date(task.dueDate)

                return (
                  <div key={task._id} className="archive-card fade-up" style={{ animationDelay: `${i * 0.04}s` }}>

                    {/* Üst satır: başlık + öncelik */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: task.description ? 8 : 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                          background: 'rgba(16,185,129,0.12)',
                          border: '1px solid rgba(16,185,129,0.25)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <svg width="11" height="11" fill="none" stroke="#10b981" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{task.title}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        {duration && (
                          <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>{duration}</span>
                        )}
                        <span className={PRIORITY[task.priority]?.cls || 'prio-medium'} style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px' }}>
                          {PRIORITY[task.priority]?.label || 'Orta'}
                        </span>
                      </div>
                    </div>

                    {/* Açıklama */}
                    {task.description && (
                      <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 8, paddingLeft: 32 }}>
                        {task.description}
                      </p>
                    )}

                    {/* Ayraç */}
                    <div className="meta-divider" />

                    {/* Meta bilgiler */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingLeft: 32 }}>

                      {/* Oluşturulma */}
                      {task.createdAt && (
                        <span className="meta-tag">
                          <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Oluşturuldu: {fmtDateTime(task.createdAt)}
                        </span>
                      )}

                      {/* Tamamlanma */}
                      {task.completedAt && (
                        <span className="meta-tag">
                          <svg width="11" height="11" fill="none" stroke="#10b981" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          Tamamlandı: {fmtDateTime(task.completedAt)}
                        </span>
                      )}

                      {/* Arşivlenme */}
                      {task.archivedAt && (
                        <span className="meta-tag" style={{ color: '#6366f1', background: 'rgba(99,102,241,0.06)', borderColor: 'rgba(99,102,241,0.18)' }}>
                          <svg width="11" height="11" fill="none" stroke="#6366f1" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                          </svg>
                          Arşivlendi: {fmtDateTime(task.archivedAt)}
                        </span>
                      )}

                      {/* Son tarih */}
                      {task.dueDate && (
                        <span className={`meta-tag${isOverdue ? ' overdue' : ''}`}>
                          <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {isOverdue ? 'Gecikmiş — ' : 'Son tarih: '}
                          {new Date(task.dueDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      )}

                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default History