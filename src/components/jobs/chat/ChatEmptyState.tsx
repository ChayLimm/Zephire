import { Bot } from "lucide-react";

const SUGGESTIONS = [
  'Who is the best match?',
  'Who has the most relevant skills?',
  'Summarize top candidates',
  'Who has gaps in experience?',
]
export default function ChatEmptyState({ onSuggest }: { onSuggest: (s: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
        style={{ background: 'rgba(30,109,219,0.08)', border: '1px solid rgba(30,109,219,0.15)' }}>
        <Bot size={20} style={{ color: '#1e6ddb' }} />
      </div>
      <p className="text-xs mb-1 font-medium" style={{ color: '#4B5775' }}>Ask about this job</p>
      <p className="text-xs mb-4" style={{ color: '#9BAABF' }}>Questions scoped to matched candidates</p>
      <div className="space-y-1.5 w-full">
        {SUGGESTIONS.map(s => (
          <button key={s} onClick={() => onSuggest(s)}
            className="w-full text-left px-3 py-2 rounded-lg text-xs transition-all bg-white"
            style={{ border: '1px solid rgba(0,0,0,0.08)', color: '#4B5775' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(30,109,219,0.3)'; e.currentTarget.style.color = '#1e6ddb' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.color = '#4B5775' }}>
            "{s}"
          </button>
        ))}
      </div>
    </div>
  )
}
