'use client'

import { useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { useUserStore, type AppUser } from '../../store/userStore'

interface AppShellProps {
  user: AppUser | null
  children: React.ReactNode
}

export function AppShell({ user, children }: AppShellProps) {
  const setUser = useUserStore((s) => s.setUser)

  useEffect(() => {
    if (user) setUser(user)
  }, [user, setUser])

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <TopBar />
      {/* Content: offset for desktop sidebar + mobile top/bottom bars */}
      <main className="lg:ml-60 pt-14 pb-20 lg:pt-0 lg:pb-0 min-h-screen">
        {children}
      </main>
    </div>
  )
}
