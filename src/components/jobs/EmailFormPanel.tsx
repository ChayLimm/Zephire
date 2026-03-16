import api from "@/lib/api"
import { ArrowLeft, Calendar, Check, ChevronLeft, Loader2, Mail, PenLine, Send, UserCheck, UserX } from "lucide-react"
import { useState } from "react"
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { sendBulkEmails, resetEmail, selectEmailLoading, selectEmailSuccess, selectEmailError } from '@/store/slices/emailSlice'

type EmailTemplate = 'shortlist' | 'rejection' | 'meeting' | 'custom'


interface SelectedCandidate {
  id: number
  name: string
  email: string
}
export default function EmailFormPanel({
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
    
  const dispatch = useAppDispatch()
  const sending = useAppSelector(selectEmailLoading)
  const sent = useAppSelector(selectEmailSuccess)
  const error = useAppSelector(selectEmailError) || ''


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
  if (!subject.trim() || !body.trim()) return
  
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

  dispatch(sendBulkEmails(payload))
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