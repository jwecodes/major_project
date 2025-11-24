import { getCurrentUser } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import FacultyCoursesClient from '@/components/admin/FacultyCoursesClient'

export default async function FacultyCoursesPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login?redirect=/admin/faculty')
  }
  
  if (!user.roles.includes('ADMIN')) {
    redirect('/unauthorized')
  }

  return <FacultyCoursesClient facultyId={params.id} />
}
