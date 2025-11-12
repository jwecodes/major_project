'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Download, Users, Clock } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

export default function StudentCoursesPage() {
  const router = useRouter()
  const [student, setStudent] = useState<any>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const studentData = localStorage.getItem('studentUser')
    if (!studentData) {
      router.push('/student/login')
      return
    }
    const parsedStudent = JSON.parse(studentData)
    setStudent(parsedStudent)
    loadCourses(parsedStudent.id)
  }, [router])

  const loadCourses = async (studentId: string) => {
    try {
      const response = await fetch(`/api/student/courses?studentId=${studentId}`)
      const data = await response.json()
      
      if (data.success) {
        setCourses(data.courses)
      }
    } catch (error) {
      toast.error('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Toaster position="top-right" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
        <p className="text-gray-600">
          {student?.programme.programmeCode} • Semester {student?.currentSemester}
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Courses Found</h3>
          <p className="text-gray-600">No courses available for your programme and semester.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {courses.map((course: any) => (
            <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 text-white">
                <h2 className="text-xl font-bold mb-2">{course.courseName}</h2>
                <p className="text-purple-100">{course.courseCode}</p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Credits</p>
                    <p className="text-lg font-semibold text-gray-900">{course.credits}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Hours</p>
                    <p className="text-lg font-semibold text-gray-900">{course.totalHours}/week</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">L-T-P-S</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {course.l}-{course.t}-{course.p}-{course.s}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      course.courseType === 'THEORY' ? 'bg-blue-100 text-blue-800' :
                      course.courseType === 'LAB' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {course.courseType}
                    </span>
                  </div>
                </div>

                {course.roomNo && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Room Number</p>
                    <p className="font-medium text-gray-900">{course.roomNo}</p>
                  </div>
                )}

                <div className="bg-purple-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Download className="h-5 w-5 text-purple-600" />
                      <span className="font-semibold text-gray-900">Available Materials</span>
                    </div>
                    <span className="text-2xl font-bold text-purple-600">{course.materialCount}</span>
                  </div>
                </div>

                <button
                  onClick={() => router.push('/student/materials')}
                  className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 font-medium"
                >
                  View Course Materials
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
