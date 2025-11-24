'use client'

import { useState, useEffect } from 'react'
import { Upload, AlertCircle, CheckCircle, Loader, BookOpen } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { uploadToSupabase } from '@/lib/supabase-storage'

interface Course {
  id: string
  courseCode: string
  courseName: string
}

export default function UploadPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    courseId: '',
    contentType: 'LECTURE_PPT',
    title: '',
    lectureNumber: '',
    assignmentNumber: '',
    description: '',
    file: null as File | null,
  })

  // Load courses for logged-in faculty
  useEffect(() => {
    const email = localStorage.getItem('facultyEmail')
    if (!email) {
      router.push('/faculty/login')
      return
    }
    loadCourses(email)
  }, [router])

  const loadCourses = async (email: string) => {
    try {
      setLoading(true)
      const res = await fetch(
        `/api/faculty/courses?email=${encodeURIComponent(email)}`
      )

      // Protect against empty/failed responses
      if (!res.ok) {
        toast.error('Error loading courses')
        return
      }

      const data = await res.json()

      if (data.success && Array.isArray(data.courses)) {
        setCourses(
          data.courses.map((c: any) => ({
            id: c.id,
            courseCode: c.courseCode,
            courseName: c.courseName,
          }))
        )
      } else {
        toast.error(data.error || 'Error loading courses')
      }
    } catch (error) {
      console.error('Error loading courses:', error)
      toast.error('Error loading courses')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50 MB')
        return
      }
      setFormData(prev => ({ ...prev, file }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.courseId || !formData.title || !formData.file) {
      toast.error('Please fill all required fields')
      return
    }

    // Validate lecture number for Lecture PPTs
    if (formData.contentType === 'LECTURE_PPT' && !formData.lectureNumber) {
      toast.error('Please enter lecture number')
      return
    }

    // Validate assignment number for Assignments
    if (formData.contentType === 'ASSIGNMENT' && !formData.assignmentNumber) {
      toast.error('Please enter assignment number')
      return
    }

    const facultyEmail = localStorage.getItem('facultyEmail')
    if (!facultyEmail) {
      toast.error('Session expired. Please log in again.')
      router.push('/faculty/login')
      return
    }

    setSubmitting(true)
    const toastId = toast.loading('Uploading file...')

    try {
      // 1️⃣ Upload file to Supabase Storage
      const uploadResult = await uploadToSupabase(
        formData.file as File,
        'teaching-content' // bucket name – adjust if yours is different
      )

      // 2️⃣ Build title/description with assignment info (optional)
      let finalTitle = formData.title.trim()
      let finalDescription = formData.description.trim()

      if (formData.contentType === 'ASSIGNMENT' && formData.assignmentNumber) {
        finalTitle = `Assignment ${formData.assignmentNumber} - ${finalTitle}`
        if (!finalDescription) {
          finalDescription = `Assignment ${formData.assignmentNumber}`
        }
      }

      // 3️⃣ Create DB record via JSON API
      const res = await fetch('/api/faculty/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: finalTitle,
          contentType: formData.contentType,
          fileName: uploadResult.fileName,
          filePath: uploadResult.path, // or uploadResult.url depending on your helper
          fileSize: uploadResult.fileSize,
          mimeType: uploadResult.mimeType,
          courseId: formData.courseId,
          facultyEmail, // ✅ backend will resolve to correct facultyId
          description: finalDescription || null,
          lectureNumber:
            formData.contentType === 'LECTURE_PPT' &&
            formData.lectureNumber.trim()
              ? Number(formData.lectureNumber)
              : null,
        }),
      })

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody.error || 'Upload failed')
      }

      const data = await res.json()

      if (data.success) {
        toast.success('Content uploaded successfully!', { id: toastId })
        // Reset form
        setFormData({
          courseId: '',
          contentType: 'LECTURE_PPT',
          title: '',
          lectureNumber: '',
          assignmentNumber: '',
          description: '',
          file: null,
        })
        const fileInput = document.getElementById(
          'file-upload'
        ) as HTMLInputElement | null
        if (fileInput) fileInput.value = ''
      } else {
        toast.error(data.error || 'Error uploading content', { id: toastId })
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Error uploading content', { id: toastId })
    } finally {
      setSubmitting(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Upload Teaching Material
        </h1>
        <p className="text-gray-600">
          Upload course content for coordinator approval
        </p>
      </div>

      <div className="bg-white p-8 rounded-lg shadow border border-gray-200 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Course *
            </label>
            <select
              value={formData.courseId}
              onChange={e =>
                setFormData(prev => ({ ...prev, courseId: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              required
            >
              <option value="">Choose a course...</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.courseCode} - {course.courseName}
                </option>
              ))}
            </select>
            {courses.length === 0 && (
              <p className="text-sm text-red-600 mt-2">
                You have no courses assigned
              </p>
            )}
          </div>

          {/* Content Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Content Type *
            </label>
            <select
              value={formData.contentType}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  contentType: e.target.value,
                  lectureNumber: '',
                  assignmentNumber: '',
                }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
              <option value="COURSE_HANDOUT">📘 Course Handout (CHO)</option>
              <option value="LECTURE_PPT">📊 Lecture PPT</option>
              <option value="ASSIGNMENT">📝 Assignment</option>
              <option value="QUESTION_BANK">❓ Question Bank</option>
              <option value="QUESTION_PAPER">📄 Question Paper</option>
              <option value="LAB_MANUAL">🔬 Lab Manual</option>
              <option value="REFERENCE_MATERIAL">📚 Reference Material</option>
            </select>
          </div>

          {/* Lecture Number - Only for Lecture PPTs */}
          {formData.contentType === 'LECTURE_PPT' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Lecture Number *
              </label>
              <input
                type="number"
                value={formData.lectureNumber}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    lectureNumber: e.target.value,
                  }))
                }
                placeholder="e.g., 1, 2, 3..."
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the lecture number for organization
              </p>
            </div>
          )}

          {/* Assignment Number - Only for Assignments */}
          {formData.contentType === 'ASSIGNMENT' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Assignment Number *
              </label>
              <input
                type="number"
                value={formData.assignmentNumber}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    assignmentNumber: e.target.value,
                  }))
                }
                placeholder="e.g., 1, 2, 3..."
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the assignment number
              </p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={e =>
                setFormData(prev => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter a descriptive title"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Examples: &quot;Introduction to Arrays&quot;, &quot;Assignment 1:
              Sorting Algorithms&quot;
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={e =>
                setFormData(prev => ({ ...prev, description: e.target.value }))
              }
              placeholder="Add any additional notes or instructions..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Add details to help students understand the content
            </p>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Upload File *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip"
                required
              />
              <label htmlFor="file-upload" className="cursor-pointer block">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 font-medium">
                  <span className="text-blue-600 hover:text-blue-700">
                    Click to upload
                  </span>{' '}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, ZIP (Max 50 MB)
                </p>
                {formData.file && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-300 rounded-lg">
                    <p className="text-sm text-green-700 font-medium">
                      ✓ {formData.file.name}
                    </p>
                    <p className="text-xs text-green-600">
                      {formatFileSize(formData.file.size)}
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={submitting || courses.length === 0}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              {submitting ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  Upload Content
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  courseId: '',
                  contentType: 'LECTURE_PPT',
                  title: '',
                  lectureNumber: '',
                  assignmentNumber: '',
                  description: '',
                  file: null,
                })
                const fileInput = document.getElementById(
                  'file-upload'
                ) as HTMLInputElement | null
                if (fileInput) fileInput.value = ''
              }}
              disabled={submitting}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold transition-colors disabled:cursor-not-allowed"
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* Guidelines Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 max-w-2xl">
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Upload Guidelines
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Maximum file size: 50 MB</li>
            <li>• Supported formats: PDF, DOC, PPT, XLS, ZIP</li>
            <li>• Use clear, descriptive titles</li>
            <li>• For lectures, include lecture number</li>
            <li>• For assignments, include assignment number</li>
          </ul>
        </div>

        <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Approval Process
          </h3>
          <ul className="text-sm text-green-800 space-y-2">
            <li>📤 Upload → Status: Pending</li>
            <li>👀 Course coordinator reviews</li>
            <li>✅ Approved → Visible to students</li>
            <li>⚠️ Changes Required → Edit &amp; resubmit</li>
            <li>❌ Rejected → Revise and upload again</li>
          </ul>
        </div>
      </div>

      {/* Content Type Reference */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mt-8 max-w-2xl">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Content Type Reference
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">📘</span>
            <div>
              <p className="font-medium text-gray-900">Course Handout (CHO)</p>
              <p className="text-sm text-gray-600">
                Comprehensive course overview and syllabus
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">📊</span>
            <div>
              <p className="font-medium text-gray-900">Lecture PPT</p>
              <p className="text-sm text-gray-600">
                Presentation slides for lectures (requires lecture number)
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">📝</span>
            <div>
              <p className="font-medium text-gray-900">Assignment</p>
              <p className="text-sm text-gray-600">
                Student assignments and homework (requires assignment number)
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">❓</span>
            <div>
              <p className="font-medium text-gray-900">Question Bank</p>
              <p className="text-sm text-gray-600">
                Collection of practice questions
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">📄</span>
            <div>
              <p className="font-medium text-gray-900">Question Paper</p>
              <p className="text-sm text-gray-600">
                Previous year or sample question papers
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">🔬</span>
            <div>
              <p className="font-medium text-gray-900">Lab Manual</p>
              <p className="text-sm text-gray-600">
                Laboratory experiment procedures and guidelines
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">📚</span>
            <div>
              <p className="font-medium text-gray-900">Reference Material</p>
              <p className="text-sm text-gray-600">
                Additional reading materials and resources
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
