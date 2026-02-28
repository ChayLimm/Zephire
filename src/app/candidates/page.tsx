'use client'
import { useEffect, useRef, useState } from 'react'
import { Upload, Search, Filter, Trash2, Eye, FileText, X, Loader2, Plus } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchCandidates, removeCandidate, uploadCandidate, updateCandidate,
  selectFilteredCandidates, selectCandidatesLoading,
  selectCandidatesError, setFilters, clearError,
  selectCandidatesFilters,
  setSelectedCandidate,
} from '@/store/slices/candidatesSlice'
import { openModal, closeModal, selectActiveModal, selectModalPayload } from '@/store/slices/uiSlice'
import { SkeletonList } from '@/components/ui/Skeleton'
import Avatar from '@/components/ui/Avatar'
import { DomainBadge } from '@/components/ui/Badge'
import { Candidate } from '@/types'
import { useRouter, useParams } from 'next/navigation'

const DOMAINS = ['tech', 'sales', 'marketing', 'finance', 'hr', 'operations']
const FILTER_DOMAINS = ['', ...DOMAINS]
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8010'

export default function CandidatesPage() {
  const dispatch = useAppDispatch()
  const candidates = useAppSelector(selectFilteredCandidates)
  const loading = useAppSelector(selectCandidatesLoading)
  const error = useAppSelector(selectCandidatesError)
  const filters = useAppSelector(selectCandidatesFilters)
  const activeModal = useAppSelector(selectActiveModal)
  const modalPayload = useAppSelector(selectModalPayload)
  const searchTimer = useRef<NodeJS.Timeout>()
  const [showUploadModal, setShowUploadModal] = useState(false)
  const router = useRouter()

  useEffect(() => { dispatch(fetchCandidates()) }, [dispatch])

  const handleSearch = (v: string) => {
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => dispatch(setFilters({ search: v })), 300)
  }

  const handleDelete = async (id: number) => {
    await dispatch(removeCandidate(id))
    dispatch(closeModal())
  }

  const handleView = (canditate: Candidate) => {
    dispatch(setSelectedCandidate(candidates))
    router.push(`/candidates/${canditate.id}`)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0F1729' }}>Candidates</h1>
          <p className="text-sm mt-1" style={{ color: '#6B7A99' }}>{candidates.length} total candidates</p>
        </div>
        <button onClick={() => setShowUploadModal(true)} className="btn-primary">
          <Plus size={16} /> Upload CV
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl mb-6"
          style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', color: '#DC2626' }}>
          <X size={16} />
          <p className="flex-1 text-sm">{error}</p>
          <button onClick={() => dispatch(clearError())}><X size={14} /></button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-10 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9BAABF' }} />
          <input
            className="input-field pl-9"
            placeholder="Search by name or position..."
            onChange={e => handleSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9BAABF' }} />
          <select
            className="input-field pl-9 pr-4"
            style={{ width: 180 }}
            value={filters.domain}
            onChange={e => dispatch(setFilters({ domain: e.target.value }))}
          >
            {FILTER_DOMAINS.map(d => (
              <option key={d} value={d}>{d ? d.charAt(0).toUpperCase() + d.slice(1) : 'All Domains'}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Candidate list */}
      {loading && candidates.length === 0 ? (
        <SkeletonList count={5} />
      ) : candidates.length === 0 ? (
        <div className="card p-16 text-center">
          <FileText size={40} className="mx-auto mb-4" style={{ color: '#D1D9E6' }} />
          <p style={{ color: '#9BAABF' }}>No candidates yet. Upload a CV to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {candidates.map((c: Candidate) => (
            <CandidateRow
              key={c.id}
              candidate={c}
              onDelete={() => dispatch(openModal({ type: 'deleteCandidate', payload: c }))}
              onView={() => window.open(`${API_BASE}/api/candidates/${c.id}/preview`, '_blank')}
              onTap={() => handleView(c)}
            />
          ))}
        </div>
      )}

      {/* Upload CV Modal */}
      {showUploadModal && (
        <UploadModal onClose={() => setShowUploadModal(false)} />
      )}

      {/* Delete Modal */}
      {activeModal === 'deleteCandidate' && modalPayload && (
        <div className="modal-overlay" onClick={() => dispatch(closeModal())}>
          <div className="modal-panel p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#0F1729' }}>Delete Candidate</h3>
            <p className="text-sm mb-6" style={{ color: '#6B7A99' }}>
              Are you sure you want to remove{' '}
              <span className="font-medium" style={{ color: '#0F1729' }}>{modalPayload.name}</span>?
            </p>
            <div className="flex gap-3 justify-end">
              <button className="btn-secondary" onClick={() => dispatch(closeModal())}>Cancel</button>
              <button className="btn-danger" onClick={() => handleDelete(modalPayload.id)} disabled={loading}>
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Upload Modal ──────────────────────────────────────
function UploadModal({ onClose }: { onClose: () => void }) {
  const dispatch = useAppDispatch()
  const loading = useAppSelector(selectCandidatesLoading)
  const fileRef = useRef<HTMLInputElement>(null)
  const [domain, setDomain] = useState('')
  const [email, setEmail] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [dragOver, setDragOver] = useState(false)

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
    if (!domain) e.domain = 'Please select a domain'
    if (!domain) e.domain = 'Please enter your email'
    if (!file) e.file = 'Please select a CV file'
    setErrors(e)
    return Object.keys(e).length === 0
  }


  const handleSubmit = async () => {
    if (!validate()) return
    const result = await dispatch(uploadCandidate({ file: file!, domain, email }))
    if (result.meta.requestStatus === 'fulfilled') onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel p-6" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold" style={{ color: '#0F1729' }}>Upload CV</h3>
            <p className="text-xs mt-0.5" style={{ color: '#9BAABF' }}>AI will extract candidate info automatically</p>
          </div>
          <button onClick={onClose} style={{ color: '#9BAABF' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#4B5775')}
            onMouseLeave={e => (e.currentTarget.style.color = '#9BAABF')}>
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Domain dropdown */}
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: '#6B7A99' }}>
              Candidate Domain <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <select
              className="input-field"
              value={domain}
              onChange={e => { setDomain(e.target.value); setErrors(prev => ({ ...prev, domain: '' })) }}
            >
              <option value="">Select a domain...</option>
              {DOMAINS.map(d => (
                <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
              ))}
            </select>
            {errors.domain && <p className="text-red-500 text-xs mt-1">{errors.domain}</p>}
          </div>

          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: '#6B7A99' }}>
              Candidate Email <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              name='email'
              className="input-field"
              value={domain}
              onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })) }}
            >
            </input>
          </div>

          {/* File drop zone */}
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
                  <button
                    onClick={e => { e.stopPropagation(); setFile(null) }}
                    className="ml-2 transition-colors"
                    style={{ color: '#9BAABF' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#DC2626')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#9BAABF')}
                  >
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
              <input
                ref={fileRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={e => handleFileChange(e.target.files?.[0] || null)}
              />
            </div>
            {errors.file && <p className="text-red-500 text-xs mt-1">{errors.file}</p>}
          </div>

          {/* Info note */}
          <div className="flex gap-2 p-3 rounded-lg text-xs"
            style={{ background: 'rgba(30,109,219,0.05)', border: '1px solid rgba(30,109,219,0.12)', color: '#4B5775' }}>
            <span style={{ color: '#1e6ddb' }}>✦</span>
            <p>AI will automatically extract name, email, skills, experience, and more from the CV.</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end mt-6">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {loading ? 'Processing...' : 'Upload & Extract'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Candidate Row ─────────────────────────────────────
function CandidateRow({ candidate: c, onDelete, onView, onTap }: {
  candidate: Candidate
  onDelete: () => void
  onView: () => void
  onTap: () => void
}) {
  const skills = (() => {
    try {
      if (!c.skills) return []
      if (Array.isArray(c.skills)) return c.skills
      return JSON.parse(c.skills as any)
    } catch { return [] }
  })()

  return (
    <div className="card p-4 flex items-center gap-4">
      <Avatar name={c.name || 'Unknown'} size={44} />
      <div className="flex-1 min-w-0" onClick={onTap}>
        <div className="flex items-center gap-2 mb-1">
          <p className="font-semibold text-sm" style={{ color: '#0F1729' }}>{c.name || 'Unknown'}</p>
          {c.domain && <DomainBadge domain={c.domain} />}
        </div>
        <p className="text-xs" style={{ color: '#6B7A99' }}>{c.email}</p>
        {c.position && (
          <p className="text-xs" style={{ color: '#9BAABF' }}>
            {c.position} · {c.expYears ?? 0}yr exp
          </p>
        )}
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {skills.slice(0, 3).map((s: string) => (
          <span key={s} className="text-xs px-2 py-0.5 rounded-md"
            style={{ background: '#F0F4FF', color: '#4B5775', border: '1px solid #E0E7FF' }}>
            {s}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onView}
          className="p-2 rounded-lg transition-all"
          style={{ color: '#9BAABF' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#1e6ddb'; e.currentTarget.style.background = 'rgba(30,109,219,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#9BAABF'; e.currentTarget.style.background = 'transparent' }}
          title="Preview CV"
        >
          <Eye size={16} />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-lg transition-all"
          style={{ color: '#9BAABF' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#DC2626'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#9BAABF'; e.currentTarget.style.background = 'transparent' }}
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}