'use client'
import { useState, useEffect } from 'react'
import { Plus, Upload, BookOpen, FileText, Trash2, Eye, Download, Filter, Search, ChevronDown, AlertCircle, CheckCircle, Clock, XCircle, Loader, ArrowRight } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

interface Course {
  id: string
  courseCode: string
  courseName: string
  semester: number
  session: string
  programme: {
    programmeName: string
    programmeCode: string
    section: string | null
  }
  allocation: {
    role: 'COORDINATOR' | 'CONTRIBUTOR'
  }
}

interface ContentItem {
  id: string
  title: string
  fileName: string
  contentType: string
  lectureNumber?: number | null
  description?: string | null
  fileSize?: number | null
  approvalStatus: 'PENDING' | 'APPROVED' | 'CHANGES_REQUIRED' | 'REJECTED'
  coordinatorNotes?: string | null
  uploadDate: string
  courseId: string
  course: {
    courseCode: string
    courseName: string
  }
}

export default function FacultyDashboard() {
  const [courses, setCourses] = useState<Course[]>([])
  const [contents, setContents] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(false)

  const [stats, setStats] = useState({
    totalCourses: 0,
    coordinatingCourses: 0,
    totalContent: 0,
    approvedContent: 0,
    pendingContent: 0,
    changesRequiredContent: 0
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [coursesRes, contentsRes] = await Promise.all([
        fetch('/api/faculty/courses'),
        fetch('/api/faculty/content')
      ])

      const coursesData = await coursesRes.json()
      const contentsData = await contentsRes.json()

      if (coursesData.success && Array.isArray(coursesData.courses)) {
        setCourses(coursesData.courses)
        const coordinating = coursesData.courses.filter((c: Course) => c.allocation.role === 'COORDINATOR').length
        setStats(prev => ({
          ...prev,
          totalCourses: coursesData.courses.length,
          coordinatingCourses: coordinating
        }))
      }

      if (contentsData.success && Array.isArray(contentsData.content)) {
        setContents(contentsData.content)
        const approved = contentsData.content.filter((c: ContentItem) => c.approvalStatus === 'APPROVED').length
        const pending = contentsData.content.filter((c: ContentItem) => c.approvalStatus === 'PENDING').length
        const changesRequired = contentsData.content.filter((c: ContentItem) => c.approvalStatus === 'CHANGES_REQUIRED').length
        setStats(prev => ({
          ...prev,
          totalContent: contentsData.content.length,
          approvedContent: approved,
          pendingContent: pending,
          changesRequiredContent: changesRequired
        }))
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Error loading data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <Toaster position="top-right" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white p-5 rounded-lg shadow border border-gray-200 hover:shadow-md transition">
          <p className="text-gray-600 text-xs font-medium uppercase">Total Courses</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">{stats.totalCourses}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow border border-gray-200 hover:shadow-md transition">
          <p className="text-gray-600 text-xs font-medium uppercase">Coordinating</p>
          <p className="text-2xl font-bold text-purple-600 mt-2">{stats.coordinatingCourses}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow border border-gray-200 hover:shadow-md transition">
          <p className="text-gray-600 text-xs font-medium uppercase">Total Content</p>
          <p className="text-2xl font-bold text-indigo-600 mt-2">{stats.totalContent}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow border border-gray-200 hover:shadow-md transition">
          <p className="text-gray-600 text-xs font-medium uppercase">Approved</p>
          <p className="text-2xl font-bold text-green-600 mt-2">{stats.approvedContent}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow border border-gray-200 hover:shadow-md transition">
          <p className="text-gray-600 text-xs font-medium uppercase">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 mt-2">{stats.pendingContent}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow border border-gray-200 hover:shadow-md transition">
          <p className="text-gray-600 text-xs font-medium uppercase">Changes Req.</p>
          <p className="text-2xl font-bold text-orange-600 mt-2">{stats.changesRequiredContent}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <a
            href="/faculty/upload"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium transition-colors shadow-sm"
          >
            <Upload className="h-5 w-5" />
            Upload Content
          </a>
          <a
            href="/faculty/courses"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 font-medium transition-colors shadow-sm"
          >
            <BookOpen className="h-5 w-5" />
            View Courses
          </a>
          <a
            href="/faculty/submissions"
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 font-medium transition-colors shadow-sm"
          >
            <FileText className="h-5 w-5" />
            My Submissions
          </a>
        </div>
      </div>

      {/* Recent Uploads */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Uploads</h3>
          {contents.length > 0 && (
            <a href="/faculty/submissions" className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium">
              View All <ArrowRight className="h-4 w-4" />
            </a>
          )}
        </div>

        {contents.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No content uploaded yet. Start by uploading your first material!</p>
        ) : (
          <div className="space-y-3">
            {contents.slice(0, 5).map(content => (
              <div key={content.id} className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-medium text-gray-900">{content.title}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        content.approvalStatus === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        content.approvalStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        content.approvalStatus === 'CHANGES_REQUIRED' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {content.approvalStatus === 'CHANGES_REQUIRED' ? 'Changes Required' : content.approvalStatus}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{content.course.courseCode} • {content.contentType}</p>
                    <p className="text-xs text-gray-500 mt-1">Uploaded: {new Date(content.uploadDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-3">📋 Guidelines</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>✓ Use clear, descriptive titles</li>
            <li>✓ Maximum file size: 50 MB</li>
            <li>✓ Supported: PDF, DOC, PPT, XLS, ZIP</li>
            <li>✓ Add descriptions for students</li>
          </ul>
        </div>
        <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-3">✅ Approval Process</h3>
          <ul className="text-sm text-green-800 space-y-2">
            <li>📤 Upload → Pending review</li>
            <li>👀 Coordinator reviews</li>
            <li>✓ Approved → Visible to students</li>
            <li>⚠️ Changes Required → Edit & resubmit</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
