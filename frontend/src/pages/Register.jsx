import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; }

  :root {
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
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-8px); }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes drift {
    0%, 100% { transform: translate(0, 0); }
    25%       { transform: translate(8px, -12px); }
    50%       { transform: translate(-4px, -20px); }
    75%       { transform: translate(-10px, -8px); }
  }

  .fade-up   { animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
  .fade-up-1 { animation: fadeUp 0.5s 0.1s cubic-bezier(0.22,1,0.36,1) both; }
  .float-anim { animation: float 5s ease-in-out infinite; }

  .reg-root {
    min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    padding: 24px;
    background: var(--bg);
    position: relative; overflow: hidden;
  }
  .bg-mesh {
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse 70% 60% at 80% -10%, rgba(139,92,246,0.12) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 10% 110%, rgba(99,102,241,0.1) 0%, transparent 60%);
    pointer-events: none;
  }
  .dark .bg-mesh {
    background:
      radial-gradient(ellipse 70% 60% at 80% -10%, rgba(139,92,246,0.18) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 10% 110%, rgba(99,102,241,0.15) 0%, transparent 60%);
  }

  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 22px;
    padding: 36px;
    width: 100%; max-width: 420px;
    box-shadow: 0 24px 80px -20px rgba(0,0,0,0.1), 0 4px 24px -4px rgba(0,0,0,0.05);
    position: relative; z-index: 1;
  }
  .dark .card { box-shadow: 0 24px 80px -20px rgba(0,0,0,0.5); }

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
    position: absolute; inset: -2px;
    border-radius: 16px;
    background: linear-gradient(135deg, #6366f1, #c4b5fd, #6366f1);
    z-index: -1;
    animation: spin 5s linear infinite;
    opacity: 0.5;
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
`

function Register() {
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !email || !password) return setError('Tüm alanları doldurunuz!')
    setLoading(true); setError('')
    try {
      await api.post('/auth/register', { name, email, password })
      navigate('/login')
    } catch {
      setError('Kayıt olurken bir hata oluştu!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="reg-root">
      <style>{STYLES}</style>
      <div className="bg-mesh" />

      {/* Floating orbs */}
      <div style={{ position: 'absolute', width: 260, height: 260, background: 'rgba(139,92,246,0.07)', filter: 'blur(60px)', borderRadius: '50%', top: '5%', right: '10%', animation: 'drift 14s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 180, height: 180, background: 'rgba(99,102,241,0.07)', filter: 'blur(50px)', borderRadius: '50%', bottom: '10%', left: '5%', animation: 'drift 18s ease-in-out infinite reverse', pointerEvents: 'none' }} />

      <div className="card fade-up">
        {/* Logo */}
        <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <div className="logo-mark float-anim" style={{ marginBottom: 14 }}>
            <svg width="22" height="22" fill="none" stroke="white" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>TaskFlow</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Görevlerini yönet, hedeflerine ulaş</p>
        </div>

        <div className="fade-up-1">
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Hesap oluştur 🚀</h2>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Hemen ücretsiz başla</p>
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
              <label>AD SOYAD</label>
              <input className="field" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Adınız Soyadınız" />
            </div>
            <div>
              <label>EMAIL</label>
              <input className="field" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ornek@mail.com" />
            </div>
            <div>
              <label>ŞİFRE</label>
              <input className="field" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  Kayıt olunuyor...
                </span>
              ) : 'Kayıt Ol'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', marginTop: 22 }}>
            Hesabın var mı?{' '}
            <a href="/login" style={{ color: '#6366f1', fontWeight: 700, textDecoration: 'none' }}>
              Giriş Yap →
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
