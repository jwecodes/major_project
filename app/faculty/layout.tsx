import { getCurrentUser } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/faculty/Sidebar'
import Header from '@/components/faculty/Header'

export default async function FacultyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  // Not logged in → redirect to login
  if (!user) {
    redirect('/login?redirect=/faculty')
  }

  // Not faculty (and not admin) → redirect to unauthorized
  if (!user.roles.includes('FACULTY') && !user.roles.includes('ADMIN')) {
    redirect('/unauthorized')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  )
}
