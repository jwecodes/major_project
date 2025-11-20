// // 'use client'
// // import { useState, useEffect } from 'react'
// // import { Plus, Upload, BookOpen, FileText, Trash2, Eye, Download, Filter, Search, ChevronDown, AlertCircle, CheckCircle, Clock, XCircle, Loader, ArrowRight } from 'lucide-react'
// // import toast, { Toaster } from 'react-hot-toast'

// // interface Course {
// //   id: string
// //   courseCode: string
// //   courseName: string
// //   semester: number
// //   session: string
// //   programme: {
// //     programmeName: string
// //     programmeCode: string
// //     section: string | null
// //   }
// //   allocation: {
// //     role: 'COORDINATOR' | 'CONTRIBUTOR'
// //   }
// // }

// // interface ContentItem {
// //   id: string
// //   title: string
// //   fileName: string
// //   contentType: string
// //   lectureNumber?: number | null
// //   description?: string | null
// //   fileSize?: number | null
// //   approvalStatus: 'PENDING' | 'APPROVED' | 'CHANGES_REQUIRED' | 'REJECTED'
// //   coordinatorNotes?: string | null
// //   uploadDate: string
// //   courseId: string
// //   course: {
// //     courseCode: string
// //     courseName: string
// //   }
// // }

// // export default function FacultyDashboard() {
// //   const [courses, setCourses] = useState<Course[]>([])
// //   const [contents, setContents] = useState<ContentItem[]>([])
// //   const [loading, setLoading] = useState(false)

// //   const [stats, setStats] = useState({
// //     totalCourses: 0,
// //     coordinatingCourses: 0,
// //     totalContent: 0,
// //     approvedContent: 0,
// //     pendingContent: 0,
// //     changesRequiredContent: 0
// //   })

// //   useEffect(() => {
// //     loadData()
// //   }, [])

// //   const loadData = async () => {
// //     try {
// //       setLoading(true)
// //       const [coursesRes, contentsRes] = await Promise.all([
// //         fetch('/api/faculty/courses'),
// //         fetch('/api/faculty/content')
// //       ])

// //       const coursesData = await coursesRes.json()
// //       const contentsData = await contentsRes.json()

// //       if (coursesData.success && Array.isArray(coursesData.courses)) {
// //         setCourses(coursesData.courses)
// //         const coordinating = coursesData.courses.filter((c: Course) => c.allocation.role === 'COORDINATOR').length
// //         setStats(prev => ({
// //           ...prev,
// //           totalCourses: coursesData.courses.length,
// //           coordinatingCourses: coordinating
// //         }))
// //       }

// //       if (contentsData.success && Array.isArray(contentsData.content)) {
// //         setContents(contentsData.content)
// //         const approved = contentsData.content.filter((c: ContentItem) => c.approvalStatus === 'APPROVED').length
// //         const pending = contentsData.content.filter((c: ContentItem) => c.approvalStatus === 'PENDING').length
// //         const changesRequired = contentsData.content.filter((c: ContentItem) => c.approvalStatus === 'CHANGES_REQUIRED').length
// //         setStats(prev => ({
// //           ...prev,
// //           totalContent: contentsData.content.length,
// //           approvedContent: approved,
// //           pendingContent: pending,
// //           changesRequiredContent: changesRequired
// //         }))
// //       }
// //     } catch (error) {
// //       console.error('Error loading data:', error)
// //       toast.error('Error loading data')
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   return (
// //     <div className="p-6">
// //       <Toaster position="top-right" />

// //       {/* Stats Cards */}
// //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
// //         <div className="bg-white p-5 rounded-lg shadow border border-gray-200 hover:shadow-md transition">
// //           <p className="text-gray-600 text-xs font-medium uppercase">Total Courses</p>
// //           <p className="text-2xl font-bold text-blue-600 mt-2">{stats.totalCourses}</p>
// //         </div>
// //         <div className="bg-white p-5 rounded-lg shadow border border-gray-200 hover:shadow-md transition">
// //           <p className="text-gray-600 text-xs font-medium uppercase">Coordinating</p>
// //           <p className="text-2xl font-bold text-purple-600 mt-2">{stats.coordinatingCourses}</p>
// //         </div>
// //         <div className="bg-white p-5 rounded-lg shadow border border-gray-200 hover:shadow-md transition">
// //           <p className="text-gray-600 text-xs font-medium uppercase">Total Content</p>
// //           <p className="text-2xl font-bold text-indigo-600 mt-2">{stats.totalContent}</p>
// //         </div>
// //         <div className="bg-white p-5 rounded-lg shadow border border-gray-200 hover:shadow-md transition">
// //           <p className="text-gray-600 text-xs font-medium uppercase">Approved</p>
// //           <p className="text-2xl font-bold text-green-600 mt-2">{stats.approvedContent}</p>
// //         </div>
// //         <div className="bg-white p-5 rounded-lg shadow border border-gray-200 hover:shadow-md transition">
// //           <p className="text-gray-600 text-xs font-medium uppercase">Pending</p>
// //           <p className="text-2xl font-bold text-yellow-600 mt-2">{stats.pendingContent}</p>
// //         </div>
// //         <div className="bg-white p-5 rounded-lg shadow border border-gray-200 hover:shadow-md transition">
// //           <p className="text-gray-600 text-xs font-medium uppercase">Changes Req.</p>
// //           <p className="text-2xl font-bold text-orange-600 mt-2">{stats.changesRequiredContent}</p>
// //         </div>
// //       </div>

// //       {/* Quick Actions */}
// //       <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mb-8">
// //         <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
// //         <div className="flex flex-wrap gap-3">
// //           <a
// //             href="/faculty/upload"
// //             className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium transition-colors shadow-sm"
// //           >
// //             <Upload className="h-5 w-5" />
// //             Upload Content
// //           </a>
// //           <a
// //             href="/faculty/courses"
// //             className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 font-medium transition-colors shadow-sm"
// //           >
// //             <BookOpen className="h-5 w-5" />
// //             View Courses
// //           </a>
// //           <a
// //             href="/faculty/submissions"
// //             className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 font-medium transition-colors shadow-sm"
// //           >
// //             <FileText className="h-5 w-5" />
// //             My Submissions
// //           </a>
// //         </div>
// //       </div>

// //       {/* Recent Uploads */}
// //       <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
// //         <div className="flex justify-between items-center mb-4">
// //           <h3 className="text-lg font-semibold text-gray-900">Recent Uploads</h3>
// //           {contents.length > 0 && (
// //             <a href="/faculty/submissions" className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium">
// //               View All <ArrowRight className="h-4 w-4" />
// //             </a>
// //           )}
// //         </div>

// //         {contents.length === 0 ? (
// //           <p className="text-gray-600 text-center py-8">No content uploaded yet. Start by uploading your first material!</p>
// //         ) : (
// //           <div className="space-y-3">
// //             {contents.slice(0, 5).map(content => (
// //               <div key={content.id} className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition">
// //                 <div className="flex items-start justify-between gap-4">
// //                   <div className="flex-1">
// //                     <div className="flex items-center gap-2 mb-1 flex-wrap">
// //                       <h4 className="font-medium text-gray-900">{content.title}</h4>
// //                       <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
// //                         content.approvalStatus === 'APPROVED' ? 'bg-green-100 text-green-700' :
// //                         content.approvalStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
// //                         content.approvalStatus === 'CHANGES_REQUIRED' ? 'bg-orange-100 text-orange-700' :
// //                         'bg-red-100 text-red-700'
// //                       }`}>
// //                         {content.approvalStatus === 'CHANGES_REQUIRED' ? 'Changes Required' : content.approvalStatus}
// //                       </span>
// //                     </div>
// //                     <p className="text-sm text-gray-600">{content.course.courseCode} • {content.contentType}</p>
// //                     <p className="text-xs text-gray-500 mt-1">Uploaded: {new Date(content.uploadDate).toLocaleDateString()}</p>
// //                   </div>
// //                 </div>
// //               </div>
// //             ))}
// //           </div>
// //         )}
// //       </div>

// //       {/* Guidelines */}
// //       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
// //         <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
// //           <h3 className="font-semibold text-blue-900 mb-3">📋 Guidelines</h3>
// //           <ul className="text-sm text-blue-800 space-y-2">
// //             <li>✓ Use clear, descriptive titles</li>
// //             <li>✓ Maximum file size: 50 MB</li>
// //             <li>✓ Supported: PDF, DOC, PPT, XLS, ZIP</li>
// //             <li>✓ Add descriptions for students</li>
// //           </ul>
// //         </div>
// //         <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
// //           <h3 className="font-semibold text-green-900 mb-3">✅ Approval Process</h3>
// //           <ul className="text-sm text-green-800 space-y-2">
// //             <li>📤 Upload → Pending review</li>
// //             <li>👀 Coordinator reviews</li>
// //             <li>✓ Approved → Visible to students</li>
// //             <li>⚠️ Changes Required → Edit & resubmit</li>
// //           </ul>
// //         </div>
// //       </div>
// //     </div>
// //   )
// // }

// 'use client'
// import { useEffect, useState } from 'react'

// export default function FacultyDashboard() {
//   const [profile, setProfile] = useState<any>(null)
//   const [courses, setCourses] = useState<any[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState('')

//   useEffect(() => {
//     const load = async () => {
//       setLoading(true)
//       setError('')
//       try {
//         const pRes = await fetch('/api/faculty/profile')
//         const cRes = await fetch('/api/faculty/courses')
//         const pData = await pRes.json()
//         const cData = await cRes.json()
//         if (!pData.success) setError(pData.error)
//         else setProfile(pData.profile)
//         if (!cData.success) setError(cData.error)
//         else setCourses(cData.courses)
//       } catch (err: any) {
//         setError('Failed to load faculty dashboard')
//       }
//       setLoading(false)
//     }
//     load()
//   }, [])

//   if (loading) return <div className="p-8">Loading...</div>
//   if (error) return <div className="p-8 text-red-600">{error}</div>
//   if (!profile) return <div className="p-8">Profile not found</div>

//   return (
//     <div className="max-w-2xl mx-auto mt-12 bg-white rounded-2xl shadow-lg p-8">
//       <h1 className="text-2xl font-bold mb-4">Welcome, {profile.name}</h1>
//       <div className="mb-2">
//         <strong>Designation:</strong> {profile.designation} <br/>
//         <strong>Email:</strong> {profile.email} <br/>
//         <strong>Department:</strong> {profile.department}
//       </div>
//       <h2 className="mt-6 mb-2 font-semibold">Courses Assigned</h2>
//       {courses.length === 0 ? (
//         <div>No courses assigned.</div>
//       ) : (
//         <ul className="list-disc ml-6">
//           {courses.map((c: any) =>
//             <li key={c.id}>{c.courseCode} - {c.courseName}</li>
//           )}
//         </ul>
//       )}
//     </div>
//   )
// }

'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader, User, BookOpen, LogOut } from 'lucide-react'

export default function FacultyDashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      // First check if user is logged in
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        console.log('No session found, redirecting to login')
        router.replace('/login')
        return
      }

      console.log('Session found:', session.user.email)

      try {
        // Check role
        const roleRes = await fetch('/api/auth/role', {
          credentials: 'include'
        })
        const roleData = await roleRes.json()

        console.log('Role data:', roleData)

        if (!roleData.currentRole) {
          console.log('No role found, redirecting to login')
          router.replace('/login')
          return
        }

        if (roleData.currentRole !== 'FACULTY') {
          console.log('Not faculty, redirecting to appropriate dashboard')
          if (roleData.currentRole === 'ADMIN') {
            router.replace('/admin')
          } else {
            router.replace('/login')
          }
          return
        }

        // Fetch profile
        const pRes = await fetch('/api/faculty/profile', {
          credentials: 'include'
        })
        const pData = await pRes.json()

        console.log('Profile data:', pData)

        if (!pData.success) {
          setError(pData.error || 'Failed to load profile')
          setLoading(false)
          return
        }
        setProfile(pData.profile)

        // Fetch courses
        const cRes = await fetch('/api/faculty/courses', {
          credentials: 'include'
        })
        const cData = await cRes.json()

        console.log('Courses data:', cData)

        if (cData.success) {
          setCourses(cData.courses)
        }
      } catch (err: any) {
        console.error('Load error:', err)
        setError('Failed to load dashboard')
      }
      setLoading(false)
    }

    checkAuthAndLoad()

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.replace('/login')
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-600 font-semibold mb-2">Error</p>
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Profile not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header with Logout */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Faculty Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex flex-col items-center gap-4">
            <div className="bg-blue-100 p-4 rounded-full">
              <User className="h-12 w-12 text-blue-600" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
              <p className="text-blue-600 font-medium">{profile.designation}</p>
              <p className="text-gray-500 text-sm mt-1">{profile.email}</p>
              {profile.department && (
                <p className="text-gray-500 text-sm">Department: {profile.department}</p>
              )}
            </div>
          </div>
        </div>

        {/* Courses Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-800">My Courses</h2>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No courses assigned yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="border-l-4 border-blue-500 bg-blue-50 rounded-lg p-4"
                >
                  <h3 className="font-semibold text-gray-900">{course.courseCode}</h3>
                  <p className="text-gray-700">{course.courseName}</p>
                  <div className="flex gap-2 mt-2 text-xs">
                    <span className="bg-white px-2 py-1 rounded">{course.programme.programmeCode}</span>
                    <span className="bg-white px-2 py-1 rounded">Sem {course.semester}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
