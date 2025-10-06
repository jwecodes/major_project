'use client'
import { Sidebar } from '@/components/sidebar'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

interface CourseDocument {
  id: number
  courseId: number
  title: string
  description?: string
  fileName: string
  filePath: string
  fileType: 'syllabus' | 'assignment' | 'notes' | 'exam' | 'other'
  uploadedBy: number
  createdAt: string
  updatedAt: string
  version: number
  isActive: boolean
  course: {
    code: string
    name: string
    programmeName: string
    semester: number
  }
  uploader: {
    name: string
    email: string
  }
}

interface Course {
  id: number
  code: string
  name: string
  programmeName: string
  semester: number
  session: string
}

export default function DocumentManagementPage() {
  const [documents, setDocuments] = useState<CourseDocument[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<CourseDocument | null>(null)
  
  // Filters
  const [selectedCourse, setSelectedCourse] = useState('')
  const [selectedFileType, setSelectedFileType] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Upload state
  const [uploadData, setUploadData] = useState({
    courseId: '',
    title: '',
    description: '',
    fileType: 'other' as const,
    file: null as File | null
  })

  const fileTypes = [
    { value: 'syllabus', label: 'Syllabus', icon: '📋', color: 'bg-blue-100 text-blue-800' },
    { value: 'assignment', label: 'Assignment', icon: '📝', color: 'bg-green-100 text-green-800' },
    { value: 'notes', label: 'Lecture Notes', icon: '📖', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'exam', label: 'Exam Paper', icon: '📊', color: 'bg-red-100 text-red-800' },
    { value: 'other', label: 'Other', icon: '📄', color: 'bg-gray-100 text-gray-800' }
  ]

  useEffect(() => {
    fetchDocuments()
    fetchCourses()
  }, [])

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const data = await api.documents.getAll({
        courseId: selectedCourse,
        fileType: selectedFileType,
        search: searchTerm
      })
      setDocuments(data)
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCourses = async () => {
    try {
      const data = await api.courses.getAllBasic()
      setCourses(data)
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [selectedCourse, selectedFileType, searchTerm])

  const handleFileUpload = async () => {
    if (!uploadData.file || !uploadData.title || !uploadData.courseId) {
      alert('Please fill in all required fields and select a file')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', uploadData.file)
      formData.append('courseId', uploadData.courseId)
      formData.append('title', uploadData.title)
      formData.append('description', uploadData.description)
      formData.append('fileType', uploadData.fileType)
      formData.append('uploadedBy', '1') // Mock faculty ID

      await api.documents.upload(formData)
      
      // Reset form
      setUploadData({
        courseId: '',
        title: '',
        description: '',
        fileType: 'other',
        file: null
      })
      setShowUploadModal(false)
      fetchDocuments()
      
      alert('Document uploaded successfully!')
    } catch (error: any) {
      console.error('Upload error:', error)
      alert(error.message || 'Failed to upload document')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (documentId: number) => {
    try {
      await api.documents.download(documentId)
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download document')
    }
  }

  const handleDelete = async (documentId: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      await api.documents.delete(documentId)
      fetchDocuments()
      alert('Document deleted successfully!')
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete document')
    }
  }

  const getFileTypeDetails = (fileType: string) => {
    return fileTypes.find(ft => ft.value === fileType) || fileTypes[fileTypes.length - 1]
  }

  const getFileSizeString = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchTerm || 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.course.code.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  return (
    <div className="flex">
      <Sidebar role="admin" />
      
      <div className="flex-1 p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Management</h1>
            <p className="text-gray-600">Manage course documents, assignments, and materials</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <span>📁</span>
              <span>Upload Document</span>
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Documents</h3>
            <div className="flex items-center">
              <span className="text-3xl font-bold text-blue-600">{documents.length}</span>
            </div>
          </div>
          
          {fileTypes.slice(0, 3).map(type => {
            const count = documents.filter(d => d.fileType === type.value).length
            return (
              <div key={type.value} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-sm font-medium text-gray-600 mb-2">{type.label}s</h3>
                <div className="flex items-center">
                  <span className={`text-3xl font-bold ${type.color.split(' ')[1]}`}>{count}</span>
                  <span className="text-lg ml-2">{type.icon}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold mb-4">Filter Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Courses</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
              <select
                value={selectedFileType}
                onChange={(e) => setSelectedFileType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {fileTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search documents..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedCourse('')
                  setSelectedFileType('')
                  setSearchTerm('')
                }}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Documents Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Documents Library</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading documents...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded By</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Version</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Upload Date</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDocuments.map((document) => {
                    const fileTypeInfo = getFileTypeDetails(document.fileType)
                    
                    return (
                      <tr key={document.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className={`h-10 w-10 rounded-lg ${fileTypeInfo.color} flex items-center justify-center text-lg`}>
                                {fileTypeInfo.icon}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{document.title}</div>
                              <div className="text-sm text-gray-500">{document.fileName}</div>
                              {document.description && (
                                <div className="text-xs text-gray-400 mt-1">{document.description}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{document.course.code}</div>
                          <div className="text-sm text-gray-500">{document.course.name}</div>
                          <div className="text-xs text-gray-400">
                            {document.course.programmeName} • Sem {document.course.semester}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${fileTypeInfo.color}`}>
                            {fileTypeInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{document.uploader.name}</div>
                          <div className="text-sm text-gray-500">{document.uploader.email}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                            v{document.version}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-500">
                          {new Date(document.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleDownload(document.id)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Download
                            </button>
                            <button
                              onClick={() => setSelectedDocument(document)}
                              className="text-green-600 hover:text-green-800 text-sm"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDelete(document.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {filteredDocuments.length === 0 && !loading && (
                <div className="p-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <div className="text-6xl mb-4">📁</div>
                    <h3 className="text-xl font-semibold text-gray-600">No Documents Found</h3>
                    <p className="text-gray-500 mt-2">No documents match your current filters</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Upload Document</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course *
                  </label>
                  <select
                    value={uploadData.courseId}
                    onChange={(e) => setUploadData(prev => ({ ...prev, courseId: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Course...</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.code} - {course.name} ({course.programmeName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    value={uploadData.title}
                    onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter document title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={uploadData.description}
                    onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Brief description of the document..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Type *
                  </label>
                  <select
                    value={uploadData.fileType}
                    onChange={(e) => setUploadData(prev => ({ ...prev, fileType: e.target.value as any }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    {fileTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File *
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setUploadData(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.png"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: PDF, DOC, DOCX, PPT, PPTX, TXT, JPG, PNG (Max: 10MB)
                  </p>
                </div>

                {uploadData.file && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-blue-600 text-lg">📎</div>
                      <div>
                        <div className="text-sm font-medium text-blue-900">{uploadData.file.name}</div>
                        <div className="text-xs text-blue-600">
                          {getFileSizeString(uploadData.file.size)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleFileUpload}
                  disabled={!uploadData.file || !uploadData.title || !uploadData.courseId || loading}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? 'Uploading...' : '📁 Upload Document'}
                </button>
                <button
                  onClick={() => setShowUploadModal(false)}
                  disabled={loading}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Document Detail Modal */}
        {selectedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Document Details</h2>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className={`h-12 w-12 rounded-lg ${getFileTypeDetails(selectedDocument.fileType).color} flex items-center justify-center text-2xl`}>
                    {getFileTypeDetails(selectedDocument.fileType).icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedDocument.title}</h3>
                    <p className="text-gray-600">{selectedDocument.fileName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Course</label>
                    <p className="text-gray-900">{selectedDocument.course.code} - {selectedDocument.course.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Type</label>
                    <p className="text-gray-900">{getFileTypeDetails(selectedDocument.fileType).label}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Version</label>
                    <p className="text-gray-900">v{selectedDocument.version}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Upload Date</label>
                    <p className="text-gray-900">{new Date(selectedDocument.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {selectedDocument.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Description</label>
                    <p className="text-gray-900">{selectedDocument.description}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-600">Uploaded By</label>
                  <p className="text-gray-900">{selectedDocument.uploader.name} ({selectedDocument.uploader.email})</p>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => handleDownload(selectedDocument.id)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  📥 Download
                </button>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200"
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
