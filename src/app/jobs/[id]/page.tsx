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

interface SelectedCandidate {
  id: number
  name: string
  email: string
}

type EmailTemplate = 'shortlist' | 'rejection' | 'meeting' | 'custom'

// ─── Email Form Panel (replaces left content) ─────────
function EmailFormPanel({
  candidates,
  jobTitle,
  onBack,
}: {
  candidates: SelectedCandidate[]
  jobTitle: string
  onBack: () => void
}) {
  const [template, setTemplate] = useState<EmailTemplate>('shortlist')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [meetingLocation, setMeetingLocation] = useState('')
  const [meetingTimes, setMeetingTimes] = useState<Record<number, { date: string; time: string }>>(
    () => Object.fromEntries(candidates.map(c => [c.id, { date: '', time: '' }]))
  )
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const TEMPLATES: Record<EmailTemplate, { label: string; icon: any; color: string; bg: string }> = {
    shortlist: { label: 'Shortlist / Interview Invite', icon: UserCheck, color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
    meeting:   { label: 'Schedule Meeting',            icon: Calendar,   color: '#1e6ddb', bg: 'rgba(30,109,219,0.08)' },
    rejection: { label: 'Rejection (Polite)',          icon: UserX,      color: '#dc2626', bg: 'rgba(220,38,38,0.07)' },
    custom:    { label: 'Custom / Free-form',          icon: PenLine,    color: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
  }

  const setMeetingField = (id: number, field: 'date' | 'time', value: string) => {
    setMeetingTimes(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
  }

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) { setError('Subject and message are required.'); return }
    if (template === 'meeting') {
      const missing = candidates.filter(c => !meetingTimes[c.id]?.date || !meetingTimes[c.id]?.time)
      if (missing.length > 0) {
        setError(`Please set date & time for: ${missing.map(c => c.name).join(', ')}`)
        return
      }
    }
    setError('')
    setSending(true)
    try {
      const payload = candidates.map(c => ({
        candidateId: c.id,
        email: c.email,
        subject,
        body: template === 'meeting'
          ? body
              .replace('{{DATE}}', meetingTimes[c.id]?.date
                ? new Date(meetingTimes[c.id].date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                : '')
              .replace('{{TIME}}', meetingTimes[c.id]?.time || '')
              .replace('{{LOCATION}}', meetingLocation || '[Location]')
          : body,
        type: template.toUpperCase(),
        meetingDate: template === 'meeting' ? meetingTimes[c.id]?.date : undefined,
        meetingTime: template === 'meeting' ? meetingTimes[c.id]?.time : undefined,
        meetingLocation: template === 'meeting' ? meetingLocation : undefined,
      }))
      await api.post('/api/email/send-bulk', { emails: payload })
      setSent(true)
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to send. Please try again.')
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center gap-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)' }}>
          <Check size={28} style={{ color: '#16a34a' }} />
        </div>
        <div>
          <p className="font-semibold text-base mb-1" style={{ color: '#0f172a' }}>
            Sent to {candidates.length} candidate{candidates.length > 1 ? 's' : ''}
          </p>
          <p className="text-sm" style={{ color: '#94a3b8' }}>Your emails have been delivered successfully.</p>
        </div>
        <div className="flex flex-wrap gap-1.5 justify-center max-w-sm">
          {candidates.map(c => (
            <span key={c.id} className="text-xs px-2.5 py-1 rounded-full"
              style={{ background: '#f1f5f9', color: '#475569' }}>{c.name}</span>
          ))}
        </div>
        <button onClick={onBack}
          className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#e2e8f0')}
          onMouseLeave={e => (e.currentTarget.style.background = '#f1f5f9')}>
          <ChevronLeft size={15} /> Back to candidates
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-6 text-sm font-medium transition-colors"
        style={{ color: '#6B7A99' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#1e6ddb')}
        onMouseLeave={e => (e.currentTarget.style.color = '#6B7A99')}
      >
        <ArrowLeft size={15} /> Back to candidates
      </button>

      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(30,109,219,0.08)', border: '1px solid rgba(30,109,219,0.15)' }}>
            <Mail size={15} style={{ color: '#1e6ddb' }} />
          </div>
          <h1 className="text-lg font-bold" style={{ color: '#0F1729' }}>Send Email</h1>
        </div>
        <p className="text-sm ml-10" style={{ color: '#94a3b8' }}>
          {candidates.length} recipient{candidates.length > 1 ? 's' : ''} · {jobTitle}
        </p>
      </div>

      <div className="space-y-4">
        {/* Recipients */}
        <div className="card p-4">
          <label className="text-xs font-medium uppercase tracking-wider mb-2 block" style={{ color: '#64748b' }}>Recipients</label>
          <div className="flex flex-wrap gap-1.5">
            {candidates.map(c => (
              <span key={c.id} className="text-xs px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(30,109,219,0.08)', color: '#1e6ddb', border: '1px solid rgba(30,109,219,0.15)' }}>
                {c.name}
              </span>
            ))}
          </div>
        </div>

        {/* Template picker */}
        <div className="card p-4">
          <label className="text-xs font-medium uppercase tracking-wider mb-3 block" style={{ color: '#64748b' }}>Template</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(TEMPLATES) as [EmailTemplate, any][]).map(([key, t]) => {
              const Icon = t.icon
              const active = template === key
              return (
                <button key={key} onClick={() => setTemplate(key)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-xs font-medium transition-all"
                  style={{
                    background: active ? t.bg : '#f8fafc',
                    border: `1px solid ${active ? t.color + '40' : '#e2e8f0'}`,
                    color: active ? t.color : '#475569',
                  }}>
                  <Icon size={13} /> {t.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Per-candidate meeting slots */}
        {template === 'meeting' && (
          <div className="card overflow-hidden p-0">
            <div className="px-4 py-3" style={{ background: 'rgba(30,109,219,0.04)', borderBottom: '1px solid rgba(30,109,219,0.1)' }}>
              <p className="text-xs font-semibold mb-2.5" style={{ color: '#1e6ddb' }}>Meeting Details</p>
              <div>
                <label className="text-xs mb-1 block" style={{ color: '#64748b' }}>Location / Video Link (shared)</label>
                <input type="text" value={meetingLocation} onChange={e => setMeetingLocation(e.target.value)}
                  placeholder="e.g. Zoom link, Office Room 3B"
                  className="w-full rounded-lg px-3 py-2 text-xs outline-none"
                  style={{ border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#3b82f6')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#e2e8f0')} />
              </div>
            </div>

            <div>
              {candidates.map((c, i) => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-3"
                  style={{
                    background: i % 2 === 0 ? '#fff' : '#fafbfc',
                    borderBottom: i < candidates.length - 1 ? '1px solid #f1f5f9' : 'none'
                  }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: '#0f172a' }}>{c.name}</p>
                    <p className="text-xs truncate" style={{ color: '#94a3b8' }}>{c.email}</p>
                  </div>
                  <input type="date" value={meetingTimes[c.id]?.date || ''}
                    onChange={e => setMeetingField(c.id, 'date', e.target.value)}
                    className="rounded-lg px-2 py-1.5 text-xs outline-none"
                    style={{ border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a', width: 130 }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#3b82f6')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#e2e8f0')} />
                  <input type="time" value={meetingTimes[c.id]?.time || ''}
                    onChange={e => setMeetingField(c.id, 'time', e.target.value)}
                    className="rounded-lg px-2 py-1.5 text-xs outline-none"
                    style={{ border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a', width: 100 }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#3b82f6')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#e2e8f0')} />
                </div>
              ))}
            </div>

            <div className="px-4 py-2.5" style={{ background: 'rgba(30,109,219,0.03)', borderTop: '1px solid rgba(30,109,219,0.08)' }}>
              <p className="text-xs" style={{ color: '#94a3b8' }}>
                Use{' '}
                {['{{DATE}}', '{{TIME}}', '{{LOCATION}}'].map(tag => (
                  <code key={tag} className="mx-0.5 px-1 rounded"
                    style={{ background: '#e0e7ff', color: '#4338ca' }}>{tag}</code>
                ))}{' '}
                in your message — replaced per candidate.
              </p>
            </div>
          </div>
        )}

        {/* Subject */}
        <div className="card p-4">
          <label className="text-xs font-medium uppercase tracking-wider mb-1.5 block" style={{ color: '#64748b' }}>Subject</label>
          <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
            placeholder="Email subject"
            className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
            style={{ border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a' }}
            onFocus={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)' }}
            onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none' }} />
        </div>

        {/* Body */}
        <div className="card p-4">
          <label className="text-xs font-medium uppercase tracking-wider mb-1.5 block" style={{ color: '#64748b' }}>Message</label>
          <textarea value={body} onChange={e => setBody(e.target.value)}
            rows={10}
            placeholder={template === 'meeting'
              ? 'Write your message. Use {{DATE}}, {{TIME}}, {{LOCATION}} where needed...'
              : 'Write your message...'}
            className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none transition-all"
            style={{ border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', lineHeight: 1.6 }}
            onFocus={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)' }}
            onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none' }} />
        </div>

        {error && (
          <p className="text-xs px-3 py-2 rounded-lg"
            style={{ background: 'rgba(220,38,38,0.06)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.15)' }}>
            {error}
          </p>
        )}

        {/* Send button */}
        <div className="flex items-center justify-between pb-6">
          <p className="text-xs" style={{ color: '#94a3b8' }}>
            Sending to <span style={{ color: '#475569', fontWeight: 500 }}>
              {candidates.length} candidate{candidates.length > 1 ? 's' : ''}
            </span>
          </p>
          <button onClick={handleSend} disabled={sending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{
              background: sending ? '#93c5fd' : '#1e6ddb',
              boxShadow: sending ? 'none' : '0 4px 12px rgba(30,109,219,0.3)',
            }}>
            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {sending ? 'Sending...' : `Send to ${candidates.length}`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────
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