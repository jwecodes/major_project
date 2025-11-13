'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  BookOpen, 
  FileText, 
  Loader, 
  Eye, 
  Download,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
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

interface ContentItem {
  id: string
  title: string
  contentType: string
  status: string
  fileName: string
  filePath: string
  uploadDate: string
}

interface CHO {
  id: string
  status: string
  courseCode: string
  courseTitle: string
  updatedAt: string
}

export default function FacultyCoursesContentPage() {
  const params = useParams()
  const router = useRouter()
  const facultyId = params?.id as string

  const [faculty, setFaculty] = useState<Faculty | null>(null)
  const [groupedCourses, setGroupedCourses] = useState<GroupedCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<GroupedCourse | null>(null)
  const [courseContent, setCourseContent] = useState<{
    content: ContentItem[]
    cho: CHO | null
  }>({ content: [], cho: null })
  const [loadingContent, setLoadingContent] = useState(false)
  const [showContentModal, setShowContentModal] = useState(false)

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

  const loadCourseContent = async (course: GroupedCourse) => {
    setSelectedCourse(course)
    setShowContentModal(true)
    setLoadingContent(true)
    setCourseContent({ content: [], cho: null })

    try {
      const [contentRes, choRes] = await Promise.all([
        fetch(`/api/admin/faculty/${facultyId}/content?courseIds=${course.courseIds.join(',')}`),
        fetch(`/api/admin/faculty/${facultyId}/cho?courseCode=${course.courseCode}`)
      ])

      const contentData = await contentRes.json()
      const choData = await choRes.json()

      setCourseContent({
        content: contentData.success ? contentData.content : [],
        cho: choData.success ? choData.cho : null
      })
    } catch (error) {
      toast.error('Error loading content')
    } finally {
      setLoadingContent(false)
    }
  }

  const updateContentStatus = async (contentId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/content/${contentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      const data = await res.json()
      if (data.success) {
        toast.success(`Content ${newStatus.toLowerCase()}!`)
        if (selectedCourse) {
          loadCourseContent(selectedCourse)
        }
      } else {
        toast.error(data.error || 'Error updating status')
      }
    } catch (error) {
      toast.error('Error updating content status')
    }
  }

  const getStatusBadge = (status: string) => {
    const config = {
      APPROVED: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
      CHANGES_REQUIRED: { bg: 'bg-orange-100', text: 'text-orange-700', icon: AlertCircle },
      SUBMITTED: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
      DRAFT: { bg: 'bg-gray-100', text: 'text-gray-700', icon: Clock }
    }

    const { bg, text, icon: Icon } = config[status as keyof typeof config] || config.PENDING

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${bg} ${text}`}>
        <Icon className="h-3 w-3" />
        {status}
      </span>
    )
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
                    onClick={() => loadCourseContent(course)}
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

      {/* Content Modal */}
      {showContentModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{selectedCourse.courseCode} - {selectedCourse.courseName}</h2>
                  <p className="text-blue-100 text-sm mt-1">All content uploaded by {faculty.name}</p>
                </div>
                <button
                  onClick={() => setShowContentModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingContent ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* Course Handout Section */}
                  <div className="border border-blue-200 rounded-lg overflow-hidden">
                    <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
                      <h3 className="font-bold text-blue-900 flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Course Handout (CHO)
                      </h3>
                    </div>
                    <div className="p-4">
                      {courseContent.cho ? (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{courseContent.cho.courseTitle}</p>
                            <p className="text-sm text-gray-600">
                              Last updated: {new Date(courseContent.cho.updatedAt).toLocaleDateString()}
                            </p>
                            <div className="mt-2">{getStatusBadge(courseContent.cho.status)}</div>
                          </div>
                          <button
                            onClick={() => router.push(`/admin/course-handouts/${courseContent.cho!.id}`)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            View CHO
                          </button>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">No course handout submitted yet</p>
                      )}
                    </div>
                  </div>

                  {/* Teaching Content Section */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Teaching Content ({courseContent.content.length})
                      </h3>
                    </div>
                    
                    {courseContent.content.length === 0 ? (
                      <div className="p-8 text-center">
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No content uploaded yet</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {courseContent.content.map((item) => (
                          <div key={item.id} className="p-4 hover:bg-gray-50">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-gray-900">{item.title}</h4>
                                  {getStatusBadge(item.status)}
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                  <p><span className="font-medium">Type:</span> {item.contentType.replace(/_/g, ' ')}</p>
                                  <p><span className="font-medium">File:</span> {item.fileName}</p>
                                  <p><span className="font-medium">Uploaded:</span> {new Date(item.uploadDate).toLocaleDateString()}</p>
                                </div>
                              </div>
                              
                              <div className="flex gap-2 flex-shrink-0">
                                {item.status === 'PENDING' && (
                                  <>
                                    <button
                                      onClick={() => updateContentStatus(item.id, 'APPROVED')}
                                      className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-medium flex items-center gap-1"
                                    >
                                      <CheckCircle className="h-3 w-3" />
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => updateContentStatus(item.id, 'REJECTED')}
                                      className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-xs font-medium flex items-center gap-1"
                                    >
                                      <XCircle className="h-3 w-3" />
                                      Reject
                                    </button>
                                  </>
                                )}
                                <a
                                  href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${item.filePath}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium flex items-center gap-1"
                                >
                                  <Download className="h-3 w-3" />
                                  Download
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t flex justify-end">
              <button
                onClick={() => setShowContentModal(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
