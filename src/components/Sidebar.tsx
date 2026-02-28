'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Users, Briefcase, Bot, LogOut, Sparkles } from 'lucide-react'
import { useAppDispatch } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import clsx from 'clsx'

const navItems = [
  { href: '/candidates', label: 'Candidates', icon: Users },
  { href: '/jobs', label: 'Job Descriptions', icon: Briefcase },
  { href: '/assistant', label: 'AI Assistant', icon: Bot },
]

export default function Sidebar() {
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const router = useRouter()

  const handleLogout = () => {
    dispatch(logout())
    router.push('/login')
  }

  return (
    <aside
      className="flex flex-col h-full flex-shrink-0"
      style={{
        width: 260,
        background: '#FFFFFF',
        borderRight: '1px solid rgba(0,0,0,0.07)',
        boxShadow: '2px 0 12px rgba(0,0,0,0.04)',
      }}
    >
      {/* Logo */}
      <div className="p-6 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #1e6ddb, #4f9ef8)' }}
        >
          <Sparkles size={18} className="text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Sora, sans-serif', color: '#0F1729' }}>
          HR<span style={{ color: '#1e6ddb' }}>.AI</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        <p className="text-xs font-semibold px-3 mb-3" style={{ color: '#9BAABF', letterSpacing: '0.08em' }}>
          NAVIGATION
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm font-medium',
                active ? '' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              )}
              style={active ? {
                background: 'rgba(30,109,219,0.08)',
                borderLeft: '2px solid #1e6ddb',
                color: '#1e6ddb',
              } : {}}
            >
              <Icon size={17} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
          style={{ color: '#9BAABF' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#DC2626'; e.currentTarget.style.background = 'rgba(239,68,68,0.05)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#9BAABF'; e.currentTarget.style.background = 'transparent' }}
        >
          <LogOut size={17} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}