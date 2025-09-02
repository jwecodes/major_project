'use client'
import { Sidebar } from '@/components/sidebar'
import { programmes, faculties, students, courses, academicContent } from '@/lib/mokedata'
import Link from 'next/link'

export default function AdminDashboard() {
  // Calculate additional statistics
  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0)
  const assignedCourses = courses.filter(course => course.facultyId).length
  const unassignedCourses = courses.filter(course => !course.facultyId).length
  const publishedContent = academicContent.filter(content => content.isPublished).length
  const pendingReviews = academicContent.filter(content => content.approvalStatus === 'pending').length
  
  // Get recent activities (you can make this dynamic later)
  const recentActivities = [
    {
      id: 1,
      type: 'student_enrolled',
      message: 'New student enrolled: Alice Wilson',
      time: '2 hours ago',
      icon: '➕',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-800'
    },
    {
      id: 2,
      type: 'content_submitted',
      message: 'Content submitted for review: Database Design Handbook',
      time: '4 hours ago',
      icon: '📋',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-800'
    },
    {
      id: 3,
      type: 'course_updated',
      message: 'Course updated: Data Structures',
      time: '6 hours ago',
      icon: '📚',
      bgColor: 'bg-green-50',
      textColor: 'text-green-800'
    },
    {
      id: 4,
      type: 'faculty_assigned',
      message: 'Faculty assigned: Dr. John Smith to Database Systems',
      time: '1 day ago',
      icon: '👨‍🏫',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-800'
    },
    {
      id: 5,
      type: 'timetable_updated',
      message: 'Timetable updated for Computer Science Engineering',
      time: '1 day ago',
      icon: '📅',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-800'
    }
  ]

  return (
    <div className="flex">
      <Sidebar role="admin" />
      
      <div className="flex-1 p-8 bg-gray-50">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="text-sm text-gray-600">
            Welcome back! Here's what's happening in your university.
          </div>
        </div>
        
        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Link href="/admin/programmes" className="group">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow group-hover:bg-blue-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-600 group-hover:text-blue-700">Programmes</h3>
                  <p className="text-3xl font-bold text-blue-600">{programmes.length}</p>
                </div>
                <div className="text-3xl text-blue-600">🎓</div>
              </div>
            </div>
          </Link>
          
          <Link href="/admin/faculties" className="group">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow group-hover:bg-green-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-600 group-hover:text-green-700">Faculties</h3>
                  <p className="text-3xl font-bold text-green-600">{faculties.length}</p>
                </div>
                <div className="text-3xl text-green-600">👨‍🏫</div>
              </div>
            </div>
          </Link>
          
          <Link href="/admin/students" className="group">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow group-hover:bg-purple-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-600 group-hover:text-purple-700">Students</h3>
                  <p className="text-3xl font-bold text-purple-600">{students.length}</p>
                </div>
                <div className="text-3xl text-purple-600">👨‍🎓</div>
              </div>
            </div>
          </Link>
          
          <Link href="/admin/courses" className="group">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow group-hover:bg-orange-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-600 group-hover:text-orange-700">Courses</h3>
                  <p className="text-3xl font-bold text-orange-600">{courses.length}</p>
                </div>
                <div className="text-3xl text-orange-600">📚</div>
              </div>
            </div>
          </Link>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Course Management</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Assigned Courses</span>
                <span className="text-sm font-medium text-green-600">{assignedCourses}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Unassigned Courses</span>
                <span className="text-sm font-medium text-red-600">{unassignedCourses}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Credits</span>
                <span className="text-sm font-medium text-blue-600">{totalCredits}</span>
              </div>
            </div>
          </div>

          <Link href="/admin/content-review" className="group">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow group-hover:bg-yellow-50">
              <h3 className="text-sm font-semibold text-gray-600 group-hover:text-yellow-700 mb-2">Content Reviews</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Pending Reviews</span>
                  <span className="text-sm font-medium text-yellow-600">{pendingReviews}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Published Content</span>
                  <span className="text-sm font-medium text-green-600">{publishedContent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Submissions</span>
                  <span className="text-sm font-medium text-blue-600">{academicContent.length}</span>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/timetable" className="group">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow group-hover:bg-indigo-50">
              <h3 className="text-sm font-semibold text-gray-600 group-hover:text-indigo-700 mb-2">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800">
                  📅 Manage Timetables
                </button>
                <button className="w-full text-left text-sm text-green-600 hover:text-green-800">
                  ➕ Add New Programme
                </button>
                <button className="w-full text-left text-sm text-purple-600 hover:text-purple-800">
                  👨‍🏫 Add New Faculty
                </button>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
          </div>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className={`flex items-center p-3 ${activity.bgColor} rounded-lg`}>
                <span className="mr-3 text-xl">{activity.icon}</span>
                <div className="flex-1">
                  <span className={`${activity.textColor} font-medium`}>{activity.message}</span>
                  <div className="text-xs text-gray-500 mt-1">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
