'use client'
import { Sidebar } from '@/components/sidebar'
import { courses, faculties } from '@/lib/mokedata'

export default function FacultyDashboard() {
  // Mock current faculty (in real app, this would come from session)
  const currentFaculty = faculties[0] // Dr. John Smith
  const myCourses = courses.filter(course => course.faculty === currentFaculty.name)

  return (
    <div className="flex">
      <Sidebar role="faculty" />
      
      <div className="flex-1 p-8 bg-gray-50">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Faculty Dashboard</h1>
        <p className="text-gray-600 mb-8">Welcome back, {currentFaculty.name}</p>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-600">My Courses</h3>
            <p className="text-3xl font-bold text-blue-600">{myCourses.length}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-600">Department</h3>
            <p className="text-xl font-bold text-green-600">{currentFaculty.department}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-600">Employee ID</h3>
            <p className="text-xl font-bold text-purple-600">{currentFaculty.employeeId}</p>
          </div>
        </div>

        {/* My Courses Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">My Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myCourses.map((course) => (
              <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg text-gray-900">{course.name}</h3>
                <p className="text-gray-600">Code: {course.code}</p>
                <p className="text-gray-600">Credits: {course.credits}</p>
                <p className="text-gray-600">Semester: {course.semester}</p>
                <button className="mt-3 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                  Manage Course
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 text-center">
              <div className="text-2xl mb-2">📤</div>
              Upload Assignment
            </button>
            <button className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 text-center">
              <div className="text-2xl mb-2">📊</div>
              Upload PPT
            </button>
            <button className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 text-center">
              <div className="text-2xl mb-2">📚</div>
              Course Handbook
            </button>
            <button className="bg-orange-600 text-white p-4 rounded-lg hover:bg-orange-700 text-center">
              <div className="text-2xl mb-2">❓</div>
              Question Papers
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
