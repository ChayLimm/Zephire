import type { Metadata } from 'next'
import './globals.css'
import StoreProvider from '@/store/StoreProvider'
import ToastContainer from '@/components/ui/ToastContainer'
import AuthGuard from '@/components/AuthGuard'

export const metadata: Metadata = {
  title: 'HR.AI — Smart Candidate Management',
  description: 'AI-powered HR assistant',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <AuthGuard>{children}</AuthGuard>
          <ToastContainer />
        </StoreProvider>
      </body>
    </html>
  )
}
