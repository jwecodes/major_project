'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/faculty/Sidebar'

export default function Dashboard() {
  const router = useRouter()
  const [faculty, setFaculty] = useState<any>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, coordinator: 0, contributor: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const facultyData = localStorage.getItem('faculty')
    const facultyId = localStorage.getItem('facultyId')

    if (!facultyData || !facultyId) {
      router.push('/faculty/login')
      return
    }

    setFaculty(JSON.parse(facultyData))
    loadCourses(facultyId)
  }, [router])

  const loadCourses = async (facultyId: string) => {
    try {
      const res = await fetch('/api/faculty/my-courses', {
        headers: { 'x-faculty-id': facultyId }
      })
      const data = await res.json()
      if (data.success) {
        const assignments = data.assignments || []
        setCourses(assignments)
        setStats({
          total: assignments.length,
          coordinator: assignments.filter((a: any) => a.role === 'COORDINATOR').length,
          contributor: assignments.filter((a: any) => a.role === 'CONTRIBUTOR').length
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!faculty) return null

  return (
    <>
      <Sidebar />
      
      <div className="lg:ml-64 min-h-screen bg-gray-50">
        <main className="p-4 md:p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {faculty.name}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <p className="text-gray-600 text-sm font-medium">Total Courses</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <p className="text-gray-600 text-sm font-medium">As Coordinator</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{stats.coordinator}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <p className="text-gray-600 text-sm font-medium">As Contributor</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.contributor}</p>
            </div>
          </div>

          {/* Courses */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Your Courses ({courses.length})</h2>
            </div>
            {loading ? (
              <div className="p-12 text-center text-gray-600">Loading...</div>
            ) : courses.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {courses.slice(0, 5).map((course: any) => (
                  <div key={course.id} className="p-6 hover:bg-gray-50 flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">{course.course.courseCode}</h3>
                      <p className="text-sm text-gray-600 truncate">{course.course.courseName}</p>
                    </div>
                    <div className="flex gap-2 items-center ml-4">
                      <span className={`px-3 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                        course.role === 'COORDINATOR'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {course.role}
                      </span>
                      <Link
                        href={`/faculty/courses/${course.courseId}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm whitespace-nowrap font-medium"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-600">No courses assigned</div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
