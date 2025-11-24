'use client'

import { useEffect, useState } from 'react'
import { Loader, BookOpen, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CourseSummary {
  id: string
  courseCode: string
  courseName: string
  semester: number
}

export default function StudentDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [studentName, setStudentName] = useState('')
  const [semester, setSemester] = useState<number | null>(null)
  const [courses, setCourses] = useState<CourseSummary[]>([])
  const [contentCount, setContentCount] = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)

        // 1) Get current student from server (Supabase session)
        const meRes = await fetch('/api/student/me')
        if (meRes.status === 401) {
          router.push('/login?redirect=/student')
          return
        }
        const meData = await meRes.json()

        if (!meData.student?.email) {
          router.push('/login?redirect=/student')
          return
        }

        const email: string = meData.student.email

        // Optional: cache for other pages that still read localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('studentEmail', email)
        }

        // 2) Fetch courses and content using email
        const [courseRes, contentRes] = await Promise.all([
          fetch(`/api/student/courses?email=${encodeURIComponent(email)}`),
          fetch(`/api/student/content?email=${encodeURIComponent(email)}`)
        ])

        const courseData = await courseRes.json()
        const contentData = await contentRes.json()

        if (courseData.success) {
          setStudentName(courseData.student?.name || '')
          setSemester(courseData.student?.currentSemester ?? null)
          setCourses(courseData.courses || [])
        }

        if (contentData.success && Array.isArray(contentData.content)) {
          setContentCount(contentData.content.length)
        }
      } catch (err) {
        console.error('Dashboard load error:', err)
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Welcome{studentName ? `, ${studentName}` : ''} 👋
        </h1>
        {semester && (
          <p className="text-gray-600">
            You are currently in{' '}
            <span className="font-semibold">Semester {semester}</span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 flex items-center gap-4">
          <div className="p-3 rounded-full bg-emerald-100">
            <BookOpen className="h-6 w-6 text-emerald-700" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">My Courses</p>
            <p className="text-3xl font-bold text-gray-900">
              {courses.length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 flex items-center gap-4">
          <div className="p-3 rounded-full bg-blue-100">
            <FileText className="h-6 w-6 text-blue-700" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">
              Approved Materials
            </p>
            <p className="text-3xl font-bold text-gray-900">
              {contentCount}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-2 font-medium">
            Quick Links
          </p>
          <div className="space-y-2 text-sm">
            <button
              onClick={() => router.push('/student/courses')}
              className="block w-full text-left px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100"
            >
              📚 View My Courses
            </button>
            <button
              onClick={() => router.push('/student/content')}
              className="block w-full text-left px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100"
            >
              📂 Browse Course Content
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
