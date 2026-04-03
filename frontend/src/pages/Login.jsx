import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; }

  :root {
    --indigo: #6366f1;
    --indigo-dark: #4f46e5;
    --surface: #ffffff;
    --bg: #f4f4f8;
    --border: rgba(0,0,0,0.08);
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
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33%       { transform: translateY(-8px) rotate(1deg); }
    66%       { transform: translateY(-4px) rotate(-1deg); }
  }
  @keyframes drift {
    0%, 100% { transform: translate(0, 0); }
    25%       { transform: translate(10px, -15px); }
    50%       { transform: translate(-5px, -25px); }
    75%       { transform: translate(-12px, -10px); }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes pulseOpacity {
    0%, 100% { opacity: 0.4; }
    50%       { opacity: 0.8; }
  }

  .fade-up   { animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
  .fade-up-1 { animation: fadeUp 0.5s 0.1s cubic-bezier(0.22,1,0.36,1) both; }
  .fade-up-2 { animation: fadeUp 0.5s 0.2s cubic-bezier(0.22,1,0.36,1) both; }
  .float-anim { animation: float 6s ease-in-out infinite; }

  .login-root {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: var(--bg);
    position: relative;
    overflow: hidden;
  }

  /* Background mesh */
  .bg-mesh {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 80% 60% at 20% -10%, rgba(99,102,241,0.12) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 80% 110%, rgba(139,92,246,0.1) 0%, transparent 60%);
    pointer-events: none;
  }
  .dark .bg-mesh {
    background:
      radial-gradient(ellipse 80% 60% at 20% -10%, rgba(99,102,241,0.18) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 80% 110%, rgba(139,92,246,0.15) 0%, transparent 60%);
  }

  /* Floating orbs */
  .orb {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
  }

  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 22px;
    padding: 36px;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 24px 80px -20px rgba(0,0,0,0.12), 0 4px 24px -4px rgba(0,0,0,0.06);
    position: relative;
    z-index: 1;
  }
  .dark .card {
    box-shadow: 0 24px 80px -20px rgba(0,0,0,0.5), 0 4px 24px -4px rgba(0,0,0,0.3);
  }

  .logo-mark {
    width: 48px; height: 48px;
    border-radius: 14px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 8px 24px -6px rgba(99,102,241,0.5);
    position: relative;
  }
  .logo-mark::after {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 16px;
    background: linear-gradient(135deg, #6366f1, #c4b5fd, #6366f1);
    z-index: -1;
    animation: spin 5s linear infinite;
    opacity: 0.6;
  }

  .field {
    width: 100%;
    border: 1px solid var(--border);
    border-radius: 11px;
    padding: 11px 14px;
    font-size: 14px;
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

  label { display: block; font-size: 12px; font-weight: 600; color: var(--muted); margin-bottom: 7px; letter-spacing: 0.03em; }

  .btn-primary {
    width: 100%;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
    border: none;
    border-radius: 11px;
    padding: 12px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
    transition: opacity 0.15s, transform 0.1s;
    box-shadow: 0 8px 24px -6px rgba(99,102,241,0.45);
  }
  .btn-primary:hover { opacity: 0.92; }
  .btn-primary:active { transform: scale(0.98); }
  .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

  .btn-secondary {
    width: 100%;
    background: transparent;
    color: var(--muted);
    border: 1px solid var(--border);
    border-radius: 11px;
    padding: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;
    text-align: center;
    text-decoration: none;
    display: block;
  }
  .btn-secondary:hover {
    border-color: #6366f1;
    color: #6366f1;
    background: rgba(99,102,241,0.04);
  }

  .error-box {
    background: rgba(239,68,68,0.07);
    border: 1px solid rgba(239,68,68,0.2);
    color: #dc2626;
    border-radius: 10px;
    padding: 10px 13px;
    font-size: 13px;
    display: flex; gap: 8px; align-items: center;
  }
  .dark .error-box { color: #f87171; background: rgba(239,68,68,0.1); }

  .divider {
    display: flex; align-items: center; gap: 12px;
    color: var(--muted); font-size: 12px;
  }
  .divider::before, .divider::after {
    content: ''; flex: 1;
    height: 1px; background: var(--border);
  }

  .show-pass-btn {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer;
    font-size: 12px; font-weight: 600; color: #94a3b8;
    font-family: inherit;
    transition: color 0.15s;
  }
  .show-pass-btn:hover { color: #6366f1; }

  /* Admin modal */
  .admin-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    z-index: 50;
    padding: 16px;
    animation: fadeUp 0.2s ease both;
  }
  .admin-box {
    background: #0f172a;
    border: 1px solid rgba(99,102,241,0.2);
    border-radius: 18px;
    padding: 28px;
    width: 100%; max-width: 360px;
    box-shadow: 0 40px 80px -20px rgba(0,0,0,0.6);
  }
`

function Login() {
  const [email,           setEmail]           = useState('')
  const [password,        setPassword]        = useState('')
  const [error,           setError]           = useState('')
  const [loading,         setLoading]         = useState(false)
  const [showPassword,    setShowPassword]    = useState(false)
  const [logoClickCount,  setLogoClickCount]  = useState(0)
  const [showAdminModal,  setShowAdminModal]  = useState(false)
  const [adminEmail,      setAdminEmail]      = useState('')
  const [adminPassword,   setAdminPassword]   = useState('')
  const [adminError,      setAdminError]      = useState('')
  const navigate = useNavigate()

  const handleLogoClick = () => {
    setLogoClickCount(prev => {
      const n = prev + 1
      if (n >= 5) { setShowAdminModal(true); return 0 }
      return n
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return setError('Email ve şifre alanları boş bırakılamaz!')
    setLoading(true); setError('')
    try {
      const res = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', res.data.token)
      navigate('/dashboard')
    } catch {
      setError('Email veya şifre hatalı!')
    } finally {
      setLoading(false)
    }
  }

  const handleAdminLogin = async (e) => {
    e.preventDefault(); setAdminError('')
    try {
      const res = await api.post('/admin/login', { email: adminEmail, password: adminPassword })
      localStorage.setItem('adminToken', res.data.token)
      setShowAdminModal(false)
      navigate('/admin/dashboard')
    } catch {
      setAdminError('Geçersiz bilgiler!')
    }
  }

  return (
    <div className="login-root">
      <style>{STYLES}</style>
      <div className="bg-mesh" />

      {/* Floating orbs */}
      <div className="orb" style={{ width: 300, height: 300, background: 'rgba(99,102,241,0.08)', filter: 'blur(60px)', top: '10%', left: '5%', animation: 'drift 12s ease-in-out infinite' }} />
      <div className="orb" style={{ width: 200, height: 200, background: 'rgba(139,92,246,0.08)', filter: 'blur(50px)', bottom: '15%', right: '8%', animation: 'drift 15s ease-in-out infinite reverse' }} />

      {/* Admin Modal */}
      {showAdminModal && (
        <div className="admin-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAdminModal(false) }}>
          <div className="admin-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#475569', marginBottom: 3 }}>Sistem Erişimi</p>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>Admin Girişi</h2>
              </div>
              <button onClick={() => setShowAdminModal(false)} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {adminError && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: 8, padding: '8px 12px', fontSize: 12, marginBottom: 14 }}>
                {adminError}
              </div>
            )}
            <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input type="email" placeholder="admin@example.com" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 13px', fontSize: 13, outline: 'none', color: '#f1f5f9', fontFamily: 'inherit' }} />
              <input type="password" placeholder="••••••••" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 13px', fontSize: 13, outline: 'none', color: '#f1f5f9', fontFamily: 'inherit' }} />
              <button type="submit" style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', marginTop: 4 }}>
                Giriş Yap
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main card */}
      <div className="card fade-up">
        {/* Logo */}
        <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <div className="logo-mark float-anim" onClick={handleLogoClick} style={{ cursor: 'pointer', userSelect: 'none', marginBottom: 14 }}>
            <svg width="22" height="22" fill="none" stroke="white" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>TaskFlow</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Görevlerini yönet, hedeflerine ulaş</p>
        </div>

        <div className="fade-up-1">
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Tekrar hoş geldin 👋</h2>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Hesabına giriş yap</p>
          </div>

          {error && (
            <div className="error-box" style={{ marginBottom: 18 }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label>EMAIL</label>
              <input className="field" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ornek@mail.com" />
            </div>
            <div>
              <label>ŞİFRE</label>
              <div style={{ position: 'relative' }}>
                <input className="field" style={{ paddingRight: 60 }} type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                <button type="button" className="show-pass-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? 'Gizle' : 'Göster'}
                </button>
              </div>
            </div>
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  Giriş yapılıyor...
                </span>
              ) : 'Giriş Yap'}
            </button>
          </form>

          <div className="divider" style={{ margin: '22px 0' }}>hesabın yok mu?</div>

          <a href="/register" className="btn-secondary">Kayıt Ol →</a>
        </div>
      </div>
    </div>
  )
}

export default Login
