'use client'
import { useState, useEffect } from 'react'
import { Crown, Users, FileText, CheckCircle, XCircle, Eye, Loader, Download } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface Course {
  courseCode: string
  courseName: string
  courseIds: string[]
}

interface Contributor {
  id: string
  name: string
  email: string
  designation: string
  contentCount: number
}

interface ContentItem {
  id: string
  title: string
  fileName: string
  contentType: string
  uploadDate: string
  approvalStatus: string
  fileUrl: string
  filePath: string
  contributor: {
    name: string
    email: string
  }
  course: {
    courseCode: string
    courseName: string
  }
}

export default function CoordinationPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [selectedContributor, setSelectedContributor] = useState<Contributor | null>(null)
  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingContent, setLoadingContent] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    const email = localStorage.getItem('facultyEmail')
    if (!email) {
      router.push('/faculty/login')
      return
    }
    loadCoordinatedCourses(email)
  }, [router])

  const loadCoordinatedCourses = async (email: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/faculty/coordinated-courses?email=${encodeURIComponent(email)}`)
      const data = await res.json()

      if (data.success) {
        setCourses(data.courses)
      } else {
        toast.error('Error loading courses')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error loading courses')
    } finally {
      setLoading(false)
    }
  }

  const loadContributors = async (course: Course) => {
    try {
      setSelectedCourse(course)
      setLoadingContent(true)
      const res = await fetch(`/api/faculty/course-contributors?courseIds=${course.courseIds.join(',')}`)
      const data = await res.json()

      if (data.success) {
        setContributors(data.contributors)
      } else {
        toast.error('Error loading contributors')
      }
    } catch (error) {
      toast.error('Error loading contributors')
    } finally {
      setLoadingContent(false)
    }
  }

  const loadContributorContent = async (contributor: Contributor) => {
    if (!selectedCourse) return

    try {
      setSelectedContributor(contributor)
      setLoadingContent(true)
      const res = await fetch(
        `/api/faculty/contributor-content?facultyId=${contributor.id}&courseIds=${selectedCourse.courseIds.join(',')}`
      )
      const data = await res.json()

      if (data.success) {
        setContent(data.content)
      } else {
        toast.error('Error loading content')
      }
    } catch (error) {
      toast.error('Error loading content')
    } finally {
      setLoadingContent(false)
    }
  }

  const updateContentStatus = async (contentId: string, status: string) => {
    try {
      setUpdating(contentId)
      const res = await fetch(`/api/faculty/update-content-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId, status })
      })

      const data = await res.json()
      if (data.success) {
        toast.success(`Content ${status.toLowerCase()}!`)
        setContent(content.map(c => 
          c.id === contentId ? { ...c, approvalStatus: status } : c
        ))
      } else {
        toast.error(data.error || 'Error updating status')
      }
    } catch (error) {
      toast.error('Error updating status')
    } finally {
      setUpdating(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string, text: string, icon: any }> = {
      APPROVED: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: FileText },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle }
    }
    const { bg, text, icon: Icon } = config[status] || config.PENDING
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
        <Icon className="h-3 w-3" />
        {status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <Toaster position="top-right" />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Crown className="h-8 w-8 text-purple-600" />
          Course Coordination
        </h1>
        <p className="text-gray-600">Review and approve content from contributors</p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center border border-gray-200">
          <Crown className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">You are not a coordinator for any courses</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Courses List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                Your Coordinated Courses ({courses.length})
              </h2>
              <div className="space-y-2">
                {courses.map((course) => (
                  <button
                    key={course.courseCode}
                    onClick={() => loadContributors(course)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedCourse?.courseCode === course.courseCode
                        ? 'bg-purple-50 border-purple-600'
                        : 'bg-gray-50 border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">{course.courseCode}</div>
                    <div className="text-sm text-gray-600 mt-1">{course.courseName}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Contributors List */}
          <div className="lg:col-span-2">
            {!selectedCourse ? (
              <div className="bg-white p-12 rounded-lg shadow text-center border border-gray-200">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Select a course to view contributors</p>
              </div>
            ) : loadingContent ? (
              <div className="bg-white p-12 rounded-lg shadow text-center border border-gray-200">
                <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading...</p>
              </div>
            ) : !selectedContributor ? (
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Contributors for {selectedCourse.courseCode}
                </h2>
                {contributors.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No contributors assigned</p>
                ) : (
                  <div className="grid gap-4">
                    {contributors.map((contributor) => (
                      <button
                        key={contributor.id}
                        onClick={() => loadContributorContent(contributor)}
                        className="text-left p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{contributor.name}</h3>
                            <p className="text-sm text-gray-600">{contributor.designation}</p>
                            <p className="text-xs text-gray-500 mt-1">{contributor.email}</p>
                          </div>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                            {contributor.contentCount} uploads
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Content List */
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                      Content by {selectedContributor.name}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">{selectedCourse.courseCode} - {selectedCourse.courseName}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedContributor(null)
                      setContent([])
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Back
                  </button>
                </div>

                {loadingContent ? (
                  <div className="text-center py-8">
                    <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                  </div>
                ) : content.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No content uploaded yet</p>
                ) : (
                  <div className="space-y-4">
                    {content.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900">{item.title}</h4>
                              {getStatusBadge(item.approvalStatus)}
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p><span className="font-medium">Type:</span> {item.contentType.replace(/_/g, ' ')}</p>
                              <p><span className="font-medium">File:</span> {item.fileName}</p>
                              <p><span className="font-medium">Uploaded:</span> {new Date(item.uploadDate).toLocaleDateString()}</p>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <a
                              href={item.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </a>
                            
                            {item.approvalStatus === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => updateContentStatus(item.id, 'APPROVED')}
                                  disabled={updating === item.id}
                                  className="px-3 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium flex items-center gap-2 disabled:bg-gray-400"
                                >
                                  {updating === item.id ? (
                                    <Loader className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <CheckCircle className="h-4 w-4" />
                                      Approve
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => updateContentStatus(item.id, 'REJECTED')}
                                  disabled={updating === item.id}
                                  className="px-3 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium flex items-center gap-2 disabled:bg-gray-400"
                                >
                                  {updating === item.id ? (
                                    <Loader className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <XCircle className="h-4 w-4" />
                                      Reject
                                    </>
                                  )}
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
