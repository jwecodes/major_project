'use client'
import { Sidebar } from '@/components/sidebar'
import { api } from '@/lib/api'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface DashboardStats {
  programmes: number
  faculties: number
  students: number
  courses: number
  assignedCourses: number
  unassignedCourses: number
  totalCredits: number
  pendingReviews: number
  publishedContent: number
  courseAssignments: number
}

interface RecentActivity {
  id: number
  type: string
  message: string
  time: string
  icon: string
  bgColor: string
  textColor: string
}

interface Programme {
  id: number
  shortName: string
  code: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    programmes: 0,
    faculties: 0,
    students: 0,
    courses: 0,
    assignedCourses: 0,
    unassignedCourses: 0,
    totalCredits: 0,
    pendingReviews: 0,
    publishedContent: 0,
    courseAssignments: 0
  })
  
  const [programmes, setProgrammes] = useState<Programme[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch real data from APIs
      const [programmesData, facultiesData] = await Promise.all([
        api.programmes.getAll('2024-2025').catch(() => []),
        api.faculty.getAll().catch(() => [])
      ])

      setProgrammes(programmesData)

      // Calculate course stats if we have programmes
      let totalCourses = 0
      let totalCredits = 0
      let assignedCourses = 0
      let unassignedCourses = 0

      for (const programme of programmesData.slice(0, 3)) { // Limit to prevent too many API calls
        try {
          const coursesData = await api.courses.getAll(programme.code)
          totalCourses += coursesData.length
          totalCredits += coursesData.reduce((sum: number, course: any) => sum + (course.C || 0), 0)
          
          // For course assignments, we'll need to implement this
          // assignedCourses += coursesData.filter(course => course.assignments?.length > 0).length
          // unassignedCourses += coursesData.filter(course => !course.assignments?.length).length
        } catch (error) {
          console.log(`No courses found for ${programme.code}`)
        }
      }

      setStats({
        programmes: programmesData.length,
        faculties: facultiesData.length,
        students: 0, // Will implement when student API is ready
        courses: totalCourses,
        assignedCourses: Math.floor(totalCourses * 0.7), // Mock 70% assigned
        unassignedCourses: Math.floor(totalCourses * 0.3), // Mock 30% unassigned
        totalCredits,
        pendingReviews: 5, // Mock data
        publishedContent: 12, // Mock data
        courseAssignments: facultiesData.reduce((total: number, faculty: any) => total + (faculty._count?.courseAssignments || 0), 0)
      })

      setLastUpdated(new Date().toLocaleTimeString())
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mock recent activities with realistic data
  const recentActivities: RecentActivity[] = [
    {
      id: 1,
      type: 'faculty_added',
      message: 'New faculty member added to Computer Science department',
      time: '2 hours ago',
      icon: '👨‍🏫',
      bgColor: 'bg-blue-50 border-l-4 border-blue-500',
      textColor: 'text-blue-800'
    },
    {
      id: 2,
      type: 'course_assigned',
      message: 'Course coordination assigned for AI & ML courses',
      time: '4 hours ago',
      icon: '🎯',
      bgColor: 'bg-green-50 border-l-4 border-green-500',
      textColor: 'text-green-800'
    },
    {
      id: 3,
      type: 'programme_updated',
      message: 'B.Tech CSE (AI & ML) programme structure updated',
      time: '6 hours ago',
      icon: '🎓',
      bgColor: 'bg-purple-50 border-l-4 border-purple-500',
      textColor: 'text-purple-800'
    },
    {
      id: 4,
      type: 'document_submitted',
      message: 'Course handbook submitted for review',
      time: '1 day ago',
      icon: '📋',
      bgColor: 'bg-yellow-50 border-l-4 border-yellow-500',
      textColor: 'text-yellow-800'
    },
    {
      id: 5,
      type: 'timetable_generated',
      message: 'Timetable generated for Semester 5 courses',
      time: '1 day ago',
      icon: '📅',
      bgColor: 'bg-indigo-50 border-l-4 border-indigo-500',
      textColor: 'text-indigo-800'
    }
  ]

  if (loading) {
    return (
      <div className="flex bg-slate-50 min-h-screen">
        <Sidebar role="admin" />
        <div className="flex-1 p-8">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-16 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
            <p className="mt-6 text-slate-500 font-medium text-lg">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role="admin" />
      
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-slate-800 mb-2">Admin Dashboard</h1>
              <p className="text-slate-600 text-lg">Welcome back! Here's your university overview</p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                <span className="text-green-600 mr-2">🟢</span>
                <span className="text-sm text-slate-600">Last updated: {lastUpdated}</span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
              📅 Academic Session: 2024-2025
            </span>
          </div>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Link href="/admin/programmes" className="group">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-200 group-hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 group-hover:text-blue-700 mb-2">Total Programmes</h3>
                  <p className="text-3xl font-bold text-blue-600">{stats.programmes}</p>
                  <p className="text-xs text-slate-500 mt-1">Active programmes</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-2xl group-hover:bg-blue-200 transition-colors">
                  <span className="text-2xl">🎓</span>
                </div>
              </div>
            </div>
          </Link>
          
          <Link href="/admin/faculty" className="group">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-200 group-hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 group-hover:text-green-700 mb-2">Total Faculty</h3>
                  <p className="text-3xl font-bold text-green-600">{stats.faculties}</p>
                  <p className="text-xs text-slate-500 mt-1">Active members</p>
                </div>
                <div className="p-3 bg-green-100 rounded-2xl group-hover:bg-green-200 transition-colors">
                  <span className="text-2xl">👨‍🏫</span>
                </div>
              </div>
            </div>
          </Link>
          
          <Link href="/admin/students" className="group">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-200 group-hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 group-hover:text-purple-700 mb-2">Total Students</h3>
                  <p className="text-3xl font-bold text-purple-600">{stats.students}</p>
                  <p className="text-xs text-slate-500 mt-1">Enrolled students</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-2xl group-hover:bg-purple-200 transition-colors">
                  <span className="text-2xl">👨‍🎓</span>
                </div>
              </div>
            </div>
          </Link>
          
          <Link href="/admin/courses" className="group">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-200 group-hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 group-hover:text-orange-700 mb-2">Total Courses</h3>
                  <p className="text-3xl font-bold text-orange-600">{stats.courses}</p>
                  <p className="text-xs text-slate-500 mt-1">Available courses</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-2xl group-hover:bg-orange-200 transition-colors">
                  <span className="text-2xl">📚</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Course Management Card */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <span className="mr-2">📊</span>
              Course Analytics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                <span className="text-sm font-medium text-slate-700">Assigned Courses</span>
                <span className="text-lg font-bold text-green-600">{stats.assignedCourses}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                <span className="text-sm font-medium text-slate-700">Unassigned Courses</span>
                <span className="text-lg font-bold text-red-600">{stats.unassignedCourses}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                <span className="text-sm font-medium text-slate-700">Total Credits</span>
                <span className="text-lg font-bold text-blue-600">{stats.totalCredits}</span>
              </div>
            </div>
          </div>

          {/* Content Management Card */}
          <Link href="/admin/content-review" className="group">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-200 group-hover:scale-[1.02]">
              <h3 className="text-lg font-bold text-slate-800 group-hover:text-yellow-700 mb-4 flex items-center">
                <span className="mr-2">📋</span>
                Content Reviews
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-xl">
                  <span className="text-sm font-medium text-slate-700">Pending Reviews</span>
                  <span className="text-lg font-bold text-yellow-600">{stats.pendingReviews}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                  <span className="text-sm font-medium text-slate-700">Published Content</span>
                  <span className="text-lg font-bold text-green-600">{stats.publishedContent}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                  <span className="text-sm font-medium text-slate-700">Course Assignments</span>
                  <span className="text-lg font-bold text-blue-600">{stats.courseAssignments}</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Quick Actions Card */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <span className="mr-2">⚡</span>
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link href="/admin/course-coordination" className="flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group">
                <span className="mr-3 text-xl">🎯</span>
                <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700">Course Coordination</span>
              </Link>
              <Link href="/admin/programmes" className="flex items-center p-3 bg-green-50 hover:bg-green-100 rounded-xl transition-colors group">
                <span className="mr-3 text-xl">➕</span>
                <span className="text-sm font-medium text-slate-700 group-hover:text-green-700">Add New Programme</span>
              </Link>
              <Link href="/admin/faculty" className="flex items-center p-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors group">
                <span className="mr-3 text-xl">👨‍🏫</span>
                <span className="text-sm font-medium text-slate-700 group-hover:text-purple-700">Manage Faculty</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 border-b border-slate-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                <span className="mr-3">📈</span>
                Recent Activity
              </h2>
              <button 
                onClick={fetchDashboardData}
                className="px-4 py-2 text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className={`p-4 ${activity.bgColor} rounded-xl transition-all hover:shadow-md`}>
                  <div className="flex items-start">
                    <span className="mr-4 text-2xl">{activity.icon}</span>
                    <div className="flex-1">
                      <span className={`${activity.textColor} font-semibold text-sm`}>
                        {activity.message}
                      </span>
                      <div className="text-xs text-slate-500 mt-2 flex items-center">
                        <span className="mr-1">⏰</span>
                        {activity.time}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Active Programmes Quick View */}
        {programmes.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                <span className="mr-3">🎓</span>
                Active Programmes
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {programmes.slice(0, 6).map((programme) => (
                  <Link key={programme.id} href={`/admin/courses?programme=${programme.code}`} className="group">
                    <div className="p-4 border-2 border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all group-hover:scale-[1.02]">
                      <h4 className="font-bold text-slate-800 group-hover:text-blue-700 mb-2">
                        {programme.shortName}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        Code: {programme.code}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
