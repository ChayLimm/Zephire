// app/emails/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { Mail, Search } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchEmails, updateEmailStatus, selectEmails, selectEmailLoading } from '@/store/slices/emailSlice'
import { Email } from '@/types'

const TYPE_COLORS: Record<string, { bg: string; color: string; border: string; label: string }> = {
  SHORTLIST: { bg: 'rgba(22,163,74,0.08)',   color: '#16a34a', border: 'rgba(22,163,74,0.2)',   label: 'Shortlist' },
  MEETING:   { bg: 'rgba(30,109,219,0.08)',  color: '#1e6ddb', border: 'rgba(30,109,219,0.2)',  label: 'Meeting'   },
  REJECTION: { bg: 'rgba(220,38,38,0.07)',   color: '#dc2626', border: 'rgba(220,38,38,0.15)',  label: 'Rejection' },
  CUSTOM:    { bg: 'rgba(124,58,237,0.08)',  color: '#7c3aed', border: 'rgba(124,58,237,0.2)',  label: 'Custom'    },
}

const STATUS_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  SENT:   { bg: 'rgba(22,163,74,0.08)',  color: '#16a34a', border: 'rgba(22,163,74,0.2)'  },
  FAILED: { bg: 'rgba(220,38,38,0.07)', color: '#dc2626', border: 'rgba(220,38,38,0.15)' },
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

export default function EmailsPage() {
  const dispatch = useAppDispatch()
  const emails = useAppSelector(selectEmails)
  const loading = useAppSelector(selectEmailLoading)
  const [selected, setSelected] = useState<any>(null)
  const [search, setSearch] = useState('')

  useEffect(() => { dispatch(fetchEmails()) }, [dispatch])

  const filtered = emails.filter((e: Email) =>
    e.toEmail?.toLowerCase().includes(search.toLowerCase()) ||
    e.subject?.toLowerCase().includes(search.toLowerCase()) ||
    e.type?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#0F1729' }}>Sent Emails</h1>
        <p className="text-sm mt-1" style={{ color: '#6B7A99' }}>{emails.length} total emails</p>
      </div>

      <div className="flex gap-0 border rounded-xl overflow-hidden" style={{ height: 600, borderColor: '#E2E8F0' }}>
        
        {/* Left — Email List */}
        <div className="flex flex-col" style={{ width: 320, borderRight: '1px solid #E2E8F0', flexShrink: 0 }}>
          <div className="p-4" style={{ borderBottom: '1px solid #E2E8F0' }}>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9BAABF' }} />
              <input
                className="input-field pl-8 w-full text-sm"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {loading ? (
              <p className="text-center text-sm p-8" style={{ color: '#9BAABF' }}>Loading...</p>
            ) : filtered.length === 0 ? (
              <p className="text-center text-sm p-8" style={{ color: '#9BAABF' }}>No emails found</p>
            ) : filtered.map((e:Email) => {
              const t = TYPE_COLORS[e.type] || TYPE_COLORS.CUSTOM
              const s = STATUS_COLORS[e.status] || STATUS_COLORS.SENT
              const isSelected = selected?.id === e.id
              return (
                <div
                  key={e.id}
                  onClick={() => setSelected(e)}
                  className="p-3 cursor-pointer"
                  style={{
                    borderBottom: '1px solid #F1F5F9',
                    background: isSelected ? '#F8FAFC' : 'transparent'
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center justify-center rounded-full text-xs font-medium flex-shrink-0"
                      style={{ width: 32, height: 32, background: t.bg, border: `1px solid ${t.border}`, color: t.color }}>
                      {initials(e.toEmail || '?')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: '#0F1729' }}>{e.toEmail}</p>
                      <p className="text-xs truncate" style={{ color: '#6B7A99' }}>{e.subject}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-xs px-1.5 py-0.5 rounded"
                        style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                        {e.status}
                      </span>
                      <span className="text-xs" style={{ color: '#9BAABF' }}>{formatDate(e.sentAt)}</span>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded"
                    style={{ background: t.bg, color: t.color, border: `1px solid ${t.border}` }}>
                    {t.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right — Email Detail */}
        <div className="flex-1 overflow-y-auto p-6">
          {!selected ? (
            <div className="h-full flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#F1F5F9' }}>
                <Mail size={18} style={{ color: '#9BAABF' }} />
              </div>
              <p className="text-sm" style={{ color: '#9BAABF' }}>Select an email to view details</p>
            </div>
          ) : (() => {
            const t = TYPE_COLORS[selected.type] || TYPE_COLORS.CUSTOM
            const s = STATUS_COLORS[selected.status] || STATUS_COLORS.SENT
            return (
              <div>
                <div className="mb-5">
                  <p className="text-base font-semibold mb-2" style={{ color: '#0F1729' }}>{selected.subject}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded"
                      style={{ background: t.bg, color: t.color, border: `1px solid ${t.border}` }}>{t.label}</span>
                    <span className="text-xs px-2 py-0.5 rounded"
                      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{selected.status}</span>
                  </div>
                </div>

                <div className="rounded-xl p-3 mb-4" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center rounded-full text-xs font-medium"
                      style={{ width: 36, height: 36, background: t.bg, border: `1px solid ${t.border}`, color: t.color }}>
                      {initials(selected.toEmail || '?')}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#0F1729' }}>{selected.toEmail}</p>
                      <p className="text-xs" style={{ color: '#6B7A99' }}>Sent {formatDate(selected.sentAt)}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl p-4 mb-4" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: '#9BAABF' }}>Message</p>
                  <p className="text-sm whitespace-pre-line" style={{ color: '#0F1729', lineHeight: 1.6 }}>{selected.body}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => dispatch(updateEmailStatus({ id: selected.id, status: 'SENT' }))}
                    className="flex-1 text-xs py-2 rounded-lg"
                    style={{ background: 'rgba(22,163,74,0.08)', color: '#16a34a', border: '1px solid rgba(22,163,74,0.2)' }}>
                    Mark as sent
                  </button>
                  <button
                    onClick={() => dispatch(updateEmailStatus({ id: selected.id, status: 'FAILED' }))}
                    className="flex-1 text-xs py-2 rounded-lg"
                    style={{ background: 'rgba(220,38,38,0.07)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.15)' }}>
                    Mark as failed
                  </button>
                </div>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}