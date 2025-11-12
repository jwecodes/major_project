'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/faculty/Sidebar'

export default function CourseView() {
  const router = useRouter()
  const params = useParams()
  const courseId = params?.courseId as string

  const [course, setCourse] = useState<any>(null)
  const [team, setTeam] = useState<any[]>([])
  const [contents, setContents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCoordinator, setIsCoordinator] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const facultyId = localStorage.getItem('facultyId')

    console.log('Course detail - Faculty ID:', facultyId)
    console.log('Course detail - Course ID:', courseId)

    if (!facultyId || !courseId) {
      router.push('/faculty/login')
      return
    }

    loadCourse(facultyId)
  }, [courseId, router])

  const loadCourse = async (facultyId: string) => {
    try {
      console.log('Loading course:', courseId)
      
      const res = await fetch(`/api/faculty/courses/${courseId}`, {
        headers: { 'x-faculty-id': facultyId }
      })

      console.log('Response status:', res.status)

      if (res.status === 401 || res.status === 403) {
        setError('You do not have access to this course')
        setLoading(false)
        return
      }

      const data = await res.json()
      
      console.log('=== COURSE DATA ===')
      console.log('Full response:', data)
      console.log('Team:', data.team)
      console.log('Team length:', data.team?.length)
      console.log('Contents:', data.contents)
      console.log('Is Coordinator:', data.isCoordinator)

      if (data.success) {
        setCourse(data.course)
        setTeam(data.team || [])
        setContents(data.contents || [])
        setIsCoordinator(data.isCoordinator || false)
        console.log('State set successfully')
      } else {
        setError(data.error || 'Failed to load course')
      }
    } catch (err) {
      console.error('Error loading course:', err)
      setError('Error loading course details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Sidebar />
        <div className="lg:ml-64 min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading course details...</p>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Sidebar />
        <div className="lg:ml-64 min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-lg shadow">
            <p className="text-red-600 mb-4">{error}</p>
            <Link href="/faculty/courses" className="text-blue-600 hover:text-blue-700">
              Back to Courses
            </Link>
          </div>
        </div>
      </>
    )
  }

  if (!course) {
    return (
      <>
        <Sidebar />
        <div className="lg:ml-64 min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Course not found</p>
            <Link href="/faculty/courses" className="text-blue-600 hover:text-blue-700">
              Back to Courses
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Sidebar />
      
      <div className="lg:ml-64 min-h-screen bg-gray-50">
        <main className="p-4 md:p-6">
          <Link href="/faculty/courses" className="text-blue-600 hover:text-blue-700 mb-6 inline-block">
            ← Back to Courses
          </Link>

          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.courseCode}</h1>
              <p className="text-gray-600">{course.courseName}</p>
            </div>
            {isCoordinator && (
              <Link
                href={`/faculty/courses/${courseId}/manage`}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium whitespace-nowrap"
              >
                📋 Manage Content
              </Link>
            )}
          </div>

          {/* Course Info */}
          <div className="bg-white rounded-lg shadow p-6 mb-6 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Course Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Programme</p>
                <p className="font-semibold text-gray-900 mt-1">{course.programme?.programmeCode || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">Semester</p>
                <p className="font-semibold text-gray-900 mt-1">{course.semester || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">Credits</p>
                <p className="font-semibold text-gray-900 mt-1">{course.credits || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">L-T-P-S</p>
                <p className="font-semibold text-gray-900 mt-1">{course.l}-{course.t}-{course.p}-{course.s}</p>
              </div>
            </div>
          </div>

          {/* Team */}
          <div className="bg-white rounded-lg shadow p-6 mb-6 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Course Team ({team?.length || 0})</h2>
            {team && team.length > 0 ? (
              <div className="space-y-2">
                {team.map((member: any) => (
                  <div key={member.id} className="p-3 border border-gray-200 rounded-lg flex justify-between items-center hover:bg-gray-50">
                    <div>
                      <p className="font-semibold text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.designation}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                      member.role === 'COORDINATOR'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No team members assigned</p>
            )}
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Teaching Content ({contents?.length || 0})</h2>
              <p className="text-xs text-gray-500 mt-1">
                {isCoordinator ? 'All content (coordinator view)' : 'Only approved content'}
              </p>
            </div>

            {contents && contents.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {contents.map((content: any) => (
                  <div key={content.id} className="p-6 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{content.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{content.contentType.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-gray-500 mt-2">By: {content.faculty?.name}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-4 ${
                        content.approvalStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        content.approvalStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        content.approvalStatus === 'CHANGES_REQUIRED' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {content.approvalStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-600">
                {isCoordinator ? 'No content uploaded yet' : 'No approved content yet'}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
