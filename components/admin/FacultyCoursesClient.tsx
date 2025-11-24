'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  BookOpen, 
  Loader, 
  Eye
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

interface Faculty {
  id: string
  name: string
  email: string
  designation: string
  facultyId: string
}

interface GroupedCourse {
  courseCode: string
  courseName: string
  programmes: {
    programmeCode: string
    programmeName: string
    section: string | null
    semester: number
  }[]
  courseIds: string[]
}

interface FacultyCoursesClientProps {
  facultyId: string
}

export default function FacultyCoursesClient({ facultyId }: FacultyCoursesClientProps) {
  const router = useRouter()
  const [faculty, setFaculty] = useState<Faculty | null>(null)
  const [groupedCourses, setGroupedCourses] = useState<GroupedCourse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (facultyId) {
      loadFacultyData()
    }
  }, [facultyId])

  const loadFacultyData = async () => {
    try {
      setLoading(true)
      
      const [facultyRes, coursesRes] = await Promise.all([
        fetch(`/api/admin/faculty/${facultyId}`),
        fetch(`/api/admin/faculty/${facultyId}/courses`)
      ])

      const facultyData = await facultyRes.json()
      const coursesData = await coursesRes.json()

      if (facultyData.success) {
        setFaculty(facultyData.faculty)
      }

      if (coursesData.success) {
        const grouped: Record<string, GroupedCourse> = {}
        
        coursesData.allocations.forEach((allocation: any) => {
          const { course } = allocation
          const key = course.courseCode

          if (!grouped[key]) {
            grouped[key] = {
              courseCode: course.courseCode,
              courseName: course.courseName,
              programmes: [],
              courseIds: []
            }
          }

          grouped[key].programmes.push({
            programmeCode: course.programme.programmeCode,
            programmeName: course.programme.programmeName,
            section: course.programme.section,
            semester: course.semester
          })
          
          grouped[key].courseIds.push(course.id)
        })

        setGroupedCourses(Object.values(grouped))
      }
    } catch (error) {
      toast.error('Error loading faculty data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!faculty) {
    return (
      <div className="p-6">
        <p className="text-red-600">Faculty not found</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/faculty')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Faculty List
        </button>

        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-2">{faculty.name}</h1>
          <div className="flex items-center gap-4 text-sm text-blue-100">
            <span>{faculty.facultyId}</span>
            <span>•</span>
            <span>{faculty.designation}</span>
            <span>•</span>
            <span>{faculty.email}</span>
          </div>
        </div>
      </div>

      {/* Courses List */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Courses & Content</h2>
          <p className="text-gray-600 text-sm mt-1">View all courses and uploaded content</p>
        </div>

        {groupedCourses.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No courses assigned to this faculty</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {groupedCourses.map((course) => (
              <div key={course.courseCode} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{course.courseCode}</h3>
                        <p className="text-gray-700 font-medium">{course.courseName}</p>
                      </div>
                    </div>

                    <div className="ml-15 space-y-2">
                      <div>
                        <span className="text-sm font-semibold text-gray-700">Programmes:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {course.programmes.map((prog, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700"
                            >
                              {prog.programmeName} 
                              {prog.section && ` (Sec ${prog.section})`}
                              {' '}- Sem {prog.semester}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push(`/admin/faculty/${facultyId}/content/${course.courseCode}`)}
                    className="ml-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2 transition-colors shadow-md flex-shrink-0"
                  >
                    <Eye className="h-5 w-5" />
                    View Content
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
