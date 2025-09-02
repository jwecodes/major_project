'use client'
import { Sidebar } from '@/components/sidebar'
import { courses, faculties } from '@/lib/mokedata'

export default function FacultyCoursesPage() {
  const currentFaculty = faculties[0] // Dr. John Smith
  const myCourses = courses.filter(course => course.faculty === currentFaculty.name)

  return (
    <div className="flex">
      <Sidebar role="faculty" />
      
      <div className="flex-1 p-8 bg-gray-50">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Upload Content
          </button>
        </div>
        
        <div className="grid gap-6">
          {myCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{course.name}</h2>
                  <p className="text-gray-600">Code: {course.code} | Credits: {course.credits}</p>
                  <p className="text-gray-600">Programme: {course.programme}</p>
                  <p className="text-gray-600">Semester: {course.semester}</p>
                </div>
                <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                  Manage
                </button>
              </div>
              
              {/* Course Content */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Course Materials</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="bg-blue-50 p-3 rounded text-center">
                    <div className="text-2xl mb-1">📄</div>
                    <p className="text-sm">3 Assignments</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded text-center">
                    <div className="text-2xl mb-1">📊</div>
                    <p className="text-sm">5 PPTs</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded text-center">
                    <div className="text-2xl mb-1">📚</div>
                    <p className="text-sm">1 Handbook</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded text-center">
                    <div className="text-2xl mb-1">❓</div>
                    <p className="text-sm">2 Question Papers</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
