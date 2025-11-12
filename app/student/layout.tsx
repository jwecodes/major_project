'use client'
import { usePathname } from 'next/navigation'
import StudentSidebar from '@/components/student/StudentSidebar'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/student/login'

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentSidebar />
      <main className="lg:ml-64 p-8">
        {children}
      </main>
    </div>
  )
}
