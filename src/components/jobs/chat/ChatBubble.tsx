import { Sparkles } from "lucide-react"
import Avatar from "../../ui/Avatar"

export default function ChatBubble({ message: msg }: { message: any }) {
  const isHR = msg.role === 'HR'
  return (
    <div className={`flex gap-2 ${isHR ? 'flex-row-reverse' : ''}`}>
      {isHR ? (
        <Avatar name="You" size={28} />
      ) : (
        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(30,109,219,0.1)', border: '1px solid rgba(30,109,219,0.2)' }}>
          <Sparkles size={12} style={{ color: '#1e6ddb' }} />
        </div>
      )}
      <div
        className="max-w-xs px-3 py-2.5 rounded-xl text-xs leading-relaxed"
        style={isHR ? {
          background: '#1e6ddb',
          color: '#ffffff',
          borderBottomRightRadius: 4,
        } : {
          background: '#FFFFFF',
          border: '1px solid rgba(0,0,0,0.08)',
          color: '#1A2035',
          borderBottomLeftRadius: 4,
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        }}
      >
        <p style={{ whiteSpace: 'pre-wrap' }}>{msg.message}</p>
      </div>
    </div>
  )
}
