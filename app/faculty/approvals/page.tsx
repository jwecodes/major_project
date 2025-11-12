'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/faculty/Sidebar'
import { CheckCircle, X, AlertCircle, Trash2, Download } from 'lucide-react'

export default function Approvals() {
  const router = useRouter()
  const [contents, setContents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedContent, setSelectedContent] = useState<any>(null)
  const [action, setAction] = useState<'approve' | 'reject' | 'delete' | null>(null)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const facultyId = localStorage.getItem('facultyId')
    const faculty = localStorage.getItem('faculty')

    console.log('Approvals page - Faculty ID:', facultyId)

    if (!facultyId || !faculty) {
      router.push('/faculty/login')
      return
    }

    loadPendingContent(facultyId)
  }, [router])

  const loadPendingContent = async (facultyId: string) => {
    try {
      console.log('Loading pending content...')
      
      // Get all courses where this faculty is COORDINATOR
      const coursesRes = await fetch(`/api/faculty/my-courses`, {
        headers: { 'x-faculty-id': facultyId }
      })

      const coursesData = await coursesRes.json()
      console.log('Courses response:', coursesData)

      if (!coursesData.success) {
        setError('Failed to load courses')
        setLoading(false)
        return
      }

      const assignments = coursesData.assignments || []
      console.log('All assignments:', assignments.length)

      // Filter only COORDINATOR courses
      const coordinatorCourses = assignments.filter((a: any) => a.role === 'COORDINATOR')
      console.log('Coordinator courses:', coordinatorCourses.length)

      if (coordinatorCourses.length === 0) {
        console.log('No coordinator courses found')
        setContents([])
        setLoading(false)
        return
      }

      // Get all content from coordinator courses
      const allContent: any[] = []

      for (const course of coordinatorCourses) {
        try {
          console.log('Fetching content for course:', course.course.id)
          
          const contentRes = await fetch(`/api/faculty/courses/${course.course.id}`, {
            headers: { 'x-faculty-id': facultyId }
          })

          const contentData = await contentRes.json()
          console.log(`Content for ${course.course.courseCode}:`, contentData.contents?.length || 0)

          if (contentData.success && contentData.contents) {
            allContent.push(...contentData.contents)
          }
        } catch (err) {
          console.error(`Error fetching content for course ${course.course.id}:`, err)
        }
      }

      console.log('Total content loaded:', allContent.length)
      setContents(allContent)
    } catch (err) {
      console.error('Error loading content:', err)
      setError('Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = (content: any, actionType: 'approve' | 'reject' | 'delete') => {
    setSelectedContent(content)
    setAction(actionType)
    setNotes('')
    setShowModal(true)
  }

  const submitAction = async () => {
    if (!selectedContent || !action) return

    if ((action === 'approve' || action === 'reject') && !notes.trim()) {
      alert('Please add notes')
      return
    }

    setSubmitting(true)

    try {
      const facultyId = localStorage.getItem('facultyId')

      let endpoint = `/api/faculty/content/${selectedContent.id}`
      let method = 'PUT'
      let body: any = {}

      if (action === 'approve') {
        body = { status: 'APPROVED', notes }
        endpoint += '/approval'
      } else if (action === 'reject') {
        body = { status: 'REJECTED', notes }
        endpoint += '/approval'
      } else if (action === 'delete') {
        method = 'DELETE'
      }

      const res = await fetch(endpoint, {
        method,
        headers: {
          'x-faculty-id': facultyId || '',
          'Content-Type': 'application/json'
        },
        body: method !== 'DELETE' ? JSON.stringify(body) : undefined
      })

      const result = await res.json()

      if (result.success) {
        alert(`Content ${action}ed successfully!`)
        setShowModal(false)
        setSelectedContent(null)
        const refreshFacultyId = localStorage.getItem('facultyId')
        if (refreshFacultyId) {
          loadPendingContent(refreshFacultyId)
        }
      } else {
        alert(result.error || 'Action failed')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error performing action')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="lg:ml-64 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content...</p>
        </div>
      </div>
    )
  }

  const pendingContents = contents.filter(c => c.approvalStatus === 'PENDING')
  const approvedContents = contents.filter(c => c.approvalStatus === 'APPROVED')
  const rejectedContents = contents.filter(c => c.approvalStatus === 'REJECTED')

  return (
    <>
      <Sidebar />
      
      <div className="lg:ml-64 min-h-screen bg-gray-50">
        <main className="p-4 md:p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Approvals</h1>
          <p className="text-gray-600 mb-8">Review and approve submissions from your team</p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">
              {error}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <p className="text-gray-600 text-sm font-medium">Pending Review</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingContents.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <p className="text-gray-600 text-sm font-medium">Approved</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{approvedContents.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <p className="text-gray-600 text-sm font-medium">Rejected</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{rejectedContents.length}</p>
            </div>
          </div>

          {/* Pending Section */}
          <div className="bg-white rounded-lg shadow border border-gray-200 mb-8">
            <div className="p-6 border-b border-gray-200 bg-yellow-50">
              <h2 className="text-xl font-bold text-gray-900">⏳ Pending Review ({pendingContents.length})</h2>
            </div>

            {pendingContents.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {pendingContents.map((content: any) => (
                  <div key={content.id} className="p-6 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">{content.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{content.contentType.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          📤 Uploaded by: {content.faculty?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          📅 {new Date(content.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {content.description && (
                      <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
                        <p className="text-xs font-semibold text-gray-700 mb-1">Description:</p>
                        <p className="text-sm text-gray-600">{content.description}</p>
                      </div>
                    )}

                    <div className="flex gap-3 flex-wrap mb-3">
                      {content.filePath && (
                        <a
                          href={content.filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block px-3 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-xs font-medium flex items-center gap-2"
                        >
                          <Download className="h-3 w-3" />
                          Download
                        </a>
                      )}
                    </div>

                    <div className="flex gap-3 flex-wrap">
                      <button
                        onClick={() => handleAction(content, 'approve')}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium flex items-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(content, 'reject')}
                        className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm font-medium"
                      >
                        ⚠️ Reject
                      </button>
                      <button
                        onClick={() => handleAction(content, 'delete')}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-600">No pending submissions</div>
            )}
          </div>

          {/* Approved Section */}
          <div className="bg-white rounded-lg shadow border border-gray-200 mb-8">
            <div className="p-6 border-b border-gray-200 bg-green-50">
              <h2 className="text-xl font-bold text-gray-900">✓ Approved ({approvedContents.length})</h2>
            </div>

            {approvedContents.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {approvedContents.map((content: any) => (
                  <div key={content.id} className="p-6 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">{content.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{content.contentType.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-gray-500 mt-2">By: {content.faculty?.name}</p>
                      </div>
                      <button
                        onClick={() => handleAction(content, 'delete')}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs font-medium"
                      >
                        Remove
                      </button>
                    </div>
                    {content.coordinatorNotes && (
                      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                        <strong>Your notes:</strong> {content.coordinatorNotes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-600">No approved content</div>
            )}
          </div>

          {/* Rejected Section */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-6 border-b border-gray-200 bg-red-50">
              <h2 className="text-xl font-bold text-gray-900">✗ Rejected ({rejectedContents.length})</h2>
            </div>

            {rejectedContents.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {rejectedContents.map((content: any) => (
                  <div key={content.id} className="p-6 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">{content.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{content.contentType.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-gray-500 mt-2">By: {content.faculty?.name}</p>
                      </div>
                    </div>
                    {content.coordinatorNotes && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded text-sm mb-3">
                        <strong className="text-red-900">Rejection reason:</strong>
                        <p className="text-red-800 mt-1">{content.coordinatorNotes}</p>
                      </div>
                    )}
                    <button
                      onClick={() => handleAction(content, 'delete')}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs font-medium"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-600">No rejected content</div>
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      {showModal && selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {action === 'approve' && '✓ Approve Content'}
              {action === 'reject' && '✗ Reject Content'}
              {action === 'delete' && '🗑️ Delete Content'}
            </h2>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Title:</strong> {selectedContent.title}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                <strong>Type:</strong> {selectedContent.contentType.replace(/_/g, ' ')}
              </p>
            </div>

            {action !== 'delete' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Notes <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    action === 'approve' ? 'Add approval comments...' :
                    'Explain why you are rejecting this content...'
                  }
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={submitAction}
                disabled={submitting}
                className={`flex-1 px-4 py-2 rounded font-medium text-white ${
                  action === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                  action === 'reject' ? 'bg-orange-600 hover:bg-orange-700' :
                  'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50`}
              >
                {submitting ? 'Processing...' : 'Confirm'}
              </button>
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedContent(null)
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
