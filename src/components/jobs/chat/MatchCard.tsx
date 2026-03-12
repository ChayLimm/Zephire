'use client'
import { AlertCircle, CheckCircle } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch } from "@/store/hooks"
import { setSelectedCandidate } from "@/store/slices/candidatesSlice"
import Avatar from "@/components/ui/Avatar"
import { ScoreBadge } from "@/components/ui/Badge"

export default function MatchCard({
  result: r,
  rank,
  selected,
  onToggleSelect,
}: {
  result: any
  rank: number
  selected?: boolean
  onToggleSelect?: (candidate: { id: number; name: string; email: string }) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const dispatch = useAppDispatch()
  const router = useRouter()

  const score = r.match_score ?? r.matchScore ?? 0
  const scoreColor = score >= 80 ? '#22C55E' : score >= 60 ? '#F59E0B' : '#EF4444'

  const reasons = (() => {
    const v = r.match_reasons || r.matchReasons
    if (!v) return []
    if (Array.isArray(v)) return v
    try { return JSON.parse(v) } catch { return [] }
  })()

  const gaps = (() => {
    const v = r.gaps
    if (!v) return []
    if (Array.isArray(v)) return v
    try { return JSON.parse(v) } catch { return [] }
  })()

  const name = r.candidate_name || r.candidateName || 'Unknown'
  const position = r.candidate_position || r.candidatePosition || ''
  const candidateId = r.candidateId || r.candidate_id
  const email = r.candidate_email || r.candidateEmail || ''

  const handleCardClick = () => setExpanded(!expanded)

  const handleNameClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!candidateId) return
    dispatch(setSelectedCandidate(r))
    router.push(`/candidates/${candidateId}`)
  }

  const handleCheckbox = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleSelect?.({ id: candidateId, name, email })
  }

  return (
    <div
      className="card p-3.5 cursor-pointer transition-all"
      onClick={handleCardClick}
      style={selected ? {
        border: '1px solid rgba(30,109,219,0.4)',
        background: 'rgba(30,109,219,0.03)',
        boxShadow: '0 0 0 3px rgba(30,109,219,0.08)',
      } : {}}
    >
      <div className="flex items-center gap-2.5">
        {/* Checkbox */}
        {onToggleSelect && (
          <div
            onClick={handleCheckbox}
            className="flex-shrink-0 w-4 h-4 rounded flex items-center justify-center transition-all"
            style={{
              border: selected ? '2px solid #1e6ddb' : '2px solid #D1D9E6',
              background: selected ? '#1e6ddb' : '#fff',
              cursor: 'pointer',
            }}
          >
            {selected && (
              <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        )}

        <span className="text-xs font-bold w-4 flex-shrink-0" style={{ color: '#9BAABF' }}>#{rank}</span>

        {/* Clickable avatar + name */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0"
          onClick={handleNameClick}
          title="View candidate profile">
          <Avatar name={name} size={34} />
          <div className="min-w-0">
            <p className="font-semibold text-xs hover:underline"
              style={{ color: '#0F1729', textDecorationColor: '#1e6ddb' }}>
              {name}
            </p>
            <p className="text-xs" style={{ color: '#6B7A99' }}>{position}</p>
          </div>
        </div>

        <ScoreBadge score={score} />
      </div>

      <div className="mt-2.5 score-bar" style={{ marginLeft: onToggleSelect ? '2.5rem' : '1.75rem' }}>
        <div className="score-fill" style={{ width: `${score}%`, background: scoreColor }} />
      </div>

      {expanded && (
        <div className="mt-3 space-y-2.5" style={{ marginLeft: onToggleSelect ? '2.5rem' : '1.75rem' }}>
          {reasons.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: '#9BAABF' }}>Why they match</p>
              {reasons.map((reason: string, i: number) => (
                <div key={i} className="flex items-start gap-1.5 mb-1">
                  <CheckCircle size={11} className="mt-0.5 flex-shrink-0" style={{ color: '#22C55E' }} />
                  <p className="text-xs" style={{ color: '#4B5775' }}>{reason}</p>
                </div>
              ))}
            </div>
          )}
          {gaps.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: '#9BAABF' }}>Gaps</p>
              {gaps.map((gap: string, i: number) => (
                <div key={i} className="flex items-start gap-1.5 mb-1">
                  <AlertCircle size={11} className="mt-0.5 flex-shrink-0" style={{ color: '#F59E0B' }} />
                  <p className="text-xs" style={{ color: '#4B5775' }}>{gap}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}