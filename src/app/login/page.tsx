'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, Sparkles } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { login, register, selectAuthLoading } from '@/store/slices/authSlice'

function AnimatedBackground() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    let frame: number
    let t = 0

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    // Orbs that slowly drift and pulse
    const orbs = [
      { x: 0.2, y: 0.25, r: 280, color: '99,179,237', speed: 0.00018, phase: 0 },
      { x: 0.78, y: 0.15, r: 220, color: '147,197,253', speed: 0.00022, phase: 1.2 },
      { x: 0.85, y: 0.72, r: 260, color: '165,180,252', speed: 0.00015, phase: 2.4 },
      { x: 0.15, y: 0.8,  r: 200, color: '125,211,252', speed: 0.0002,  phase: 0.8 },
      { x: 0.5,  y: 0.5,  r: 180, color: '196,181,253', speed: 0.00012, phase: 3.1 },
    ]

    // Floating particles
    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 2.2 + 0.5,
      vx: (Math.random() - 0.5) * 0.00015,
      vy: (Math.random() - 0.5) * 0.00015,
      alpha: Math.random() * 0.4 + 0.1,
    }))

    const draw = () => {
      const W = canvas.width, H = canvas.height
      ctx.clearRect(0, 0, W, H)

      // White base
      ctx.fillStyle = '#f8fafc'
      ctx.fillRect(0, 0, W, H)

      // Soft gradient orbs
      orbs.forEach(o => {
        const ox = o.x + Math.sin(t * o.speed + o.phase) * 0.06
        const oy = o.y + Math.cos(t * o.speed * 0.7 + o.phase) * 0.05
        const pulse = 1 + Math.sin(t * o.speed * 2 + o.phase) * 0.08
        const grad = ctx.createRadialGradient(ox * W, oy * H, 0, ox * W, oy * H, o.r * pulse)
        grad.addColorStop(0,   `rgba(${o.color},0.18)`)
        grad.addColorStop(0.5, `rgba(${o.color},0.07)`)
        grad.addColorStop(1,   `rgba(${o.color},0)`)
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(ox * W, oy * H, o.r * pulse, 0, Math.PI * 2)
        ctx.fill()
      })

      // Subtle mesh lines
      const STEP = 60
      const cols = Math.ceil(W / STEP) + 1
      const rows = Math.ceil(H / STEP) + 1
      ctx.strokeStyle = 'rgba(148,163,184,0.08)'
      ctx.lineWidth = 0.8
      for (let c = 0; c < cols; c++) {
        ctx.beginPath(); ctx.moveTo(c * STEP, 0); ctx.lineTo(c * STEP, H); ctx.stroke()
      }
      for (let r = 0; r < rows; r++) {
        ctx.beginPath(); ctx.moveTo(0, r * STEP); ctx.lineTo(W, r * STEP); ctx.stroke()
      }

      // Floating dots with connections
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0
        if (p.y < 0) p.y = 1; if (p.y > 1) p.y = 0
      })

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const ax = particles[i].x * W, ay = particles[i].y * H
          const bx = particles[j].x * W, by = particles[j].y * H
          const dist = Math.sqrt((ax-bx)**2 + (ay-by)**2)
          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(ax, ay); ctx.lineTo(bx, by)
            ctx.strokeStyle = `rgba(99,139,219,${0.12 * (1 - dist / 100)})`
            ctx.lineWidth = 0.7
            ctx.stroke()
          }
        }
      }

      particles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(99,139,219,${p.alpha})`
        ctx.fill()
      })

      t++
      frame = requestAnimationFrame(draw)
    }

    draw()
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={ref} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />
}

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const loading = useAppSelector(selectAuthLoading)

  const [isRegister, setIsRegister] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'HR' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.email) e.email = 'Email is required'
    if (!form.password || form.password.length < 4) e.password = 'Password must be at least 4 characters'
    if (isRegister && !form.username) e.username = 'Username is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    let result: any
    if (isRegister) {
      result = await dispatch(register({ ...form }))
    } else {
      result = await dispatch(login({ email: form.email, password: form.password }))
    }
    if (result.meta.requestStatus === 'fulfilled') {
      setTimeout(() => router.push('/candidates'), 100)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; }

        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          font-family: 'Sora', sans-serif;
          position: relative;
          background: #f8fafc;
        }

        .login-wrap {
          width: 100%;
          max-width: 420px;
          position: relative;
          z-index: 10;
          animation: riseIn 0.6s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(20px) }
          to   { opacity: 1; transform: translateY(0) }
        }

        /* Logo */
        .logo-area { text-align: center; margin-bottom: 1.8rem; }
        .logo-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(30,109,219,0.07);
          border: 1px solid rgba(30,109,219,0.15);
          border-radius: 999px;
          padding: 0.28rem 0.8rem;
          margin-bottom: 0.9rem;
          font-size: 0.68rem;
          font-weight: 500;
          color: #2563eb;
          letter-spacing: 0.09em;
          text-transform: uppercase;
        }
        .logo-badge-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #3b82f6;
          animation: pulse-dot 2s infinite;
        }
        @keyframes pulse-dot {
          0%,100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.5) }
          50%      { box-shadow: 0 0 0 5px rgba(59,130,246,0) }
        }
        .logo-title {
          font-size: 2.2rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.03em;
          line-height: 1;
          margin-bottom: 0.4rem;
        }
        .logo-title span { color: #1e6ddb; }
        .logo-sub {
          font-size: 0.78rem;
          color: #94a3b8;
          font-weight: 400;
        }

        /* Card */
        .login-card {
          background: rgba(255,255,255,0.78);
          border: 1px solid rgba(226,232,240,0.9);
          border-radius: 18px;
          padding: 2rem;
          box-shadow:
            0 1px 2px rgba(0,0,0,0.04),
            0 8px 24px rgba(0,0,0,0.07),
            0 32px 64px rgba(30,109,219,0.05),
            inset 0 1px 0 rgba(255,255,255,0.9);
          backdrop-filter: blur(24px);
        }

        .card-header {
          font-size: 1.05rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .card-header-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1e6ddb, #60a5fa);
          flex-shrink: 0;
        }

        .fields-stack { display: flex; flex-direction: column; gap: 1rem; }

        .field { display: flex; flex-direction: column; gap: 0.38rem; }
        .field-label {
          font-size: 0.7rem;
          font-weight: 500;
          color: #64748b;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          font-family: 'DM Mono', monospace;
        }
        .field-wrap { position: relative; }
        .field-input {
          width: 100%;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 9px;
          color: #0f172a;
          padding: 0.65rem 0.9rem;
          font-size: 0.875rem;
          font-family: 'Sora', sans-serif;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
        }
        .field-input:focus {
          border-color: #3b82f6;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }
        .field-input::placeholder { color: #cbd5e1; }
        .field-input.has-icon { padding-right: 2.6rem; }
        .field-error {
          font-size: 0.68rem;
          color: #ef4444;
          font-family: 'DM Mono', monospace;
        }

        .eye-btn {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          transition: color 0.15s;
        }
        .eye-btn:hover { color: #475569; }

        .submit-btn {
          width: 100%;
          padding: 0.72rem 1rem;
          border-radius: 9px;
          border: none;
          background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%);
          color: #fff;
          font-family: 'Sora', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          transition: box-shadow 0.2s, transform 0.12s;
          box-shadow: 0 4px 12px rgba(37,99,235,0.35), 0 1px 3px rgba(37,99,235,0.2);
          margin-top: 0.2rem;
        }
        .submit-btn:hover:not(:disabled) {
          box-shadow: 0 6px 20px rgba(37,99,235,0.45), 0 2px 6px rgba(37,99,235,0.25);
          transform: translateY(-1px);
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
          margin: 1.4rem 0 1rem;
        }

        .toggle-btn {
          width: 100%;
          text-align: center;
          background: none;
          border: none;
          font-size: 0.8rem;
          color: #94a3b8;
          cursor: pointer;
          font-family: 'Sora', sans-serif;
          transition: color 0.18s;
          padding: 0;
        }
        .toggle-btn:hover { color: #2563eb; }
        .toggle-btn b { font-weight: 600; color: #2563eb; }

        .ai-footer {
          text-align: center;
          margin-top: 1.3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          font-size: 0.67rem;
          color: #cbd5e1;
          font-family: 'DM Mono', monospace;
          letter-spacing: 0.06em;
        }

        select.field-input option { background: #fff; color: #0f172a; }
      `}</style>

      <div className="login-root">
        <AnimatedBackground />

        <div className="login-wrap">
          {/* Logo */}
          <div className="logo-area">
            <div className="logo-badge">
              <div className="logo-badge-dot" />
              AI-Powered Recruitment
            </div>
            <div className="logo-title">Sok<span>.Hr</span></div>
            <div className="logo-sub">I can filter, search, and analyze all your candidate data.</div>
          </div>

          {/* Card */}
          <div className="login-card">
            <div className="card-header">
              <div className="card-header-dot" />
              {isRegister ? 'Create your account' : 'Welcome back'}
            </div>

            <div className="fields-stack">
              {isRegister && (
                <div className="field">
                  <div className="field-label">Username</div>
                  <input className="field-input" placeholder="your_username" value={form.username}
                    onChange={e => setForm({ ...form, username: e.target.value })} />
                  {errors.username && <div className="field-error">↑ {errors.username}</div>}
                </div>
              )}

              <div className="field">
                <div className="field-label">Email</div>
                <input className="field-input" type="email" placeholder="you@company.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} />
                {errors.email && <div className="field-error">↑ {errors.email}</div>}
              </div>

              <div className="field">
                <div className="field-label">Password</div>
                <div className="field-wrap">
                  <input className="field-input has-icon" type={showPass ? 'text' : 'password'}
                    placeholder="••••••••" value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
                  <button className="eye-btn" type="button" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <div className="field-error">↑ {errors.password}</div>}
              </div>

              {isRegister && (
                <div className="field">
                  <div className="field-label">Role</div>
                  <select className="field-input" value={form.role}
                    onChange={e => setForm({ ...form, role: e.target.value })}>
                    <option value="HR">HR Staff</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              )}

              <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
                {loading && <Loader2 size={15} className="animate-spin" />}
                {loading ? 'Signing in...' : isRegister ? 'Create Account' : 'Sign In'}
              </button>
            </div>

            <div className="divider" />

            <button className="toggle-btn" onClick={() => { setIsRegister(!isRegister); setErrors({}) }}>
              {isRegister
                ? <>Already have an account? <b>Sign in</b></>
                : <>Don't have an account? <b>Register</b></>}
            </button>
          </div>

          <div className="ai-footer">
            <Sparkles size={10} />
            <span>Powered by AI · Secure · Enterprise-ready</span>
          </div>
        </div>
      </div>
    </>
  )
}