import { chatApi } from "@/lib/api";
import { Bot, Loader2, Send, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ChatEmptyState from "./ChatEmptyState";
import ChatBubble from "./ChatBubble";

// ─── Job-scoped Chat Panel ──────────────────────────────
export default function JobChat({ jobId, jobTitle }: { jobId: number; jobTitle: string }) {
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setLoadingHistory(true)
    chatApi.getJobHistory(jobId)
      .then(res => {
        const data = res.data?.data || res.data || []
        setMessages(Array.isArray(data) ? data : [])
      })
      .catch(() => setMessages([]))
      .finally(() => setLoadingHistory(false))
  }, [jobId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = async () => {
    const msg = input.trim()
    if (!msg || isTyping) return
    setInput('')

    const userMsg = { id: Date.now(), role: 'HR', message: msg, created_at: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)

    try {
      const res = await chatApi.send(msg, jobId)
      const aiMsg = res.data?.data || res.data
      if (aiMsg) setMessages(prev => [...prev, aiMsg])
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'ASSISTANT',
        message: 'Sorry, something went wrong. Please try again.',
        created_at: new Date().toISOString(),
      }])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <>
      {/* Chat Header */}
      <div className="px-4 py-4 border-b" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(30,109,219,0.1)', border: '1px solid rgba(30,109,219,0.2)' }}>
            <Bot size={15} style={{ color: '#1e6ddb' }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold" style={{ color: '#0F1729' }}>AI Assistant</p>
            <p className="text-xs truncate" style={{ color: '#9BAABF' }}>Scoped to: {jobTitle}</p>
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
          <ChatEmptyState onSuggest={(s) => { setInput(s); textareaRef.current?.focus() }} />
        ) : (
          messages.map((msg: any) => (
            <ChatBubble key={msg.id} message={msg} />
          ))
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
          <textarea
            ref={textareaRef}
            className="input-field pr-10 resize-none text-sm"
            rows={2}
            placeholder="Ask about this job's candidates..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ minHeight: 48, fontSize: 13 }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2.5 bottom-2.5 p-1.5 rounded-lg transition-all"
            style={{
              background: input.trim() && !isTyping ? '#1e6ddb' : '#E8ECF4',
              color: input.trim() && !isTyping ? '#ffffff' : '#9BAABF',
            }}
          >
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
