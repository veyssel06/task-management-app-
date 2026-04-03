import { useState, useEffect } from 'react'
import api from '../services/api'
import Navbar from '../components/Navbar'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom'

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; }

  :root {
    --surface: #ffffff;
    --bg: #f4f4f8;
    --border: rgba(0,0,0,0.06);
    --text: #0f172a;
    --muted: #64748b;
    --indigo: #6366f1;
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
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  .fade-up   { animation: fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both; }
  .fade-up-1 { animation: fadeUp 0.4s 0.07s cubic-bezier(0.22,1,0.36,1) both; }
  .fade-up-2 { animation: fadeUp 0.4s 0.14s cubic-bezier(0.22,1,0.36,1) both; }
  .fade-up-3 { animation: fadeUp 0.4s 0.21s cubic-bezier(0.22,1,0.36,1) both; }
  .fade-up-4 { animation: fadeUp 0.4s 0.28s cubic-bezier(0.22,1,0.36,1) both; }

  .section {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 24px;
  }
  .section-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 18px;
    display: flex; align-items: center; gap: 10px;
  }
  .section-title-icon {
    width: 30px; height: 30px;
    border-radius: 9px;
    background: rgba(99,102,241,0.1);
    border: 1px solid rgba(99,102,241,0.15);
    display: flex; align-items: center; justify-content: center;
  }

  .field {
    width: 100%;
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 10px 13px;
    font-size: 13.5px;
    font-family: inherit;
    outline: none;
    background: var(--bg);
    color: var(--text);
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .field:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
    background: var(--surface);
  }
  .field::placeholder { color: #94a3b8; }

  label { display: block; font-size: 11.5px; font-weight: 600; color: var(--muted); margin-bottom: 6px; letter-spacing: 0.03em; }

  .btn-primary {
    background: #6366f1;
    color: white; border: none;
    border-radius: 10px;
    padding: 10px 20px;
    font-size: 13px; font-weight: 600;
    cursor: pointer; font-family: inherit;
    transition: background 0.15s, transform 0.1s;
  }
  .btn-primary:hover  { background: #4f46e5; }
  .btn-primary:active { transform: scale(0.97); }

  .btn-dark {
    background: var(--text);
    color: var(--surface); border: none;
    border-radius: 10px;
    padding: 10px 20px;
    font-size: 13px; font-weight: 600;
    cursor: pointer; font-family: inherit;
    transition: opacity 0.15s, transform 0.1s;
  }
  .btn-dark:hover  { opacity: 0.85; }
  .btn-dark:active { transform: scale(0.97); }

  .btn-danger {
    background: rgba(239,68,68,0.08);
    color: #ef4444;
    border: 1px solid rgba(239,68,68,0.25);
    border-radius: 10px;
    padding: 10px 20px;
    font-size: 13px; font-weight: 600;
    cursor: pointer; font-family: inherit;
    transition: all 0.15s;
  }
  .btn-danger:hover {
    background: #ef4444;
    color: white;
    border-color: #ef4444;
  }

  .toast-success { background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.25); color: #059669; border-radius: 10px; padding: 10px 13px; font-size: 13px; display: flex; gap: 8px; align-items: center; }
  .toast-error   { background: rgba(239,68,68,0.07);  border: 1px solid rgba(239,68,68,0.2);  color: #dc2626; border-radius: 10px; padding: 10px 13px; font-size: 13px; display: flex; gap: 8px; align-items: center; }
  .dark .toast-success { color: #34d399; background: rgba(16,185,129,0.1); }
  .dark .toast-error   { color: #f87171; background: rgba(239,68,68,0.1); }

  .stat-card {
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 16px;
    text-align: center;
    background: var(--bg);
    transition: transform 0.15s;
  }
  .stat-card:hover { transform: translateY(-2px); }

  .emoji-btn {
    width: 42px; height: 42px;
    border-radius: 11px;
    border: 2px solid var(--border);
    background: var(--bg);
    font-size: 20px;
    cursor: pointer;
    transition: all 0.15s;
    display: flex; align-items: center; justify-content: center;
  }
  .emoji-btn:hover   { border-color: #6366f1; background: rgba(99,102,241,0.06); }
  .emoji-btn.selected { border-color: #6366f1; background: rgba(99,102,241,0.1); box-shadow: 0 0 0 2px rgba(99,102,241,0.2); }
`

function CheckIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

function Profile() {
  const navigate = useNavigate()
  const [user,            setUser]            = useState(null)
  const [stats,           setStats]           = useState({ total: 0, todo: 0, inProgress: 0, done: 0 })
  const [name,            setName]            = useState('')
  const [avatar,          setAvatar]          = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword,     setNewPassword]     = useState('')
  const [profileMessage,  setProfileMessage]  = useState('')
  const [profileError,    setProfileError]    = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError,   setPasswordError]   = useState('')
  const [loading,         setLoading]         = useState(true)

  useEffect(() => {
    api.get('/user/profile')
      .then(r => {
        setUser(r.data.user)
        setStats(r.data.stats || { total: 0, todo: 0, inProgress: 0, done: 0 })
        setName(r.data.user.name || '')
        setAvatar(r.data.user.avatar || '')
      })
      .catch(() => setProfileError('Profil yüklenemedi!'))
      .finally(() => setLoading(false))
  }, [])

  const autoHide = (setter, delay = 3000) => {
    const t = setTimeout(() => setter(''), delay)
    return () => clearTimeout(t)
  }
  useEffect(() => { if (profileMessage)  return autoHide(setProfileMessage) }, [profileMessage])
  useEffect(() => { if (profileError)    return autoHide(setProfileError) },   [profileError])
  useEffect(() => { if (passwordMessage) return autoHide(setPasswordMessage) }, [passwordMessage])
  useEffect(() => { if (passwordError)   return autoHide(setPasswordError) },   [passwordError])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      await api.put('/user/profile', { name, avatar })
      setUser(p => ({ ...p, name, avatar }))
      setProfileMessage('Profil güncellendi!')
    } catch {
      setProfileError('Güncelleme başarısız!')
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!currentPassword || !newPassword) return setPasswordError('Tüm alanları doldurunuz!')
    try {
      await api.put('/user/change-password', { currentPassword, newPassword })
      setPasswordMessage('Şifre başarıyla değiştirildi!')
      setCurrentPassword(''); setNewPassword('')
    } catch {
      setPasswordError('Mevcut şifre hatalı!')
    }
  }

  const handleDeleteAccount = async () => {
    const result = await Swal.fire({
      title: 'Hesabını silmek istediğine emin misin?',
      text: 'Bu işlem geri alınamaz! Tüm görevlerin de silinecek.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#374151',
      confirmButtonText: 'Evet, sil',
      cancelButtonText: 'İptal',
    })
    if (result.isConfirmed) {
      await api.delete('/user/delete-account')
      localStorage.removeItem('token')
      navigate('/login')
    }
  }

  const successRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0
  const joinDate    = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'

  const EMOJIS = ['👨‍💻', '👩‍💻', '🧑‍💼', '👨‍🎓', '👩‍🎓', '🦊', '🐻', '🐼', '🦁', '🐯']

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <style>{STYLES}</style>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 14 }} />
        <p style={{ fontSize: 13, color: 'var(--muted)', animation: 'fadeUp 0.4s ease both' }}>Yükleniyor...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{STYLES}</style>
      <Navbar />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Hero */}
        <div className="fade-up" style={{
          position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #7c3aed 100%)',
          borderRadius: 20, padding: '28px', color: 'white',
          boxShadow: '0 20px 60px -15px rgba(99,102,241,0.4)',
        }}>
          <div style={{ position: 'absolute', width: 200, height: 200, background: 'rgba(255,255,255,0.06)', borderRadius: '50%', top: -60, right: -50, pointerEvents: 'none' }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{
              width: 72, height: 72, borderRadius: 18,
              background: 'rgba(255,255,255,0.15)',
              border: '2px solid rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, flexShrink: 0, overflow: 'hidden',
              boxShadow: '0 8px 24px -6px rgba(0,0,0,0.2)',
            }}>
              {avatar && avatar.startsWith('http')
                ? <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span>{avatar || '👤'}</span>}
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Profil</p>
              <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{user?.name}</h1>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>{user?.email}</p>
              <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>Katılma: {joinDate}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="section fade-up-1">
          <div className="section-title">
            <div className="section-title-icon">
              <svg width="14" height="14" fill="none" stroke="#6366f1" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            İstatistikler
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 18 }}>
            {[
              { label: 'Toplam', value: stats.total,      color: '#6366f1' },
              { label: 'Yapılacak', value: stats.todo,    color: '#6366f1' },
              { label: 'Devam',    value: stats.inProgress, color: '#f59e0b' },
              { label: 'Bitti',   value: stats.done,      color: '#10b981' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <p style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 5 }}>{s.label}</p>
              </div>
            ))}
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>Tamamlama Oranı</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#6366f1' }}>%{successRate}</span>
            </div>
            <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${successRate}%`, background: 'linear-gradient(90deg, #6366f1, #10b981)', borderRadius: 99, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
            </div>
          </div>
        </div>

        {/* Edit Profile */}
        <div className="section fade-up-2">
          <div className="section-title">
            <div className="section-title-icon">
              <svg width="14" height="14" fill="none" stroke="#6366f1" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            Profili Düzenle
          </div>

          {profileMessage && <div className="toast-success" style={{ marginBottom: 14 }}><CheckIcon />{profileMessage}</div>}
          {profileError   && <div className="toast-error"   style={{ marginBottom: 14 }}><span>⚠</span>{profileError}</div>}

          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label>AD SOYAD</label>
              <input className="field" type="text" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label>AVATAR SEÇ</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                {EMOJIS.map(emoji => (
                  <button key={emoji} type="button" onClick={() => setAvatar(emoji)} className={`emoji-btn${avatar === emoji ? ' selected' : ''}`}>
                    {emoji}
                  </button>
                ))}
              </div>
              <input className="field" type="text" value={avatar.startsWith('http') ? avatar : ''} onChange={e => setAvatar(e.target.value)} placeholder="ya da resim linki yapıştır (https://...)" />
            </div>
            <div>
              <button className="btn-primary" type="submit">Güncelle</button>
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div className="section fade-up-3">
          <div className="section-title">
            <div className="section-title-icon">
              <svg width="14" height="14" fill="none" stroke="#6366f1" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            Şifre Değiştir
          </div>

          {passwordMessage && <div className="toast-success" style={{ marginBottom: 14 }}><CheckIcon />{passwordMessage}</div>}
          {passwordError   && <div className="toast-error"   style={{ marginBottom: 14 }}><span>⚠</span>{passwordError}</div>}

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label>MEVCUT ŞİFRE</label>
              <input className="field" type="password" placeholder="••••••••" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
            </div>
            <div>
              <label>YENİ ŞİFRE</label>
              <input className="field" type="password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
            <div style={{ paddingTop: 4 }}>
              <button className="btn-dark" type="submit">Şifreyi Değiştir</button>
            </div>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="section fade-up-4" style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
          <div className="section-title">
            <div style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" fill="none" stroke="#ef4444" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <span style={{ color: '#ef4444' }}>Tehlikeli Bölge</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.5 }}>
            Hesabını silersen tüm görevlerin kalıcı olarak silinir. Bu işlem geri alınamaz.
          </p>
          <button className="btn-danger" onClick={handleDeleteAccount}>Hesabı Sil</button>
        </div>

      </div>
    </div>
  )
}

export default Profile
