// app/student/layout.tsx
import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import StudentHeader from '@/components/student/Header'
import StudentSidebar from '@/components/student/Sidebar' // your existing sidebar

export default async function StudentLayout({
  children,
}: {
  children: ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) {
    redirect('/login?redirect=/student')
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
    include: { roles: true },
  })

  if (!dbUser) {
    redirect('/login?redirect=/student')
  }

  const activeRoles = dbUser.roles
    .filter(r => r.isActive)
    .map(r => r.role) as ('ADMIN' | 'FACULTY' | 'STUDENT')[]

  const headerUser = {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    roles: activeRoles,
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <StudentSidebar />

      <div className="flex-1 flex flex-col">
        <StudentHeader user={headerUser} />

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
