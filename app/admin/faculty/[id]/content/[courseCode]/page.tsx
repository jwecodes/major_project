'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  FileText, 
  Loader, 
  Eye, 
  Download,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  BookOpen,
  FileQuestion,
  ClipboardList,
  FlaskConical,
  BookMarked,
  Presentation
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

interface Faculty {
  id: string
  name: string
  email: string
  facultyId: string
}

interface ContentItem {
  id: string
  title: string
  contentType: string
  approvalStatus: string
  fileName: string
  filePath: string
  fileUrl: string
  createdAt: string
  coordinatorNotes?: string
}

interface CHO {
  id: string
  status: string
  courseTitle: string
  updatedAt: string
}

interface GroupedContent {
  COURSE_HANDOUT: ContentItem[]
  LECTURE_PPT: ContentItem[]
  ASSIGNMENT: ContentItem[]
  QUESTION_BANK: ContentItem[]
  LAB_ASSIGNMENT: ContentItem[]  // Add this
  QUESTION_PAPER: ContentItem[]
  LAB_MANUAL: ContentItem[]
  REFERENCE_MATERIAL: ContentItem[]
}

export default function FacultyCourseContentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const facultyId = params?.id as string
  const courseCode = params?.courseCode as string

  const [faculty, setFaculty] = useState<Faculty | null>(null)
  const [courseName, setCourseName] = useState('')
  const [courseIds, setCourseIds] = useState<string[]>([])
  const [cho, setCho] = useState<CHO | null>(null)
  const [groupedContent, setGroupedContent] = useState<GroupedContent>({
    COURSE_HANDOUT: [],
    LECTURE_PPT: [],
    ASSIGNMENT: [],
    QUESTION_BANK: [],
    QUESTION_PAPER: [],
    LAB_ASSIGNMENT: [],  // Add this
    LAB_MANUAL: [],
    REFERENCE_MATERIAL: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (facultyId && courseCode) {
      loadData()
    }
  }, [facultyId, courseCode])

  const loadData = async () => {
    try {
      setLoading(true)

      // Load faculty info
      const facultyRes = await fetch(`/api/admin/faculty/${facultyId}`)
      const facultyData = await facultyRes.json()
      
      if (facultyData.success) {
        setFaculty(facultyData.faculty)
      }

      // Load courses to get course IDs
      const coursesRes = await fetch(`/api/admin/faculty/${facultyId}/courses`)
      const coursesData = await coursesRes.json()

      if (coursesData.success) {
        const matchingCourses = coursesData.allocations.filter(
          (alloc: any) => alloc.course.courseCode === courseCode
        )
        
        if (matchingCourses.length > 0) {
          setCourseName(matchingCourses[0].course.courseName)
          const ids = matchingCourses.map((alloc: any) => alloc.course.id)
          setCourseIds(ids)

          // Load content and CHO
          const [contentRes, choRes] = await Promise.all([
            fetch(`/api/admin/faculty/${facultyId}/content?courseIds=${ids.join(',')}`),
            fetch(`/api/admin/faculty/${facultyId}/cho?courseCode=${courseCode}`)
          ])

          const contentData = await contentRes.json()
          const choData = await choRes.json()

          if (contentData.success) {
            // Group content by type
            const grouped: GroupedContent = {
              COURSE_HANDOUT: [],
              LECTURE_PPT: [],
              ASSIGNMENT: [],
              QUESTION_BANK: [],
              QUESTION_PAPER: [],
              LAB_ASSIGNMENT: [],
              LAB_MANUAL: [],
              REFERENCE_MATERIAL: []
            }

            contentData.content.forEach((item: ContentItem) => {
              if (grouped[item.contentType as keyof GroupedContent]) {
                grouped[item.contentType as keyof GroupedContent].push(item)
              }
            })

            setGroupedContent(grouped)
          }

          if (choData.success) {
            setCho(choData.cho)
          }
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Error loading content')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; icon: any }> = {
      APPROVED: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
      CHANGES_REQUIRED: { bg: 'bg-orange-100', text: 'text-orange-700', icon: AlertCircle },
      SUBMITTED: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
      DRAFT: { bg: 'bg-gray-100', text: 'text-gray-700', icon: Clock }
    }

    const { bg, text, icon: Icon } = config[status] || config.PENDING

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${bg} ${text}`}>
        <Icon className="h-3 w-3" />
        {status}
      </span>
    )
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      COURSE_HANDOUT: BookOpen,
      LECTURE_PPT: Presentation,
      ASSIGNMENT: ClipboardList,
      QUESTION_BANK: FileQuestion,
      QUESTION_PAPER: FileText,
      LAB_MANUAL: FlaskConical,
      LAB_ASSIGNMENT: FlaskConical,  // Add this - using Flask icon for labs
      REFERENCE_MATERIAL: BookMarked
    }
    return icons[category] || FileText
  }

  const getCategoryLabel = (category: string) => {
    return category.replace(/_/g, ' ')
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      COURSE_HANDOUT: 'blue',
      LECTURE_PPT: 'purple',
      ASSIGNMENT: 'green',
      QUESTION_BANK: 'orange',
      QUESTION_PAPER: 'red',
      LAB_ASSIGNMENT: 'teal', 
      LAB_MANUAL: 'indigo',
      REFERENCE_MATERIAL: 'pink'
    }
    return colors[category] || 'gray'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const totalContent = Object.values(groupedContent).reduce((sum, arr) => sum + arr.length, 0)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push(`/admin/faculty/${facultyId}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Faculty Courses
        </button>

        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-2">{courseCode} - {courseName}</h1>
          <div className="flex items-center gap-4 text-sm text-blue-100">
            <span>Faculty: {faculty?.name}</span>
            <span>•</span>
            <span>{totalContent} Total Items</span>
          </div>
        </div>
      </div>

      {/* Course Handout (CHO) Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            Course Handout (CHO)
          </h2>
        </div>
        <div className="p-6">
          {cho ? (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <p className="font-semibold text-gray-900">{cho.courseTitle}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Last updated: {new Date(cho.updatedAt).toLocaleDateString()}
                </p>
                <div className="mt-2">{getStatusBadge(cho.status)}</div>
              </div>
              <button
                onClick={() => router.push(`/admin/course-handouts/${cho.id}`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium"
              >
                <Eye className="h-4 w-4" />
                View CHO
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No course handout submitted yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Content by Category */}
      <div className="space-y-6">
        {(Object.entries(groupedContent) as [string, ContentItem[]][]).map(([category, items]) => {
          const Icon = getCategoryIcon(category)
          const color = getCategoryColor(category)
          
          return (
            <div key={category} className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Icon className="h-6 w-6 text-gray-600" />
                  {getCategoryLabel(category)} ({items.length})
                </h2>
              </div>

              {items.length === 0 ? (
                <div className="p-8 text-center">
                  <Icon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No {getCategoryLabel(category).toLowerCase()} uploaded yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {items.map((item: ContentItem) => (
                    <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{item.title}</h4>
                            {getStatusBadge(item.approvalStatus)}
                          </div>
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><span className="font-medium">File:</span> {item.fileName}</p>
                            <p><span className="font-medium">Uploaded:</span> {new Date(item.createdAt).toLocaleDateString()}</p>
                            
                            {item.coordinatorNotes && (
                              <div className={`mt-3 p-3 rounded-lg border-l-4 ${
                                item.approvalStatus === 'REJECTED' 
                                  ? 'bg-red-50 border-red-500' 
                                  : 'bg-orange-50 border-orange-500'
                              }`}>
                                <p className={`text-xs font-semibold mb-1 ${
                                  item.approvalStatus === 'REJECTED' ? 'text-red-700' : 'text-orange-700'
                                }`}>
                                  Coordinator Feedback:
                                </p>
                                <p className={`text-sm ${
                                  item.approvalStatus === 'REJECTED' ? 'text-red-900' : 'text-orange-900'
                                }`}>
                                  {item.coordinatorNotes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2 flex-shrink-0">
                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </a>
                          <a
                            href={item.fileUrl}
                            download
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium flex items-center gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
