import { getCurrentUser } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import FacultyDashboardClient from '@/components/faculty/FacultyDashboardClient'

export default async function FacultyDashboardPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login?redirect=/faculty/dashboard')
  }
  
  if (!user.roles.includes('FACULTY')) {
    if (user.roles.includes('ADMIN')) {
      redirect('/admin/dashboard')
    }
    redirect('/unauthorized')
  }

  return <FacultyDashboardClient />
}
