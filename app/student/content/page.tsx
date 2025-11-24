'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader, FileText, Search, Eye, Download } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'

interface ContentItem {
  id: string
  title: string
  contentType: string
  description?: string | null
  lectureNumber?: number | null
  fileName: string
  filePath: string
  fileSize?: number | null
  approvalStatus: 'APPROVED'
  uploadDate: string
  courseId: string
  course: {
    id: string
    courseCode: string
    courseName: string
    semester: number
  }
  facultyName: string
}

const buildFileUrl = (filePath: string) => {
  if (!filePath) return ''
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath
  }
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!baseUrl) {
    console.warn('NEXT_PUBLIC_SUPABASE_URL not set')
    return filePath
  }
  const bucket = 'teaching-content'
  const finalPath = filePath.startsWith(`${bucket}/`)
    ? filePath
    : `${bucket}/${filePath}`

  return `${baseUrl}/storage/v1/object/public/${finalPath}`
}

export default function StudentContentPage() {
  const router = useRouter()
  const [contents, setContents] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)

        // 1) Get student via Supabase session
        const meRes = await fetch('/api/student/me')
        if (meRes.status === 401) {
          router.push('/login?redirect=/student/content')
          return
        }
        const meData = await meRes.json()
        if (!meData.student?.email) {
          router.push('/login?redirect=/student/content')
          return
        }

        const email: string = meData.student.email
        if (typeof window !== 'undefined') {
          localStorage.setItem('studentEmail', email)
        }

        // 2) Fetch approved content for their enrolled courses
        const res = await fetch(
          `/api/student/content?email=${encodeURIComponent(email)}`
        )
        const data = await res.json()

        if (data.success && Array.isArray(data.content)) {
          setContents(data.content)
        } else if (!data.success) {
          toast.error(data.error || 'Error loading content')
        }
      } catch (error) {
        console.error('Error loading content:', error)
        toast.error('Error loading content')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [router])

  const formatFileSize = (bytes?: number | null): string => {
    if (!bytes) return ''
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

  const filtered = useMemo(() => {
    let result = contents

    if (selectedCourseId !== 'all') {
      result = result.filter(c => c.courseId === selectedCourseId)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        c =>
          c.title.toLowerCase().includes(q) ||
          c.course.courseCode.toLowerCase().includes(q) ||
          c.course.courseName.toLowerCase().includes(q)
      )
    }

    return result
  }, [contents, search, selectedCourseId])

  const courses = useMemo(() => {
    const map = new Map<string, { id: string; label: string }>()
    contents.forEach(c => {
      if (!map.has(c.courseId)) {
        map.set(c.courseId, {
          id: c.courseId,
          label: `${c.course.courseCode} - ${c.course.courseName}`,
        })
      }
    })
    return Array.from(map.values())
  }, [contents])

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <Toaster position="top-right" />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Course Content
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Only <span className="font-semibold">approved</span> materials are
            shown here.
          </p>
        </div>
        <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
          {filtered.length} item{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-6 flex flex-wrap gap-4">
        <div className="min-w-[220px] flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course
          </label>
          <select
            value={selectedCourseId}
            onChange={e => setSelectedCourseId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 bg-white"
          >
            <option value="all">All Courses</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[220px] flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title or course..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center border border-gray-200">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">
            No content available yet
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Once your faculty uploads and your coordinator approves materials,
            they will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => {
            const url = buildFileUrl(item.filePath)
            return (
              <div
                key={item.id}
                className="p-5 rounded-lg border bg-white hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-2xl">
                        {getContentIcon(item.contentType)}
                      </span>
                      <h4 className="font-semibold text-gray-900">
                        {item.title}
                      </h4>
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs font-medium">
                        {formatContentType(item.contentType)}
                      </span>
                      {item.lectureNumber && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          Lecture #{item.lectureNumber}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-600 mb-2 flex-wrap">
                      <span className="font-medium text-emerald-700">
                        {item.course.courseCode}
                      </span>
                      <span>•</span>
                      <span>{item.fileName}</span>
                      {item.fileSize && (
                        <>
                          <span>•</span>
                          <span>{formatFileSize(item.fileSize)}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>
                        {new Date(item.uploadDate).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>By {item.facultyName}</span>
                    </div>

                    {item.description && (
                      <p className="text-sm text-gray-700 mb-1">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        if (!url) {
                          toast.error('File URL not available')
                          return
                        }
                        window.open(url, '_blank')
                      }}
                      className="p-2 text-indigo-600 hover:bg-indigo-100 rounded transition-colors"
                      title="View File"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <a
                      href={url || '#'}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                      title="Download"
                    >
                      <Download className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
