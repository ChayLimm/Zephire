import { chatApi } from "@/lib/api";
import { Bot, Loader2, Send, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ─── Candidate Chat Panel ──────────────────────────────
export default function CandidateChat({ candidateId, candidateName }: { candidateId: number; candidateName: string }) {
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
                        <p className="text-sm font-semibold" style={{ color: '#0F1729' }}>Sok</p>
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