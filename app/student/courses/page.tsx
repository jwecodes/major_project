'use client'
import { Sidebar } from '@/components/sidebar'
import { courses, students } from '@/lib/mokedata'

export default function StudentCoursesPage() {
  const currentStudent = students[0] // Alice Wilson
  const studentCourses = courses.filter(course => course.programme === currentStudent.programme)

  return (
    <div className="flex">
      <Sidebar role="student" />
      
      <div className="flex-1 p-8 bg-gray-50">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Courses</h1>
        
        <div className="grid gap-6">
          {studentCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{course.name}</h2>
                  <p className="text-gray-600">Code: {course.code} | Credits: {course.credits}</p>
                  <p className="text-gray-600">Faculty: {course.faculty}</p>
                  <p className="text-gray-600">Semester: {course.semester}</p>
                </div>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  Active
                </span>
              </div>
              
              {/* Available Materials */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Available Materials</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                  <div className="bg-blue-50 p-3 rounded hover:bg-blue-100 cursor-pointer transition-colors">
                    <div className="text-2xl mb-1">📄</div>
                    <p className="text-sm font-medium">Assignments</p>
                    <p className="text-xs text-gray-600">3 available</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded hover:bg-green-100 cursor-pointer transition-colors">
                    <div className="text-2xl mb-1">📊</div>
                    <p className="text-sm font-medium">Presentations</p>
                    <p className="text-xs text-gray-600">5 available</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded hover:bg-purple-100 cursor-pointer transition-colors">
                    <div className="text-2xl mb-1">📚</div>
                    <p className="text-sm font-medium">Handbook</p>
                    <p className="text-xs text-gray-600">1 available</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded hover:bg-orange-100 cursor-pointer transition-colors">
                    <div className="text-2xl mb-1">❓</div>
                    <p className="text-sm font-medium">Question Papers</p>
                    <p className="text-xs text-gray-600">2 available</p>
                  </div>
                </div>
                
                {/* Recent Uploads */}
                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Uploads</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Assignment 3 - Trees and Graphs</span>
                      <span className="text-gray-500">2 days ago</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>PPT - Sorting Algorithms</span>
                      <span className="text-gray-500">1 week ago</span>
                    </div>
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
