'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Download, TrendingUp, Calendar } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

export default function StudentDashboard() {
  const router = useRouter()
  const [student, setStudent] = useState<any>(null)
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalMaterials: 0,
    recentUploads: 0
  })
  const [courses, setCourses] = useState<any[]>([])
  const [recentMaterials, setRecentMaterials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const studentData = localStorage.getItem('studentUser')
    if (!studentData) {
      router.push('/student/login')
      return
    }
    const parsedStudent = JSON.parse(studentData)
    setStudent(parsedStudent)
    loadDashboardData(parsedStudent.id)
  }, [router])

  const loadDashboardData = async (studentId: string) => {
    try {
      const response = await fetch(`/api/student/dashboard?studentId=${studentId}`)
      const data = await response.json()
      
      if (data.success) {
        setStats(data.stats)
        setCourses(data.courses)
        setRecentMaterials(data.recentMaterials)
      }
    } catch (error) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Toaster position="top-right" />
      
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {student?.name}!
        </h1>
        <p className="text-gray-600">
          {student?.programme.programmeCode} • Semester {student?.currentSemester}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-3xl font-bold text-gray-900">{stats.totalCourses}</span>
          </div>
          <h3 className="text-gray-600 font-medium">Enrolled Courses</h3>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Download className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-3xl font-bold text-gray-900">{stats.totalMaterials}</span>
          </div>
          <h3 className="text-gray-600 font-medium">Available Materials</h3>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-3xl font-bold text-gray-900">{stats.recentUploads}</span>
          </div>
          <h3 className="text-gray-600 font-medium">New This Week</h3>
        </div>
      </div>

      {/* My Courses */}
      <div className="bg-white rounded-lg shadow-md mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">My Courses</h2>
        </div>
        
        {courses.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No courses enrolled yet</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course: any) => (
                <div
                  key={course.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{course.courseName}</h3>
                  <p className="text-sm text-gray-600 mb-3">{course.courseCode}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{course.credits} Credits</span>
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-semibold">
                      {course.materialCount} Materials
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Materials */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Recently Added Materials</h2>
            <button
              onClick={() => router.push('/student/materials')}
              className="text-purple-600 hover:text-purple-700 font-medium text-sm"
            >
              View All →
            </button>
          </div>
        </div>
        
        {recentMaterials.length === 0 ? (
          <div className="p-12 text-center">
            <Download className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No materials available yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {recentMaterials.map((material: any) => (
              <div key={material.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{material.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {material.course.courseCode} - {material.course.courseName}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(material.createdAt).toLocaleDateString()}
                      </span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                        {material.contentType.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                  <a
                    href={material.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 ml-4"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
