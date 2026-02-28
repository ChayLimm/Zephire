'use client'

import Avatar from "@/components/ui/Avatar";
import { DomainBadge } from "@/components/ui/Badge";
import { SkeletonList } from "@/components/ui/Skeleton";
import { candidatesApi } from "@/lib/api";
import { useAppDispatch } from "@/store/hooks";
import { setSelectedCandidate } from "@/store/slices/candidatesSlice";
import { ArrowLeft, Bot } from "lucide-react";
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from "react";

export default function CandidateDetailPage() {
    const param = useParams()
    const id = param.id as string
    const router = useRouter()
    const [candidate, setCandidate] = useState<any>()
    const [loading, setLoading] = useState(true);
    const dispatch = useAppDispatch()
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8010'

    const skills = (() => {
        try {
            if (!candidate.skills) return []
            if (Array.isArray(candidate.skills)) return candidate.skills
            return JSON.parse(candidate.skills as any)
        } catch { return [] }
    })()

    useEffect(() => {
        setLoading(true)
        candidatesApi.getById(Number(id)).then(
            res => {
                const data = res.data?.data || res.data
                setCandidate(data)
                dispatch(setSelectedCandidate(data))
            }
        ).catch(() => router.push('/candidates'))
            .finally(() => setLoading(false))
    }, [id])

    const handleOnPreview = () => {
        window.open(`${API_BASE}/api/candidates/${candidate.id}/preview`, '_blank')
    }

    if (loading) return <div className="p-8"><SkeletonList count={3} /></div>
    if (!candidate) return null

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: '#F4F6FA' }}>
            <div className="flex-1 overflow-y-auto p-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 mb-5 transition-colors text-sm font-medium"
                    style={{ color: '#6B7A99' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#1e6ddb')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#6B7A99')}
                >
                    <ArrowLeft size={15} /> Back to Candidates
                </button>
                <div className="card p-5 mb-4 flex items-center gap-4">
                    <Avatar name={candidate.name || 'Unknown'} size={44} />
                    <div>
                        <h1 className="text-lg font-bold " style={{ color: '#0F1729' }}>{candidate.name}</h1>
                        <p>{candidate.email}</p>
                        <div className="flex items-center gap-2 mb-3">
                            {candidate.domain && <DomainBadge domain={candidate.domain} />}
                            <span className="text-xs" style={{ color: '#9BAABF' }}>{skills.length}+ skills</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {skills.map((s: string) => (
                                <span key={s} className="text-xs px-2 py-0.5 rounded-md"
                                    style={{ background: '#F0F4FF', color: '#4B5775', border: '1px solid #E0E7FF' }}>
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => handleOnPreview()}
                    className="flex items-center gap-2 mb-5 transition-colors text-sm font-medium"
                    style={{ color: '#1e6ddb' }}
                >
                    Preview CV
                </button>

            </div>

            <div className="flex 1 "
                style={{
                    width: 400,
                    borderLeft: '1px solid rgba(0,0,0,0.07)',
                    background: '#FFFFFF',
                    flexShrink: 0,
                }}>
                <div className="px-4 py-4 border-b" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(30,109,219,0.1)', border: '1px solid rgba(30,109,219,0.2)' }}>
                            <Bot size={15} style={{ color: '#1e6ddb' }} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold" style={{ color: '#0F1729' }}>Form</p>
                            <p className="text-xs truncate" style={{ color: '#9BAABF' }}>Form</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )




}