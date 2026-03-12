'use client'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Sidebar from './Sidebar'

const PUBLIC_ROUTES = ['/login', '/apply']

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [checked, setChecked] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const isPublic = PUBLIC_ROUTES.includes(pathname)

    if (isPublic) {
      // Already logged in + trying to visit /login → redirect to app
      if (token && pathname === '/login') {
        router.replace('/candidates')
        return
      }
      setAuthenticated(!!token)
      setChecked(true)
      return
    }

    // Protected route — no token → go to login
    if (!token) {
      router.replace('/login')
      return
    }

    setAuthenticated(true)
    setChecked(true)
  }, [pathname])

  if (!checked) return null

  const isPublic = PUBLIC_ROUTES.includes(pathname)

  if (isPublic) return <>{children}</>

  if (!authenticated) return null

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}