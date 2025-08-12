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

export default function FacultyContentPage() {
  const [selectedCourse, setSelectedCourse] = useState('')
  const [contentFilter, setContentFilter] = useState('all')
  const [approvalFilter, setApprovalFilter] = useState('all') // New filter
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedContent, setSelectedContent] = useState<AcademicContent | null>(null)
  
  const currentFaculty = faculties[0]
  
  const [newContent, setNewContent] = useState({
    title: '',
    description: '',
    type: 'assignment' as const,
    courseId: ''
  })

  const facultyCourses = courses.filter(course => course.facultyId === currentFaculty.id)

  const getFacultyContent = () => {
    let content = academicContent.filter(content => content.facultyId === currentFaculty.id)
    
    if (selectedCourse) {
      content = content.filter(item => item.courseId === selectedCourse)
    }
    
    if (contentFilter !== 'all') {
      content = content.filter(item => item.type === contentFilter)
    }

    // New approval filter
    if (approvalFilter !== 'all') {
      content = content.filter(item => item.approvalStatus === approvalFilter)
    }
    
    if (searchTerm) {
      content = content.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    return content.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
  }

  const getCourseName = (courseId: string) => {
    return courses.find(course => course.id === courseId)?.name || 'Unknown Course'
  }

  const getContentTypeDetails = (type: string) => {
    return contentTypes.find(ct => ct.value === type) || contentTypes[contentTypes.length - 1]
  }

  const getApprovalStatusDetails = (status: string) => {
    return approvalStatuses.find(s => s.value === status) || approvalStatuses[0]
  }

  const handleSubmitForReview = () => {
    if (!newContent.title || !newContent.courseId || !newContent.type) {
      alert('Please fill in all required fields')
      return
    }
    
    console.log('Submitting content for admin review:', {
      ...newContent,
      facultyId: currentFaculty.id,
      submittedAt: new Date().toISOString().split('T')[0],
      approvalStatus: 'pending'
    })
    
    setNewContent({
      title: '',
      description: '',
      type: 'assignment',
      courseId: ''
    })
    setShowUploadModal(false)
  }

  const handleViewReview = (content: AcademicContent) => {
    setSelectedContent(content)
    setShowReviewModal(true)
  }

  const facultyContentList = getFacultyContent()

  return (
    <div className="flex">
      <Sidebar role="faculty" />
      
      <div className="flex-1 p-8 bg-gray-50">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Submit Content for Review
          </button>
        </div>

        {/* Updated Stats with Approval Status */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-sm font-semibold text-gray-600">Total Submitted</h3>
            <p className="text-2xl font-bold text-blue-600">{facultyContentList.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-sm font-semibold text-gray-600">Pending Review</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {facultyContentList.filter(c => c.approvalStatus === 'pending').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-sm font-semibold text-gray-600">Approved</h3>
            <p className="text-2xl font-bold text-green-600">
              {facultyContentList.filter(c => c.approvalStatus === 'approved').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-sm font-semibold text-gray-600">Needs Revision</h3>
            <p className="text-2xl font-bold text-orange-600">
              {facultyContentList.filter(c => c.approvalStatus === 'needs_revision').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-sm font-semibold text-gray-600">Published</h3>
            <p className="text-2xl font-bold text-purple-600">
              {facultyContentList.filter(c => c.isPublished).length}
            </p>
          </div>
        </div>

        {/* Updated Filters with Approval Status */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Filters & Search</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="">All Courses</option>
                {facultyCourses.map(course => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Content Type</label>
              <select
                value={contentFilter}
                onChange={(e) => setContentFilter(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="all">All Types</option>
                {contentTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Approval Status</label>
              <select
                value={approvalFilter}
                onChange={(e) => setApprovalFilter(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="all">All Status</option>
                {approvalStatuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search content..."
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedCourse('')
                  setContentFilter('all')
                  setApprovalFilter('all')
                  setSearchTerm('')
                }}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded text-sm hover:bg-gray-700"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Updated Content List with Approval Status */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              My Content Submissions ({facultyContentList.length})
            </h2>
          </div>

          {facultyContentList.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {facultyContentList.map((content) => {
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
                            <p className="text-sm text-gray-600">{getCourseName(content.courseId)}</p>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-3">{content.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${contentTypeDetails.value}`}>
                            {contentTypeDetails.label}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${approvalStatusDetails.color}`}>
                            {approvalStatusDetails.label}
                          </span>
                          <span>📅 Submitted: {content.submittedAt}</span>
                          {content.approvalStatus === 'approved' && (
                            <>
                              <span>⬇️ {content.downloadCount} downloads</span>
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                Published
                              </span>
                            </>
                          )}
                        </div>

                        {/* Review Comments Preview */}
                        {(content.approvalStatus === 'rejected' || content.approvalStatus === 'needs_revision') && content.reviewComments && (
                          <div className="mt-3 p-3 bg-gray-50 rounded border-l-4 border-orange-400">
                            <p className="text-sm text-gray-800">
                              <span className="font-medium">Admin Review:</span> {content.reviewComments}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {(content.reviewComments || content.approvalStatus !== 'pending') && (
                          <button
                            onClick={() => handleViewReview(content)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View Review
                          </button>
                        )}
                        {(content.approvalStatus === 'rejected' || content.approvalStatus === 'needs_revision') && (
                          <button className="text-green-600 hover:text-green-800 text-sm">
                            Resubmit
                          </button>
                        )}
                        {content.approvalStatus === 'pending' && (
                          <button className="text-yellow-600 hover:text-yellow-800 text-sm">
                            Edit
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
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-600">No Content Found</h3>
                <p className="text-gray-500 mt-2">Start by submitting your first content for admin review</p>
              </div>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Submit Content for Review
              </button>
            </div>
          )}
        </div>

        {/* Updated Upload Modal - Submit for Review */}
        {/* Upload Content Modal - Ultra Compact Version for Faculty */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 z-50">
            <div className="bg-white rounded-lg max-w-sm w-full p-4 max-h-[80vh] overflow-y-auto">
              <h2 className="text-base font-semibold mb-3 text-gray-900">Submit for Review</h2>
              
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-800 mb-1">Title *</label>
                  <input
                    type="text"
                    value={newContent.title}
                    onChange={(e) => setNewContent(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                    placeholder="Content title"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-800 mb-1">Description</label>
                  <textarea
                    value={newContent.description}
                    onChange={(e) => setNewContent(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                    placeholder="Brief description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-800 mb-1">Course *</label>
                    <select
                      value={newContent.courseId}
                      onChange={(e) => setNewContent(prev => ({ ...prev, courseId: e.target.value }))}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                    >
                      <option value="">Select...</option>
                      {facultyCourses.map(course => (
                        <option key={course.id} value={course.id}>{course.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-800 mb-1">Type *</label>
                    <select
                      value={newContent.type}
                      onChange={(e) => setNewContent(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                    >
                      {contentTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-800 mb-1">Upload File *</label>
                  <div className="border-2 border-dashed border-gray-300 rounded p-3 text-center">
                    <div className="text-gray-400">
                      <div className="text-lg mb-1">📎</div>
                      <p className="text-xs">Click to upload</p>
                    </div>
                    <button className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 mt-1">
                      Choose File
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded p-2">
                  <p className="text-xs text-blue-800">
                    <strong>Note:</strong> Content will be reviewed by admin before publication.
                  </p>
                </div>
              </div>

              <div className="flex space-x-2 mt-3">
                <button
                  onClick={handleSubmitForReview}
                  className="flex-1 bg-blue-600 text-white py-1 px-3 rounded text-xs hover:bg-blue-700"
                >
                  Submit for Review
                </button>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 bg-gray-600 text-white py-1 px-3 rounded text-xs hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Review Details Modal */}
        {showReviewModal && selectedContent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-lg w-full p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Review Details</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">{selectedContent.title}</h3>
                  <p className="text-sm text-gray-600">{getCourseName(selectedContent.courseId)}</p>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getApprovalStatusDetails(selectedContent.approvalStatus).color}`}>
                    {getApprovalStatusDetails(selectedContent.approvalStatus).label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Submitted:</span>
                    <p className="text-gray-600">{selectedContent.submittedAt}</p>
                  </div>
                  {selectedContent.reviewedAt && (
                    <div>
                      <span className="font-medium text-gray-700">Reviewed:</span>
                      <p className="text-gray-600">{selectedContent.reviewedAt}</p>
                    </div>
                  )}
                </div>

                {selectedContent.reviewComments && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Admin Comments:</span>
                    <div className="mt-2 p-3 bg-gray-50 rounded border-l-4 border-blue-400">
                      <p className="text-sm text-gray-800">{selectedContent.reviewComments}</p>
                    </div>
                  </div>
                )}

                {selectedContent.approvalStatus === 'approved' && (
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-sm text-green-800">
                      ✅ This content has been approved and is now available to students.
                      Total downloads: {selectedContent.downloadCount}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 mt-6">
                {(selectedContent.approvalStatus === 'rejected' || selectedContent.approvalStatus === 'needs_revision') && (
                  <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
                    Resubmit Content
                  </button>
                )}
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
