import { AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";
import Avatar from "../../ui/Avatar";
import { ScoreBadge } from "../../ui/Badge";

export default function MatchCard({ result: r, rank }: { result: any; rank: number }) {
  const [expanded, setExpanded] = useState(false)
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

  return (
    <div className="card p-3.5 cursor-pointer" onClick={() => setExpanded(!expanded)}>
      <div className="flex items-center gap-2.5">
        <span className="text-xs font-bold w-4" style={{ color: '#9BAABF' }}>#{rank}</span>
        <Avatar name={name} size={34} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-xs" style={{ color: '#0F1729' }}>{name}</p>
          <p className="text-xs" style={{ color: '#6B7A99' }}>{position}</p>
        </div>
        <ScoreBadge score={score} />
      </div>

      <div className="mt-2.5 ml-7 score-bar">
        <div className="score-fill" style={{ width: `${score}%`, background: scoreColor }} />
      </div>

      {expanded && (
        <div className="mt-3 ml-7 space-y-2.5">
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