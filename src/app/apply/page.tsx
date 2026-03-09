'use client'
import { useRef, useState } from 'react'
import { Upload, FileText, X, Loader2, CheckCircle, Sparkles } from 'lucide-react'
import { candidatesApi } from '@/lib/api'

const DOMAINS = ['tech', 'sales', 'marketing', 'finance', 'hr', 'operations']

type Step = 'form' | 'success'

export default function ApplyPage() {
  const [step, setStep] = useState<Step>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    domain: '',
    position: '',
    exp_years: 0,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleFileChange = (f: File | null) => {
    if (!f) return
    if (f.type !== 'application/pdf') {
      setErrors(prev => ({ ...prev, file: 'Only PDF files are accepted' }))
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, file: 'File must be under 10MB' }))
      return
    }
    setFile(f)
    setErrors(prev => ({ ...prev, file: '' }))
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email format'
    if (!form.domain) e.domain = 'Please select a domain'
    if (!form.position.trim()) e.position = 'Position is required'
    if (!file) e.file = 'Please upload your CV'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    setError(null)
    try {
      await candidatesApi.apply(file!, form)
      setStep('success')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#F4F6FA' }}>
        <div className="card p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.2)' }}>
            <CheckCircle size={32} style={{ color: '#16A34A' }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#0F1729' }}>Application Submitted!</h2>
          <p className="text-sm mb-6" style={{ color: '#6B7A99' }}>
            Thank you <strong style={{ color: '#0F1729' }}>{form.name}</strong>! Your CV has been received
            and is pending review by our HR team. We'll be in touch soon.
          </p>
          <div className="p-4 rounded-xl text-xs text-left space-y-1"
            style={{ background: 'rgba(30,109,219,0.05)', border: '1px solid rgba(30,109,219,0.12)' }}>
            <p style={{ color: '#9BAABF' }}>What happens next?</p>
            <p style={{ color: '#4B5775' }}>① HR team reviews your application</p>
            <p style={{ color: '#4B5775' }}>② AI extracts and analyzes your CV</p>
            <p style={{ color: '#4B5775' }}>③ You'll be matched against open positions</p>
          </div>
          <button
            onClick={() => { setStep('form'); setForm({ name: '', email: '', phone: '', domain: '', position: '', exp_years: 0 }); setFile(null) }}
            className="btn-secondary w-full mt-6 justify-center"
          >
            Submit Another Application
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#F4F6FA' }}>
      {/* Header */}
      <div className="bg-white border-b px-6 py-4" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1e6ddb, #4f9ef8)' }}>
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold" style={{ fontFamily: 'Sora, sans-serif', color: '#0F1729' }}>
            Hire<span style={{ color: '#1e6ddb' }}>nova</span>
          </span>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#0F1729' }}>Apply for a Position</h1>
          <p className="text-sm" style={{ color: '#6B7A99' }}>
            Submit your CV and our AI will match you with the best open roles.
          </p>
        </div>

        {/* Global error */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl mb-6"
            style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', color: '#DC2626' }}>
            <X size={16} />
            <p className="flex-1 text-sm">{error}</p>
            <button onClick={() => setError(null)}><X size={14} /></button>
          </div>
        )}

        <div className="card p-6 space-y-5">

          {/* Name + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: '#6B7A99' }}>
                Full Name <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input className="input-field" placeholder="Chay Lim"
                value={form.name}
                onChange={e => { setForm({ ...form, name: e.target.value }); setErrors(prev => ({ ...prev, name: '' })) }} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: '#6B7A99' }}>
                Email <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input className="input-field" placeholder="you@email.com" type="email"
                value={form.email}
                onChange={e => { setForm({ ...form, email: e.target.value }); setErrors(prev => ({ ...prev, email: '' })) }} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Phone + Domain */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: '#6B7A99' }}>
                Phone <span style={{ color: '#9BAABF' }}>(optional)</span>
              </label>
              <input className="input-field" placeholder="+855 12 345 678"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: '#6B7A99' }}>
                Domain <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <select className="input-field" value={form.domain}
                onChange={e => { setForm({ ...form, domain: e.target.value }); setErrors(prev => ({ ...prev, domain: '' })) }}>
                <option value="">Select your domain...</option>
                {DOMAINS.map(d => (
                  <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                ))}
              </select>
              {errors.domain && <p className="text-red-500 text-xs mt-1">{errors.domain}</p>}
            </div>
          </div>

          {/* Position + Experience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: '#6B7A99' }}>
                Current / Desired Position <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input className="input-field" placeholder="Flutter Developer"
                value={form.position}
                onChange={e => { setForm({ ...form, position: e.target.value }); setErrors(prev => ({ ...prev, position: '' })) }} />
              {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position}</p>}
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: '#6B7A99' }}>
                Years of Experience
              </label>
              <input className="input-field" type="number" min={0} max={50}
                value={form.exp_years}
                onChange={e => setForm({ ...form, exp_years: Number(e.target.value) })} />
            </div>
          </div>

          {/* CV Upload */}
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: '#6B7A99' }}>
              CV / Resume (PDF) <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <div
              className="rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all"
              style={{
                borderColor: dragOver ? '#1e6ddb' : errors.file ? 'rgba(239,68,68,0.4)' : '#D1D9E6',
                background: dragOver ? 'rgba(30,109,219,0.04)' : '#F8FAFC',
              }}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleFileChange(e.dataTransfer.files[0]) }}
            >
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(30,109,219,0.08)', border: '1px solid rgba(30,109,219,0.2)' }}>
                    <FileText size={18} style={{ color: '#1e6ddb' }} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium" style={{ color: '#0F1729' }}>{file.name}</p>
                    <p className="text-xs" style={{ color: '#9BAABF' }}>{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); setFile(null) }}
                    className="ml-2 transition-colors" style={{ color: '#9BAABF' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#DC2626')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#9BAABF')}>
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload size={28} className="mx-auto mb-3" style={{ color: '#9BAABF' }} />
                  <p className="text-sm font-medium mb-1" style={{ color: '#4B5775' }}>
                    Drop your CV here or <span style={{ color: '#1e6ddb' }}>browse</span>
                  </p>
                  <p className="text-xs" style={{ color: '#9BAABF' }}>PDF only · Max 10MB</p>
                </>
              )}
              <input ref={fileRef} type="file" accept=".pdf" className="hidden"
                onChange={e => handleFileChange(e.target.files?.[0] || null)} />
            </div>
            {errors.file && <p className="text-red-500 text-xs mt-1">{errors.file}</p>}
          </div>

          {/* Info note */}
          <div className="flex gap-2 p-3 rounded-lg text-xs"
            style={{ background: 'rgba(30,109,219,0.05)', border: '1px solid rgba(30,109,219,0.12)', color: '#4B5775' }}>
            <span style={{ color: '#1e6ddb' }}>✦</span>
            <p>Our AI will extract your skills, experience, and match you against open positions automatically.</p>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary w-full justify-center py-3"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Processing your CV...</>
              : <><Upload size={16} /> Submit Application</>
            }
          </button>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#9BAABF' }}>
          Your data is handled securely and will only be used for recruitment purposes.
        </p>
      </div>
    </div>
  )
}