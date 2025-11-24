'use client'

import { useState, useEffect } from 'react'
import {
  FileText,
  Search,
  Loader,
  AlertCircle,
  Trash2,
  Eye,
  Download,
  XCircle,
  CheckCircle,
  Clock,
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface ContentItem {
  id: string
  title: string
  fileName: string
  contentType: string
  lectureNumber?: number | null
  description?: string | null
  fileSize?: number | null
  filePath: string
  approvalStatus: 'PENDING' | 'APPROVED' | 'CHANGES_REQUIRED' | 'REJECTED'
  coordinatorNotes?: string | null
  uploadDate: string
  courseId: string
  course: {
    courseCode: string
    courseName: string
  }
}

interface CHO {
  id: string
  courseCode: string
  courseTitle: string
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  updatedAt: string
}

// 👇 Helper to build Supabase public file URL from stored path
const buildFileUrl = (filePath: string) => {
  if (!filePath) return ''

  // If it's already a full URL, just return it
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath
  }

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!baseUrl) {
    // Fallback: let it behave as before (will 404 but at least not crash)
    console.warn('NEXT_PUBLIC_SUPABASE_URL is not set')
    return filePath
  }

  // Adjust bucket name if different
  const bucket = 'teaching-content'
  // Avoid duplicating bucket in path
  const finalPath = filePath.startsWith(`${bucket}/`)
    ? filePath
    : `${bucket}/${filePath}`

  return `${baseUrl}/storage/v1/object/public/${finalPath}`
}

export default function SubmissionsPage() {
  const router = useRouter()
  const [contents, setContents] = useState<ContentItem[]>([])
  const [chos, setCHOs] = useState<CHO[]>([])
  const [filteredContents, setFilteredContents] = useState<ContentItem[]>([])
  const [filteredCHOs, setFilteredCHOs] = useState<CHO[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [email, setEmail] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'content' | 'cho'>('content')

  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const storedEmail = localStorage.getItem('facultyEmail')
    if (!storedEmail) {
      router.push('/faculty/login')
      return
    }

    setEmail(storedEmail)
    loadData(storedEmail)
  }, [router])

  useEffect(() => {
    applyFilters()
  }, [contents, chos, filterStatus, searchTerm, activeTab])

  const loadData = async (facultyEmail: string) => {
    try {
      setLoading(true)

      const [contentRes, choRes] = await Promise.all([
        fetch(`/api/faculty/content?email=${encodeURIComponent(facultyEmail)}`),
        fetch(
          `/api/faculty/course-handout/list?email=${encodeURIComponent(
            facultyEmail
          )}`
        ),
      ])

      const contentData = await contentRes.json()
      const choData = await choRes.json()

      if (contentData.success && Array.isArray(contentData.content)) {
        setContents(contentData.content)
      } else if (!contentData.success) {
        toast.error(contentData.error || 'Error loading teaching content')
      }

      if (choData.success && Array.isArray(choData.chos)) {
        setCHOs(choData.chos)
      } else if (!choData.success) {
        toast.error(choData.error || 'Error loading course handouts')
      }
    } catch (error) {
      console.error('Fetch Error:', error)
      toast.error('Error loading data')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    if (activeTab === 'content') {
      let result = contents

      if (filterStatus !== 'all') {
        result = result.filter(c => c.approvalStatus === filterStatus)
      }

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase()
        result = result.filter(
          c =>
            c.title.toLowerCase().includes(q) ||
            c.course.courseCode.toLowerCase().includes(q)
        )
      }

      setFilteredContents(result)
    } else {
      let result = chos

      if (filterStatus !== 'all') {
        result = result.filter(c => c.status === filterStatus)
      }

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase()
        result = result.filter(
          c =>
            c.courseTitle.toLowerCase().includes(q) ||
            c.courseCode.toLowerCase().includes(q)
        )
      }

      setFilteredCHOs(result)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this content? This cannot be undone.')) return

    const storedEmail = localStorage.getItem('facultyEmail')
    if (!storedEmail) return

    setDeleting(id)
    try {
      const res = await fetch(
        `/api/faculty/content/${id}?email=${encodeURIComponent(storedEmail)}`,
        {
          method: 'DELETE',
        }
      )
      const data = await res.json()

      if (data.success) {
        toast.success('Deleted!')
        setContents(contents.filter(c => c.id !== id))
      } else {
        toast.error(data.error || 'Error deleting')
      }
    } catch (error) {
      toast.error('Error')
    } finally {
      setDeleting(null)
    }
  }

  const handleViewFile = (filePath: string) => {
    const url = buildFileUrl(filePath)
    if (!url) {
      toast.error('File URL not available')
      return
    }
    window.open(url, '_blank')
  }

  const formatFileSize = (bytes?: number | null): string => {
    if (!bytes) return 'Unknown'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const formatContentType = (type: string): string => {
    const typeMap: { [key: string]: string } = {
      COURSE_HANDOUT: 'Course Handout',
      LECTURE_PPT: 'Lecture PPT',
      ASSIGNMENT: 'Assignment',
      QUESTION_BANK: 'Question Bank',
      QUESTION_PAPER: 'Question Paper',
      LAB_MANUAL: 'Lab Manual',
      REFERENCE_MATERIAL: 'Reference Material',
    }
    return typeMap[type] || type
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-50 border-green-200'
      case 'PENDING':
      case 'SUBMITTED':
        return 'bg-yellow-50 border-yellow-200'
      case 'CHANGES_REQUIRED':
        return 'bg-orange-50 border-orange-200'
      case 'DRAFT':
        return 'bg-gray-50 border-gray-200'
      default:
        return 'bg-red-50 border-red-200'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle className="h-3 w-3" /> Approved
          </span>
        )
      case 'PENDING':
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            <Clock className="h-3 w-3" /> Pending
          </span>
        )
      case 'CHANGES_REQUIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
            <AlertCircle className="h-3 w-3" /> Changes Required
          </span>
        )
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            <Clock className="h-3 w-3" /> Draft
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <XCircle className="h-3 w-3" /> Rejected
          </span>
        )
    }
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'COURSE_HANDOUT':
        return '📘'
      case 'LECTURE_PPT':
        return '📊'
      case 'ASSIGNMENT':
        return '📝'
      case 'QUESTION_BANK':
        return '❓'
      case 'QUESTION_PAPER':
        return '📄'
      case 'LAB_MANUAL':
        return '🔬'
      case 'REFERENCE_MATERIAL':
        return '📚'
      default:
        return '📄'
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading submissions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Toaster position="top-right" />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Submissions</h1>
          {email && (
            <p className="text-sm text-gray-600 mt-1">Logged in as: {email}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const storedEmail = localStorage.getItem('facultyEmail')
              if (storedEmail) loadData(storedEmail)
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors flex items-center gap-2"
          >
            <Loader className="h-4 w-4" />
            Refresh
          </button>
          <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
            {activeTab === 'content'
              ? filteredContents.length
              : filteredCHOs.length}{' '}
            items
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('content')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'content'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📚 Teaching Content ({contents.length})
        </button>
        <button
          onClick={() => setActiveTab('cho')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'cho'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📘 Course Handouts ({chos.length})
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-6 flex gap-4 flex-wrap">
        <div className="flex-1 min-w-64">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          >
            <option value="all">All Status</option>
            {activeTab === 'content' ? (
              <>
                <option value="APPROVED">✅ Approved</option>
                <option value="PENDING">⏳ Pending</option>
                <option value="CHANGES_REQUIRED">⚠️ Changes Required</option>
                <option value="REJECTED">❌ Rejected</option>
              </>
            ) : (
              <>
                <option value="APPROVED">✅ Approved</option>
                <option value="SUBMITTED">📤 Submitted</option>
                <option value="DRAFT">📝 Draft</option>
                <option value="REJECTED">❌ Rejected</option>
              </>
            )}
          </select>
        </div>

        <div className="flex-1 min-w-64">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={`Search by ${
                activeTab === 'content'
                  ? 'title or course code'
                  : 'course name or code'
              }...`}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>
        </div>
      </div>

      {/* Content List */}
      {activeTab === 'content' ? (
        filteredContents.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow text-center border border-gray-200">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">
              No teaching content found
            </p>
            <p className="text-gray-500 text-sm mt-2">
              {contents.length === 0
                ? "You haven't uploaded any content yet. Go to Upload Content to get started."
                : 'No content matches your filters'}
            </p>
            {contents.length === 0 && (
              <button
                onClick={() => router.push('/faculty/upload')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Upload Content
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredContents.map(content => {
              const publicUrl = buildFileUrl(content.filePath)
              return (
                <div
                  key={content.id}
                  className={`p-5 rounded-lg border ${getStatusColor(
                    content.approvalStatus
                  )} hover:shadow-md transition`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-2xl">
                          {getContentIcon(content.contentType)}
                        </span>
                        <h4 className="font-semibold text-gray-900">
                          {content.title}
                        </h4>
                        {getStatusBadge(content.approvalStatus)}
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs font-medium">
                          {formatContentType(content.contentType)}
                        </span>
                        {content.lectureNumber && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            #{content.lectureNumber}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-600 mb-2 flex-wrap">
                        <span className="font-medium text-blue-600">
                          {content.course.courseCode}
                        </span>
                        <span>•</span>
                        <span>{content.fileName}</span>
                        <span>•</span>
                        <span>{formatFileSize(content.fileSize)}</span>
                        <span>•</span>
                        <span>
                          {new Date(content.uploadDate).toLocaleDateString()}
                        </span>
                      </div>

                      {content.description && (
                        <p className="text-sm text-gray-700 mb-2">
                          {content.description}
                        </p>
                      )}

                      {content.coordinatorNotes && (
                        <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs text-yellow-800">
                          <p className="font-semibold mb-1">
                            📝 Coordinator Feedback:
                          </p>
                          <p>{content.coordinatorNotes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleViewFile(content.filePath)}
                        className="p-2 text-indigo-600 hover:bg-indigo-100 rounded transition-colors"
                        title="View File"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <a
                        href={publicUrl || '#'}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                        title="Download"
                      >
                        <Download className="h-5 w-5" />
                      </a>
                      {content.approvalStatus !== 'APPROVED' && (
                        <button
                          onClick={() => handleDelete(content.id)}
                          disabled={deleting === content.id}
                          className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deleting === content.id ? (
                            <Loader className="h-5 w-5 animate-spin" />
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : // CHO List
      filteredCHOs.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center border border-gray-200">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No course handouts found</p>
          <p className="text-gray-500 text-sm mt-2">
            {chos.length === 0
              ? "You haven't created any course handouts yet."
              : 'No CHO matches your filters'}
          </p>
          {chos.length === 0 && (
            <button
              onClick={() => router.push('/faculty/course-handout')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Course Handout
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCHOs.map(cho => (
            <div
              key={cho.id}
              className={`p-5 rounded-lg border ${getStatusColor(
                cho.status
              )} hover:shadow-md transition`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-2xl">📘</span>
                    <h4 className="font-semibold text-gray-900">
                      {cho.courseTitle}
                    </h4>
                    {getStatusBadge(cho.status)}
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {cho.courseCode}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span>
                      Last updated:{' '}
                      {new Date(cho.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => router.push('/faculty/course-handout')}
                    className="px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors font-medium"
                  >
                    {cho.status === 'DRAFT' ? 'Continue Editing' : 'View'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
