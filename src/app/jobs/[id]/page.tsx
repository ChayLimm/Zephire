'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, User, AlertCircle, CheckCircle, Send, Sparkles, Loader2, Bot } from 'lucide-react'
import { useAppDispatch } from '@/store/hooks'
import { setSelectedJob } from '@/store/slices/jobsSlice'
import { jobsApi, chatApi } from '@/lib/api'
import { ScoreBadge, DomainBadge } from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import { SkeletonList } from '@/components/ui/Skeleton'
import JobChat from '@/components/jobs/chat/JobChat'
import MatchCard from '@/components/jobs/chat/MatchCard'


export default function JobDetailPage() {
  const params = useParams()
  const id = params.id as string
  const dispatch = useAppDispatch()
  const router = useRouter()
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F4F6FA' }}>
      {/* ── LEFT: Job detail + matches (scrollable) ── */}
      <div className="flex-1 overflow-y-auto p-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-5 transition-colors text-sm font-medium"
          style={{ color: '#6B7A99' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#1e6ddb')}
          onMouseLeave={e => (e.currentTarget.style.color = '#6B7A99')}
        >
          <ArrowLeft size={15} /> Back to Jobs
        </button>

        {/* Job Info Card */}
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

        {/* Match Results */}
        <h2 className="text-sm font-semibold mb-3" style={{ color: '#0F1729' }}>Matched Candidates</h2>
        {matchResults.length === 0 ? (
          <div className="card p-8 text-center">
            <User size={28} className="mx-auto mb-3" style={{ color: '#D1D9E6' }} />
            <p className="text-sm" style={{ color: '#9BAABF' }}>No candidates matched.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {[...matchResults]
              .sort((a: any, b: any) => (b.match_score || b.matchScore) - (a.match_score || a.matchScore))
              .map((r: any, i: number) => (
                <MatchCard key={r.id} result={r} rank={i + 1} />
              ))}
          </div>
        )}
      </div>

      {/* ── RIGHT: Job-scoped Chat ── */}
      <div
        className="flex flex-col"
        style={{
          width: 400,
          borderLeft: '1px solid rgba(0,0,0,0.07)',
          background: '#FFFFFF',
          flexShrink: 0,
        }}
      >
        <JobChat jobId={Number(id)} jobTitle={job.title} />
      </div>
    </div>
  )
}
