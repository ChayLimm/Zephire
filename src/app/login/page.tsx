'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { login, register, selectAuthLoading } from '@/store/slices/authSlice'

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
      setTimeout(() => {
        router.push('/candidates')
      }, 100)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'radial-gradient(ellipse at top left, rgba(0,212,170,0.06) 0%, #0F1117 50%)' }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #00D4AA, #0099FF)' }}>
            <Sparkles size={26} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>
            HR<span style={{ color: '#00D4AA' }}>.AI</span>
          </h1>
          <p className="text-slate-400 text-sm">Smart Candidate Management</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <h2 className="text-xl font-semibold text-white mb-6">
            {isRegister ? 'Create Account' : 'Welcome back'}
          </h2>

          <div className="space-y-4">
            {isRegister && (
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">Username</label>
                <input
                  className="input-field"
                  placeholder="your_username"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                />
                {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">Email</label>
              <input
                className="input-field"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  className="input-field pr-10"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            {isRegister && (
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">Role</label>
                <select
                  className="input-field"
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                >
                  <option value="HR">HR Staff</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary w-full justify-center mt-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsRegister(!isRegister); setErrors({}) }}
              className="text-sm text-slate-400 hover:text-teal-400 transition-colors"
              style={{ '--tw-text-opacity': 1 } as any}
            >
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
