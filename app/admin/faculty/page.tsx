import { getCurrentUser } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import AdminFacultyClient from '@/components/admin/AdminFacultyClient'

export default async function AdminFacultyPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login?redirect=/admin/faculty')
  }
  
  if (!user.roles.includes('ADMIN')) {
    redirect('/unauthorized')
  }

  return <AdminFacultyClient />
}
