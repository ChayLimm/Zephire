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

  const isPublic = PUBLIC_ROUTES.includes(pathname)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    console.log('AuthGuard check — pathname:', pathname, 'token:', token)

    if (isPublic) {
      if (token && pathname === '/login') {
        router.replace('/candidates')
        return
      }
      setAuthenticated(!!token)
      setChecked(true)
      return
    }

    if (!token) {
      router.replace('/login')
      // ← don't return early without setChecked, causes infinite null
      setChecked(true)
      return
    }

    setAuthenticated(true)
    setChecked(true)
  }, [pathname, isPublic, router])

  // Show nothing until check is done
  if (!checked) return null

  if (isPublic) return <>{children}</>

  // Not authenticated — show nothing while redirect happens
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
