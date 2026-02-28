// Badge.tsx
import clsx from 'clsx'

const domainColors: Record<string, string> = {
  tech: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  sales: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  marketing: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  finance: 'bg-green-500/15 text-green-400 border-green-500/30',
  hr: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
  operations: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
}

export function DomainBadge({ domain }: { domain: string }) {
  return (
    <span className={clsx('text-xs px-2 py-0.5 rounded-full border font-medium capitalize',
      domainColors[domain] || 'bg-slate-500/15 text-slate-400 border-slate-500/30')}>
      {domain}
    </span>
  )
}

export function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? '#00D4AA' : score >= 60 ? '#F59E0B' : '#F87171'
  return (
    <span
      className="text-xs px-2.5 py-0.5 rounded-full font-bold"
      style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
    >
      {score}%
    </span>
  )
}
