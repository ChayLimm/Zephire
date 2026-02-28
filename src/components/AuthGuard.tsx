'use client'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Sidebar from './Sidebar'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [checked, setChecked] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token && pathname !== '/login') {
      router.push('/login')
    } else {
      setAuthenticated(!!token)
      setChecked(true)
    }
  }, [pathname, router])

  // ✅ Don't flash anything while checking
  if (!checked) return null

  const isLogin = pathname === '/login'

  // ✅ If not authenticated and not on login, don't render
  if (!authenticated && !isLogin) return null

  if (isLogin) return <>{children}</>

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}