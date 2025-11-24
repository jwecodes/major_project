'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Loader, User, BookOpen, LogOut, Award, FileText, Upload, CheckCircle, Clock } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

interface Profile {
  id: string
  facultyId: string
  name: string
  email: string
  designation: string
  department: string | null
  contactNo: string | null
}

interface Course {
  id: string
  courseCode: string
  courseName: string
  semester: number
  credits: number
  programme: {
    programmeCode: string
    programmeName: string
    section: string | null
  }
  allocation: {
    role: 'COORDINATOR' | 'CONTRIBUTOR'
  }
}

interface ContentStats {
  total: number
  approved: number
  pending: number
  rejected: number
}

export default function FacultyDashboardClient() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [contentStats, setContentStats] = useState<ContentStats>({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadDashboardData()

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

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Load profile
      const profileRes = await fetch('/api/faculty/profile')
      const profileData = await profileRes.json()

      if (!profileData.success) {
        setError(profileData.error || 'Failed to load profile')
        setLoading(false)
        return
      }

      setProfile(profileData.profile)

      // Load courses
      const coursesRes = await fetch('/api/faculty/courses')
      const coursesData = await coursesRes.json()

      if (coursesData.success) {
        setCourses(coursesData.courses)
      }

      // Load content stats
      const statsRes = await fetch('/api/faculty/content-stats')
      const statsData = await statsRes.json()

      if (statsData.success) {
        setContentStats(statsData.stats)
      }
    } catch (err: any) {
      console.error('Load error:', err)
      setError('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      toast.error('Failed to logout')
    }
  }

  const navigateToCourse = (courseCode: string) => {
    router.push(`/faculty/courses/${courseCode}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-600">Profile not found</div>
      </div>
    )
  }

  const coordinatorCourses = courses.filter(c => c.allocation.role === 'COORDINATOR')
  const contributorCourses = courses.filter(c => c.allocation.role === 'CONTRIBUTOR')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Faculty Dashboard</h1>
              <p className="text-gray-600 text-sm mt-1">Welcome back, {profile.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-full mb-4">
                  <User className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 text-center">{profile.name}</h2>
                <p className="text-blue-600 font-medium text-center">{profile.designation}</p>
                <p className="text-gray-500 text-sm mt-2 text-center">{profile.email}</p>
                <p className="text-gray-600 text-sm font-medium mt-1">{profile.facultyId}</p>
                {profile.department && (
                  <div className="mt-4 px-4 py-2 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-900 font-medium">
                      {profile.department}
                    </p>
                  </div>
                )}
                {profile.contactNo && (
                  <p className="text-gray-600 text-sm mt-2">{profile.contactNo}</p>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Total Courses</span>
                  <span className="font-bold text-blue-600">{courses.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">As Coordinator</span>
                  <span className="font-bold text-green-600">{coordinatorCourses.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">As Contributor</span>
                  <span className="font-bold text-purple-600">{contributorCourses.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Content Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Total Content</p>
                    <p className="text-2xl font-bold text-gray-900">{contentStats.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Approved</p>
                    <p className="text-2xl font-bold text-green-600">{contentStats.approved}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Pending</p>
                    <p className="text-2xl font-bold text-orange-600">{contentStats.pending}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <Upload className="h-8 w-8 text-red-600" />
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">{contentStats.rejected}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Coordinator Courses */}
            {coordinatorCourses.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-6 w-6 text-green-600" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Courses as Coordinator ({coordinatorCourses.length})
                  </h2>
                </div>

                <div className="space-y-3">
                  {coordinatorCourses.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => navigateToCourse(course.courseCode)}
                      className="border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-white rounded-lg p-4 cursor-pointer hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg">{course.courseCode}</h3>
                          <p className="text-gray-700 mt-1">{course.courseName}</p>
                          <div className="flex gap-2 mt-3 flex-wrap">
                            <span className="bg-white px-3 py-1 rounded-full text-xs font-semibold text-gray-700 border border-gray-200">
                              {course.programme.programmeCode}
                              {course.programme.section && `-${course.programme.section}`}
                            </span>
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                              Sem {course.semester}
                            </span>
                            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold">
                              {course.credits} Credits
                            </span>
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                              COORDINATOR
                            </span>
                          </div>
                        </div>
                        <BookOpen className="h-6 w-6 text-green-600 ml-4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contributor Courses */}
            {contributorCourses.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Courses as Contributor ({contributorCourses.length})
                  </h2>
                </div>

                <div className="space-y-3">
                  {contributorCourses.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => navigateToCourse(course.courseCode)}
                      className="border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-white rounded-lg p-4 cursor-pointer hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg">{course.courseCode}</h3>
                          <p className="text-gray-700 mt-1">{course.courseName}</p>
                          <div className="flex gap-2 mt-3 flex-wrap">
                            <span className="bg-white px-3 py-1 rounded-full text-xs font-semibold text-gray-700 border border-gray-200">
                              {course.programme.programmeCode}
                              {course.programme.section && `-${course.programme.section}`}
                            </span>
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                              Sem {course.semester}
                            </span>
                            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold">
                              {course.credits} Credits
                            </span>
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">
                              CONTRIBUTOR
                            </span>
                          </div>
                        </div>
                        <BookOpen className="h-6 w-6 text-blue-600 ml-4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Courses */}
            {courses.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-medium">No courses assigned yet</p>
                <p className="text-gray-500 text-sm mt-2">
                  Please contact the administrator to get courses assigned to you
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
