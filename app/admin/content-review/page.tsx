'use client'
import { useState, useEffect } from 'react'
import { FileText, CheckCircle, XCircle, AlertCircle, Download, Eye, X } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { getPendingContent, approveContent, requestChanges } from '@/app/actions/admin'

interface Content {
  id: string
  title: string
  contentType: string
  fileName: string
  filePath: string
  fileSize: number
  description: string | null
  lectureNumber: number | null
  approvalStatus: string
  createdAt: string
  faculty: {
    name: string
    facultyId: string
    designation: string
  }
  course: {
    courseCode: string
    courseName: string
    programme: {
      programmeCode: string
      programmeName: string
    }
  }
}

export default function ContentReviewPage() {
  const [contents, setContents] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedContent, setSelectedContent] = useState<Content | null>(null)
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | null>(null)
  const [notes, setNotes] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    setLoading(true)
    const data = await getPendingContent()
    setContents(data)
    setLoading(false)
  }

  const handleApproveClick = (content: Content) => {
    setSelectedContent(content)
    setModalAction('approve')
    setNotes('')
    setShowModal(true)
  }

  const handleRejectClick = (content: Content) => {
    setSelectedContent(content)
    setModalAction('reject')
    setNotes('')
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!selectedContent) return

    if (modalAction === 'reject' && !notes.trim()) {
      toast.error('Please provide a reason for requesting changes')
      return
    }

    setProcessing(true)

    try {
      const result = modalAction === 'approve'
        ? await approveContent(selectedContent.id, notes || undefined)
        : await requestChanges(selectedContent.id, notes)

      if (result.success) {
        toast.success(
          modalAction === 'approve' 
            ? 'Content approved successfully!' 
            : 'Changes requested successfully!'
        )
        setShowModal(false)
        setSelectedContent(null)
        setNotes('')
        loadContent()
      } else {
        toast.error(result.error || 'An error occurred')
      }
    } catch (error) {
      toast.error('Failed to process request')
    } finally {
      setProcessing(false)
    }
  }

  const getContentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'LECTURE_PPT': 'bg-blue-100 text-blue-800',
      'ASSIGNMENT': 'bg-green-100 text-green-800',
      'QUESTION_BANK': 'bg-purple-100 text-purple-800',
      'LAB_MANUAL': 'bg-orange-100 text-orange-800',
      'SYLLABUS': 'bg-pink-100 text-pink-800',
      'NOTES': 'bg-yellow-100 text-yellow-800',
      'COURSE_HANDBOOK': 'bg-indigo-100 text-indigo-800',
      'REFERENCE_MATERIAL': 'bg-gray-100 text-gray-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Toaster position="top-right" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Review</h1>
        <p className="text-gray-600">Review and approve teaching materials submitted by faculty</p>
      </div>

      {/* Review Modal */}
      {showModal && selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {modalAction === 'approve' ? 'Approve Content' : 'Request Changes'}
                  </h2>
                  <p className="text-gray-600 mt-1">{selectedContent.title}</p>
                </div>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Content Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-900 mb-3">Content Details</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Faculty</p>
                    <p className="font-medium text-gray-900">{selectedContent.faculty.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Designation</p>
                    <p className="font-medium text-gray-900">{selectedContent.faculty.designation}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Course</p>
                    <p className="font-medium text-gray-900">{selectedContent.course.courseCode}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Programme</p>
                    <p className="font-medium text-gray-900">{selectedContent.course.programme.programmeCode}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Type</p>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getContentTypeColor(selectedContent.contentType)}`}>
                      {selectedContent.contentType.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-600">File Size</p>
                    <p className="font-medium text-gray-900">{(selectedContent.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                {selectedContent.description && (
                  <div className="mt-3">
                    <p className="text-gray-600 text-sm">Description</p>
                    <p className="text-gray-900 mt-1">{selectedContent.description}</p>
                  </div>
                )}
              </div>

              {/* Preview/Download */}
              <div className="mb-4">
                <a
                  href={selectedContent.filePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-100 font-medium"
                >
                  <Download className="h-5 w-5" />
                  Download & Review File ({selectedContent.fileName})
                </a>
              </div>

              {/* Notes Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  {modalAction === 'approve' ? 'Approval Notes (Optional)' : 'Changes Required (Required)'}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    modalAction === 'approve'
                      ? 'Add any notes or feedback...'
                      : 'Explain what changes are needed...'
                  }
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required={modalAction === 'reject'}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={processing}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                    modalAction === 'approve'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-orange-600 hover:bg-orange-700 text-white'
                  } disabled:bg-gray-400`}
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      {modalAction === 'approve' ? (
                        <>
                          <CheckCircle className="h-5 w-5" />
                          Approve Content
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-5 w-5" />
                          Request Changes
                        </>
                      )}
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600">Pending Review</p>
            <p className="text-4xl font-bold text-yellow-600">{contents.length}</p>
          </div>
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Content List */}
      <div className="bg-white rounded-lg shadow-md">
        {contents.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">All Caught Up!</h3>
            <p className="text-gray-600">No content pending review at the moment</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {contents.map((content) => (
              <div key={content.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">{content.title}</h3>
                      {content.lectureNumber && (
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          Lecture {content.lectureNumber}
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getContentTypeColor(content.contentType)}`}>
                        {content.contentType.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600">Submitted by</p>
                        <p className="font-medium text-gray-900">{content.faculty.name}</p>
                        <p className="text-xs text-gray-600">{content.faculty.facultyId} • {content.faculty.designation}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Course</p>
                        <p className="font-medium text-gray-900">{content.course.courseCode} - {content.course.courseName}</p>
                        <p className="text-xs text-gray-600">{content.course.programme.programmeCode}</p>
                      </div>
                    </div>

                    {content.description && (
                      <p className="text-sm text-gray-700 mb-3 bg-gray-50 p-3 rounded">
                        {content.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>{content.fileName}</span>
                      </div>
                      <span>•</span>
                      <span>{(content.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                      <span>•</span>
                      <span>{new Date(content.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => handleApproveClick(content)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium whitespace-nowrap"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectClick(content)}
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2 font-medium whitespace-nowrap"
                    >
                      <XCircle className="h-4 w-4" />
                      Request Changes
                    </button>
                    <a
                      href={content.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 flex items-center gap-2 font-medium justify-center"
                    >
                      <Download className="h-4 w-4" />
                      Preview
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
