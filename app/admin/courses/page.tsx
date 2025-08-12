'use client'
import { Sidebar } from '@/components/sidebar'
import { courses, faculties } from '@/lib/mokedata'
import { useState } from 'react'

export default function AdminCoursesPage() {
  const [courseList, setCourseList] = useState(courses)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [selectedFacultyId, setSelectedFacultyId] = useState('')

  const handleAssignFaculty = (course: any) => {
    setSelectedCourse(course)
    setSelectedFacultyId(course.facultyId || '')
    setShowAssignModal(true)
  }

  const handleSaveAssignment = () => {
    if (!selectedCourse || !selectedFacultyId) return

    const selectedFaculty = faculties.find(f => f.id === selectedFacultyId)
    
    setCourseList(prev => 
      prev.map(course => 
        course.id === selectedCourse.id 
          ? { 
              ...course, 
              facultyId: selectedFacultyId, 
              faculty: selectedFaculty ? selectedFaculty.name : 'Unassigned' 
            }
          : course
      )
    )
    
    setShowAssignModal(false)
    setSelectedCourse(null)
    setSelectedFacultyId('')
  }

  const handleRemoveFaculty = (courseId: string) => {
    setCourseList(prev => 
      prev.map(course => 
        course.id === courseId 
          ? { ...course, facultyId: null, faculty: 'Unassigned' }
          : course
      )
    )
  }

  const getFacultyBadgeColor = (faculty: string) => {
    if (faculty === 'Unassigned') return 'bg-red-100 text-red-800'
    return 'bg-green-100 text-green-800'
  }

  return (
    <div className="flex">
      <Sidebar role="admin" />
      
      <div className="flex-1 p-8 bg-gray-50">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Courses Management</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Add Course
          </button>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-600">Total Courses</h3>
            <p className="text-3xl font-bold text-blue-600">{courseList.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-600">Assigned</h3>
            <p className="text-3xl font-bold text-green-600">
              {courseList.filter(c => c.facultyId).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-600">Unassigned</h3>
            <p className="text-3xl font-bold text-red-600">
              {courseList.filter(c => !c.facultyId).length}
            </p>
          </div>
        </div>

        {/* Courses Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Programme</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credits</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Faculty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {courseList.map((course) => (
                <tr key={course.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {course.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {course.code}
                  </td>
                  <td className="px-6 py-4 text-gray-500 max-w-xs">
                    <div className="truncate">{course.programme}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {course.credits}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {course.semester}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getFacultyBadgeColor(course.faculty)}`}>
                      {course.faculty}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button
                      onClick={() => handleAssignFaculty(course)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      {course.facultyId ? 'Reassign' : 'Assign'}
                    </button>
                    {course.facultyId && (
                      <button
                        onClick={() => handleRemoveFaculty(course.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Assignment Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-semibold mb-4">
                {selectedCourse?.facultyId ? 'Reassign Faculty' : 'Assign Faculty'}
              </h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course
                </label>
                <p className="text-gray-900 font-medium">{selectedCourse?.name}</p>
                <p className="text-gray-500 text-sm">{selectedCourse?.code}</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Faculty
                </label>
                <select
                  value={selectedFacultyId}
                  onChange={(e) => setSelectedFacultyId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a faculty...</option>
                  {faculties.map((faculty) => (
                    <option key={faculty.id} value={faculty.id}>
                      {faculty.name} ({faculty.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleSaveAssignment}
                  disabled={!selectedFacultyId}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Assignment
                </button>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
