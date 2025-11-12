// 'use client'
// import { useState, useEffect } from 'react'
// import { useRouter, useSearchParams } from 'next/navigation'
// import { Upload as UploadIcon, FileText, CheckCircle, AlertCircle, X } from 'lucide-react'
// import Sidebar from '@/components/faculty/Sidebar'
// import { supabase } from '@/lib/supabase'

// const CONTENT_TYPES = [
//   { value: 'LECTURE_PPT', label: 'Lecture PPT' },
//   { value: 'ASSIGNMENT', label: 'Assignment' },
//   { value: 'QUESTION_BANK', label: 'Question Bank' },
//   { value: 'LAB_MANUAL', label: 'Lab Manual' },
//   { value: 'COURSE_HANDBOOK', label: 'Course Handbook' },
//   { value: 'SYLLABUS', label: 'Syllabus' },
//   { value: 'NOTES', label: 'Notes' },
//   { value: 'REFERENCE_MATERIAL', label: 'Reference Material' }
// ]

// export default function UploadContentPage() {
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const preSelectedCourseId = searchParams.get('courseId')

//   const [faculty, setFaculty] = useState<any>(null)
//   const [courses, setCourses] = useState<any[]>([])
//   const [uploading, setUploading] = useState(false)
//   const [selectedFile, setSelectedFile] = useState<File | null>(null)
//   const [dragActive, setDragActive] = useState(false)
//   const [success, setSuccess] = useState(false)
//   const [error, setError] = useState('')
//   const [progress, setProgress] = useState(0)

//   const [formData, setFormData] = useState({
//     courseId: preSelectedCourseId || '',
//     contentType: '',
//     title: '',
//     description: '',
//     lectureNumber: ''
//   })

//   useEffect(() => {
//     const facultyData = localStorage.getItem('faculty')
//     const facultyId = localStorage.getItem('facultyId')
    
//     if (!facultyData || !facultyId) {
//       router.push('/faculty/login')
//       return
//     }
    
//     const parsedFaculty = JSON.parse(facultyData)
//     setFaculty(parsedFaculty)
//     loadCourses(facultyId)
//   }, [router])

//   const loadCourses = async (facultyId: string) => {
//     try {
//       console.log('Loading courses for:', facultyId)
//       const response = await fetch(`/api/faculty/my-courses`, {
//         headers: { 'x-faculty-id': facultyId }
//       })
//       const data = await response.json()
//       console.log('Courses response:', data)
      
//       if (data.success) {
//         setCourses(data.assignments || [])
//       }
//     } catch (error) {
//       console.error('Error loading courses:', error)
//     }
//   }

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (file) {
//       if (file.size > 50 * 1024 * 1024) {
//         setError('File size must be less than 50MB')
//         return
//       }
//       setSelectedFile(file)
//       setError('')
//     }
//   }

//   const handleDrag = (e: React.DragEvent) => {
//     e.preventDefault()
//     e.stopPropagation()
//     setDragActive(e.type === 'dragenter' || e.type === 'dragover')
//   }

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault()
//     e.stopPropagation()
//     setDragActive(false)

//     const file = e.dataTransfer.files?.[0]
//     if (file) {
//       if (file.size > 50 * 1024 * 1024) {
//         setError('File size must be less than 50MB')
//         return
//       }
//       setSelectedFile(file)
//       setError('')
//     }
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError('')

//     if (!selectedFile) {
//       setError('Please select a file to upload')
//       return
//     }

//     if (!formData.courseId || !formData.contentType || !formData.title) {
//       setError('Please fill all required fields')
//       return
//     }

//     setUploading(true)
//     setProgress(0)

//     try {
//       const facultyId = localStorage.getItem('facultyId')
//       if (!facultyId) {
//         setError('Session expired. Please login again.')
//         router.push('/faculty/login')
//         return
//       }

//       // Step 1: Upload to Supabase Storage
//       console.log('=== UPLOAD START ===')
//       console.log('Faculty ID:', facultyId)
//       console.log('Course ID:', formData.courseId)
      
//       setProgress(10)
//       const fileExt = selectedFile.name.split('.').pop()
//       const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
//       const filePath = `teaching-content/${formData.courseId}/${facultyId}/${fileName}`

//       console.log('Uploading file to Supabase:', filePath)
//       setProgress(20)

//       const { error: uploadError, data } = await supabase.storage
//         .from('teaching-content')
//         .upload(filePath, selectedFile, {
//           cacheControl: '3600',
//           upsert: false
//         })

//       if (uploadError) {
//         console.error('Supabase upload error:', uploadError)
//         setError('Failed to upload file to storage: ' + uploadError.message)
//         setUploading(false)
//         return
//       }

//       console.log('✓ File uploaded to Supabase')
//       setProgress(50)

//       // Step 2: Get public URL
//       const { data: publicUrl } = supabase.storage
//         .from('teaching-content')
//         .getPublicUrl(filePath)

//       console.log('✓ Public URL:', publicUrl.publicUrl)
//       setProgress(70)

//       // Step 3: Save metadata to database
//       const uploadFormData = new FormData()
//       uploadFormData.append('title', formData.title)
//       uploadFormData.append('courseId', formData.courseId)
//       uploadFormData.append('contentType', formData.contentType)
//       uploadFormData.append('description', formData.description)
//       uploadFormData.append('fileUrl', publicUrl.publicUrl)

//       console.log('Sending to API:')
//       console.log('  courseId:', formData.courseId)
//       console.log('  title:', formData.title)
//       console.log('  contentType:', formData.contentType)
      
//       setProgress(80)

//       const response = await fetch('/api/faculty/content/upload', {
//         method: 'POST',
//         headers: { 'x-faculty-id': facultyId },
//         body: uploadFormData
//       })

//       const result = await response.json()

//       console.log('API Response:', result)

//       if (!result.success) {
//         setError(result.error || 'Failed to save content')
//         setUploading(false)
//         return
//       }

//       console.log('✓ Content saved to database')
//       setProgress(100)
//       setSuccess(true)

//       setTimeout(() => {
//         router.push('/faculty/submissions')
//       }, 2000)
//     } catch (error: any) {
//       console.error('Upload error:', error)
//       setError(error.message || 'Upload failed')
//       setUploading(false)
//     }
//   }

//   const removeFile = () => {
//     setSelectedFile(null)
//   }

//   if (success) {
//     return (
//       <>
//         <Sidebar />
//         <div className="lg:ml-64 min-h-screen bg-gray-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-lg shadow p-12 text-center max-w-md border border-gray-200">
//             <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//               <CheckCircle className="h-8 w-8 text-green-600" />
//             </div>
//             <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Successful!</h2>
//             <p className="text-gray-600 mb-4">Your content has been uploaded to Supabase and saved to the database.</p>
//             <p className="text-sm text-gray-500">Awaiting coordinator approval...</p>
//           </div>
//         </div>
//       </>
//     )
//   }

//   return (
//     <>
//       <Sidebar />
      
//       <div className="lg:ml-64 min-h-screen bg-gray-50">
//         <main className="p-4 md:p-6">
//           <div className="mb-8">
//             <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Teaching Content</h1>
//             <p className="text-gray-600">Upload lecture materials, assignments, and other course content to Supabase</p>
//           </div>

//           <div className="max-w-3xl">
//             <div className="bg-white rounded-lg shadow border border-gray-200 p-8">
//               <form onSubmit={handleSubmit} className="space-y-6">
//                 {error && (
//                   <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
//                     <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
//                     <p className="text-sm text-red-800">{error}</p>
//                   </div>
//                 )}

//                 {/* Course Selection */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Select Course <span className="text-red-600">*</span>
//                   </label>
//                   <select
//                     value={formData.courseId}
//                     onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
//                     required
//                   >
//                     <option value="">Choose a course...</option>
//                     {courses.map((course) => (
//                       <option key={course.id} value={course.course.id}>
//                         {course.course.courseCode} - {course.course.courseName}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Content Type */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Content Type <span className="text-red-600">*</span>
//                   </label>
//                   <select
//                     value={formData.contentType}
//                     onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
//                     required
//                   >
//                     <option value="">Select content type...</option>
//                     {CONTENT_TYPES.map((type) => (
//                       <option key={type.value} value={type.value}>
//                         {type.label}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Title */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Title <span className="text-red-600">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.title}
//                     onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                     placeholder="e.g., Introduction to Data Structures"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
//                     required
//                   />
//                 </div>

//                 {/* Lecture Number (conditional) */}
//                 {formData.contentType === 'LECTURE_PPT' && (
//                   <div>
//                     <label className="block text-sm font-medium text-gray-900 mb-2">
//                       Lecture Number (Optional)
//                     </label>
//                     <input
//                       type="number"
//                       value={formData.lectureNumber}
//                       onChange={(e) => setFormData({ ...formData, lectureNumber: e.target.value })}
//                       placeholder="e.g., 1"
//                       min="1"
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
//                     />
//                   </div>
//                 )}

//                 {/* Description */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Description (Optional)
//                   </label>
//                   <textarea
//                     value={formData.description}
//                     onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                     placeholder="Add a brief description of this content..."
//                     rows={4}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
//                   />
//                 </div>

//                 {/* File Upload */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-900 mb-2">
//                     Upload File <span className="text-red-600">*</span>
//                   </label>
                  
//                   {!selectedFile ? (
//                     <label
//                       onDragEnter={handleDrag}
//                       onDragLeave={handleDrag}
//                       onDragOver={handleDrag}
//                       onDrop={handleDrop}
//                       className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
//                         dragActive
//                           ? 'border-blue-600 bg-blue-50'
//                           : 'border-gray-300 hover:bg-gray-50'
//                       }`}
//                     >
//                       <div className="flex flex-col items-center justify-center py-6">
//                         <UploadIcon className="h-12 w-12 text-gray-400 mb-4" />
//                         <p className="mb-2 text-sm text-gray-900 font-medium">
//                           <span className="font-semibold">Click to upload</span> or drag and drop
//                         </p>
//                         <p className="text-xs text-gray-600">PDF, PPTX, DOCX, ZIP (Max 50MB)</p>
//                       </div>
//                       <input
//                         type="file"
//                         onChange={handleFileChange}
//                         className="hidden"
//                         accept=".pdf,.pptx,.ppt,.docx,.doc,.zip,.xls,.xlsx"
//                       />
//                     </label>
//                   ) : (
//                     <div className="border-2 border-green-300 bg-green-50 rounded-lg p-4">
//                       <div className="flex items-start justify-between">
//                         <div className="flex items-center gap-3 flex-1">
//                           <CheckCircle className="h-10 w-10 text-green-600 flex-shrink-0" />
//                           <div className="flex-1 min-w-0">
//                             <p className="font-medium text-gray-900 truncate">{selectedFile.name}</p>
//                             <p className="text-sm text-gray-600">
//                               {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
//                             </p>
//                           </div>
//                         </div>
//                         <button
//                           type="button"
//                           onClick={removeFile}
//                           className="text-red-600 hover:text-red-800 ml-4 flex-shrink-0"
//                         >
//                           <X className="h-6 w-6" />
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* Progress Bar */}
//                 {uploading && (
//                   <div>
//                     <div className="flex justify-between mb-2">
//                       <span className="text-sm font-medium text-gray-700">Uploading to Supabase...</span>
//                       <span className="text-sm font-medium text-blue-600">{progress}%</span>
//                     </div>
//                     <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
//                       <div
//                         className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-300"
//                         style={{ width: `${progress}%` }}
//                       ></div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Info Alert */}
//                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
//                   <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
//                   <div className="text-sm text-blue-900">
//                     <p className="font-semibold mb-1">Upload Process:</p>
//                     <ul className="list-disc list-inside space-y-1">
//                       <li>File is uploaded securely to Supabase Storage</li>
//                       <li>Metadata is saved to your database</li>
//                       <li>Content awaits coordinator approval</li>
//                       <li>Track status in My Submissions</li>
//                     </ul>
//                   </div>
//                 </div>

//                 {/* Submit Button */}
//                 <div className="flex gap-4">
//                   <button
//                     type="submit"
//                     disabled={uploading}
//                     className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold flex items-center justify-center gap-2"
//                   >
//                     {uploading ? (
//                       <>
//                         <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                         Uploading to Supabase...
//                       </>
//                     ) : (
//                       <>
//                         <UploadIcon className="h-5 w-5" />
//                         Upload Content
//                       </>
//                     )}
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => router.push('/faculty/dashboard')}
//                     className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </main>
//       </div>
//     </>
//   )
// }

'use client'
import { useState, useEffect } from 'react'
import { Upload, AlertCircle, CheckCircle, Loader, FileText, BookOpen, ClipboardList } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

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
    file: null as File | null
  })

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
      const res = await fetch(`/api/faculty/courses?email=${encodeURIComponent(email)}`)
      const data = await res.json()

      if (data.success && Array.isArray(data.courses)) {
        setCourses(data.courses.map((c: any) => ({
          id: c.id,
          courseCode: c.courseCode,
          courseName: c.courseName
        })))
      }
    } catch (error) {
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

    const email = localStorage.getItem('facultyEmail')
    if (!email) {
      router.push('/faculty/login')
      return
    }

    setSubmitting(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('email', email)
      uploadFormData.append('courseId', formData.courseId)
      uploadFormData.append('contentType', formData.contentType)
      uploadFormData.append('title', formData.title)
      
      if (formData.lectureNumber) {
        uploadFormData.append('lectureNumber', formData.lectureNumber)
      }
      if (formData.assignmentNumber) {
        uploadFormData.append('assignmentNumber', formData.assignmentNumber)
      }
      if (formData.description) {
        uploadFormData.append('description', formData.description)
      }
      uploadFormData.append('file', formData.file)

      const res = await fetch('/api/faculty/content', {
        method: 'POST',
        body: uploadFormData
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Content uploaded successfully!')
        setFormData({
          courseId: '',
          contentType: 'LECTURE_PPT',
          title: '',
          lectureNumber: '',
          assignmentNumber: '',
          description: '',
          file: null
        })
        const fileInput = document.getElementById('file-upload') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      } else {
        toast.error(data.error || 'Error uploading content')
      }
    } catch (error) {
      toast.error('Error uploading content')
    } finally {
      setSubmitting(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const getContentTypeIcon = (type: string) => {
    switch(type) {
      case 'COURSE_HANDOUT': return '📘'
      case 'LECTURE_PPT': return '📊'
      case 'ASSIGNMENT': return '📝'
      case 'QUESTION_BANK': return '❓'
      case 'QUESTION_PAPER': return '📄'
      case 'LAB_MANUAL': return '🔬'
      case 'REFERENCE_MATERIAL': return '📚'
      default: return '📄'
    }
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Teaching Material</h1>
        <p className="text-gray-600">Upload course content for coordinator approval</p>
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
              onChange={(e) => setFormData(prev => ({ ...prev, courseId: e.target.value }))}
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
              <p className="text-sm text-red-600 mt-2">You have no courses assigned</p>
            )}
          </div>

          {/* Content Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Content Type *
            </label>
            <select
              value={formData.contentType}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                contentType: e.target.value,
                lectureNumber: '',
                assignmentNumber: ''
              }))}
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
                onChange={(e) => setFormData(prev => ({ ...prev, lectureNumber: e.target.value }))}
                placeholder="e.g., 1, 2, 3..."
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Enter the lecture number for organization</p>
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
                onChange={(e) => setFormData(prev => ({ ...prev, assignmentNumber: e.target.value }))}
                placeholder="e.g., 1, 2, 3..."
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Enter the assignment number</p>
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
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter a descriptive title"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Examples: "Introduction to Arrays", "Assignment 1: Sorting Algorithms"
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
                  <span className="text-blue-600 hover:text-blue-700">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, ZIP (Max 50 MB)
                </p>
                {formData.file && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-300 rounded-lg">
                    <p className="text-sm text-green-700 font-medium">
                      ✓ {formData.file.name}
                    </p>
                    <p className="text-xs text-green-600">{formatFileSize(formData.file.size)}</p>
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
                  file: null
                })
                const fileInput = document.getElementById('file-upload') as HTMLInputElement
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
            <li>⚠️ Changes Required → Edit & resubmit</li>
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
              <p className="text-sm text-gray-600">Comprehensive course overview and syllabus</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">📊</span>
            <div>
              <p className="font-medium text-gray-900">Lecture PPT</p>
              <p className="text-sm text-gray-600">Presentation slides for lectures (requires lecture number)</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">📝</span>
            <div>
              <p className="font-medium text-gray-900">Assignment</p>
              <p className="text-sm text-gray-600">Student assignments and homework (requires assignment number)</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">❓</span>
            <div>
              <p className="font-medium text-gray-900">Question Bank</p>
              <p className="text-sm text-gray-600">Collection of practice questions</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">📄</span>
            <div>
              <p className="font-medium text-gray-900">Question Paper</p>
              <p className="text-sm text-gray-600">Previous year or sample question papers</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">🔬</span>
            <div>
              <p className="font-medium text-gray-900">Lab Manual</p>
              <p className="text-sm text-gray-600">Laboratory experiment procedures and guidelines</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">📚</span>
            <div>
              <p className="font-medium text-gray-900">Reference Material</p>
              <p className="text-sm text-gray-600">Additional reading materials and resources</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
