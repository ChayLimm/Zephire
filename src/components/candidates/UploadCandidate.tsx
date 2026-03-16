// ─── Upload Modal ──────────────────────────────────────

import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { selectCandidatesLoading, updateCandidate, uploadCandidate } from "@/store/slices/candidatesSlice"
import { Candidate } from "@/types"
import { FileText, Loader2, PenLine, Upload, X } from "lucide-react"
import { useRef, useState } from "react"

const DOMAINS = ['tech', 'sales', 'marketing', 'finance', 'hr', 'operations']
const FILTER_DOMAINS = ['', ...DOMAINS]
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8010'

export default function UploadModal({ onClose, candidate }: {
    onClose: () => void
    candidate?: Candidate
}) {
    const dispatch = useAppDispatch()
    const loading = useAppSelector(selectCandidatesLoading)
    const fileRef = useRef<HTMLInputElement>(null)
    const [dragOver, setDragOver] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const isUpdate = !!candidate 

    const [form, setForm] = useState({
        name: candidate?.name || '',
        email: candidate?.email || '',
        phone: candidate?.phone || '',
        domain: candidate?.domain || '',
        position: candidate?.position || '',
        exp_years: candidate?.exp_years?.toString() || '',
    })

    const setField = (key: string, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }))
        setErrors(prev => ({ ...prev, [key]: '' }))
    }

    const handleFileChange = (f: File | null) => {
        if (!f) return
        if (f.type !== 'application/pdf') {
            setErrors(prev => ({ ...prev, file: 'Only PDF files are accepted' }))
            return
        }
        setFile(f)
        setErrors(prev => ({ ...prev, file: '' }))
    }

    const validate = () => {
        const e: Record<string, string> = {}
        if (!form.name) e.name = 'Name is required'
        if (!form.email) e.email = 'Email is required'
        if (!form.phone) e.phone = 'Phone is required'
        if (!form.domain) e.domain = 'Please select a domain'
        if (!form.position) e.position = 'Position is required'
        if (!form.exp_years || isNaN(Number(form.exp_years))) e.exp_years = 'Valid years required'
        if (!isUpdate && !file) e.file = 'Please select a CV file'  // ← only required for upload
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = async () => {
        if (!validate()) return

        if (isUpdate) {
            // ── Update mode ──
            const result = await dispatch(updateCandidate({
                id: candidate!.id,
                name: form.name,
                email: form.email,
                phone: form.phone,
                domain: form.domain,
                position: form.position,
                exp_years: Number(form.exp_years),

            }))
            if (result.meta.requestStatus === 'fulfilled') onClose()
        } else {
            // ── Upload mode ──
            const result = await dispatch(uploadCandidate({
                file: file!,
                data: {
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    domain: form.domain,
                    position: form.position,
                    exp_years: Number(form.exp_years),
                }
            }))
            if (result.meta.requestStatus === 'fulfilled') onClose()
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-panel p-6" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>

                {/* Header */}
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold" style={{ color: '#0F1729' }}>
                            {isUpdate ? 'Edit Candidate' : 'Upload CV'}
                        </h3>
                        <p className="text-xs mt-0.5" style={{ color: '#9BAABF' }}>
                            {isUpdate ? 'Update candidate information' : 'AI will extract and enrich candidate info automatically'}
                        </p>
                    </div>
                    {/* ❌ Remove this button from here */}
                    <button onClick={onClose} style={{ color: '#9BAABF' }}>
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-4">

                    {/* Row: Name + Email */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium mb-1.5 block" style={{ color: '#6B7A99' }}>
                                Full Name <span style={{ color: '#DC2626' }}>*</span>
                            </label>
                            <input className="input-field" placeholder="John Doe"
                                value={form.name} onChange={e => setField('name', e.target.value)} />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1.5 block" style={{ color: '#6B7A99' }}>
                                Email <span style={{ color: '#DC2626' }}>*</span>
                            </label>
                            <input className="input-field" placeholder="john@email.com" type="email"
                                value={form.email} onChange={e => setField('email', e.target.value)} />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                    </div>

                    {/* Row: Phone + Exp Years */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium mb-1.5 block" style={{ color: '#6B7A99' }}>
                                Phone <span style={{ color: '#DC2626' }}>*</span>
                            </label>
                            <input className="input-field" placeholder="+855 12 345 678"
                                value={form.phone} onChange={e => setField('phone', e.target.value)} />
                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1.5 block" style={{ color: '#6B7A99' }}>
                                Years of Experience <span style={{ color: '#DC2626' }}>*</span>
                            </label>
                            <input className="input-field" placeholder="3" type="number" min={0}
                                value={form.exp_years} onChange={e => setField('exp_years', e.target.value)} />
                            {errors.exp_years && <p className="text-red-500 text-xs mt-1">{errors.exp_years}</p>}
                        </div>
                    </div>

                    {/* Row: Domain + Position */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium mb-1.5 block" style={{ color: '#6B7A99' }}>
                                Domain <span style={{ color: '#DC2626' }}>*</span>
                            </label>
                            <select className="input-field" value={form.domain}
                                onChange={e => setField('domain', e.target.value)}>
                                <option value="">Select domain...</option>
                                {DOMAINS.map(d => (
                                    <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                                ))}
                            </select>
                            {errors.domain && <p className="text-red-500 text-xs mt-1">{errors.domain}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1.5 block" style={{ color: '#6B7A99' }}>
                                Position <span style={{ color: '#DC2626' }}>*</span>
                            </label>
                            <input className="input-field" placeholder="e.g. Frontend Developer"
                                value={form.position} onChange={e => setField('position', e.target.value)} />
                            {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position}</p>}
                        </div>
                    </div>

                    {/* File drop zone */}
                    {!isUpdate && (

                        <div>
                            <label className="text-xs font-medium mb-1.5 block" style={{ color: '#6B7A99' }}>
                                CV File (PDF) <span style={{ color: '#DC2626' }}>*</span>
                            </label>
                            <div
                                className="relative rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all"
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
                                            <p className="text-sm font-medium truncate max-w-[220px]" style={{ color: '#0F1729' }}>{file.name}</p>
                                            <p className="text-xs" style={{ color: '#9BAABF' }}>{(file.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                        <button onClick={e => { e.stopPropagation(); setFile(null) }}
                                            className="ml-2 transition-colors" style={{ color: '#9BAABF' }}
                                            onMouseEnter={e => (e.currentTarget.style.color = '#DC2626')}
                                            onMouseLeave={e => (e.currentTarget.style.color = '#9BAABF')}>
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Upload size={24} className="mx-auto mb-2" style={{ color: '#9BAABF' }} />
                                        <p className="text-sm" style={{ color: '#6B7A99' }}>
                                            Drop PDF here or <span style={{ color: '#1e6ddb' }}>browse</span>
                                        </p>
                                        <p className="text-xs mt-1" style={{ color: '#9BAABF' }}>PDF only · Max 10MB</p>
                                    </>
                                )}
                                <input ref={fileRef} type="file" accept=".pdf" className="hidden"
                                    onChange={e => handleFileChange(e.target.files?.[0] || null)} />
                            </div>
                            {errors.file && <p className="text-red-500 text-xs mt-1">{errors.file}</p>}
                        </div>

                    )}
                    {/* Info note */}
                    <div className="flex gap-2 p-3 rounded-lg text-xs"
                        style={{ background: 'rgba(30,109,219,0.05)', border: '1px solid rgba(30,109,219,0.12)', color: '#4B5775' }}>
                        <span style={{ color: '#1e6ddb' }}>✦</span>
                        <p>AI will automatically extract and enrich skills, experience, and more from the CV.</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 justify-end mt-6">
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? <Loader2 size={14} className="animate-spin" /> : isUpdate ? <PenLine size={14} /> : <Upload size={14} />}
                        {loading ? 'Saving...' : isUpdate ? 'Save Changes' : 'Upload & Extract'}
                    </button>
                </div>
            </div>
        </div>
    )
}
