import { getCurrentUser } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import CourseCoordinationClient from '@/components/admin/CourseCoordinationClient'

export default async function CourseCoordinationPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login?redirect=/admin/course-coordination')
  }
  
  if (!user.roles.includes('ADMIN')) {
    redirect('/unauthorized')
  }

  return <CourseCoordinationClient />
}
