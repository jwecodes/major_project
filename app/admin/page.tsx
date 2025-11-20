// 'use client'
// import { useEffect, useState } from 'react'
// import { getDashboardStats } from '@/app/actions/admin'
// import { GraduationCap, BookOpen, Users, Clock } from 'lucide-react'

// export default function AdminDashboard() {
//   const [stats, setStats] = useState({
//     totalProgrammes: 0,
//     totalCourses: 0,
//     totalFaculty: 0,
//     pendingApprovals: 0
//   })

//   useEffect(() => {
//     loadStats()
//   }, [])

//   const loadStats = async () => {
//     const data = await getDashboardStats()
//     setStats(data)
//   }

//   return (
//     <div>
//       <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-500 text-sm">Total Programmes</p>
//               <p className="text-3xl font-bold mt-1">{stats.totalProgrammes}</p>
//             </div>
//             <div className="bg-blue-100 rounded-full p-3">
//               <GraduationCap className="h-8 w-8 text-blue-600" />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-500 text-sm">Total Courses</p>
//               <p className="text-3xl font-bold mt-1">{stats.totalCourses}</p>
//             </div>
//             <div className="bg-green-100 rounded-full p-3">
//               <BookOpen className="h-8 w-8 text-green-600" />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-500 text-sm">Total Faculty</p>
//               <p className="text-3xl font-bold mt-1">{stats.totalFaculty}</p>
//             </div>
//             <div className="bg-purple-100 rounded-full p-3">
//               <Users className="h-8 w-8 text-purple-600" />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-500 text-sm">Pending Approvals</p>
//               <p className="text-3xl font-bold mt-1">{stats.pendingApprovals}</p>
//             </div>
//             <div className="bg-yellow-100 rounded-full p-3">
//               <Clock className="h-8 w-8 text-yellow-600" />
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="mt-8 bg-white rounded-lg shadow">
//         <div className="px-6 py-4 border-b">
//           <h2 className="text-xl font-semibold">Quick Actions</h2>
//         </div>
//         <div className="p-6 grid grid-cols-3 gap-4">
//           <a href="/admin/programmes" className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition">
//             <h3 className="font-semibold text-blue-700">Manage Programmes</h3>
//             <p className="text-sm text-gray-600 mt-1">Add or edit academic programmes</p>
//           </a>
//           <a href="/admin/courses" className="p-4 border-2 border-green-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition">
//             <h3 className="font-semibold text-green-700">Manage Courses</h3>
//             <p className="text-sm text-gray-600 mt-1">Add or edit course details</p>
//           </a>
//           <a href="/admin/course-coordination" className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition">
//             <h3 className="font-semibold text-purple-700">Course Coordination</h3>
//             <p className="text-sm text-gray-600 mt-1">Allocate faculty to courses</p>
//           </a>
//         </div>
//       </div>
//     </div>
//   )
// }

'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { GraduationCap, BookOpen, Users, Clock, Loader, LogOut } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      // Check session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.replace('/login')
        return
      }

      try {
        // Check role
        const roleRes = await fetch('/api/auth/role', {
          credentials: 'include'
        })
        const roleData = await roleRes.json()

        if (!roleData.currentRole || roleData.currentRole !== 'ADMIN') {
          if (roleData.currentRole === 'FACULTY') {
            router.replace('/faculty')
          } else {
            router.replace('/login')
          }
          return
        }

        // Fetch dashboard stats
        const statsRes = await fetch('/api/admin/stats', {
          credentials: 'include'
        })
        const statsData = await statsRes.json()

        if (statsData.success) {
          setStats(statsData.stats)
        } else {
          setError(statsData.error || 'Failed to load stats')
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
          <p className="text-gray-600">Loading admin dashboard...</p>
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>

        {/* Stats Grid */}
        {stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-3xl font-bold text-gray-900">{stats.totalStudents || 0}</span>
              </div>
              <h3 className="text-gray-600 font-medium">Total Students</h3>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-3xl font-bold text-gray-900">{stats.totalFaculty || 0}</span>
              </div>
              <h3 className="text-gray-600 font-medium">Total Faculty</h3>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-3xl font-bold text-gray-900">{stats.totalCourses || 0}</span>
              </div>
              <h3 className="text-gray-600 font-medium">Total Courses</h3>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-3xl font-bold text-gray-900">{stats.pendingApprovals || 0}</span>
              </div>
              <h3 className="text-gray-600 font-medium">Pending Approvals</h3>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No stats available</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => router.push('/admin/students')}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow text-left"
          >
            <GraduationCap className="h-8 w-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Manage Students</h3>
            <p className="text-sm text-gray-600">View and manage student records</p>
          </button>

          <button
            onClick={() => router.push('/admin/faculty')}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow text-left"
          >
            <Users className="h-8 w-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Manage Faculty</h3>
            <p className="text-sm text-gray-600">View and manage faculty members</p>
          </button>

          <button
            onClick={() => router.push('/admin/courses')}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow text-left"
          >
            <BookOpen className="h-8 w-8 text-purple-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Manage Courses</h3>
            <p className="text-sm text-gray-600">View and manage course catalog</p>
          </button>
        </div>
      </div>
    </div>
  )
}
