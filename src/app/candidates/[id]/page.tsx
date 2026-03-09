'use client'
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
                            <Eye size={13} /> Open CV
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

// ─── Candidate Chat Panel ──────────────────────────────
function CandidateChat({ candidateId, candidateName }: { candidateId: number; candidateName: string }) {
    const [messages, setMessages] = useState<any[]>([])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [loadingHistory, setLoadingHistory] = useState(true)
    const bottomRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        setLoadingHistory(true)
        chatApi.getCandidateHistory(candidateId)
            .then(res => {
                const data = res.data?.data || res.data || []
                setMessages(Array.isArray(data) ? data : [])
            })
            .catch(() => setMessages([]))
            .finally(() => setLoadingHistory(false))
    }, [candidateId])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isTyping])

    const handleSend = async () => {
        const msg = input.trim()
        if (!msg || isTyping) return
        setInput('')

        const userMsg = { id: Date.now(), role: 'HR', message: msg }
        setMessages(prev => [...prev, userMsg])
        setIsTyping(true)

        try {
            const res = await chatApi.sendCandidate(msg, candidateId)
            const aiMsg = res.data?.data || res.data
            if (aiMsg) setMessages(prev => [...prev, aiMsg])
        } catch {
            setMessages(prev => [...prev, {
                id: Date.now(), role: 'ASSISTANT',
                message: 'Sorry, something went wrong.',
            }])
        } finally {
            setIsTyping(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
    }

    const SUGGESTIONS = [
        `Summarize ${candidateName}'s experience`,
        'What are their strongest skills?',
        'Any red flags in their CV?',
        'What roles would suit them?',
    ]

    return (
        <>
            {/* Header */}
            <div className="px-4 py-4 border-b" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(30,109,219,0.1)', border: '1px solid rgba(30,109,219,0.2)' }}>
                        <Bot size={15} style={{ color: '#1e6ddb' }} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold" style={{ color: '#0F1729' }}>AI Assistant</p>
                        <p className="text-xs" style={{ color: '#9BAABF' }}>Scoped to: {candidateName}</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: '#F8FAFC' }}>
                {loadingHistory ? (
                    <div className="flex items-center justify-center h-20">
                        <Loader2 size={18} className="animate-spin" style={{ color: '#9BAABF' }} />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                            style={{ background: 'rgba(30,109,219,0.08)', border: '1px solid rgba(30,109,219,0.15)' }}>
                            <Bot size={20} style={{ color: '#1e6ddb' }} />
                        </div>
                        <p className="text-xs font-medium mb-1" style={{ color: '#4B5775' }}>Ask about this candidate</p>
                        <p className="text-xs mb-4" style={{ color: '#9BAABF' }}>Questions scoped to their CV and profile</p>
                        <div className="space-y-1.5 w-full">
                            {SUGGESTIONS.map(s => (
                                <button key={s} onClick={() => { setInput(s); textareaRef.current?.focus() }}
                                    className="w-full text-left px-3 py-2 rounded-lg text-xs transition-all bg-white"
                                    style={{ border: '1px solid rgba(0,0,0,0.08)', color: '#4B5775' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(30,109,219,0.3)'; e.currentTarget.style.color = '#1e6ddb' }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.color = '#4B5775' }}>
                                    "{s}"
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map((msg: any) => {
                        const isHR = msg.role === 'HR'
                        return (
                            <div key={msg.id} className={`flex gap-2 ${isHR ? 'flex-row-reverse' : ''}`}>
                                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={isHR
                                        ? { background: '#1e6ddb', color: '#fff', fontSize: 10, fontWeight: 600 }
                                        : { background: 'rgba(30,109,219,0.1)', border: '1px solid rgba(30,109,219,0.2)' }}>
                                    {isHR ? 'HR' : <Sparkles size={12} style={{ color: '#1e6ddb' }} />}
                                </div>
                                <div className="max-w-xs px-3 py-2.5 rounded-xl text-xs leading-relaxed"
                                    style={isHR ? {
                                        background: '#1e6ddb', color: '#fff', borderBottomRightRadius: 4,
                                    } : {
                                        background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)',
                                        color: '#1A2035', borderBottomLeftRadius: 4,
                                        boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                                    }}>
                                    <p style={{ whiteSpace: 'pre-wrap' }}>{msg.message}</p>
                                </div>
                            </div>
                        )
                    })
                )}

                {isTyping && (
                    <div className="flex gap-2 items-start">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(30,109,219,0.1)', border: '1px solid rgba(30,109,219,0.2)' }}>
                            <Sparkles size={12} style={{ color: '#1e6ddb' }} />
                        </div>
                        <div className="px-3 py-2.5 rounded-xl bg-white" style={{ borderBottomLeftRadius: 4, border: '1px solid rgba(0,0,0,0.08)' }}>
                            <div className="flex items-center gap-1">
                                {[0, 1, 2].map(i => (
                                    <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                                        style={{ background: '#1e6ddb', animationDelay: `${i * 0.15}s` }} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t bg-white" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
                <div className="relative">
                    <textarea ref={textareaRef} className="input-field pr-10 resize-none text-sm" rows={2}
                        placeholder="Ask about this candidate..."
                        value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                        style={{ minHeight: 48, fontSize: 13 }} />
                    <button onClick={handleSend} disabled={!input.trim() || isTyping}
                        className="absolute right-2.5 bottom-2.5 p-1.5 rounded-lg transition-all"
                        style={{
                            background: input.trim() && !isTyping ? '#1e6ddb' : '#E8ECF4',
                            color: input.trim() && !isTyping ? '#ffffff' : '#9BAABF',
                        }}>
                        <Send size={14} />
                    </button>
                </div>
                <p className="text-xs text-center mt-1.5" style={{ color: '#9BAABF' }}>
                    Enter to send · Shift+Enter for new line
                </p>
            </div>
        </>
    )
}