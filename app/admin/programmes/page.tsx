'use client'
import { Sidebar } from '@/components/sidebar'
import { programmes, courses, faculties } from '@/lib/mokedata'
import { useState } from 'react'

export default function ProgrammesPage() {
  const [selectedProgramme, setSelectedProgramme] = useState<string | null>(null)
  const [showAddProgrammeModal, setShowAddProgrammeModal] = useState(false)
  const [viewMode, setViewMode] = useState<'courses' | 'faculties'>('courses')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('')
  
  // Form state for adding new programme
  const [newProgramme, setNewProgramme] = useState({
    name: '',
    department: '',
    duration: 3
  })

  // Get courses for a specific programme
  const getCoursesForProgramme = (programmeName: string) => {
    return courses.filter(course => course.programme === programmeName)
  }

  // Get faculties teaching in a specific programme - FIXED VERSION
  const getFacultiesForProgramme = (programmeName: string) => {
    const programmeCourses = getCoursesForProgramme(programmeName)
    const facultyIds = [...new Set(programmeCourses.map(course => course.facultyId).filter(Boolean))]
    
    return facultyIds.map(facultyId => {
      const faculty = faculties.find(f => f.id === facultyId)
      if (!faculty) return null // Return null if faculty not found
      
      const assignedCourses = programmeCourses.filter(course => course.facultyId === facultyId)
      
      return {
        ...faculty,
        assignedCourses,
        totalCredits: assignedCourses.reduce((sum, course) => sum + course.credits, 0)
      }
    }).filter(Boolean) // Filter out null values
  }

  // Group courses by semester
  const getCoursesBySemester = (programmeName: string) => {
    const programmeCourses = getCoursesForProgramme(programmeName)
    const grouped: { [key: number]: any[] } = {}
    
    programmeCourses.forEach(course => {
      if (!grouped[course.semester]) {
        grouped[course.semester] = []
      }
      grouped[course.semester].push(course)
    })
    
    return grouped
  }

  // Get faculty name by ID with enhanced display
  const getFacultyName = (facultyId: string | null) => {
    if (!facultyId) return { name: 'Unassigned', status: 'unassigned' }
    const faculty = faculties.find(f => f.id === facultyId)
    return faculty ? { name: faculty.name, status: 'assigned', department: faculty.department } : { name: 'Unassigned', status: 'unassigned' }
  }

  // Handle adding new programme
  const handleAddProgramme = () => {
    if (!newProgramme.name || !newProgramme.department) {
      alert('Please fill in all required fields')
      return
    }
    
    console.log('Adding new programme:', {
      ...newProgramme,
      id: Date.now().toString(),
      totalStudents: 0
    })
    
    setNewProgramme({ name: '', department: '', duration: 3 })
    setShowAddProgrammeModal(false)
  }

  // Filter programmes based on search and department
  const getFilteredProgrammes = () => {
    return programmes.filter(programme => {
      const matchesSearch = programme.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDepartment = !filterDepartment || programme.department === filterDepartment
      return matchesSearch && matchesDepartment
    })
  }

  // Get programme statistics
  const getProgrammeStats = (programmeName: string) => {
    const programmeCourses = getCoursesForProgramme(programmeName)
    const programmeFaculties = getFacultiesForProgramme(programmeName)
    const assignedCourses = programmeCourses.filter(course => course.facultyId).length
    const totalCredits = programmeCourses.reduce((sum, course) => sum + course.credits, 0)
    
    return {
      totalCourses: programmeCourses.length,
      assignedCourses,
      unassignedCourses: programmeCourses.length - assignedCourses,
      totalCredits,
      totalFaculties: programmeFaculties.length,
      assignmentRate: programmeCourses.length > 0 ? Math.round((assignedCourses / programmeCourses.length) * 100) : 0
    }
  }

  const filteredProgrammes = getFilteredProgrammes()
  const uniqueDepartments = [...new Set(programmes.map(p => p.department))]

  return (
    <div className="flex">
      <Sidebar role="admin" />
      
      <div className="flex-1 p-6 bg-gray-50 min-h-screen">
        {/* Enhanced Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Programme Management</h1>
            <p className="text-gray-600">Manage programmes, courses, and faculty assignments</p>
          </div>
          <button 
            onClick={() => setShowAddProgrammeModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            ➕ Add Programme
          </button>
        </div>

        {/* Enhanced Filters and Search */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter & Search</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Programmes</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by programme name..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Department</label>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Departments</option>
                {uniqueDepartments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterDepartment('')
                }}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-2xl">🎓</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Programmes</p>
                <p className="text-3xl font-bold text-blue-600">{filteredProgrammes.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-2xl">📚</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-3xl font-bold text-green-600">
                  {filteredProgrammes.reduce((sum, prog) => sum + getCoursesForProgramme(prog.name).length, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <span className="text-2xl">👨‍🏫</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Teaching Faculties</p>
                <p className="text-3xl font-bold text-purple-600">
                  {filteredProgrammes.reduce((sum, prog) => sum + getProgrammeStats(prog.name).totalFaculties, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Assigned</p>
                <p className="text-3xl font-bold text-indigo-600">
                  {filteredProgrammes.reduce((sum, prog) => sum + getProgrammeStats(prog.name).assignedCourses, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unassigned</p>
                <p className="text-3xl font-bold text-orange-600">
                  {filteredProgrammes.reduce((sum, prog) => sum + getProgrammeStats(prog.name).unassignedCourses, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Programmes Grid */}
        <div className="space-y-6">
          {filteredProgrammes.length > 0 ? (
            filteredProgrammes.map((programme) => {
              const isSelected = selectedProgramme === programme.id
              const coursesBySemester = getCoursesBySemester(programme.name)
              const programmeFaculties = getFacultiesForProgramme(programme.name)
              const maxSemester = programme.duration * 2
              const stats = getProgrammeStats(programme.name)
              
              return (
                <div 
                  key={programme.id} 
                  className={`bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md ${
                    isSelected ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'
                  }`}
                >
                  {/* Programme Header */}
                  <div 
                    className="p-6 cursor-pointer"
                    onClick={() => setSelectedProgramme(isSelected ? null : programme.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h2 className="text-xl font-bold text-gray-900">{programme.name}</h2>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {programme.department}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-lg font-bold text-gray-900">{programme.duration}</p>
                            <p className="text-xs text-gray-600">Years</p>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-lg font-bold text-gray-900">{maxSemester}</p>
                            <p className="text-xs text-gray-600">Semesters</p>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-lg font-bold text-gray-900">{programme.totalStudents}</p>
                            <p className="text-xs text-gray-600">Students</p>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-lg font-bold text-gray-900">{stats.totalCourses}</p>
                            <p className="text-xs text-gray-600">Courses</p>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-lg font-bold text-gray-900">{stats.totalFaculties}</p>
                            <p className="text-xs text-gray-600">Faculties</p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Faculty Assignment Progress</span>
                            <span className="text-sm font-bold text-gray-900">{stats.assignmentRate}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                stats.assignmentRate >= 80 ? 'bg-green-500' :
                                stats.assignmentRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${stats.assignmentRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <button 
                        className={`ml-6 p-2 rounded-lg transition-colors ${
                          isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedProgramme(isSelected ? null : programme.id)
                        }}
                      >
                        {isSelected ? '📂' : '📁'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isSelected && (
                    <div className="border-t border-gray-200 p-6">
                      {/* View Mode Toggle */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setViewMode('courses')}
                              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                viewMode === 'courses' 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              📚 Courses View
                            </button>
                            <button
                              onClick={() => setViewMode('faculties')}
                              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                viewMode === 'faculties' 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              👨‍🏫 Faculties View
                            </button>
                          </div>
                        </div>

                        {viewMode === 'courses' ? (
                          // Courses View (Semester-wise)
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Semester Overview</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
                              {Array.from({length: maxSemester}, (_, i) => i + 1).map(sem => {
                                const semesterCourses = coursesBySemester[sem] || []
                                
                                return (
                                  <div key={sem} className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                                    <p className="text-lg font-bold text-blue-600">{semesterCourses.length}</p>
                                    <p className="text-xs text-blue-800">Sem {sem}</p>
                                  </div>
                                )
                              })}
                            </div>

                            {/* Course Details */}
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                              {Array.from({length: maxSemester}, (_, i) => i + 1).map(semester => {
                                const semesterCourses = coursesBySemester[semester] || []
                                
                                return (
                                  <div key={semester} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                      <h4 className="font-semibold text-gray-900 flex items-center">
                                        <span className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm mr-3">
                                          Semester {semester}
                                        </span>
                                        <span className="text-gray-600 text-sm">
                                          ({semesterCourses.length} courses)
                                        </span>
                                      </h4>
                                      <div className="text-sm text-gray-500">
                                        Credits: {semesterCourses.reduce((sum, course) => sum + course.credits, 0)}
                                      </div>
                                    </div>
                                    
                                    {semesterCourses.length > 0 ? (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {semesterCourses.map((course) => {
                                          const facultyInfo = getFacultyName(course.facultyId)
                                          
                                          return (
                                            <div key={course.id} className="p-3 bg-gray-50 rounded-lg border">
                                              <h5 className="font-medium text-gray-900 text-sm mb-1">{course.name}</h5>
                                              <p className="text-xs text-gray-600 mb-2">
                                                📚 {course.code} • {course.credits} credits
                                              </p>
                                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                facultyInfo.status === 'assigned' 
                                                  ? 'bg-green-100 text-green-800' 
                                                  : 'bg-red-100 text-red-800'
                                              }`}>
                                                {facultyInfo.status === 'assigned' ? '✅' : '❌'} {facultyInfo.name}
                                              </span>
                                            </div>
                                          )
                                        })}
                                      </div>
                                    ) : (
                                      <div className="text-center py-6 text-gray-500">
                                        <p className="text-sm">No courses scheduled for this semester</p>
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ) : (
                          // Faculties View - FIXED VERSION
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              Programme Faculties ({programmeFaculties.length})
                            </h3>
                            
                            {programmeFaculties.length > 0 ? (
                              <div className="space-y-4 max-h-96 overflow-y-auto">
                                {programmeFaculties.map((faculty) => {
                                  // Add safety check
                                  if (!faculty) return null
                                  
                                  return (
                                    <div key={faculty.id} className="border border-gray-200 rounded-lg p-4">
                                      <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                          <div className="flex items-center space-x-3 mb-2">
                                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                              <span className="text-purple-600 font-semibold">
                                                {faculty.name?.split(' ').map(n => n[0]).join('') || 'N/A'}
                                              </span>
                                            </div>
                                            <div>
                                              <h4 className="font-semibold text-gray-900">{faculty.name || 'Unknown Faculty'}</h4>
                                              <p className="text-sm text-gray-600">{faculty.employeeId || 'N/A'} • {faculty.department || 'N/A'}</p>
                                              <p className="text-xs text-gray-500">{faculty.email || 'N/A'}</p>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <div className="flex space-x-4">
                                            <div className="text-center">
                                              <p className="text-lg font-bold text-blue-600">{faculty.assignedCourses?.length || 0}</p>
                                              <p className="text-xs text-gray-600">Courses</p>
                                            </div>
                                            <div className="text-center">
                                              <p className="text-lg font-bold text-green-600">{faculty.totalCredits || 0}</p>
                                              <p className="text-xs text-gray-600">Credits</p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Faculty's Courses */}
                                      <div className="ml-13">
                                        <h5 className="font-medium text-gray-800 mb-2">Teaching Subjects:</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                          {faculty.assignedCourses?.length > 0 ? (
                                            faculty.assignedCourses.map((course) => (
                                              <div key={course.id} className="flex items-center justify-between p-2 bg-purple-50 rounded border border-purple-200">
                                                <div>
                                                  <p className="font-medium text-sm text-purple-900">{course.name}</p>
                                                  <p className="text-xs text-purple-700">{course.code} • Sem {course.semester}</p>
                                                </div>
                                                <span className="text-xs font-medium text-purple-700 bg-purple-200 px-2 py-1 rounded">
                                                  {course.credits} Credits
                                                </span>
                                              </div>
                                            ))
                                          ) : (
                                            <p className="text-sm text-gray-500">No courses assigned</p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            ) : (
                              <div className="text-center py-8 text-gray-500">
                                <div className="text-4xl mb-2">👨‍🏫</div>
                                <p className="text-sm">No faculties assigned to this programme yet</p>
                                <p className="text-xs text-gray-400 mt-1">Assign faculties to courses to see them here</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="text-gray-400 mb-4">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-600">No Programmes Found</h3>
                <p className="text-gray-500 mt-2">
                  {searchTerm || filterDepartment 
                    ? 'Try adjusting your search criteria' 
                    : 'Start by adding your first programme'}
                </p>
              </div>
              <button
                onClick={() => setShowAddProgrammeModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Add Programme
              </button>
            </div>
          )}
        </div>

        {/* Add Programme Modal */}
        {showAddProgrammeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add New Programme</h2>
                <button
                  onClick={() => setShowAddProgrammeModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Programme Name *
                  </label>
                  <input
                    type="text"
                    value={newProgramme.name}
                    onChange={(e) => setNewProgramme(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Computer Science Engineering"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Department *
                  </label>
                  <select
                    value={newProgramme.department}
                    onChange={(e) => setNewProgramme(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Department...</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Management">Management</option>
                    <option value="Arts">Arts</option>
                    <option value="Science">Science</option>
                    <option value="Commerce">Commerce</option>
                    <option value="Medicine">Medicine</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Duration (Years) *
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[2, 3, 4, 5, 6].map(duration => (
                      <button
                        key={duration}
                        type="button"
                        onClick={() => setNewProgramme(prev => ({ ...prev, duration }))}
                        className={`p-3 rounded-lg border text-center transition-colors ${
                          newProgramme.duration === duration
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-bold">{duration}</div>
                        <div className="text-xs">Years</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-600 text-lg">💡</span>
                    <div>
                      <p className="text-sm text-blue-800 font-medium">Programme Summary</p>
                      <p className="text-sm text-blue-700 mt-1">
                        This programme will have <strong>{newProgramme.duration * 2} semesters</strong>.
                        You can add courses after creation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-8">
                <button
                  onClick={handleAddProgramme}
                  disabled={!newProgramme.name || !newProgramme.department}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  Create Programme
                </button>
                <button
                  onClick={() => setShowAddProgrammeModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 font-medium transition-colors"
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
