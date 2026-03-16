'use client'
import { useEffect, useRef, useState } from 'react'
import { Upload, Search, Filter, Trash2, Eye, FileText, X, Loader2, Plus, Clock, CheckCircle, XCircle, Users } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchCandidates, removeCandidate, uploadCandidate,
  selectFilteredCandidates, selectCandidatesLoading,
  selectCandidatesError, setFilters, clearError,
  selectCandidatesFilters, setSelectedCandidate,
} from '@/store/slices/candidatesSlice'
import { openModal, closeModal, selectActiveModal, selectModalPayload } from '@/store/slices/uiSlice'
import { SkeletonList } from '@/components/ui/Skeleton'
import Avatar from '@/components/ui/Avatar'
import { DomainBadge } from '@/components/ui/Badge'
import { Candidate } from '@/types'
import { useRouter } from 'next/navigation'
import { candidatesApi } from '@/lib/api'
import UploadModal from '@/components/candidates/UploadCandidate'

const DOMAINS = ['tech', 'sales', 'marketing', 'finance', 'hr', 'operations']
const FILTER_DOMAINS = ['', ...DOMAINS]
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8010'

type Tab = 'approved' | 'pending'

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
  const [activeTab, setActiveTab] = useState<Tab>('approved')
  const [pending, setPending] = useState<Candidate[]>([])
  const [pendingLoading, setPendingLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => { dispatch(fetchCandidates()) }, [dispatch])

  useEffect(() => {
    if (activeTab === 'pending') fetchPending()
  }, [activeTab])

  const fetchPending = async () => {
    setPendingLoading(true)
    try {
      const res = await candidatesApi.getPending()
      const data = res.data?.data || res.data || []
      setPending(Array.isArray(data) ? data : [])
    } catch {
      setPending([])
    } finally {
      setPendingLoading(false)
    }
  }

  const handleApprove = async (id: number) => {
    setActionLoading(id)
    try {
      await candidatesApi.approve(id)
      setPending(prev => prev.filter(c => c.id !== id))
      dispatch(fetchCandidates()) // refresh approved list
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id: number) => {
    setActionLoading(id)
    try {
      await candidatesApi.reject(id)
      setPending(prev => prev.filter(c => c.id !== id))
    } finally {
      setActionLoading(null)
    }
  }

  const handleSearch = (v: string) => {
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => dispatch(setFilters({ search: v })), 300)
  }

  const handleDelete = async (id: number) => {
    await dispatch(removeCandidate(id))
    dispatch(closeModal())
  }

  const handleView = (c: Candidate) => {
    dispatch(setSelectedCandidate(c))  // ✅ fixed: pass c not candidates
    router.push(`/candidates/${c.id}`)
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

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: '#EDF0F7' }}>
        <button
          onClick={() => setActiveTab('approved')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={activeTab === 'approved' ? {
            background: '#FFFFFF',
            color: '#0F1729',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
          } : { color: '#6B7A99' }}
        >
          <Users size={14} />
          Approved
          <span className="text-xs px-1.5 py-0.5 rounded-md"
            style={{ background: activeTab === 'approved' ? 'rgba(30,109,219,0.1)' : 'rgba(0,0,0,0.06)', color: activeTab === 'approved' ? '#1e6ddb' : '#9BAABF' }}>
            {candidates.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={activeTab === 'pending' ? {
            background: '#FFFFFF',
            color: '#0F1729',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
          } : { color: '#6B7A99' }}
        >
          <Clock size={14} />
          Pending Review
          {pending.length > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded-md"
              style={{ background: 'rgba(245,158,11,0.15)', color: '#D97706' }}>
              {pending.length}
            </span>
          )}
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

      {/* ── Approved Tab ── */}
      {activeTab === 'approved' && (
        <>
          <div className="flex gap-3 mb-6">
           <div className="relative flex-1">
              <Search 
                size={16} 
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" 
                style={{ color: '#9BAABF' }} 
              />
              <input 
                className="input-field pl-9 w-full" 
                placeholder="Search by name or position..."
                onChange={e => handleSearch(e.target.value)} 
              />
            </div>
            <div className="relative">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9BAABF' }} />
              <select className="input-field pl-9 pr-4" style={{ width: 180 }}
                value={filters.domain} onChange={e => dispatch(setFilters({ domain: e.target.value }))}>
                {FILTER_DOMAINS.map(d => (
                  <option key={d} value={d}>{d ? d.charAt(0).toUpperCase() + d.slice(1) : 'All Domains'}</option>
                ))}
              </select>
            </div>
          </div>

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
        </>
      )}

      {/* ── Pending Tab ── */}
      {activeTab === 'pending' && (
        <>
          {pendingLoading ? (
            <SkeletonList count={3} />
          ) : pending.length === 0 ? (
            <div className="card p-16 text-center">
              <Clock size={40} className="mx-auto mb-4" style={{ color: '#D1D9E6' }} />
              <p style={{ color: '#9BAABF' }}>No pending applications.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((c: Candidate) => (
                <PendingRow
                  key={c.id}
                  candidate={c}
                  actionLoading={actionLoading === c.id}
                  onApprove={() => handleApprove(c.id)}
                  onReject={() => handleReject(c.id)}
                  onView={() => window.open(`${API_BASE}/api/candidates/${c.id}/preview`, '_blank')}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Upload CV Modal */}
      {showUploadModal && <UploadModal onClose={() => setShowUploadModal(false)} />}

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

// ─── Pending Row ───────────────────────────────────────
function PendingRow({ candidate: c, onApprove, onReject, onView, actionLoading }: {
  candidate: Candidate
  onApprove: () => void
  onReject: () => void
  onView: () => void
  actionLoading: boolean
}) {
  return (
    <div className="card p-4 flex items-center gap-4">
      <Avatar name={c.name || 'Unknown'} size={44} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-semibold text-sm" style={{ color: '#0F1729' }}>{c.name || 'Unknown'}</p>
          {c.domain && <DomainBadge domain={c.domain} />}
          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: 'rgba(245,158,11,0.1)', color: '#D97706', border: '1px solid rgba(245,158,11,0.2)' }}>
            Self Applied
          </span>
        </div>
        <p className="text-xs" style={{ color: '#6B7A99' }}>{c.email}</p>
        {c.position && (
          <p className="text-xs" style={{ color: '#9BAABF' }}>
            {c.position} · {c.exp_years ?? 0}yr exp
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Preview CV */}
        <button onClick={onView}
          className="p-2 rounded-lg transition-all"
          style={{ color: '#9BAABF' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#1e6ddb'; e.currentTarget.style.background = 'rgba(30,109,219,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#9BAABF'; e.currentTarget.style.background = 'transparent' }}
          title="Preview CV">
          <Eye size={16} />
        </button>

        {/* Reject */}
        <button onClick={onReject} disabled={actionLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{ background: 'rgba(239,68,68,0.06)', color: '#DC2626', border: '1px solid rgba(239,68,68,0.15)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.12)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.06)')}>
          {actionLoading ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={13} />}
          Reject
        </button>

        {/* Approve */}
        <button onClick={onApprove} disabled={actionLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{ background: 'rgba(34,197,94,0.08)', color: '#16A34A', border: '1px solid rgba(34,197,94,0.2)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(34,197,94,0.15)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(34,197,94,0.08)')}>
          {actionLoading ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={13} />}
          Approve
        </button>
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
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onTap}>
        <div className="flex items-center gap-2 mb-1">
          <p className="font-semibold text-sm" style={{ color: '#0F1729' }}>{c.name || 'Unknown'}</p>
          {c.domain && <DomainBadge domain={c.domain} />}
        </div>
        <p className="text-xs" style={{ color: '#6B7A99' }}>{c.email}</p>
        {c.position && (
          <p className="text-xs" style={{ color: '#9BAABF' }}>
            {c.position} · {c.exp_years ?? 0}yr exp
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
        <button onClick={onView}
          className="p-2 rounded-lg transition-all" style={{ color: '#9BAABF' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#1e6ddb'; e.currentTarget.style.background = 'rgba(30,109,219,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#9BAABF'; e.currentTarget.style.background = 'transparent' }}
          title="Preview CV">
          <Eye size={16} />
        </button>
        <button onClick={onDelete}
          className="p-2 rounded-lg transition-all" style={{ color: '#9BAABF' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#DC2626'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#9BAABF'; e.currentTarget.style.background = 'transparent' }}
          title="Delete">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}