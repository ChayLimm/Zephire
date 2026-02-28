'use client'
import { useEffect, useRef, useState } from 'react'
import { Send, Bot, Trash2, Loader2, X, Sparkles } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchChatHistory, sendMessage, clearHistory, addUserMessage,
  selectMessages, selectIsTyping, selectChatError, clearChatError,
} from '@/store/slices/chatSlice'
import { ChatMessage } from '@/types'
import Avatar from '@/components/ui/Avatar'

const SUGGESTIONS = [
  'Show me candidates with Flutter experience',
  'Who has the most backend experience?',
  'Find candidates who speak English and Khmer',
  'List all tech candidates with 2+ years experience',
]

export default function AssistantPage() {
  const dispatch = useAppDispatch()
  const messages = useAppSelector(selectMessages)
  const isTyping = useAppSelector(selectIsTyping)
  const error = useAppSelector(selectChatError)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { dispatch(fetchChatHistory()) }, [dispatch])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isTyping])

  const handleSend = async () => {
    const msg = input.trim()
    if (!msg) return
    setInput('')
    dispatch(addUserMessage(msg))
    await dispatch(sendMessage({ message: msg }))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: '#F4F6FA' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 bg-white border-b" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(30,109,219,0.1)', border: '1px solid rgba(30,109,219,0.2)' }}>
            <Bot size={18} style={{ color: '#1e6ddb' }} />
          </div>
          <div>
            <h1 className="font-semibold text-sm" style={{ color: '#0F1729' }}>AI Assistant</h1>
            <p className="text-xs" style={{ color: '#9BAABF' }}>Ask anything about your candidates</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={() => dispatch(clearHistory())} className="btn-secondary text-xs py-2 px-3">
            <Trash2 size={13} /> Clear
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mx-8 mt-4 flex items-center gap-3 p-3 rounded-xl text-red-600 text-sm"
          style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
          <X size={14} />
          <p className="flex-1">{error}</p>
          <button onClick={() => dispatch(clearChatError())}><X size={12} /></button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
        {messages.length === 0 ? (
          <EmptyState onSuggest={(msg) => { setInput(msg); textareaRef.current?.focus() }} />
        ) : (
          messages.map((msg: ChatMessage) => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-8 py-5 bg-white border-t" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
        <div className="relative max-w-4xl mx-auto">
          <textarea
            ref={textareaRef}
            className="input-field pr-14 resize-none"
            rows={2}
            placeholder="Ask about candidates, skills, experience... (Enter to send)"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ minHeight: 52 }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-3 bottom-3 p-2 rounded-lg transition-all"
            style={{
              background: input.trim() && !isTyping ? '#1e6ddb' : '#E8ECF4',
              color: input.trim() && !isTyping ? '#ffffff' : '#9BAABF',
            }}
          >
            {isTyping ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <p className="text-xs text-center mt-2" style={{ color: '#9BAABF' }}>Shift+Enter for new line · Enter to send</p>
      </div>
    </div>
  )
}

function MessageBubble({ message: msg }: { message: ChatMessage }) {
  const isHR = msg.role === 'HR'
  return (
    <div className={`flex gap-3 ${isHR ? 'flex-row-reverse' : ''}`}>
      {isHR ? (
        <Avatar name="You" size={32} />
      ) : (
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(30,109,219,0.1)', border: '1px solid rgba(30,109,219,0.2)' }}>
          <Sparkles size={14} style={{ color: '#1e6ddb' }} />
        </div>
      )}
      <div
        className="max-w-2xl px-4 py-3 rounded-2xl text-sm leading-relaxed"
        style={isHR ? {
          background: '#1e6ddb',
          color: '#ffffff',
          borderBottomRightRadius: 4,
        } : {
          background: '#FFFFFF',
          border: '1px solid rgba(0,0,0,0.08)',
          color: '#1A2035',
          borderBottomLeftRadius: 4,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <p style={{ whiteSpace: 'pre-wrap' }}>{msg.message}</p>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(30,109,219,0.1)', border: '1px solid rgba(30,109,219,0.2)' }}>
        <Sparkles size={14} style={{ color: '#1e6ddb' }} />
      </div>
      <div className="px-4 py-3 rounded-2xl bg-white" style={{ borderBottomLeftRadius: 4, border: '1px solid rgba(0,0,0,0.08)' }}>
        <div className="flex items-center gap-1">
          {[0, 1, 2].map(i => (
            <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
              style={{ background: '#1e6ddb', animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function EmptyState({ onSuggest }: { onSuggest: (msg: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: 'rgba(30,109,219,0.08)', border: '1px solid rgba(30,109,219,0.15)' }}>
        <Bot size={28} style={{ color: '#1e6ddb' }} />
      </div>
      <h2 className="text-lg font-semibold mb-2" style={{ color: '#0F1729' }}>Ask about your candidates</h2>
      <p className="text-sm mb-8 max-w-sm" style={{ color: '#6B7A99' }}>
        I can filter, search, and analyze all your candidate data. Try one of these:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
        {SUGGESTIONS.map(s => (
          <button
            key={s}
            onClick={() => onSuggest(s)}
            className="text-left p-3 rounded-xl text-xs transition-all bg-white hover:border-blue-300"
            style={{ border: '1px solid rgba(0,0,0,0.08)', color: '#4B5775', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            "{s}"
          </button>
        ))}
      </div>
    </div>
  )
}