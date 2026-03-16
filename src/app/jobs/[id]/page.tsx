'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft, User, Send, Loader2, Mail, X, Check,
  UserCheck, UserX, Calendar, PenLine, Users, ChevronLeft
} from 'lucide-react'
import { useAppDispatch } from '@/store/hooks'
import { setSelectedJob } from '@/store/slices/jobsSlice'
import { jobsApi } from '@/lib/api'
import { DomainBadge } from '@/components/ui/Badge'
import { SkeletonList } from '@/components/ui/Skeleton'
import JobChat from '@/components/jobs/chat/JobChat'
import MatchCard from '@/components/jobs/chat/MatchCard'
import api from '@/lib/api'
import EmailFormPanel from '@/components/jobs/EmailFormPanel'

interface SelectedCandidate {
  id: number
  name: string
  email: string
}

export default function JobDetailPage() {
  const params = useParams()
  const id = params.id as string
  const dispatch = useAppDispatch()
  const router = useRouter()
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<SelectedCandidate[]>([])
  const [showEmailForm, setShowEmailForm] = useState(false)

  useEffect(() => {
    setLoading(true)
    jobsApi.getById(Number(id))
      .then(res => {
        const data = res.data?.data || res.data
        setJob(data)
        dispatch(setSelectedJob(data))
      })
      .catch(() => router.push('/jobs'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-8"><SkeletonList count={3} /></div>
  if (!job) return null

  const matchResults = job.match_results || job.matchResults || []
  const requiredSkills = (() => {
    const s = job.required_skills || job.requiredSkills
    if (!s) return []
    if (Array.isArray(s)) return s
    try { return JSON.parse(s) } catch { return [] }
  })()

  const sortedResults = [...matchResults].sort(
    (a: any, b: any) => (b.match_score || b.matchScore) - (a.match_score || a.matchScore)
  )

  const toggleSelect = (candidate: SelectedCandidate) => {
    setSelected(prev =>
      prev.find(c => c.id === candidate.id)
        ? prev.filter(c => c.id !== candidate.id)
        : [...prev, candidate]
    )
  }

  const toggleSelectAll = () => {
    if (selected.length === sortedResults.length) {
      setSelected([])
    } else {
      setSelected(sortedResults.map((r: any) => ({
        id: r.candidateId || r.candidate_id,
        name: r.candidate_name || r.candidateName || 'Unknown',
        email: r.candidate_email || r.candidateEmail || '',
      })))
    }
  }

  const allSelected = selected.length === sortedResults.length && sortedResults.length > 0

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F4F6FA' }}>

      {/* ── LEFT: toggles between job detail and email form ── */}
      {showEmailForm ? (
        <EmailFormPanel
          candidates={selected}
          jobTitle={job.title}
          onBack={() => setShowEmailForm(false)}
        />
      ) : (
        <div className="flex-1 overflow-y-auto p-6 relative">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 mb-5 transition-colors text-sm font-medium"
            style={{ color: '#6B7A99' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#1e6ddb')}
            onMouseLeave={e => (e.currentTarget.style.color = '#6B7A99')}
          >
            <ArrowLeft size={15} /> Back to Jobs
          </button>

          {/* Job Info */}
          <div className="card p-5 mb-4">
            <h1 className="text-lg font-bold mb-2" style={{ color: '#0F1729' }}>{job.title}</h1>
            <div className="flex items-center gap-2 mb-3">
              {job.field && <DomainBadge domain={job.field} />}
              <span className="text-xs" style={{ color: '#9BAABF' }}>
                {job.min_exp_years || job.minExpYears}+ yrs exp
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: '#4B5775' }}>{job.description}</p>
            {requiredSkills.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: '#9BAABF' }}>Required Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {requiredSkills.map((s: string) => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded-md"
                      style={{ background: 'rgba(30,109,219,0.08)', color: '#1e6ddb', border: '1px solid rgba(30,109,219,0.15)' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-4 pt-3 border-t" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
              <p className="text-xs" style={{ color: '#9BAABF' }}>
                Created by <span style={{ color: '#4B5775' }}>{job.created_by || job.createdBy}</span>
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="card p-4">
              <p className="text-2xl font-bold" style={{ color: '#1e6ddb' }}>{matchResults.length}</p>
              <p className="text-xs mt-1" style={{ color: '#9BAABF' }}>Total Matches</p>
            </div>
            <div className="card p-4">
              <p className="text-2xl font-bold" style={{ color: '#F59E0B' }}>
                {matchResults.length > 0
                  ? Math.round(matchResults.reduce((a: number, r: any) => a + (r.match_score || r.matchScore || 0), 0) / matchResults.length)
                  : 0}%
              </p>
              <p className="text-xs mt-1" style={{ color: '#9BAABF' }}>Avg Score</p>
            </div>
          </div>

          {/* Candidates header */}
          {sortedResults.length > 0 && (
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold" style={{ color: '#0F1729' }}>Matched Candidates</h2>
              <button onClick={toggleSelectAll}
                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all"
                style={{
                  background: allSelected ? 'rgba(30,109,219,0.08)' : '#f1f5f9',
                  color: allSelected ? '#1e6ddb' : '#64748b',
                  border: `1px solid ${allSelected ? 'rgba(30,109,219,0.2)' : '#e2e8f0'}`,
                }}>
                <Users size={12} />
                {allSelected ? 'Deselect all' : 'Select all'}
              </button>
            </div>
          )}

          {sortedResults.length === 0 ? (
            <div className="card p-8 text-center">
              <User size={28} className="mx-auto mb-3" style={{ color: '#D1D9E6' }} />
              <p className="text-sm" style={{ color: '#9BAABF' }}>No candidates matched.</p>
            </div>
          ) : (
            <div className="space-y-2" style={{ paddingBottom: selected.length > 0 ? '5rem' : '1rem' }}>
              {sortedResults.map((r: any, i: number) => {
                const cid = r.candidateId || r.candidate_id
                const isSelected = selected.some(c => c.id === cid)
                return (
                  <MatchCard
                    key={r.id}
                    result={r}
                    rank={i + 1}
                    selected={isSelected}
                    onToggleSelect={toggleSelect}
                  />
                )
              })}
            </div>
          )}

          {/* Floating action bar */}
          {selected.length > 0 && (
            <div
              className="fixed bottom-6 flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#0f172a',
                boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
                zIndex: 40,
                animation: 'slideUp 0.2s ease',
              }}
            >
              <style>{`@keyframes slideUp { from { opacity:0; transform:translateX(-50%) translateY(12px) } to { opacity:1; transform:translateX(-50%) translateY(0) } }`}</style>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: '#1e6ddb', color: '#fff' }}>
                  {selected.length}
                </div>
                <span className="text-sm text-white font-medium">
                  candidate{selected.length > 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="w-px h-5 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowEmailForm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                  style={{ background: '#1e6ddb', color: '#fff' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#2563eb')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#1e6ddb')}>
                  <Mail size={13} /> Send Email
                </button>
                <button
                  onClick={() => setSelected([])}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all"
                  style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.14)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}>
                  <X size={12} /> Clear
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── RIGHT: Chat — always visible ── */}
      <div className="flex flex-col flex-shrink-0"
        style={{ width: 400, borderLeft: '1px solid rgba(0,0,0,0.07)', background: '#FFFFFF' }}>
        <JobChat jobId={Number(id)} jobTitle={job.title} />
      </div>
    </div>
  )



}