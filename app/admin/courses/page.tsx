'use client'
import { Sidebar } from '@/components/sidebar'
import { programmes, courses, faculties } from '@/lib/mokedata'
import type { Course } from '@/lib/mokedata'
import { useState } from 'react'

// Extended interface for comprehensive course data
interface ExtendedCourse {
  id: string
  code: string
  name: string
  programme: string
  semester: number
  credits: number
  facultyId?: string
  lecture: number
  tutorial: number
  practical: number
  type: 'industrial' | 'skill' | 'vac' | 'oe' | 'core' | 'aec' | 'dse' | 'project' | 'int' | 'mooc' | 'other'
  roomNo: string
  hours: number
  studentCount: number
}

export default function CourseManagementPage() {
  const [selectedSession, setSelectedSession] = useState('')
  const [selectedProgramme, setSelectedProgramme] = useState('')
  const [showAddCourseModal, setShowAddCourseModal] = useState(false)
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Form state for adding new course
  const [newCourse, setNewCourse] = useState<Partial<ExtendedCourse>>({
    code: '',
    name: '',
    programme: '',
    semester: 1,
    credits: 3,
    lecture: 3,
    tutorial: 1,
    practical: 0,
    type: 'core',
    roomNo: '',
    hours: 4,
    studentCount: 60
  })

  // Available sessions
  const sessions = [
    '2022-2026',
    '2023-2027',
    '2024-2028',
    '2025-2029',
    '2026-2030'
  ]

  // Course types with descriptions
  const courseTypes = [
    { value: 'core', label: 'Core Course', color: 'bg-blue-100 text-blue-800' },
    { value: 'dse', label: 'Discipline Specific Elective', color: 'bg-purple-100 text-purple-800' },
    { value: 'oe', label: 'Open Elective', color: 'bg-green-100 text-green-800' },
    { value: 'aec', label: 'Ability Enhancement Course', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'vac', label: 'Value Added Course', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'skill', label: 'Skill Enhancement Course', color: 'bg-orange-100 text-orange-800' },
    { value: 'industrial', label: 'Industrial Course', color: 'bg-red-100 text-red-800' },
    { value: 'project', label: 'Project', color: 'bg-pink-100 text-pink-800' },
    { value: 'int', label: 'Internship', color: 'bg-cyan-100 text-cyan-800' },
    { value: 'mooc', label: 'MOOC', color: 'bg-emerald-100 text-emerald-800' },
    { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' }
  ]

  // Get filtered courses
  const getFilteredCourses = () => {
    let filteredCourses = courses

    if (selectedProgramme) {
      const programme = programmes.find(p => p.id === selectedProgramme)
      if (programme) {
        filteredCourses = filteredCourses.filter(course => course.programme === programme.name)
      }
    }

    if (searchTerm) {
      filteredCourses = filteredCourses.filter(course => 
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filteredCourses
  }

  // Get course type details
  const getCourseTypeDetails = (type: string) => {
    return courseTypes.find(ct => ct.value === type) || courseTypes[courseTypes.length - 1]
  }

  // Get faculty name
  const getFacultyName = (facultyId?: string) => {
    if (!facultyId) return 'Unassigned'
    const faculty = faculties.find(f => f.id === facultyId)
    return faculty ? faculty.name : 'Unassigned'
  }

  // Handle adding new course
  const handleAddCourse = () => {
    if (!newCourse.code || !newCourse.name || !selectedProgramme) {
      alert('Please fill in all required fields')
      return
    }

    const programme = programmes.find(p => p.id === selectedProgramme)
    
    const courseToAdd: Course = {
    id: Date.now().toString(),
    code: newCourse.code,
    name: newCourse.name,
    programme: programme?.name || '',
    semester: newCourse.semester || 1,
    credits: newCourse.credits || 3,
    facultyId: undefined, // Set to null for new courses (unassigned)
    lecture: newCourse.lecture || 3,
    tutorial: newCourse.tutorial || 1,
    practical: newCourse.practical || 0,
    type: newCourse.type || 'core',
    roomNo: newCourse.roomNo || '',
    hours: newCourse.hours || 4,
    studentCount: newCourse.studentCount || 60
  }

    console.log('Adding new course:', courseToAdd)
    
    // Reset form
    setNewCourse({
      code: '',
      name: '',
      programme: '',
      semester: 1,
      credits: 3,
      lecture: 3,
      tutorial: 1,
      practical: 0,
      type: 'core',
      roomNo: '',
      hours: 4,
      studentCount: 60
    })
    setShowAddCourseModal(false)
  }

  const filteredCourses = getFilteredCourses()
  const selectedProgrammeData = programmes.find(p => p.id === selectedProgramme)

  return (
    <div className="flex">
      <Sidebar role="admin" />
      
      <div className="flex-1 p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Management</h1>
            <p className="text-gray-600">Manage all courses across programmes and sessions</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowBulkUploadModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              📁 Upload
            </button>
            <button
              onClick={() => setShowAddCourseModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ➕ Add Course
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Courses</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Academic Session *
              </label>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="">Select Session...</option>
                {sessions.map(session => (
                  <option key={session} value={session}>{session}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Programme *
              </label>
              <select
                value={selectedProgramme}
                onChange={(e) => setSelectedProgramme(e.target.value)}
                disabled={!selectedSession}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:bg-gray-100"
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
                Search Courses
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or code..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedSession('')
                  setSelectedProgramme('')
                  setSearchTerm('')
                }}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Course Statistics */}
        {selectedProgramme && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-600">Total Courses</h3>
              <p className="text-3xl font-bold text-blue-600">{filteredCourses.length}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-600">Total Credits</h3>
              <p className="text-3xl font-bold text-green-600">
                {filteredCourses.reduce((sum, course) => sum + course.credits, 0)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-600">Assigned Faculty</h3>
              <p className="text-3xl font-bold text-purple-600">
                {filteredCourses.filter(course => course.facultyId).length}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-600">Programme Duration</h3>
              <p className="text-3xl font-bold text-orange-600">
                {selectedProgrammeData?.duration || 0} Years
              </p>
            </div>
          </div>
        )}

        {/* Course Table */}
        {selectedSession && selectedProgramme ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-blue-600 text-white">
              <h2 className="text-lg font-semibold">
                Course Details - {selectedProgrammeData?.name} ({selectedSession})
              </h2>
            </div>

            {filteredCourses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course Code</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course Name</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Sem</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">L-T-P</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Credits</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Room</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Hours</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Students</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculty</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCourses.map((course, index) => {
                      const courseType = getCourseTypeDetails(course.type || 'core')
                      
                      return (
                        <tr key={course.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{course.code}</td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">{course.name}</div>
                            <div className="text-xs text-gray-500">{course.programme}</div>
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-900">{course.semester}</td>
                          <td className="px-4 py-3 text-center text-sm text-gray-900">
                            {course.lecture || 3}-{course.tutorial || 1}-{course.practical || 0}
                          </td>
                          <td className="px-4 py-3 text-center text-sm font-medium text-gray-900">{course.credits}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${courseType.color}`}>
                              {courseType.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-900">{course.roomNo || 'TBA'}</td>
                          <td className="px-4 py-3 text-center text-sm text-gray-900">{course.hours || 4}</td>
                          <td className="px-4 py-3 text-center text-sm text-gray-900">{course.studentCount || 60}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{getFacultyName(course.facultyId)}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex justify-center space-x-2">
                              <button className="text-blue-600 hover:text-blue-800 text-xs">Edit</button>
                              <button className="text-red-600 hover:text-red-800 text-xs">Delete</button>
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
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-semibold text-gray-600">No Courses Found</h3>
                  <p className="text-gray-500 mt-2">No courses available for the selected criteria</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <div className="text-6xl mb-4">🎓</div>
              <h3 className="text-xl font-semibold text-gray-600">Select Session & Programme</h3>
              <p className="text-gray-500 mt-2">Please select both academic session and programme to view courses</p>
            </div>
          </div>
        )}

        {/* Add Course Modal */}
        {showAddCourseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add New Course</h2>
                <button
                  onClick={() => setShowAddCourseModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">Course Code *</label>
                    <input
                      type="text"
                      value={newCourse.code || ''}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, code: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="e.g., CS301"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">Course Name *</label>
                    <input
                      type="text"
                      value={newCourse.name || ''}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="e.g., Data Structures"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">Semester *</label>
                      <select
                        value={newCourse.semester || 1}
                        onChange={(e) => setNewCourse(prev => ({ ...prev, semester: Number(e.target.value) }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      >
                        {Array.from({length: 8}, (_, i) => i + 1).map(sem => (
                          <option key={sem} value={sem}>Semester {sem}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">Credits *</label>
                      <input
                        type="number"
                        value={newCourse.credits || 3}
                        onChange={(e) => setNewCourse(prev => ({ ...prev, credits: Number(e.target.value) }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        min="1"
                        max="10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">Course Type *</label>
                    <select
                      value={newCourse.type || 'core'}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      {courseTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Academic Structure */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Academic Structure</h3>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">Lecture Hours</label>
                      <input
                        type="number"
                        value={newCourse.lecture || 3}
                        onChange={(e) => setNewCourse(prev => ({ ...prev, lecture: Number(e.target.value) }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        min="0"
                        max="10"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">Tutorial Hours</label>
                      <input
                        type="number"
                        value={newCourse.tutorial || 1}
                        onChange={(e) => setNewCourse(prev => ({ ...prev, tutorial: Number(e.target.value) }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        min="0"
                        max="10"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">Practical Hours</label>
                      <input
                        type="number"
                        value={newCourse.practical || 0}
                        onChange={(e) => setNewCourse(prev => ({ ...prev, practical: Number(e.target.value) }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        min="0"
                        max="10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">Room Number</label>
                      <input
                        type="text"
                        value={newCourse.roomNo || ''}
                        onChange={(e) => setNewCourse(prev => ({ ...prev, roomNo: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="e.g., LH-101"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">Total Hours/Week</label>
                      <input
                        type="number"
                        value={newCourse.hours || 4}
                        onChange={(e) => setNewCourse(prev => ({ ...prev, hours: Number(e.target.value) }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        min="1"
                        max="20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">Number of Students</label>
                    <input
                      type="number"
                      value={newCourse.studentCount || 60}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, studentCount: Number(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      min="1"
                      max="200"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <h4 className="font-medium text-blue-900 mb-2">Course Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-blue-800">
                    <span className="font-medium">L-T-P:</span> {newCourse.lecture || 3}-{newCourse.tutorial || 1}-{newCourse.practical || 0}
                  </div>
                  <div className="text-blue-800">
                    <span className="font-medium">Credits:</span> {newCourse.credits || 3}
                  </div>
                  <div className="text-blue-800">
                    <span className="font-medium">Total Hours:</span> {newCourse.hours || 4}/week
                  </div>
                  <div className="text-blue-800">
                    <span className="font-medium">Capacity:</span> {newCourse.studentCount || 60} students
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-8">
                <button
                  onClick={handleAddCourse}
                  disabled={!newCourse.code || !newCourse.name || !selectedProgramme}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  Add Course
                </button>
                <button
                  onClick={() => setShowAddCourseModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Upload Modal */}
        {/* Bulk Upload Modal - Compact Version */}
        {showBulkUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Upload Courses</h2>
                <button
                  onClick={() => setShowBulkUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2 text-sm">Download Template</h3>
                  <p className="text-xs text-gray-600 mb-3">
                    Download the Excel template with required format.
                  </p>
                  <button className="bg-green-100 text-green-800 px-3 py-2 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium">
                    📥 Download Template
                  </button>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-900 mb-2 text-sm">Upload File</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <div className="text-gray-400 mb-3">
                      <div className="text-3xl mb-2">📁</div>
                      <p className="text-xs">Drag and drop Excel file here</p>
                      <p className="text-xs text-gray-500 mt-1">or click to browse</p>
                    </div>
                    <button className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      Choose File
                    </button>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <h4 className="font-medium text-yellow-900 mb-1 text-sm">Required Columns:</h4>
                  <div className="text-xs text-yellow-800 space-y-1">
                    <p>• Course Code, Name, Semester, Credits</p>
                    <p>• L-T-P Hours, Type, Room, Students</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-5">
                <button
                  className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 font-medium transition-colors text-sm"
                >
                  Upload Courses
                </button>
                <button
                  onClick={() => setShowBulkUploadModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 font-medium transition-colors text-sm"
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
