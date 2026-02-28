import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { createJob, selectJobsLoading } from "@/store/slices/jobsSlice"
import { Loader2, Plus, Target, X } from "lucide-react"
import { useState } from "react"

export default 
function JobFormModal({ onClose }: { onClose: () => void }) {
  const dispatch = useAppDispatch()
  const loading = useAppSelector(selectJobsLoading)
  const [form, setForm] = useState({
    title: '', field: 'tech', position: '', description: '',
    min_exp_years: 1, required_skills: [] as string[],
  })
  const [skillInput, setSkillInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const addSkill = () => {
    const s = skillInput.trim()
    if (s && !form.required_skills.includes(s)) {
      setForm({ ...form, required_skills: [...form.required_skills, s] })
    }
    setSkillInput('')
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.title) e.title = 'Title is required'
    if (!form.position) e.position = 'Position is required'
    if (!form.description) e.description = 'Description is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    const result = await dispatch(createJob(form))
    if (result.meta.requestStatus === 'fulfilled') onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel p-6" onClick={e => e.stopPropagation()} style={{ maxWidth: 580 }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold" style={{ color: '#0F1729' }}>Create Job & Match Candidates</h3>
          <button onClick={onClose} style={{ color: '#9BAABF' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#4B5775')}
            onMouseLeave={e => (e.currentTarget.style.color = '#9BAABF')}>
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: '#6B7A99' }}>Job Title *</label>
              <input className="input-field" placeholder="Senior Flutter Developer"
                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: '#6B7A99' }}>Field *</label>
              <select className="input-field" value={form.field} onChange={e => setForm({ ...form, field: e.target.value })}>
                {['tech', 'sales', 'marketing', 'finance', 'hr', 'operations'].map(d => (
                  <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: '#6B7A99' }}>Position *</label>
              <input className="input-field" placeholder="Flutter Developer"
                value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} />
              {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position}</p>}
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: '#6B7A99' }}>Min Experience (years)</label>
              <input className="input-field" type="number" min={0}
                value={form.min_exp_years} onChange={e => setForm({ ...form, min_exp_years: +e.target.value })} />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: '#6B7A99' }}>Required Skills</label>
            <div className="flex gap-2 mb-2">
              <input className="input-field" placeholder="Add skill and press Enter"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
              <button className="btn-secondary px-3" onClick={addSkill}><Plus size={14} /></button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {form.required_skills.map(s => (
                <span key={s} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md"
                  style={{ background: 'rgba(30,109,219,0.08)', color: '#1e6ddb', border: '1px solid rgba(30,109,219,0.2)' }}>
                  {s}
                  <button onClick={() => setForm({ ...form, required_skills: form.required_skills.filter(x => x !== s) })}>
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: '#6B7A99' }}>Job Description *</label>
            <textarea className="input-field" rows={4} placeholder="Describe the role, requirements, and responsibilities..."
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Target size={14} />}
            {loading ? 'Matching...' : 'Create & Match'}
          </button>
        </div>
      </div>
    </div>
  )
}