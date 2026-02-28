const colors = [
  '#00D4AA', '#F59E0B', '#60A5FA', '#A78BFA', '#F472B6',
  '#34D399', '#FB923C', '#38BDF8',
]

function getColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function getInitials(name: string) {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
}

export default function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const color = getColor(name || '')
  const initials = getInitials(name || '')
  return (
    <div
      className="flex items-center justify-center rounded-full font-bold flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: `${color}25`,
        border: `1.5px solid ${color}60`,
        color,
        fontSize: size * 0.35,
        fontFamily: 'Sora, sans-serif',
      }}
    >
      {initials}
    </div>
  )
}
