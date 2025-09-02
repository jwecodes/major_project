'use client'
import { Sidebar } from '@/components/sidebar'
import { courses, students } from '@/lib/mokedata'

export default function StudentDashboard() {
  // Mock current student (in real app, this would come from session)
  const currentStudent = students[0] // Alice Wilson
  const studentCourses = courses.filter(course => course.programme === currentStudent.programme)

  return (
    <div className="flex">
      <Sidebar role="student" />
      
      <div className="flex-1 p-8 bg-gray-50">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Dashboard</h1>
        <p className="text-gray-600 mb-8">Welcome back, {currentStudent.name}</p>
        
        {/* Student Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-600">Roll Number</h3>
            <p className="text-xl font-bold text-blue-600">{currentStudent.rollNumber}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-600">Programme</h3>
            <p className="text-sm font-bold text-green-600">{currentStudent.programme}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-600">Current Year</h3>
            <p className="text-3xl font-bold text-purple-600">{currentStudent.year}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-600">Total Courses</h3>
            <p className="text-3xl font-bold text-orange-600">{studentCourses.length}</p>
          </div>
        </div>

        {/* Current Courses */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">My Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studentCourses.map((course) => (
              <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg text-gray-900">{course.name}</h3>
                <p className="text-gray-600">Code: {course.code}</p>
                <p className="text-gray-600">Credits: {course.credits}</p>
                <p className="text-gray-600">Faculty: {course.faculty}</p>
                <button className="mt-3 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                  View Materials
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-blue-50 rounded">
              <span className="mr-3">📄</span>
              <div>
                <p className="font-medium">New assignment uploaded</p>
                <p className="text-sm text-gray-600">Data Structures - Assignment 3</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-green-50 rounded">
              <span className="mr-3">📊</span>
              <div>
                <p className="font-medium">PPT available</p>
                <p className="text-sm text-gray-600">Algorithms - Sorting Techniques</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-purple-50 rounded">
              <span className="mr-3">❓</span>
              <div>
                <p className="font-medium">Question paper uploaded</p>
                <p className="text-sm text-gray-600">Database Systems - Mid Term</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
