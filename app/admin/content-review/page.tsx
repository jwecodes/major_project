'use client'
import { Sidebar } from '@/components/sidebar'
import { courses, faculties, academicContent, contentTypes, approvalStatuses } from '@/lib/mokedata'
import { useState } from 'react'

interface AcademicContent {
  id: string
  title: string
  description: string
  type: 'assignment' | 'ppt' | 'handbook' | 'question_paper' | 'notes' | 'video' | 'other'
  courseId: string
  facultyId: string
  fileUrl: string
  fileName: string
  fileSize: string
  uploadedAt: string
  isPublished: boolean
  downloadCount: number
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'needs_revision'
  reviewedBy?: string
  reviewedAt?: string
  reviewComments?: string
  submittedAt: string
}

export default function AdminContentReviewPage() {
  const [statusFilter, setStatusFilter] = useState('pending')
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedContent, setSelectedContent] = useState<AcademicContent | null>(null)
  const [reviewForm, setReviewForm] = useState({
    status: 'approved' as 'approved' | 'rejected' | 'needs_revision',
    comments: ''
  })

  // Get content for review
  const getContentForReview = () => {
    let content = academicContent
    
    if (statusFilter !== 'all') {
      content = content.filter(item => item.approvalStatus === statusFilter)
    }
    
    return content.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
  }

  // Get course and faculty names
  const getCourseName = (courseId: string) => {
    return courses.find(course => course.id === courseId)?.name || 'Unknown Course'
  }

  const getFacultyName = (facultyId: string) => {
    return faculties.find(faculty => faculty.id === facultyId)?.name || 'Unknown Faculty'
  }

  const getContentTypeDetails = (type: string) => {
    return contentTypes.find(ct => ct.value === type) || contentTypes[contentTypes.length - 1]
  }

  const getApprovalStatusDetails = (status: string) => {
    return approvalStatuses.find(s => s.value === status) || approvalStatuses[0]
  }

  // Handle review
  const handleReviewContent = (content: AcademicContent) => {
    setSelectedContent(content)
    setReviewForm({
      status: 'approved',
      comments: ''
    })
    setShowReviewModal(true)
  }

  // Submit review
  const handleSubmitReview = () => {
    if (!selectedContent) return
    
    console.log('Admin review submitted:', {
      contentId: selectedContent.id,
      status: reviewForm.status,
      comments: reviewForm.comments,
      reviewedBy: 'admin1',
      reviewedAt: new Date().toISOString().split('T')[0]
    })
    
    setShowReviewModal(false)
    setSelectedContent(null)
    setReviewForm({ status: 'approved', comments: '' })
  }

  const contentList = getContentForReview()

  return (
    <div className="flex">
      <Sidebar role="admin" />
      
      <div className="flex-1 p-8 bg-gray-50">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Content Review</h1>
          <div className="text-sm text-gray-600">
            Review and approve faculty-submitted content
          </div>
        </div>

        {/* Review Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-600">Pending Review</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {academicContent.filter(c => c.approvalStatus === 'pending').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-600">Approved</h3>
            <p className="text-3xl font-bold text-green-600">
              {academicContent.filter(c => c.approvalStatus === 'approved').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-600">Needs Revision</h3>
            <p className="text-3xl font-bold text-orange-600">
              {academicContent.filter(c => c.approvalStatus === 'needs_revision').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-600">Rejected</h3>
            <p className="text-3xl font-bold text-red-600">
              {academicContent.filter(c => c.approvalStatus === 'rejected').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-800">Filter by Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">All Status</option>
              {approvalStatuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Content for Review ({contentList.length})
            </h2>
          </div>

          {contentList.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {contentList.map((content) => {
                const contentTypeDetails = getContentTypeDetails(content.type)
                const approvalStatusDetails = getApprovalStatusDetails(content.approvalStatus)
                
                return (
                  <div key={content.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl">{contentTypeDetails.icon}</span>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{content.title}</h3>
                            <p className="text-sm text-gray-600">
                              {getCourseName(content.courseId)} • {getFacultyName(content.facultyId)}
                            </p>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-3">{content.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${approvalStatusDetails.color}`}>
                            {approvalStatusDetails.label}
                          </span>
                          <span>📁 {content.fileName}</span>
                          <span>💾 {content.fileSize}</span>
                          <span>📅 Submitted: {content.submittedAt}</span>
                          {content.reviewedAt && (
                            <span>✅ Reviewed: {content.reviewedAt}</span>
                          )}
                        </div>

                        {content.reviewComments && (
                          <div className="mt-3 p-3 bg-gray-50 rounded border-l-4 border-blue-400">
                            <p className="text-sm text-gray-800">
                              <span className="font-medium">Review Comments:</span> {content.reviewComments}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          Preview
                        </button>
                        <button className="text-green-600 hover:text-green-800 text-sm">
                          Download
                        </button>
                        {content.approvalStatus === 'pending' && (
                          <button
                            onClick={() => handleReviewContent(content)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                          >
                            Review
                          </button>
                        )}
                        {content.approvalStatus !== 'pending' && (
                          <button
                            onClick={() => handleReviewContent(content)}
                            className="text-orange-600 hover:text-orange-800 text-sm"
                          >
                            Re-review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-600">No Content to Review</h3>
                <p className="text-gray-500 mt-2">No content matches the selected filter</p>
              </div>
            </div>
          )}
        </div>

        {/* Review Modal */}
        {/* Review Modal - Compact Version */}
        {showReviewModal && selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-lg w-full p-5 max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-3 text-gray-900">Review Content</h2>
            
            <div className="space-y-3 mb-4">
                <div>
                <h3 className="font-medium text-gray-900 text-sm">{selectedContent.title}</h3>
                <p className="text-xs text-gray-600">
                    {getCourseName(selectedContent.courseId)} • {getFacultyName(selectedContent.facultyId)}
                </p>
                </div>

                <div>
                <span className="text-xs font-medium text-gray-700">Description:</span>
                <p className="text-sm text-gray-800">{selectedContent.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                    <span className="font-medium text-gray-700">Type:</span>
                    <p className="text-gray-600">{getContentTypeDetails(selectedContent.type).label}</p>
                </div>
                <div>
                    <span className="font-medium text-gray-700">File:</span>
                    <p className="text-gray-600">{selectedContent.fileName}</p>
                </div>
                </div>
            </div>

            <div className="border-t pt-3">
                <h4 className="font-medium text-gray-900 mb-2 text-sm">Admin Review</h4>
                
                <div className="space-y-3">
                <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                    Review Decision *
                    </label>
                    <div className="space-y-1">
                    <label className="flex items-center">
                        <input
                        type="radio"
                        value="approved"
                        checked={reviewForm.status === 'approved'}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, status: e.target.value as any }))}
                        className="w-3 h-3 text-green-600 border-gray-300 focus:ring-green-500"
                        />
                        <span className="ml-2 text-sm text-gray-900">✅ Approve</span>
                    </label>
                    <label className="flex items-center">
                        <input
                        type="radio"
                        value="needs_revision"
                        checked={reviewForm.status === 'needs_revision'}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, status: e.target.value as any }))}
                        className="w-3 h-3 text-orange-600 border-gray-300 focus:ring-orange-500"
                        />
                        <span className="ml-2 text-sm text-gray-900">🔄 Needs Revision</span>
                    </label>
                    <label className="flex items-center">
                        <input
                        type="radio"
                        value="rejected"
                        checked={reviewForm.status === 'rejected'}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, status: e.target.value as any }))}
                        className="w-3 h-3 text-red-600 border-gray-300 focus:ring-red-500"
                        />
                        <span className="ml-2 text-sm text-gray-900">❌ Reject</span>
                    </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">
                    Comments {reviewForm.status !== 'approved' && '*'}
                    </label>
                    <textarea
                    value={reviewForm.comments}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, comments: e.target.value }))}
                    rows={3}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder={reviewForm.status === 'approved' 
                        ? 'Optional feedback...' 
                        : 'Provide improvement feedback...'}
                    />
                </div>
                </div>
            </div>

            <div className="flex space-x-3 mt-4">
                <button
                onClick={handleSubmitReview}
                disabled={reviewForm.status !== 'approved' && !reviewForm.comments.trim()}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                Submit Review
                </button>
                <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded text-sm hover:bg-gray-700"
                >
                Cancel
                </button>
            </div>
            </div>
        </div>
        )}



      </div>
    </div>
  )
}
