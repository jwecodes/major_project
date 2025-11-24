import { getCurrentUser } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import FacultyCourseContentClient from '@/components/admin/FacultyCourseContentClient'

export default async function FacultyCourseContentPage({ 
  params 
}: { 
  params: { id: string; courseCode: string } 
}) {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login?redirect=/admin/faculty')
  }
  
  if (!user.roles.includes('ADMIN')) {
    redirect('/unauthorized')
  }

  return <FacultyCourseContentClient facultyId={params.id} courseCode={params.courseCode} />
}
