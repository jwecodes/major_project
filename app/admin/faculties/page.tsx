'use client'
import { Sidebar } from '@/components/sidebar'
import { programmes, courses, faculties } from '@/lib/mokedata'
import type { Course } from '@/lib/mokedata'
import { useState } from 'react'

// Extended Faculty interface for additional details
interface ExtendedFaculty {
  id: string
  name: string
  employeeId: string
  department: string
  email: string
  designation: string
  contactNo: string
  courses: string[]
}

export default function FacultyCourseAllocationPage() {
  const [selectedProgramme, setSelectedProgramme] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('')
  const [showAllocationModal, setShowAllocationModal] = useState(false)
  const [showAddFacultyModal, setShowAddFacultyModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFacultyForAllocation, setSelectedFacultyForAllocation] = useState('')
  
  // Form state for adding new faculty
  const [newFaculty, setNewFaculty] = useState({
    name: '',
    employeeId: '',
    department: '',
    email: '',
    designation: '',
    contactNo: ''
  })

  // Extended faculty data with additional details
  const extendedFaculties: ExtendedFaculty[] = [
    {
      id: '1',
      name: 'Dr. John Smith',
      employeeId: 'FAC001',
      department: 'Engineering',
      email: 'john.smith@university.edu',
      designation: 'Professor',
      contactNo: '+1-234-567-8901',
      courses: ['1', '2', '7']
    },
    {
      id: '2',
      name: 'Prof. Sarah Johnson',
      employeeId: 'FAC002',
      department: 'Engineering',
      email: 'sarah.johnson@university.edu',
      designation: 'Associate Professor',
      contactNo: '+1-234-567-8902',
      courses: ['4', '8']
    },
    {
      id: '3',
      name: 'Dr. Michael Brown',
      employeeId: 'FAC003',
      department: 'Management',
      email: 'michael.brown@university.edu',
      designation: 'Assistant Professor',
      contactNo: '+1-234-567-8903',
      courses: ['5', '9']
    },
    {
      id: '4',
      name: 'Dr. Emily Davis',
      employeeId: 'FAC004',
      department: 'Engineering',
      email: 'emily.davis@university.edu',
      designation: 'Associate Professor',
      contactNo: '+1-234-567-8904',
      courses: []
    },
    {
      id: '5',
      name: 'Prof. Robert Wilson',
      employeeId: 'FAC005',
      department: 'Management',
      email: 'robert.wilson@university.edu',
      designation: 'Professor',
      contactNo: '+1-234-567-8905',
      courses: []
    }
  ]

  // Get courses for selected programme
  const getCoursesForProgramme = () => {
    if (!selectedProgramme) return []
    const programme = programmes.find(p => p.id === selectedProgramme)
    if (!programme) return []
    return courses.filter(course => course.programme === programme.name)
  }

  // Get faculties for selected course
  const getFacultiesForCourse = () => {
    if (!selectedCourse) return extendedFaculties

    // Get programme for the selected course
    const course = courses.find(c => c.id === selectedCourse)
    if (!course) return extendedFaculties

    const programme = programmes.find(p => p.name === course.programme)
    if (!programme) return extendedFaculties

    // Filter faculties by department
    let filteredFaculties = extendedFaculties.filter(faculty => 
      faculty.department === programme.code
    )

    // Apply search filter
    if (searchTerm) {
      filteredFaculties = filteredFaculties.filter(faculty =>
        faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faculty.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faculty.designation.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filteredFaculties
  }

  // Check if faculty is assigned to selected course
  const isFacultyAssignedToCourse = (facultyId: string) => {
    if (!selectedCourse) return false
    const course = courses.find(c => c.id === selectedCourse)
    return course?.facultyId === facultyId
  }

  // Get faculty course count
  const getFacultyCourseCount = (facultyId: string) => {
    return courses.filter(course => course.facultyId === facultyId).length
  }

  // Get faculty workload (total credits)
  const getFacultyWorkload = (facultyId: string) => {
    const facultyCourses = courses.filter(course => course.facultyId === facultyId)
    return facultyCourses.reduce((sum, course) => sum + course.credits, 0)
  }

  // Handle course allocation
  const handleCourseAllocation = () => {
    if (!selectedCourse || !selectedFacultyForAllocation) {
      alert('Please select both course and faculty')
      return
    }

    const course = courses.find(c => c.id === selectedCourse)
    const faculty = extendedFaculties.find(f => f.id === selectedFacultyForAllocation)

    console.log(`Allocating course "${course?.name}" to faculty "${faculty?.name}"`)
    
    setShowAllocationModal(false)
    setSelectedFacultyForAllocation('')
  }

  // Handle adding new faculty
  const handleAddFaculty = () => {
    if (!newFaculty.name || !newFaculty.employeeId || !newFaculty.department) {
      alert('Please fill in all required fields')
      return
    }

    console.log('Adding new faculty:', {
      ...newFaculty,
      id: Date.now().toString(),
      courses: []
    })

    setNewFaculty({
      name: '',
      employeeId: '',
      department: '',
      email: '',
      designation: '',
      contactNo: ''
    })
    setShowAddFacultyModal(false)
  }

  const programmeCourses = getCoursesForProgramme()
  const filteredFaculties = getFacultiesForCourse()
  const selectedCourseData = courses.find(c => c.id === selectedCourse)
  const selectedProgrammeData = programmes.find(p => p.id === selectedProgramme)

  // Get designation color
  const getDesignationColor = (designation: string) => {
    const colors: Record<string, string> = {
      'Professor': 'bg-purple-100 text-purple-800',
      'Associate Professor': 'bg-blue-100 text-blue-800',
      'Assistant Professor': 'bg-green-100 text-green-800',
      'Lecturer': 'bg-orange-100 text-orange-800'
    }
    return colors[designation] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="flex">
      <Sidebar role="admin" />
      
      <div className="flex-1 p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Faculty Course Allocation Management</h1>
            <p className="text-gray-600">Manage faculty assignments and course allocations</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddFacultyModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              ➕ Add Faculty
            </button>
            <button
              onClick={() => setShowAllocationModal(true)}
              disabled={!selectedCourse}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🎯 Faculty Course Allocation
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Faculty & Courses</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Programme *
              </label>
              <select
                value={selectedProgramme}
                onChange={(e) => {
                  setSelectedProgramme(e.target.value)
                  setSelectedCourse('') // Reset course selection
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="">Select Programme...</option>
                {programmes.map(programme => (
                  <option key={programme.id} value={programme.id}>
                    {programme.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Code *
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                disabled={!selectedProgramme}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:bg-gray-100"
              >
                <option value="">Select Course...</option>
                {programmeCourses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Faculty
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, ID, or designation..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedProgramme('')
                  setSelectedCourse('')
                  setSearchTerm('')
                }}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Course Information */}
        {selectedCourse && selectedCourseData && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Course Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-sm font-medium text-blue-600">Course Code</p>
                <p className="text-lg font-bold text-blue-900">{selectedCourseData.code}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-sm font-medium text-green-600">Course Name</p>
                <p className="text-lg font-bold text-green-900">{selectedCourseData.name}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <p className="text-sm font-medium text-purple-600">Semester</p>
                <p className="text-lg font-bold text-purple-900">{selectedCourseData.semester}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <p className="text-sm font-medium text-orange-600">Credits</p>
                <p className="text-lg font-bold text-orange-900">{selectedCourseData.credits}</p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg text-center">
                <p className="text-sm font-medium text-indigo-600">L-T-P</p>
                <p className="text-lg font-bold text-indigo-900">
                  {selectedCourseData.lecture || 3}-{selectedCourseData.tutorial || 1}-{selectedCourseData.practical || 0}
                </p>
              </div>
              <div className="bg-pink-50 p-4 rounded-lg text-center">
                <p className="text-sm font-medium text-pink-600">Students</p>
                <p className="text-lg font-bold text-pink-900">{selectedCourseData.studentCount || 60}</p>
              </div>
            </div>
          </div>
        )}

        {/* Faculty Details Table */}
        {selectedProgramme ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-blue-600 text-white">
              <h2 className="text-lg font-semibold">
                Faculty Details - {selectedProgrammeData?.code} Department
                {selectedCourse && ` (${selectedCourseData?.code})`}
              </h2>
            </div>

            {filteredFaculties.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculty ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculty Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact No</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Courses</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Workload</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredFaculties.map((faculty, index) => {
                      const isAssigned = isFacultyAssignedToCourse(faculty.id)
                      const courseCount = getFacultyCourseCount(faculty.id)
                      const workload = getFacultyWorkload(faculty.id)
                      
                      return (
                        <tr key={faculty.id} className={`hover:bg-gray-50 ${isAssigned ? 'bg-blue-50' : ''}`}>
                          <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{faculty.employeeId}</td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">{faculty.name}</div>
                            <div className="text-xs text-gray-500">{faculty.department}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getDesignationColor(faculty.designation)}`}>
                              {faculty.designation}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{faculty.contactNo}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{faculty.email}</td>
                          <td className="px-4 py-3 text-center text-sm font-medium text-blue-600">{courseCount}</td>
                          <td className="px-4 py-3 text-center text-sm font-medium text-green-600">{workload} Credits</td>
                          <td className="px-4 py-3 text-center">
                            {isAssigned ? (
                              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                ✅ Assigned
                              </span>
                            ) : (
                              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                Available
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex justify-center space-x-2">
                              <button 
                                onClick={() => {
                                  setSelectedFacultyForAllocation(faculty.id)
                                  setShowAllocationModal(true)
                                }}
                                disabled={!selectedCourse}
                                className="text-blue-600 hover:text-blue-800 text-xs disabled:text-gray-400"
                              >
                                {isAssigned ? 'Reassign' : 'Assign'}
                              </button>
                              <button className="text-green-600 hover:text-green-800 text-xs">View</button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <div className="text-6xl mb-4">👨‍🏫</div>
                  <h3 className="text-xl font-semibold text-gray-600">No Faculty Found</h3>
                  <p className="text-gray-500 mt-2">
                    {searchTerm ? 'No faculty matches your search criteria' : 'No faculty available for the selected programme'}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <div className="text-6xl mb-4">🎓</div>
              <h3 className="text-xl font-semibold text-gray-600">Select Programme & Course</h3>
              <p className="text-gray-500 mt-2">Please select a programme and course to view faculty allocation options</p>
            </div>
          </div>
        )}

        {/* Faculty Course Allocation Modal */}
        {showAllocationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Faculty Course Allocation</h2>
                <button
                  onClick={() => setShowAllocationModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Course Information</h3>
                  {selectedCourseData && (
                    <div className="text-sm text-blue-800">
                      <p><strong>Course:</strong> {selectedCourseData.code} - {selectedCourseData.name}</p>
                      <p><strong>Programme:</strong> {selectedCourseData.programme}</p>
                      <p><strong>Semester:</strong> {selectedCourseData.semester} | <strong>Credits:</strong> {selectedCourseData.credits}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Select Faculty for Allocation *
                  </label>
                  <select
                    value={selectedFacultyForAllocation}
                    onChange={(e) => setSelectedFacultyForAllocation(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="">Choose faculty...</option>
                    {filteredFaculties.map(faculty => (
                      <option key={faculty.id} value={faculty.id}>
                        {faculty.name} ({faculty.employeeId}) - {getFacultyCourseCount(faculty.id)} courses
                      </option>
                    ))}
                  </select>
                </div>

                {selectedFacultyForAllocation && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">Selected Faculty</h4>
                    {(() => {
                      const faculty = extendedFaculties.find(f => f.id === selectedFacultyForAllocation)
                      return faculty ? (
                        <div className="text-sm text-green-800">
                          <p><strong>Name:</strong> {faculty.name}</p>
                          <p><strong>Designation:</strong> {faculty.designation}</p>
                          <p><strong>Current Workload:</strong> {getFacultyWorkload(faculty.id)} credits ({getFacultyCourseCount(faculty.id)} courses)</p>
                        </div>
                      ) : null
                    })()}
                  </div>
                )}
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleCourseAllocation}
                  disabled={!selectedFacultyForAllocation}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  Allocate Course
                </button>
                <button
                  onClick={() => setShowAllocationModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 font-medium transition-colors"
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
            <div className="bg-white rounded-xl max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Add New Faculty</h2>
                <button
                  onClick={() => setShowAddFacultyModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">Faculty Name *</label>
                  <input
                    type="text"
                    value={newFaculty.name}
                    onChange={(e) => setNewFaculty(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Enter faculty name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">Employee ID *</label>
                  <input
                    type="text"
                    value={newFaculty.employeeId}
                    onChange={(e) => setNewFaculty(prev => ({ ...prev, employeeId: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="e.g., FAC006"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">Department *</label>
                  <select
                    value={newFaculty.department}
                    onChange={(e) => setNewFaculty(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="">Select Department...</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Management">Management</option>
                    <option value="Arts">Arts</option>
                    <option value="Science">Science</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">Designation</label>
                  <select
                    value={newFaculty.designation}
                    onChange={(e) => setNewFaculty(prev => ({ ...prev, designation: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="">Select Designation...</option>
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Lecturer">Lecturer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">Contact Number</label>
                  <input
                    type="text"
                    value={newFaculty.contactNo}
                    onChange={(e) => setNewFaculty(prev => ({ ...prev, contactNo: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="+1-234-567-8900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">Email</label>
                  <input
                    type="email"
                    value={newFaculty.email}
                    onChange={(e) => setNewFaculty(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="faculty@university.edu"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleAddFaculty}
                  disabled={!newFaculty.name || !newFaculty.employeeId || !newFaculty.department}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  Add Faculty
                </button>
                <button
                  onClick={() => setShowAddFacultyModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 font-medium transition-colors"
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
