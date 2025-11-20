// // 'use client'
// // import { useState, useEffect } from 'react'
// // import { useRouter } from 'next/navigation'
// // import Link from 'next/link'
// // import Sidebar from '@/components/faculty/Sidebar'

// // export default function Dashboard() {
// //   const router = useRouter()
// //   const [faculty, setFaculty] = useState<any>(null)
// //   const [courses, setCourses] = useState<any[]>([])
// //   const [stats, setStats] = useState({ total: 0, coordinator: 0, contributor: 0 })
// //   const [loading, setLoading] = useState(true)

// //   useEffect(() => {
// //     const facultyData = localStorage.getItem('faculty')
// //     const facultyId = localStorage.getItem('facultyId')

// //     if (!facultyData || !facultyId) {
// //       router.push('/faculty/login')
// //       return
// //     }

// //     setFaculty(JSON.parse(facultyData))
// //     loadCourses(facultyId)
// //   }, [router])

// //   const loadCourses = async (facultyId: string) => {
// //     try {
// //       const res = await fetch('/api/faculty/my-courses', {
// //         headers: { 'x-faculty-id': facultyId }
// //       })
// //       const data = await res.json()
// //       if (data.success) {
// //         const assignments = data.assignments || []
// //         setCourses(assignments)
// //         setStats({
// //           total: assignments.length,
// //           coordinator: assignments.filter((a: any) => a.role === 'COORDINATOR').length,
// //           contributor: assignments.filter((a: any) => a.role === 'CONTRIBUTOR').length
// //         })
// //       }
// //     } catch (err) {
// //       console.error(err)
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   if (!faculty) return null

// //   return (
// //     <>
// //       <Sidebar />
      
// //       <div className="lg:ml-64 min-h-screen bg-gray-50">
// //         <main className="p-4 md:p-6">
// //           <div className="mb-8">
// //             <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
// //             <p className="text-gray-600 mt-1">Welcome back, {faculty.name}</p>
// //           </div>

// //           {/* Stats */}
// //           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
// //             <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
// //               <p className="text-gray-600 text-sm font-medium">Total Courses</p>
// //               <p className="text-3xl font-bold text-blue-600 mt-2">{stats.total}</p>
// //             </div>
// //             <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
// //               <p className="text-gray-600 text-sm font-medium">As Coordinator</p>
// //               <p className="text-3xl font-bold text-purple-600 mt-2">{stats.coordinator}</p>
// //             </div>
// //             <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
// //               <p className="text-gray-600 text-sm font-medium">As Contributor</p>
// //               <p className="text-3xl font-bold text-green-600 mt-2">{stats.contributor}</p>
// //             </div>
// //           </div>

// //           {/* Courses */}
// //           <div className="bg-white rounded-lg shadow border border-gray-200">
// //             <div className="p-6 border-b border-gray-200">
// //               <h2 className="text-xl font-bold text-gray-900">Your Courses ({courses.length})</h2>
// //             </div>
// //             {loading ? (
// //               <div className="p-12 text-center text-gray-600">Loading...</div>
// //             ) : courses.length > 0 ? (
// //               <div className="divide-y divide-gray-200">
// //                 {courses.slice(0, 5).map((course: any) => (
// //                   <div key={course.id} className="p-6 hover:bg-gray-50 flex justify-between items-center">
// //                     <div className="flex-1 min-w-0">
// //                       <h3 className="font-semibold text-gray-900">{course.course.courseCode}</h3>
// //                       <p className="text-sm text-gray-600 truncate">{course.course.courseName}</p>
// //                     </div>
// //                     <div className="flex gap-2 items-center ml-4">
// //                       <span className={`px-3 py-1 rounded text-xs font-semibold whitespace-nowrap ${
// //                         course.role === 'COORDINATOR'
// //                           ? 'bg-purple-100 text-purple-800'
// //                           : 'bg-blue-100 text-blue-800'
// //                       }`}>
// //                         {course.role}
// //                       </span>
// //                       <Link
// //                         href={`/faculty/courses/${course.courseId}`}
// //                         className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm whitespace-nowrap font-medium"
// //                       >
// //                         View
// //                       </Link>
// //                     </div>
// //                   </div>
// //                 ))}
// //               </div>
// //             ) : (
// //               <div className="p-12 text-center text-gray-600">No courses assigned</div>
// //             )}
// //           </div>
// //         </main>
// //       </div>
// //     </>
// //   )
// // }

// 'use client'
// import { useState, useEffect } from 'react'
// import { Plus, Upload, BookOpen, FileText, Trash2, Eye, Download, Filter, Search, ChevronDown, AlertCircle, CheckCircle, Clock, XCircle, Loader, ArrowRight, User, Mail, Phone, Building2, Award, Calendar } from 'lucide-react'
// import toast, { Toaster } from 'react-hot-toast'

// interface FacultyProfile {
//   id: string
//   facultyId: string
//   name: string
//   email: string
//   designation: string
//   department: string | null
//   contactNo: string | null
// }

// interface Course {
//   id: string
//   courseCode: string
//   courseName: string
//   semester: number
//   session: string
//   programme: {
//     programmeName: string
//     programmeCode: string
//     section: string | null
//   }
//   allocation: {
//     role: 'COORDINATOR' | 'CONTRIBUTOR'
//   }
// }

// interface ContentItem {
//   id: string
//   title: string
//   fileName: string
//   contentType: string
//   lectureNumber?: number | null
//   description?: string | null
//   fileSize?: number | null
//   approvalStatus: 'PENDING' | 'APPROVED' | 'CHANGES_REQUIRED' | 'REJECTED'
//   coordinatorNotes?: string | null
//   uploadDate: string
//   courseId: string
//   course: {
//     courseCode: string
//     courseName: string
//   }
// }

// export default function FacultyDashboard() {
//   const [profile, setProfile] = useState<FacultyProfile | null>(null)
//   const [courses, setCourses] = useState<Course[]>([])
//   const [contents, setContents] = useState<ContentItem[]>([])
//   const [loading, setLoading] = useState(false)

//   const [stats, setStats] = useState({
//     totalCourses: 0,
//     coordinatingCourses: 0,
//     totalContent: 0,
//     approvedContent: 0,
//     pendingContent: 0,
//     changesRequiredContent: 0
//   })

//   useEffect(() => {
//     loadData()
//   }, [])

//   const loadData = async () => {
//     try {
//       setLoading(true)
//       const [profileRes, coursesRes, contentsRes] = await Promise.all([
//         fetch('/api/faculty/profile'),
//         fetch('/api/faculty/courses'),
//         fetch('/api/faculty/content')
//       ])

//       const profileData = await profileRes.json()
//       const coursesData = await coursesRes.json()
//       const contentsData = await contentsRes.json()

//       if (profileData.success && profileData.profile) {
//         setProfile(profileData.profile)
//       }

//       if (coursesData.success && Array.isArray(coursesData.courses)) {
//         setCourses(coursesData.courses)
//         const coordinating = coursesData.courses.filter((c: Course) => c.allocation.role === 'COORDINATOR').length
//         setStats(prev => ({
//           ...prev,
//           totalCourses: coursesData.courses.length,
//           coordinatingCourses: coordinating
//         }))
//       }

//       if (contentsData.success && Array.isArray(contentsData.content)) {
//         setContents(contentsData.content)
//         const approved = contentsData.content.filter((c: ContentItem) => c.approvalStatus === 'APPROVED').length
//         const pending = contentsData.content.filter((c: ContentItem) => c.approvalStatus === 'PENDING').length
//         const changesRequired = contentsData.content.filter((c: ContentItem) => c.approvalStatus === 'CHANGES_REQUIRED').length
//         setStats(prev => ({
//           ...prev,
//           totalContent: contentsData.content.length,
//           approvedContent: approved,
//           pendingContent: pending,
//           changesRequiredContent: changesRequired
//         }))
//       }
//     } catch (error) {
//       console.error('Error loading data:', error)
//       toast.error('Error loading data')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const getGreeting = () => {
//     const hour = new Date().getHours()
//     if (hour < 12) return 'Good Morning'
//     if (hour < 17) return 'Good Afternoon'
//     return 'Good Evening'
//   }

//   if (loading && !profile) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <Loader className="h-8 w-8 animate-spin text-blue-600" />
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
//       <Toaster position="top-right" />

//       {/* Welcome Header */}
//       <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
//         <div className="max-w-7xl mx-auto px-6 py-8">
//           <div className="flex items-start justify-between gap-6 flex-wrap">
//             {/* Left Section - Welcome Message */}
//             <div className="flex-1 min-w-[300px]">
//               <div className="flex items-center gap-3 mb-2">
//                 <div className="w-16 h-16 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white border-opacity-30">
//                   <User className="h-8 w-8" />
//                 </div>
//                 <div>
//                   <p className="text-blue-100 text-sm font-medium">{getGreeting()}!</p>
//                   <h1 className="text-3xl font-bold">{profile?.name || 'Faculty Member'}</h1>
//                 </div>
//               </div>
//               <p className="text-blue-100 text-sm mt-3">Welcome to your dashboard. Manage your courses and content efficiently.</p>
//             </div>

//             {/* Right Section - Faculty Details Card */}
//             <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4 border border-white border-opacity-20 min-w-[320px]">
//               <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
//                 <Award className="h-4 w-4" />
//                 Faculty Details
//               </h3>
//               <div className="space-y-2 text-sm">
//                 <div className="flex items-center gap-2 text-blue-50">
//                   <User className="h-4 w-4 flex-shrink-0" />
//                   <span className="font-medium">ID:</span>
//                   <span>{profile?.facultyId || 'N/A'}</span>
//                 </div>
//                 <div className="flex items-center gap-2 text-blue-50">
//                   <Award className="h-4 w-4 flex-shrink-0" />
//                   <span className="font-medium">Designation:</span>
//                   <span>{profile?.designation || 'N/A'}</span>
//                 </div>
//                 {profile?.department && (
//                   <div className="flex items-center gap-2 text-blue-50">
//                     <Building2 className="h-4 w-4 flex-shrink-0" />
//                     <span className="font-medium">Department:</span>
//                     <span>{profile.department}</span>
//                   </div>
//                 )}
//                 <div className="flex items-center gap-2 text-blue-50">
//                   <Mail className="h-4 w-4 flex-shrink-0" />
//                   <span className="font-medium">Email:</span>
//                   <span className="truncate">{profile?.email || 'N/A'}</span>
//                 </div>
//                 {profile?.contactNo && (
//                   <div className="flex items-center gap-2 text-blue-50">
//                     <Phone className="h-4 w-4 flex-shrink-0" />
//                     <span className="font-medium">Contact:</span>
//                     <span>{profile.contactNo}</span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-6 py-6">
//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
//           <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition">
//             <div className="flex items-center justify-between mb-2">
//               <p className="text-gray-600 text-xs font-medium uppercase">Total Courses</p>
//               <BookOpen className="h-5 w-5 text-blue-600" />
//             </div>
//             <p className="text-3xl font-bold text-blue-600">{stats.totalCourses}</p>
//           </div>
//           <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition">
//             <div className="flex items-center justify-between mb-2">
//               <p className="text-gray-600 text-xs font-medium uppercase">Coordinating</p>
//               <Award className="h-5 w-5 text-purple-600" />
//             </div>
//             <p className="text-3xl font-bold text-purple-600">{stats.coordinatingCourses}</p>
//           </div>
//           <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition">
//             <div className="flex items-center justify-between mb-2">
//               <p className="text-gray-600 text-xs font-medium uppercase">Total Content</p>
//               <FileText className="h-5 w-5 text-indigo-600" />
//             </div>
//             <p className="text-3xl font-bold text-indigo-600">{stats.totalContent}</p>
//           </div>
//           <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition">
//             <div className="flex items-center justify-between mb-2">
//               <p className="text-gray-600 text-xs font-medium uppercase">Approved</p>
//               <CheckCircle className="h-5 w-5 text-green-600" />
//             </div>
//             <p className="text-3xl font-bold text-green-600">{stats.approvedContent}</p>
//           </div>
//           <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition">
//             <div className="flex items-center justify-between mb-2">
//               <p className="text-gray-600 text-xs font-medium uppercase">Pending</p>
//               <Clock className="h-5 w-5 text-yellow-600" />
//             </div>
//             <p className="text-3xl font-bold text-yellow-600">{stats.pendingContent}</p>
//           </div>
//           <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition">
//             <div className="flex items-center justify-between mb-2">
//               <p className="text-gray-600 text-xs font-medium uppercase">Changes Req.</p>
//               <AlertCircle className="h-5 w-5 text-orange-600" />
//             </div>
//             <p className="text-3xl font-bold text-orange-600">{stats.changesRequiredContent}</p>
//           </div>
//         </div>

//         {/* Quick Actions */}
//         <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//             <ArrowRight className="h-5 w-5 text-blue-600" />
//             Quick Actions
//           </h3>
//           <div className="flex flex-wrap gap-3">
//             <a
//               href="/faculty/upload"
//               className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 font-medium transition-all shadow-md hover:shadow-lg"
//             >
//               <Upload className="h-5 w-5" />
//               Upload Content
//             </a>
//             <a
//               href="/faculty/courses"
//               className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-indigo-800 flex items-center gap-2 font-medium transition-all shadow-md hover:shadow-lg"
//             >
//               <BookOpen className="h-5 w-5" />
//               View Courses
//             </a>
//             <a
//               href="/faculty/submissions"
//               className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 flex items-center gap-2 font-medium transition-all shadow-md hover:shadow-lg"
//             >
//               <FileText className="h-5 w-5" />
//               My Submissions
//             </a>
//           </div>
//         </div>

//         {/* Recent Uploads */}
//         <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8">
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
//               <Clock className="h-5 w-5 text-indigo-600" />
//               Recent Uploads
//             </h3>
//             {contents.length > 0 && (
//               <a href="/faculty/submissions" className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium">
//                 View All <ArrowRight className="h-4 w-4" />
//               </a>
//             )}
//           </div>

//           {contents.length === 0 ? (
//             <div className="text-center py-12 bg-gray-50 rounded-lg">
//               <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
//               <p className="text-gray-600 font-medium">No content uploaded yet</p>
//               <p className="text-gray-500 text-sm mt-2">Start by uploading your first material!</p>
//               <a
//                 href="/faculty/upload"
//                 className="inline-flex items-center gap-2 mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
//               >
//                 <Upload className="h-4 w-4" />
//                 Upload Now
//               </a>
//             </div>
//           ) : (
//             <div className="space-y-3">
//               {contents.slice(0, 5).map(content => (
//                 <div key={content.id} className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition hover:border-blue-300">
//                   <div className="flex items-start justify-between gap-4">
//                     <div className="flex-1">
//                       <div className="flex items-center gap-2 mb-1 flex-wrap">
//                         <h4 className="font-semibold text-gray-900">{content.title}</h4>
//                         <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${
//                           content.approvalStatus === 'APPROVED' ? 'bg-green-100 text-green-700' :
//                           content.approvalStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
//                           content.approvalStatus === 'CHANGES_REQUIRED' ? 'bg-orange-100 text-orange-700' :
//                           'bg-red-100 text-red-700'
//                         }`}>
//                           {content.approvalStatus === 'APPROVED' && <CheckCircle className="h-3 w-3" />}
//                           {content.approvalStatus === 'PENDING' && <Clock className="h-3 w-3" />}
//                           {content.approvalStatus === 'CHANGES_REQUIRED' && <AlertCircle className="h-3 w-3" />}
//                           {content.approvalStatus === 'REJECTED' && <XCircle className="h-3 w-3" />}
//                           {content.approvalStatus === 'CHANGES_REQUIRED' ? 'Changes Required' : content.approvalStatus}
//                         </span>
//                       </div>
//                       <p className="text-sm text-gray-600 font-medium">{content.course.courseCode} • {content.contentType}</p>
//                       <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
//                         <Calendar className="h-3 w-3" />
//                         Uploaded: {new Date(content.uploadDate).toLocaleDateString()}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Guidelines */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-xl shadow-md">
//             <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2 text-lg">
//               <FileText className="h-5 w-5" />
//               Upload Guidelines
//             </h3>
//             <ul className="text-sm text-blue-800 space-y-2.5">
//               <li className="flex items-start gap-2">
//                 <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" />
//                 <span>Use clear, descriptive titles for easy identification</span>
//               </li>
//               <li className="flex items-start gap-2">
//                 <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" />
//                 <span>Maximum file size: 50 MB per upload</span>
//               </li>
//               <li className="flex items-start gap-2">
//                 <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" />
//                 <span>Supported formats: PDF, DOC, PPT, XLS, ZIP</span>
//               </li>
//               <li className="flex items-start gap-2">
//                 <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" />
//                 <span>Add detailed descriptions to help students</span>
//               </li>
//             </ul>
//           </div>
//           <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-6 rounded-xl shadow-md">
//             <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2 text-lg">
//               <CheckCircle className="h-5 w-5" />
//               Approval Process
//             </h3>
//             <ul className="text-sm text-green-800 space-y-2.5">
//               <li className="flex items-start gap-2">
//                 <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
//                   <span className="text-xs font-bold text-yellow-700">1</span>
//                 </div>
//                 <span><strong>Upload:</strong> Submit your content for review</span>
//               </li>
//               <li className="flex items-start gap-2">
//                 <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
//                   <span className="text-xs font-bold text-blue-700">2</span>
//                 </div>
//                 <span><strong>Review:</strong> Coordinator reviews the material</span>
//               </li>
//               <li className="flex items-start gap-2">
//                 <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
//                   <span className="text-xs font-bold text-green-700">3</span>
//                 </div>
//                 <span><strong>Approved:</strong> Content becomes visible to students</span>
//               </li>
//               <li className="flex items-start gap-2">
//                 <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
//                   <span className="text-xs font-bold text-orange-700">!</span>
//                 </div>
//                 <span><strong>Changes:</strong> Review feedback and resubmit</span>
//               </li>
//             </ul>
//           </div>
//         </div>
//       </div>
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
