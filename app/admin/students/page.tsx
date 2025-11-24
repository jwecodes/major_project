import { getCurrentUser } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import StudentManagementClient from '@/components/admin/StudentManagementClient'

export default async function StudentManagementPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login?redirect=/admin/students')
  }
  
  if (!user.roles.includes('ADMIN')) {
    redirect('/unauthorized')
  }

  return <StudentManagementClient />
}
