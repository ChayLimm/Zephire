'use client'
import { useEffect, useState } from 'react'
import { Mail, CheckCircle2, Star } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchEmails, updateEmailStatus, selectEmails, selectEmailLoading } from '@/store/slices/emailSlice'
import { Email } from '@/types'

const TYPE_COLORS: Record<string, { bg: string; color: string; border: string; label: string }> = {
  SHORTLIST: { bg: 'rgba(22,163,74,0.08)',  color: '#16a34a', border: 'rgba(22,163,74,0.2)',  label: 'Shortlist' },
  MEETING:   { bg: 'rgba(30,109,219,0.08)', color: '#1e6ddb', border: 'rgba(30,109,219,0.2)', label: 'Meeting'   },
  REJECTION: { bg: 'rgba(220,38,38,0.07)',  color: '#dc2626', border: 'rgba(220,38,38,0.15)', label: 'Rejection' },
  CUSTOM:    { bg: 'rgba(124,58,237,0.08)', color: '#7c3aed', border: 'rgba(124,58,237,0.2)', label: 'Custom'    },
}

const STAGE_STATUSES = [
  { value: 'PENDING',     label: 'Pending',     bg: 'rgba(234,179,8,0.08)',   color: '#ca8a04', border: 'rgba(234,179,8,0.2)'   },
  { value: 'SHORTLISTED', label: 'Shortlisted', bg: 'rgba(22,163,74,0.08)',   color: '#16a34a', border: 'rgba(22,163,74,0.2)'   },
  { value: 'INTERVIEWED', label: 'Interviewed', bg: 'rgba(30,109,219,0.08)',  color: '#1e6ddb', border: 'rgba(30,109,219,0.2)'  },
  { value: 'OFFER_SENT',  label: 'Offer Sent',  bg: 'rgba(124,58,237,0.08)', color: '#7c3aed', border: 'rgba(124,58,237,0.2)'  },
  { value: 'REJECTED',    label: 'Rejected',    bg: 'rgba(220,38,38,0.07)',   color: '#dc2626', border: 'rgba(220,38,38,0.15)'  },
]

const CATEGORIES = [
  { value: 'ALL',       label: 'All'       },
  { value: 'SHORTLIST', label: 'Shortlist' },
  { value: 'MEETING',   label: 'Meeting'   },
  { value: 'REJECTION', label: 'Rejection' },
  { value: 'CUSTOM',    label: 'Custom'    },
]

function initials(name: string) {
  return name.split(/[@.\s]/).filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const isToday = d.toDateString() === new Date().toDateString()
  if (isToday) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function avatarColor(email: string) {
  const colors = ['#1e6ddb','#16a34a','#7c3aed','#dc2626','#ca8a04','#0891b2','#be185d']
  return colors[(email.charCodeAt(0) || 0) % colors.length]
}

export default function EmailsPage() {
  const dispatch = useAppDispatch()
  const emails = useAppSelector(selectEmails)
  const loading = useAppSelector(selectEmailLoading)
  const [selected, setSelected] = useState<any>(null)
  const [category, setCategory] = useState('ALL')
  const [savingStage, setSavingStage] = useState(false)
  const [savedStage, setSavedStage] = useState(false)
  const [starred, setStarred] = useState<Set<string>>(new Set())
  const [stageValue, setStageValue] = useState<string>('PENDING')

  useEffect(() => { dispatch(fetchEmails()) }, [dispatch])

  // Seed stageValue whenever a different email is selected
  useEffect(() => {
    if (selected) setStageValue(selected.stage || 'PENDING')
  }, [selected?.id])

  const handleStageChange = async (value: string) => {
    setStageValue(value) // optimistic — owns the UI value independently of Redux
    setSavingStage(true)
    setSavedStage(false)
    await dispatch(updateEmailStatus({ id: selected.id, status: value }))
    setSavingStage(false)
    setSavedStage(true)
    setTimeout(() => setSavedStage(false), 2000)
  }

  const toggleStar = (id: string, ev: React.MouseEvent) => {
    ev.stopPropagation()
    setStarred(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const filtered = emails.filter((e: Email) => category === 'ALL' || e.type === category)

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f6f8fc', fontFamily: "'Google Sans', Roboto, sans-serif", overflow: 'hidden' }}>

      {/* ── Left: email list ── */}
      <div style={{ width: 340, display: 'flex', flexDirection: 'column', background: '#fff', borderRight: '1px solid #e8eaed', flexShrink: 0 }}>

        {/* Category tabs */}
        <div style={{ borderBottom: '1px solid #e8eaed', flexShrink: 0 }}>
          <div style={{ display: 'flex' }}>
            {CATEGORIES.map(cat => {
              const t = cat.value !== 'ALL' ? TYPE_COLORS[cat.value] : null
              const activeColor = t?.color || '#1a73e8'
              const isActive = category === cat.value
              return (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  style={{
                    flex: 1, padding: '11px 2px', border: 'none', background: 'transparent',
                    cursor: 'pointer', fontSize: 12, fontWeight: isActive ? 600 : 400,
                    color: isActive ? activeColor : '#5f6368',
                    borderBottom: `2px solid ${isActive ? activeColor : 'transparent'}`,
                    transition: 'all 0.15s', whiteSpace: 'nowrap',
                  }}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Count row */}
        <div style={{ padding: '6px 16px', borderBottom: '1px solid #f1f3f4' }}>
          <span style={{ fontSize: 12, color: '#9aa0a6' }}>
            {filtered.length} email{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Email rows */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <p style={{ textAlign: 'center', fontSize: 13, color: '#9aa0a6', padding: 24 }}>Loading...</p>
          ) : filtered.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 40, gap: 8 }}>
              <Mail size={26} style={{ color: '#c5c9d0' }} />
              <p style={{ fontSize: 13, color: '#9aa0a6' }}>No emails here</p>
            </div>
          ) : filtered.map((e: Email) => {
            const t = TYPE_COLORS[e.type] || TYPE_COLORS.CUSTOM
            const isSelected = selected?.id === e.id
            const av = avatarColor(e.toEmail || '')

            return (
              <div
                key={e.id}
                onClick={() => { setSelected(e); setSavedStage(false) }}
                style={{
                  display: 'flex', alignItems: 'center', padding: '0 8px',
                  background: isSelected ? '#d3e3fd' : '#fff',
                  borderBottom: '1px solid #f1f3f4', cursor: 'pointer', transition: 'background 0.12s',
                }}
                onMouseEnter={ev => { if (!isSelected) (ev.currentTarget as HTMLElement).style.background = '#f2f6fc' }}
                onMouseLeave={ev => { if (!isSelected) (ev.currentTarget as HTMLElement).style.background = '#fff' }}
              >
               

                <div style={{ width: 32, height: 32, borderRadius: '50%', background: av, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#fff', flexShrink: 0, marginRight: 10 }}>
                  {initials(e.toEmail || '?')}
                </div>

                <div style={{ flex: 1, minWidth: 0, padding: '10px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#202124', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
                      {e.toEmail}
                    </span>
                    <span style={{ fontSize: 11, color: '#5f6368', flexShrink: 0, marginLeft: 4 }}>
                      {formatDate(e.sentAt)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 3, background: t.bg, color: t.color, border: `1px solid ${t.border}`, fontWeight: 500, flexShrink: 0 }}>
                      {t.label}
                    </span>
                    <p style={{ fontSize: 13, color: '#5f6368', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                      {e.subject}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Right: reading pane ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff', margin: 8, borderRadius: 8, border: '1px solid #e8eaed' }}>
        {!selected ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f1f3f4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mail size={24} style={{ color: '#9aa0a6' }} />
            </div>
            <p style={{ fontSize: 14, color: '#5f6368' }}>Select an email to read</p>
          </div>
        ) : (() => {
          const t = TYPE_COLORS[selected.type] || TYPE_COLORS.CUSTOM
          const currentStage = STAGE_STATUSES.find(st => st.value === stageValue) || STAGE_STATUSES[0]
          const av = avatarColor(selected.toEmail || '')

          return (
            <div style={{ flex: 1, overflowY: 'auto', padding: '28px 36px' }}>

              {/* Subject row + stage status */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 12 }}>
                <h2 style={{ fontSize: 20, fontWeight: 400, color: '#202124', margin: 0, lineHeight: 1.3 }}>
                  {selected.subject}
                </h2>

                {/* Stage status pill — clickable cycling */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={currentStage.value}
                      disabled={savingStage}
                      onChange={e => handleStageChange(e.target.value)}
                      style={{
                        appearance: 'none', WebkitAppearance: 'none',
                        fontSize: 12, fontWeight: 600, padding: '5px 28px 5px 12px',
                        borderRadius: 20, cursor: 'pointer',
                        background: currentStage.bg, color: currentStage.color,
                        border: `1.5px solid ${currentStage.border}`,
                        outline: 'none', transition: 'all 0.15s',
                        opacity: savingStage ? 0.6 : 1,
                      }}
                    >
                      {STAGE_STATUSES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    {/* Chevron icon */}
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                      <path d="M2 3.5L5 6.5L8 3.5" stroke={currentStage.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  {savingStage && <span style={{ fontSize: 11, color: '#9aa0a6' }}>Saving...</span>}
                  {savedStage && (
                    <span style={{ fontSize: 11, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <CheckCircle2 size={11} /> Saved
                    </span>
                  )}
                </div>
              </div>

              {/* Type badge */}
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 12, background: t.bg, color: t.color, border: `1px solid ${t.border}`, fontWeight: 500 }}>
                  {t.label}
                </span>
              </div>

              {/* Recipient row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #e8eaed' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: av, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
                  {initials(selected.toEmail || '?')}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: 13, color: '#5f6368' }}>To:</span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#202124' }}>{selected.toEmail}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#5f6368', marginTop: 2 }}>
                    {new Date(selected.sentAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div style={{ fontSize: 14, color: '#202124', lineHeight: 1.75, whiteSpace: 'pre-line', marginBottom: 36 }}>
                {selected.body}
              </div>



            </div>
          )
        })()}
      </div>
    </div>
  )
}