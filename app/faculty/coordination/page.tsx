'use client'

import { useState, useEffect } from 'react'
import {
  Crown,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Loader,
  Clock,
} from 'lucide-react'
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
  lectureNumber?: number | null
  description?: string | null
  filePath: string
  fileUrl: string
  approvalStatus: 'PENDING' | 'APPROVED' | 'CHANGES_REQUIRED' | 'REJECTED'
  coordinatorNotes?: string | null
  uploadDate: string
  updatedFromId?: string | null
  contributor: { name: string; email: string }
  course: { courseCode: string; courseName: string }
}

interface RevisionItem {
  id: string
  title: string
  fileName: string
  approvalStatus: 'PENDING' | 'APPROVED' | 'CHANGES_REQUIRED' | 'REJECTED'
  createdAt: string
}

export default function CoordinationPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [selectedContributor, setSelectedContributor] =
    useState<Contributor | null>(null)
  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingContent, setLoadingContent] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)

  // approval modal
  const [showModal, setShowModal] = useState(false)
  const [modalContent, setModalContent] = useState<ContentItem | null>(null)
  const [modalAction, setModalAction] = useState<
    'APPROVED' | 'REJECTED' | 'CHANGES_REQUIRED' | null
  >(null)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // revision history modal
  const [showRevisionsModal, setShowRevisionsModal] = useState(false)
  const [revisionTarget, setRevisionTarget] = useState<ContentItem | null>(null)
  const [revisions, setRevisions] = useState<RevisionItem[]>([])
  const [revisionsLoading, setRevisionsLoading] = useState(false)

  useEffect(() => {
    const email =
      typeof window !== 'undefined' ? localStorage.getItem('facultyEmail') : null

    if (!email) {
      router.push('/faculty/login')
      return
    }

    loadCoordinatedCourses(email)
  }, [router])

  // 👉 reuse /api/faculty/courses to find where faculty is COORDINATOR
  const loadCoordinatedCourses = async (email: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/faculty/courses?email=${encodeURIComponent(email)}`)
      const data = await res.json()

      if (data.success && Array.isArray(data.courses)) {
        const grouped: Record<
          string,
          {
            courseCode: string
            courseName: string
            courseIds: string[]
            role: 'COORDINATOR' | 'CONTRIBUTOR'
          }
        > = {}

        data.courses.forEach((course: any) => {
          const key = course.courseCode

          if (!grouped[key]) {
            grouped[key] = {
              courseCode: course.courseCode,
              courseName: course.courseName,
              courseIds: [course.id],
              role: course.allocation.role,
            }
          } else {
            if (!grouped[key].courseIds.includes(course.id)) {
              grouped[key].courseIds.push(course.id)
            }
            if (course.allocation.role === 'COORDINATOR') {
              grouped[key].role = 'COORDINATOR'
            }
          }
        })

        const onlyCoordinator: Course[] = Object.values(grouped)
          .filter(c => c.role === 'COORDINATOR')
          .map(c => ({
            courseCode: c.courseCode,
            courseName: c.courseName,
            courseIds: c.courseIds,
          }))

        setCourses(onlyCoordinator)
      } else {
        toast.error(data.error || 'Error loading courses')
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
      setSelectedContributor(null)
      setContent([])
      setLoadingContent(true)
      const res = await fetch(
        `/api/faculty/course-contributors?courseIds=${course.courseIds.join(',')}`
      )
      const data = await res.json()
      if (data.success) {
        setContributors(data.contributors)
      } else {
        toast.error(data.error || 'Error loading contributors')
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
      setContent([])
      setLoadingContent(true)
      const res = await fetch(
        `/api/faculty/contributor-content?facultyId=${contributor.id}&courseIds=${selectedCourse.courseIds.join(
          ','
        )}`
      )
      const data = await res.json()
      if (data.success) {
        setContent(data.content)
      } else {
        toast.error(data.error || 'Error loading content')
      }
    } catch (error) {
      toast.error('Error loading content')
    } finally {
      setLoadingContent(false)
    }
  }

  // ====== approval actions ======

  const handleAction = (
    item: ContentItem,
    action: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUIRED'
  ) => {
    setModalContent(item)
    setModalAction(action)
    setNotes('')
    setShowModal(true)
  }

  const submitAction = async () => {
    if (!modalContent || !modalAction) return
    if (modalAction === 'CHANGES_REQUIRED' && !notes.trim()) {
      toast.error('Enter feedback for requested changes')
      return
    }
    setSubmitting(true)
    setUpdating(modalContent.id)
    try {
      const res = await fetch(`/api/faculty/content/${modalContent.id}/approval`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: modalAction, notes }),
      })
      const result = await res.json()
      if (result.success) {
        toast.success(
          modalAction === 'APPROVED'
            ? 'Content approved!'
            : modalAction === 'REJECTED'
            ? 'Content rejected!'
            : 'Change request sent!'
        )
        setContent(prev =>
          prev.map(c =>
            c.id === modalContent.id
              ? {
                  ...c,
                  approvalStatus: modalAction,
                  coordinatorNotes: modalAction === 'CHANGES_REQUIRED' ? notes : '',
                }
              : c
          )
        )
        setShowModal(false)
        setModalContent(null)
        setModalAction(null)
        setNotes('')
      } else {
        toast.error(result.error || 'Error updating status')
      }
    } catch (error) {
      toast.error('Error updating status')
    } finally {
      setSubmitting(false)
      setUpdating(null)
    }
  }

  // ====== revision history ======

  const openRevisionHistory = async (item: ContentItem) => {
    setRevisionTarget(item)
    setShowRevisionsModal(true)
    setRevisionsLoading(true)

    // if this is a revision, root is updatedFromId; else root is itself
    const rootId = item.updatedFromId || item.id

    try {
      const res = await fetch(`/api/faculty/content/${rootId}/revisions`)
      const data = await res.json()

      if (data.success && Array.isArray(data.revisions)) {
        // Prisma route returns basic TeachingContent; map to RevisionItem
        const mapped: RevisionItem[] = data.revisions.map((r: any) => ({
          id: r.id,
          title: r.title,
          fileName: r.fileName,
          approvalStatus: r.approvalStatus,
          createdAt: r.createdAt,
        }))
        setRevisions(mapped)
      } else {
        toast.error(data.error || 'Could not load revision history')
        setRevisions([])
      }
    } catch (err) {
      console.error('Revision history error:', err)
      toast.error('Error loading revision history')
      setRevisions([])
    } finally {
      setRevisionsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const config: Record<
      string,
      { bg: string; text: string; icon: any }
    > = {
      APPROVED: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: FileText },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
      CHANGES_REQUIRED: { bg: 'bg-orange-100', text: 'text-orange-700', icon: XCircle },
    }
    const { bg, text, icon: Icon } = config[status] || config.PENDING
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${bg} ${text}`}
      >
        <Icon className="h-3 w-3" />
        {status.replace(/_/g, ' ')}
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
        <p className="text-gray-600">
          Review, approve, or request changes for contributor uploads and track
          revisions over time.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center border border-gray-200">
          <Crown className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">
            You are not a coordinator for any courses
          </p>
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
                {courses.map(course => (
                  <button
                    key={course.courseCode}
                    onClick={() => loadContributors(course)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedCourse?.courseCode === course.courseCode
                        ? 'bg-purple-50 border-purple-600'
                        : 'bg-gray-50 border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">
                      {course.courseCode}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {course.courseName}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Contributors List and Content */}
          <div className="lg:col-span-2">
            {!selectedCourse ? (
              <div className="bg-white p-12 rounded-lg shadow text-center border border-gray-200">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Select a course to view contributors</p>
              </div>
            ) : loadingContent && !selectedContributor ? (
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
                  <p className="text-gray-500 text-center py-8">
                    No contributors assigned
                  </p>
                ) : (
                  <div className="grid gap-4">
                    {contributors.map(contributor => (
                      <button
                        key={contributor.id}
                        onClick={() => loadContributorContent(contributor)}
                        className="text-left p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {contributor.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {contributor.designation}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {contributor.email}
                            </p>
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
              // Content List
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                      Content by {selectedContributor.name}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedCourse.courseCode} - {selectedCourse.courseName}
                    </p>
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
                  <p className="text-gray-500 text-center py-8">
                    No content uploaded yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {content.map(item => (
                      <div
                        key={item.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h4 className="font-semibold text-gray-900">
                                {item.title}
                              </h4>
                              {getStatusBadge(item.approvalStatus)}
                              {item.updatedFromId && (
                                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
                                  Revision Upload
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>
                                <span className="font-medium">Type:</span>{' '}
                                {item.contentType.replace(/_/g, ' ')}
                              </p>
                              <p>
                                <span className="font-medium">File:</span>{' '}
                                {item.fileName}
                              </p>
                              <p>
                                <span className="font-medium">Uploaded:</span>{' '}
                                {new Date(item.uploadDate).toLocaleDateString()}
                              </p>
                            </div>

                            {item.approvalStatus === 'CHANGES_REQUIRED' &&
                              item.coordinatorNotes && (
                                <div className="mt-2 p-2 border-l-4 border-orange-600 bg-orange-50 text-orange-800 rounded">
                                  <strong>Feedback:</strong>{' '}
                                  {item.coordinatorNotes}
                                </div>
                              )}
                          </div>
                          <div className="flex flex-col gap-2 items-end">
                            <div className="flex gap-2">
                              <a
                                href={item.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium flex items-center gap-2"
                              >
                                <Eye className="h-4 w-4" />
                                View
                              </a>
                              <button
                                onClick={() => openRevisionHistory(item)}
                                className="px-3 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center gap-2"
                              >
                                <Clock className="h-4 w-4" />
                                History
                              </button>
                            </div>

                            {item.approvalStatus === 'PENDING' && (
                              <div className="flex flex-col gap-2 mt-2 w-full">
                                <button
                                  onClick={() => handleAction(item, 'APPROVED')}
                                  disabled={updating === item.id}
                                  className="px-3 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium flex items-center gap-2 disabled:bg-gray-400"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleAction(item, 'REJECTED')}
                                  disabled={updating === item.id}
                                  className="px-3 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium flex items-center gap-2 disabled:bg-gray-400"
                                >
                                  <XCircle className="h-4 w-4" />
                                  Reject
                                </button>
                                <button
                                  onClick={() =>
                                    handleAction(item, 'CHANGES_REQUIRED')
                                  }
                                  disabled={updating === item.id}
                                  className="px-3 py-2 text-white bg-orange-600 hover:bg-orange-700 rounded-lg text-sm font-medium flex items-center gap-2 disabled:bg-gray-400"
                                >
                                  ✏️ Request Changes
                                </button>
                              </div>
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

      {/* Approve / Reject / Request Changes Modal */}
      {showModal && modalContent && modalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-bold mb-4">
              {modalAction === 'APPROVED'
                ? 'Approve Content'
                : modalAction === 'REJECTED'
                ? 'Reject Content'
                : 'Request Changes'}
            </h2>
            <div className="mb-2 font-semibold">{modalContent.title}</div>
            <div className="mb-4 text-sm text-gray-500">
              {modalContent.fileName}
            </div>
            {modalAction === 'CHANGES_REQUIRED' && (
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium">
                  Feedback/Required Changes:
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full border border-gray-300 px-2 py-1 rounded focus:ring"
                  placeholder="Describe required changes for contributor..."
                />
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={submitAction}
                disabled={submitting}
                className={`flex-1 px-4 py-2 rounded font-medium text-white ${
                  modalAction === 'APPROVED'
                    ? 'bg-green-600 hover:bg-green-700'
                    : modalAction === 'REJECTED'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-orange-600 hover:bg-orange-700'
                } disabled:opacity-50`}
              >
                {submitting
                  ? 'Processing...'
                  : modalAction === 'APPROVED'
                  ? 'Approve'
                  : modalAction === 'REJECTED'
                  ? 'Reject'
                  : 'Request Changes'}
              </button>
              <button
                onClick={() => {
                  setShowModal(false)
                  setModalContent(null)
                  setModalAction(null)
                  setNotes('')
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revision History Modal */}
      {showRevisionsModal && revisionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Revision History
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {revisionTarget.title} ({revisionTarget.fileName})
                </p>
              </div>
              <button
                onClick={() => {
                  setShowRevisionsModal(false)
                  setRevisionTarget(null)
                  setRevisions([])
                }}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
              >
                ✕
              </button>
            </div>

            {revisionsLoading ? (
              <div className="py-6 flex items-center justify-center">
                <Loader className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : revisions.length === 0 ? (
              <p className="text-sm text-gray-600 py-4 text-center">
                No revision history found.
              </p>
            ) : (
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {revisions.map((rev, idx) => (
                  <div key={rev.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className="w-2 h-2 rounded-full bg-blue-500 mt-1" />
                      {idx !== revisions.length - 1 && (
                        <div className="w-px flex-1 bg-gray-300 mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-3 border-b border-gray-100 last:border-none">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm text-gray-900">
                          {rev.title}
                        </p>
                        {getStatusBadge(rev.approvalStatus)}
                      </div>
                      <p className="text-xs text-gray-600">
                        File: {rev.fileName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(rev.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
