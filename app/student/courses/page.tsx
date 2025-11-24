'use client'

import { useEffect, useState } from 'react'
import { Loader, BookOpen } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Course {
  id: string
  courseCode: string
  courseName: string
  semester: number
  session: string
  programmeName: string
  programmeCode: string
}

export default function StudentCoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)

        // 1) Get current student
        const meRes = await fetch('/api/student/me')
        if (meRes.status === 401) {
          router.push('/login?redirect=/student/courses')
          return
        }
        const meData = await meRes.json()
        if (!meData.student?.email) {
          router.push('/login?redirect=/student/courses')
          return
        }

        const email: string = meData.student.email

        if (typeof window !== 'undefined') {
          localStorage.setItem('studentEmail', email)
        }

        // 2) Fetch their courses
        const res = await fetch(
          `/api/student/courses?email=${encodeURIComponent(email)}`
        )
        const data = await res.json()

        if (data.success && Array.isArray(data.courses)) {
          setCourses(data.courses)
        }
      } catch (err) {
        console.error('Error loading courses:', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [router])

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
        <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
          {courses.length} Course{courses.length !== 1 ? 's' : ''}
        </span>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center border border-gray-200">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No courses found</p>
          <p className="text-gray-500 text-sm mt-2">
            You are not enrolled in any courses yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div
              key={course.id}
              className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {course.courseName}
                  </h3>
                  <p className="text-sm font-mono text-emerald-700">
                    {course.courseCode}
                  </p>
                </div>
              </div>

              <div className="border-t pt-3 mt-3 text-sm text-gray-700 space-y-1">
                <p>
                  <span className="font-medium">Programme:</span>{' '}
                  {course.programmeName || course.programmeCode}
                </p>
                <p>
                  <span className="font-medium">Semester:</span>{' '}
                  {course.semester}
                </p>
                <p>
                  <span className="font-medium">Session:</span>{' '}
                  {course.session}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
