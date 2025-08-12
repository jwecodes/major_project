'use client'
import { Sidebar } from '@/components/sidebar'
import { programmes, faculties, courses } from '@/lib/mokedata'
import { useState } from 'react'

interface Faculty {
  id: string
  name: string
  employeeId: string
  department: string
  email: string
  courses: string[]
}

export default function FacultiesPage() {
  const [selectedProgramme, setSelectedProgramme] = useState<string | null>(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [selectedFacultyId, setSelectedFacultyId] = useState('')
  const [viewMode, setViewMode] = useState<'programme' | 'faculty'>('programme')
  const [showAddFacultyModal, setShowAddFacultyModal] = useState(false)
  
  // New state variables for bulk assign functionality
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false)
  const [selectedFacultyForBulkAssign, setSelectedFacultyForBulkAssign] = useState<Faculty | null>(null)
  const [selectedCoursesForAssign, setSelectedCoursesForAssign] = useState<string[]>([])

  // Get courses for a specific programme
  const getCoursesForProgramme = (programmeName: string) => {
    return courses.filter(course => course.programme === programmeName)
  }

  // Get faculty assignments for a programme
  const getFacultyAssignmentsForProgramme = (programmeName: string) => {
    const programmeCourses = getCoursesForProgramme(programmeName)
    const assignments: any[] = []
    
    programmeCourses.forEach(course => {
      const assignedFaculty = faculties.find(f => f.id === course.facultyId)
      assignments.push({
        course,
        faculty: assignedFaculty
      })
    })
    
    return assignments
  }

  // Get courses assigned to a specific faculty
  const getCoursesForFaculty = (facultyId: string) => {
    return courses.filter(course => course.facultyId === facultyId)
  }

  // Get faculty workload stats
  const getFacultyStats = (facultyId: string) => {
    const facultyCourses = getCoursesForFaculty(facultyId)
    const totalCredits = facultyCourses.reduce((sum, course) => sum + course.credits, 0)
    const programmes = [...new Set(facultyCourses.map(course => course.programme))]
    
    return {
      totalCourses: facultyCourses.length,
      totalCredits,
      programmes: programmes.length
    }
  }

  // Bulk course assignment functions
  const handleBulkAssignCourses = (faculty: Faculty) => {
    setSelectedFacultyForBulkAssign(faculty)
    setSelectedCoursesForAssign([])
    setShowBulkAssignModal(true)
  }

  const getAvailableCoursesForFaculty = (faculty: Faculty) => {
    // Get courses that are either unassigned or in the same department
    return courses.filter(course => 
      !course.facultyId || // Unassigned courses
      course.facultyId === faculty.id || // Already assigned to this faculty
      // Courses in same department
      programmes.find(p => p.name === course.programme)?.department === faculty.department
    )
  }

  const handleCourseSelection = (courseId: string) => {
    setSelectedCoursesForAssign(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    )
  }

  const handleSaveBulkAssignment = () => {
    if (!selectedFacultyForBulkAssign || selectedCoursesForAssign.length === 0) return
    
    console.log(`Assigning ${selectedCoursesForAssign.length} courses to ${selectedFacultyForBulkAssign.name}:`, {
      facultyId: selectedFacultyForBulkAssign.id,
      courseIds: selectedCoursesForAssign
    })
    
    // In a real app, you would update the database here
    
    setShowBulkAssignModal(false)
    setSelectedFacultyForBulkAssign(null)
    setSelectedCoursesForAssign([])
  }

  const handleAssignFaculty = (course: any) => {
    setSelectedCourse(course)
    setSelectedFacultyId(course.facultyId || '')
    setShowAssignModal(true)
  }

  const handleRemoveFaculty = (courseId: string) => {
    console.log(`Removing faculty from course: ${courseId}`)
    // In real app, update the database
  }

  const handleSaveAssignment = () => {
    if (!selectedCourse || !selectedFacultyId) return
    
    const selectedFaculty = faculties.find(f => f.id === selectedFacultyId)
    console.log(`Assigning ${selectedFaculty?.name} to ${selectedCourse.name}`)
    
    setShowAssignModal(false)
    setSelectedCourse(null)
    setSelectedFacultyId('')
  }

  const getDepartmentColor = (department: string) => {
    const colors: Record<string, string> = {
      'Engineering': 'bg-blue-100 text-blue-800',
      'Management': 'bg-green-100 text-green-800',
      'Arts': 'bg-purple-100 text-purple-800',
      'Science': 'bg-yellow-100 text-yellow-800'
    }
    return colors[department] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="flex">
      <Sidebar role="admin" />
      
      <div className="flex-1 p-8 bg-gray-50">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Faculty Management</h1>
          <div className="flex space-x-3">
            <button 
              onClick={() => setShowAddFacultyModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Add Faculty
            </button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('programme')}
              className={`px-4 py-2 rounded-lg font-medium ${
                viewMode === 'programme' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Programme & Course View
            </button>
            <button
              onClick={() => setViewMode('faculty')}
              className={`px-4 py-2 rounded-lg font-medium ${
                viewMode === 'faculty' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Faculty View
            </button>
          </div>
        </div>

        {viewMode === 'programme' ? (
          /* Programme & Course View */
          <div className="grid grid-cols-1 gap-6 mb-8">
            {programmes.map((programme) => {
              const assignments = getFacultyAssignmentsForProgramme(programme.name)
              const isSelected = selectedProgramme === programme.id
              
              return (
                <div 
                  key={programme.id} 
                  className={`bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg ${
                    isSelected ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div 
                    className="flex justify-between items-start mb-4 cursor-pointer"
                    onClick={() => setSelectedProgramme(isSelected ? null : programme.id)}
                  >
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900">{programme.name}</h2>
                      <p className="text-gray-600">Department: {programme.department}</p>
                      <p className="text-gray-600">
                        {assignments.length} courses • {assignments.filter(a => a.faculty).length} assigned
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">
                          {assignments.filter(a => a.faculty).length}
                        </p>
                        <p className="text-sm text-gray-600">Assigned</p>
                      </div>
                      <button 
                        className="text-blue-600 hover:text-blue-800"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedProgramme(isSelected ? null : programme.id)
                        }}
                      >
                        {isSelected ? '▼' : '▶'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Course & Faculty Details */}
                  {isSelected && (
                    <div className="border-t pt-4 mt-4">
                      <h3 className="font-semibold mb-4">Courses & Faculty Assignments</h3>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {assignments.map((assignment) => (
                          <div key={assignment.course.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{assignment.course.name}</h4>
                              <p className="text-sm text-gray-600">
                                {assignment.course.code} • {assignment.course.credits} credits • Sem {assignment.course.semester}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              {assignment.faculty ? (
                                <div className="text-right">
                                  <p className="font-medium text-gray-900">{assignment.faculty.name}</p>
                                  <p className="text-sm text-gray-600">{assignment.faculty.employeeId}</p>
                                </div>
                              ) : (
                                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                                  Unassigned
                                </span>
                              )}
                              
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleAssignFaculty(assignment.course)}
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  {assignment.faculty ? 'Reassign' : 'Assign'}
                                </button>
                                {assignment.faculty && (
                                  <button
                                    onClick={() => handleRemoveFaculty(assignment.course.id)}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          /* Faculty View */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {faculties.map((faculty) => {
              const facultyCourses = getCoursesForFaculty(faculty.id)
              const stats = getFacultyStats(faculty.id)
              
              return (
                <div key={faculty.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-gray-900">{faculty.name}</h2>
                      <p className="text-gray-600">{faculty.employeeId} • {faculty.email}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getDepartmentColor(faculty.department)}`}>
                        {faculty.department}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-blue-600">{stats.totalCourses}</p>
                      <p className="text-xs text-gray-600">Courses</p>
                    </div>
                  </div>

                  {/* Faculty Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <p className="font-bold text-blue-600">{stats.totalCourses}</p>
                      <p className="text-xs text-gray-600">Courses</p>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <p className="font-bold text-green-600">{stats.totalCredits}</p>
                      <p className="text-xs text-gray-600">Credits</p>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <p className="font-bold text-purple-600">{stats.programmes}</p>
                      <p className="text-xs text-gray-600">Programmes</p>
                    </div>
                  </div>

                  {/* Faculty Courses */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-800 mb-3">Assigned Courses</h4>
                    {facultyCourses.length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {facultyCourses.map((course) => (
                          <div key={course.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex-1">
                              <p className="font-medium text-sm text-gray-900">{course.name}</p>
                              <p className="text-xs text-gray-600">{course.code} • {course.credits} credits</p>
                            </div>
                            <button
                              onClick={() => handleRemoveFaculty(course.id)}
                              className="text-red-600 hover:text-red-800 text-xs"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No courses assigned</p>
                    )}
                  </div>

                  {/* Faculty Actions */}
                  <div className="flex space-x-2 mt-4">
                    <button 
                      onClick={() => handleBulkAssignCourses(faculty)}
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700"
                    >
                      Assign Courses
                    </button>
                    <button className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">
                      Edit
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Bulk Assign Courses Modal */}
        {showBulkAssignModal && selectedFacultyForBulkAssign && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[80vh] overflow-hidden">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                Assign Courses to {selectedFacultyForBulkAssign.name}
              </h2>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Faculty: <span className="font-medium">{selectedFacultyForBulkAssign.name}</span> • 
                  Department: <span className="font-medium">{selectedFacultyForBulkAssign.department}</span>
                </p>
              </div>

              <div className="mb-4">
                <h3 className="font-medium text-gray-800 mb-2">Available Courses</h3>
                <div className="border rounded-lg max-h-96 overflow-y-auto">
                  {getAvailableCoursesForFaculty(selectedFacultyForBulkAssign).length > 0 ? (
                    getAvailableCoursesForFaculty(selectedFacultyForBulkAssign).map((course) => {
                      const isSelected = selectedCoursesForAssign.includes(course.id)
                      const isCurrentlyAssigned = course.facultyId === selectedFacultyForBulkAssign.id
                      const isAssignedToOther = course.facultyId && course.facultyId !== selectedFacultyForBulkAssign.id
                      
                      return (
                        <div 
                          key={course.id} 
                          className={`flex items-center justify-between p-3 border-b hover:bg-gray-50 ${
                            isSelected ? 'bg-blue-50 border-blue-200' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleCourseSelection(course.id)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{course.name}</h4>
                              <p className="text-sm text-gray-600">
                                {course.code} • {course.credits} credits • Sem {course.semester}
                              </p>
                              <p className="text-xs text-gray-500">{course.programme}</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            {isCurrentlyAssigned ? (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                Currently Assigned
                              </span>
                            ) : isAssignedToOther ? (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                                Assigned to Other
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                                Available
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No available courses for this faculty's department
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-4 p-3 bg-blue-50 rounded">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">{selectedCoursesForAssign.length}</span> courses selected
                  {selectedCoursesForAssign.length > 0 && (
                    <span className="ml-2">
                      • Total Credits: {selectedCoursesForAssign.reduce((sum, courseId) => {
                        const course = courses.find(c => c.id === courseId)
                        return sum + (course?.credits || 0)
                      }, 0)}
                    </span>
                  )}
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleSaveBulkAssignment}
                  disabled={selectedCoursesForAssign.length === 0}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Assign {selectedCoursesForAssign.length} Course{selectedCoursesForAssign.length !== 1 ? 's' : ''}
                </button>
                <button
                  onClick={() => setShowBulkAssignModal(false)}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Faculty Assignment Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                {selectedCourse?.facultyId ? 'Reassign Faculty' : 'Assign Faculty'}
              </h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Course
                </label>
                <p className="text-gray-900 font-medium">{selectedCourse?.name}</p>
                <p className="text-gray-600 text-sm">{selectedCourse?.code}</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Select Faculty
                </label>
                <select
                  value={selectedFacultyId}
                  onChange={(e) => setSelectedFacultyId(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Save Assignment
                </button>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Faculty Modal */}
        {showAddFacultyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Add New Faculty</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Faculty Name *
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Enter faculty name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Employee ID *
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Enter employee ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Department *
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="">Select department...</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Management">Management</option>
                    <option value="Arts">Arts</option>
                    <option value="Science">Science</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    console.log('Adding new faculty...')
                    setShowAddFacultyModal(false)
                  }}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                >
                  Add Faculty
                </button>
                <button
                  onClick={() => setShowAddFacultyModal(false)}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
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
