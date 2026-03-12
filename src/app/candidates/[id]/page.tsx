'use client'
import CandidateChat from "@/components/jobs/chat/CandidateChat"
import Avatar from "@/components/ui/Avatar"
import { DomainBadge } from "@/components/ui/Badge"
import { SkeletonList } from "@/components/ui/Skeleton"
import { candidatesApi, chatApi } from "@/lib/api"
import { useAppDispatch } from "@/store/hooks"
import { setSelectedCandidate } from "@/store/slices/candidatesSlice"
import {
    ArrowLeft, Bot, Eye, Mail, Phone, Briefcase, Clock,
    Send, Sparkles, Loader2, X,
    FileText
} from "lucide-react"
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useRef, useState } from "react"

export default function CandidateDetailPage() {
    const param = useParams()
    const id = param.id as string
    const router = useRouter()
    const [candidate, setCandidate] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const dispatch = useAppDispatch()
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8010'

    useEffect(() => {
        setLoading(true)
        candidatesApi.getById(Number(id))
            .then(res => {
                const data = res.data?.data || res.data
                setCandidate(data)
                dispatch(setSelectedCandidate(data))
            })
            .catch(() => router.push('/candidates'))
            .finally(() => setLoading(false))
    }, [id])

    if (loading) return <div className="p-8"><SkeletonList count={3} /></div>
    if (!candidate) return null

    const skills = (() => {
        try {
            if (!candidate.skills) return []
            if (Array.isArray(candidate.skills)) return candidate.skills
            return JSON.parse(candidate.skills)
        } catch { return [] }
    })()

    const stack = (() => {
        try {
            if (!candidate.stack) return []
            if (Array.isArray(candidate.stack)) return candidate.stack
            return JSON.parse(candidate.stack)
        } catch { return [] }
    })()

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: '#F4F6FA' }}>

            {/* ── LEFT: Candidate Info ── */}
            {/* ── LEFT: Candidate Info ── */}
            <div className="flex-1 overflow-y-auto p-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 mb-6 text-sm font-medium transition-colors"
                    style={{ color: '#6B7A99' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#1e6ddb')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#6B7A99')}
                >
                    <ArrowLeft size={15} /> Back to Candidates
                </button>

                {/* Profile Card */}
                <div className="card p-6 mb-4">
                    <div className="flex items-start gap-4">
                        <Avatar name={candidate.name || 'Unknown'} size={56} />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h1 className="text-xl font-bold" style={{ color: '#0F1729' }}>{candidate.name}</h1>
                                {candidate.domain && <DomainBadge domain={candidate.domain} />}
                            </div>
                            {candidate.position && (
                                <p className="text-sm font-medium mb-2" style={{ color: '#4B5775' }}>{candidate.position}</p>
                            )}
                            <div className="flex flex-wrap gap-4 text-xs" style={{ color: '#9BAABF' }}>
                                {candidate.email && (
                                    <span className="flex items-center gap-1">
                                        <Mail size={12} /> {candidate.email}
                                    </span>
                                )}
                                {candidate.phone && (
                                    <span className="flex items-center gap-1">
                                        <Phone size={12} /> {candidate.phone}
                                    </span>
                                )}
                                {candidate.exp_years != null && (
                                    <span className="flex items-center gap-1">
                                        <Briefcase size={12} /> {candidate.exp_years} yr exp
                                    </span>
                                )}
                                {candidate.uploadedAt && (
                                    <span className="flex items-center gap-1">
                                        <Clock size={12} /> {new Date(candidate.uploadedAt).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => window.open(`${API_BASE}/api/candidates/${candidate.id}/preview`, '_blank')}
                            className="btn-secondary text-xs py-2 px-3 flex-shrink-0"
                        >
                            {/* <Eye size={13} /> Open CV */}
                        </button>
                    </div>
                </div>

                {/* Skills */}
                {skills.length > 0 && (
                    <div className="card p-5 mb-4">
                        <h2 className="text-sm font-semibold mb-3" style={{ color: '#0F1729' }}>Skills</h2>
                        <div className="flex flex-wrap gap-2">
                            {skills.map((s: string) => (
                                <span key={s} className="text-xs px-2.5 py-1 rounded-md font-medium"
                                    style={{ background: '#F0F4FF', color: '#4B5775', border: '1px solid #E0E7FF' }}>
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tech Stack */}
                {stack.length > 0 && (
                    <div className="card p-5 mb-4">
                        <h2 className="text-sm font-semibold mb-3" style={{ color: '#0F1729' }}>Tech Stack</h2>
                        <div className="flex flex-wrap gap-2">
                            {stack.map((s: string) => (
                                <span key={s} className="text-xs px-2.5 py-1 rounded-md font-medium"
                                    style={{ background: 'rgba(30,109,219,0.06)', color: '#1e6ddb', border: '1px solid rgba(30,109,219,0.15)' }}>
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Details */}
                {/* <div className="card p-5 mb-4">
                    <h2 className="text-sm font-semibold mb-3" style={{ color: '#0F1729' }}>Details</h2>
                    <div className="space-y-2 text-sm">
                        {candidate.uploadedBy && (
                            <div className="flex justify-between">
                                <span style={{ color: '#9BAABF' }}>Uploaded by</span>
                                <span style={{ color: '#4B5775' }}>{candidate.uploadedBy}</span>
                            </div>
                        )}
                        {candidate.source && (
                            <div className="flex justify-between">
                                <span style={{ color: '#9BAABF' }}>Source</span>
                                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                    style={candidate.source === 'SELF_APPLIED'
                                        ? { background: 'rgba(245,158,11,0.1)', color: '#D97706' }
                                        : { background: 'rgba(30,109,219,0.08)', color: '#1e6ddb' }}>
                                    {candidate.source === 'SELF_APPLIED' ? 'Self Applied' : 'HR Uploaded'}
                                </span>
                            </div>
                        )}
                        {candidate.status && (
                            <div className="flex justify-between">
                                <span style={{ color: '#9BAABF' }}>Status</span>
                                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                    style={candidate.status === 'APPROVED'
                                        ? { background: 'rgba(34,197,94,0.08)', color: '#16A34A' }
                                        : candidate.status === 'PENDING'
                                            ? { background: 'rgba(245,158,11,0.1)', color: '#D97706' }
                                            : { background: 'rgba(239,68,68,0.08)', color: '#DC2626' }}>
                                    {candidate.status}
                                </span>
                            </div>
                        )}
                    </div>
                </div> */}

                {/* CV Preview */}
                {/* CV Preview */}
                <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold" style={{ color: '#0F1729' }}>CV Preview</h2>
                    <button
                    onClick={() => window.open(`${API_BASE}/api/candidates/${candidate.id}/preview`, '_blank')}
                    className="flex items-center gap-1.5 text-xs font-medium"
                    style={{ color: '#1e6ddb' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                    <Eye size={13} /> Open in new tab
                    </button>
                </div>
                <div className="rounded-xl overflow-hidden border" style={{ borderColor: '#E0E7FF', height: 700 }}>
                    <object
                    data={`${API_BASE}/api/candidates/${candidate.id}/preview`}
                    type="application/pdf"
                    className="w-full h-full"
                    >
                    {/* Fallback if browser can't render PDF */}
                    <div className="flex flex-col items-center justify-center h-full gap-3"
                        style={{ background: '#F8FAFC' }}>
                        <FileText size={32} style={{ color: '#D1D9E6' }} />
                        <p className="text-sm" style={{ color: '#9BAABF' }}>
                        Unable to display PDF in browser.
                        </p>
                        <button
                        onClick={() => window.open(`${API_BASE}/api/candidates/${candidate.id}/preview`, '_blank')}
                        className="btn-primary text-xs py-2 px-4"
                        >
                        <Eye size={13} /> Open PDF
                        </button>
                    </div>
                    </object>
                </div>
                </div>
            </div>

            {/* ── RIGHT: Candidate Chat ── */}
            <div className="flex flex-col flex-shrink-0"
                style={{ width: 400, borderLeft: '1px solid rgba(0,0,0,0.07)', background: '#FFFFFF' }}>
                <CandidateChat candidateId={Number(id)} candidateName={candidate.name} />
            </div>
        </div>
    )
}
