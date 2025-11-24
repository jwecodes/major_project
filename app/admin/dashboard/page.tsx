// 'use client'
// import { useState, useEffect } from 'react'
// import { BookOpen, GraduationCap, Users, FileText, Clock, CheckCircle, TrendingUp } from 'lucide-react'

// interface DashboardStats {
//   totalProgrammes: number
//   totalCourses: number
//   totalFaculty: number
//   totalStudents: number
//   pendingApprovals: number
//   approvedContent: number
//   totalContent: number
//   recentUploads: any[]
// }

// export default function AdminDashboard() {
//   const [stats, setStats] = useState<DashboardStats>({
//     totalProgrammes: 0,
//     totalCourses: 0,
//     totalFaculty: 0,
//     totalStudents: 0,
//     pendingApprovals: 0,
//     approvedContent: 0,
//     totalContent: 0,
//     recentUploads: []
//   })
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     loadDashboardStats()
//   }, [])

//   const loadDashboardStats = async () => {
//     try {
//       const response = await fetch('/api/admin/dashboard-stats')
//       const data = await response.json()
      
//       if (data.success) {
//         setStats(data.stats)
//       }
//     } catch (error) {
//       console.error('Failed to load dashboard stats:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading dashboard...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div>
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
//         <p className="text-gray-600 mt-1">Overview of your Teaching Content Management System</p>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         {/* Programmes */}
//         <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
//           <div className="flex items-center justify-between mb-4">
//             <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
//               <BookOpen className="h-6 w-6 text-blue-600" />
//             </div>
//             <span className="text-3xl font-bold text-gray-900">{stats.totalProgrammes}</span>
//           </div>
//           <h3 className="text-gray-600 font-medium">Total Programmes</h3>
//           <p className="text-sm text-gray-500 mt-1">Active academic programmes</p>
//         </div>

//         {/* Courses */}
//         <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
//           <div className="flex items-center justify-between mb-4">
//             <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
//               <GraduationCap className="h-6 w-6 text-green-600" />
//             </div>
//             <span className="text-3xl font-bold text-gray-900">{stats.totalCourses}</span>
//           </div>
//           <h3 className="text-gray-600 font-medium">Total Courses</h3>
//           <p className="text-sm text-gray-500 mt-1">Courses across all programmes</p>
//         </div>

//         {/* Faculty */}
//         <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
//           <div className="flex items-center justify-between mb-4">
//             <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
//               <Users className="h-6 w-6 text-purple-600" />
//             </div>
//             <span className="text-3xl font-bold text-gray-900">{stats.totalFaculty}</span>
//           </div>
//           <h3 className="text-gray-600 font-medium">Faculty Members</h3>
//           <p className="text-sm text-gray-500 mt-1">Registered faculty</p>
//         </div>

//         {/* Students */}
//         <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
//           <div className="flex items-center justify-between mb-4">
//             <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
//               <Users className="h-6 w-6 text-pink-600" />
//             </div>
//             <span className="text-3xl font-bold text-gray-900">{stats.totalStudents}</span>
//           </div>
//           <h3 className="text-gray-600 font-medium">Total Students</h3>
//           <p className="text-sm text-gray-500 mt-1">Enrolled students</p>
//         </div>
//       </div>

//       {/* Content Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//         {/* Pending Approvals */}
//         <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
//           <div className="flex items-center justify-between mb-4">
//             <div className="w-12 h-12 bg-yellow-200 rounded-lg flex items-center justify-center">
//               <Clock className="h-6 w-6 text-yellow-700" />
//             </div>
//             <span className="text-4xl font-bold text-yellow-700">{stats.pendingApprovals}</span>
//           </div>
//           <h3 className="text-gray-900 font-semibold text-lg">Pending Approvals</h3>
//           <p className="text-gray-700 text-sm mt-1">Content awaiting review</p>
//         </div>

//         {/* Approved Content */}
//         <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
//           <div className="flex items-center justify-between mb-4">
//             <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
//               <CheckCircle className="h-6 w-6 text-green-700" />
//             </div>
//             <span className="text-4xl font-bold text-green-700">{stats.approvedContent}</span>
//           </div>
//           <h3 className="text-gray-900 font-semibold text-lg">Approved Content</h3>
//           <p className="text-gray-700 text-sm mt-1">Content available to students</p>
//         </div>

//         {/* Total Content */}
//         <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
//           <div className="flex items-center justify-between mb-4">
//             <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
//               <FileText className="h-6 w-6 text-blue-700" />
//             </div>
//             <span className="text-4xl font-bold text-blue-700">{stats.totalContent}</span>
//           </div>
//           <h3 className="text-gray-900 font-semibold text-lg">Total Uploads</h3>
//           <p className="text-gray-700 text-sm mt-1">All teaching materials</p>
//         </div>
//       </div>

//       {/* Quick Actions */}
//       <div className="grid md:grid-cols-2 gap-6 mb-8">
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
//             <TrendingUp className="h-6 w-6 text-blue-600" />
//             Quick Actions
//           </h3>
//           <div className="space-y-3">
//             <a
//               href="/admin/programmes"
//               className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
//             >
//               <h4 className="font-semibold text-gray-900">Manage Programmes</h4>
//               <p className="text-sm text-gray-600">Add or edit academic programmes</p>
//             </a>
//             <a
//               href="/admin/courses"
//               className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
//             >
//               <h4 className="font-semibold text-gray-900">Manage Courses</h4>
//               <p className="text-sm text-gray-600">Add or edit course details</p>
//             </a>
//             <a
//               href="/admin/content-review"
//               className="block p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
//             >
//               <h4 className="font-semibold text-gray-900">Review Content</h4>
//               <p className="text-sm text-gray-600">{stats.pendingApprovals} pending approvals</p>
//             </a>
//           </div>
//         </div>

//         {/* Recent Uploads */}
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
//             <FileText className="h-6 w-6 text-purple-600" />
//             Recent Uploads
//           </h3>
//           {stats.recentUploads.length === 0 ? (
//             <p className="text-gray-500 text-center py-8">No recent uploads</p>
//           ) : (
//             <div className="space-y-3">
//               {stats.recentUploads.map((upload: any) => (
//                 <div key={upload.id} className="p-4 bg-gray-50 rounded-lg">
//                   <h4 className="font-semibold text-gray-900 text-sm">{upload.title}</h4>
//                   <p className="text-xs text-gray-600 mt-1">
//                     {upload.course.courseCode} • {upload.faculty.name}
//                   </p>
//                   <div className="flex items-center gap-2 mt-2">
//                     <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
//                       upload.approvalStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
//                       upload.approvalStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
//                       'bg-orange-100 text-orange-800'
//                     }`}>
//                       {upload.approvalStatus}
//                     </span>
//                     <span className="text-xs text-gray-500">
//                       {new Date(upload.createdAt).toLocaleDateString()}
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }


import { getCurrentUser } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import AdminDashboardClient from '@/components/admin/AdminDashboardClient'

export default async function AdminPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login?redirect=/admin')
  }
  
  if (!user.roles.includes('ADMIN')) {
    redirect('/unauthorized')
  }

  return <AdminDashboardClient />
}
