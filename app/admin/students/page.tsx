'use client'
import { Sidebar } from '@/components/sidebar'
import { programmes, students } from '@/lib/mokedata'
import { useState } from 'react'

interface Student {
  id: string
  name: string
  rollNumber: string
  programme: string
  year: number
  email: string
}

export default function StudentsPage() {
  const [selectedProgramme, setSelectedProgramme] = useState<string | null>(null)
  const [showAddStudentModal, setShowAddStudentModal] = useState(false)
  const [selectedProgrammeForAdd, setSelectedProgrammeForAdd] = useState('')
  const [viewMode, setViewMode] = useState<'year' | 'semester'>('year')
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null) // New state for semester filter
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedSemesterForAdd, setSelectedSemesterForAdd] = useState('')

  const getAvailableSemesters = (programmeName: string, year: number) => {
    const programme = programmes.find(p => p.name === programmeName)
    if (!programme || !year) return []
    
    const baseSemester = (year - 1) * 2
    return [baseSemester + 1, baseSemester + 2]
  }

  // Get students for a specific programme
  const getStudentsForProgramme = (programmeName: string) => {
    return students.filter(student => student.programme === programmeName)
  }

  // Convert year to semester (assuming 2 semesters per year)
  const yearToSemesters = (year: number) => {
    return [(year - 1) * 2 + 1, (year - 1) * 2 + 2]
  }

  // Get semester from year (random assignment for demo)
  const getStudentSemester = (student: Student) => {
    const semesters = yearToSemesters(student.year)
    // For demo, randomly assign to odd or even semester
    return semesters[student.id.charCodeAt(0) % 2]
  }

  // Get programme stats
  const getProgrammeStudentStats = (programmeName: string) => {
    const programmeStudents = getStudentsForProgramme(programmeName)
    
    const yearDistribution = programmeStudents.reduce((acc, student) => {
      acc[student.year] = (acc[student.year] || 0) + 1
      return acc
    }, {} as Record<number, number>)

    const semesterDistribution = programmeStudents.reduce((acc, student) => {
      const semester = getStudentSemester(student)
      acc[semester] = (acc[semester] || 0) + 1
      return acc
    }, {} as Record<number, number>)

    const getAvailableSemesters = (programmeName: string, year: number) => {
      const programme = programmes.find(p => p.name === programmeName)
      if (!programme || !year) return []
      
      const baseSemester = (year - 1) * 2
      return [baseSemester + 1, baseSemester + 2]
    }
    
    return {
      totalStudents: programmeStudents.length,
      yearDistribution,
      semesterDistribution
    }
  }

  const handleAddStudent = (programmeName: string) => {
    setSelectedProgrammeForAdd(programmeName)
    setShowAddStudentModal(true)
  }

  const getYearBadgeColor = (year: number) => {
    const colors: Record<number, string> = {
      1: 'bg-green-100 text-green-800',
      2: 'bg-blue-100 text-blue-800', 
      3: 'bg-yellow-100 text-yellow-800',
      4: 'bg-purple-100 text-purple-800'
    }
    return colors[year] || 'bg-gray-100 text-gray-800'
  }

  const getSemesterBadgeColor = (semester: number) => {
    const colors = [
      'bg-red-100 text-red-800',     // Semester 1
      'bg-red-200 text-red-900',     // Semester 2
      'bg-blue-100 text-blue-800',   // Semester 3
      'bg-blue-200 text-blue-900',   // Semester 4
      'bg-yellow-100 text-yellow-800', // Semester 5
      'bg-yellow-200 text-yellow-900', // Semester 6
      'bg-purple-100 text-purple-800', // Semester 7
      'bg-purple-200 text-purple-900'  // Semester 8
    ]
    return colors[semester - 1] || 'bg-gray-100 text-gray-800'
  }

  const groupStudentsBySemester = (programmeStudents: Student[]) => {
    return programmeStudents.reduce((acc, student) => {
      const semester = getStudentSemester(student)
      if (!acc[semester]) acc[semester] = []
      acc[semester].push(student)
      return acc
    }, {} as Record<number, Student[]>)
  }

  const groupStudentsByYear = (programmeStudents: Student[]) => {
    return programmeStudents.reduce((acc, student) => {
      if (!acc[student.year]) acc[student.year] = []
      acc[student.year].push(student)
      return acc
    }, {} as Record<number, Student[]>)
  }

  // Filter students by selected semester
  const getFilteredSemesterStudents = (programmeStudents: Student[]) => {
    const groupedBySemester = groupStudentsBySemester(programmeStudents)
    
    if (selectedSemester === null) {
      return groupedBySemester
    }
    
    return selectedSemester in groupedBySemester 
      ? { [selectedSemester]: groupedBySemester[selectedSemester] }
      : {}
  }

  return (
    <div className="flex">
      <Sidebar role="admin" />
      
      <div className="flex-1 p-8 bg-gray-50">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Students by Programme</h1>
          <button 
            onClick={() => setShowAddStudentModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Student
          </button>
        </div>
        
        {/* Programmes with Student Data */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          {programmes.map((programme) => {
            const stats = getProgrammeStudentStats(programme.name)
            const isSelected = selectedProgramme === programme.id
            const programmeStudents = getStudentsForProgramme(programme.name)
            const maxSemester = programme.duration * 2
            
            return (
              <div 
                key={programme.id} 
                className={`bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg ${
                  isSelected ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div 
                  className="flex justify-between items-start mb-4 cursor-pointer"
                  onClick={() => {
                    setSelectedProgramme(isSelected ? null : programme.id)
                    setSelectedSemester(null) // Reset semester filter when changing programme
                  }}
                >
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900">{programme.name}</h2>
                    <p className="text-gray-600">Department: {programme.department}</p>
                    <p className="text-gray-600">Duration: {programme.duration} years ({maxSemester} semesters)</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">{stats.totalStudents}</p>
                      <p className="text-sm text-gray-600">Students</p>
                    </div>
                    <button 
                      className="text-blue-600 hover:text-blue-800"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedProgramme(isSelected ? null : programme.id)
                        setSelectedSemester(null)
                      }}
                    >
                      {isSelected ? '▼' : '▶'}
                    </button>
                  </div>
                </div>
                
                {/* Toggle View Mode */}
                {isSelected && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setViewMode('year')
                            setSelectedSemester(null)
                          }}
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            viewMode === 'year' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Year View
                        </button>
                        <button
                          onClick={() => {
                            setViewMode('semester')
                            setSelectedSemester(null)
                          }}
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            viewMode === 'semester' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Semester View
                        </button>
                      </div>
                      
                      {/* Semester Filter Dropdown */}
                      {viewMode === 'semester' && (
                        <div className="flex items-center space-x-2">
                          <label className="text-sm font-medium text-gray-700">Filter by Semester:</label>
                          <select
                            value={selectedSemester || ''}
                            onChange={(e) => setSelectedSemester(e.target.value ? Number(e.target.value) : null)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">All Semesters</option>
                            {Array.from({length: maxSemester}, (_, i) => i + 1).map(semester => (
                              <option key={semester} value={semester}>
                                Semester {semester}
                              </option>
                            ))}
                          </select>
                          {selectedSemester && (
                            <button
                              onClick={() => setSelectedSemester(null)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Year/Semester Distribution */}
                {viewMode === 'year' ? (
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    {[1, 2, 3, 4].slice(0, programme.duration).map(year => (
                      <div key={year} className="text-center p-3 bg-gray-50 rounded">
                        <p className="text-xl font-bold text-gray-800">
                          {stats.yearDistribution[year] || 0}
                        </p>
                        <p className="text-sm text-gray-600">Year {year}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {Array.from({length: maxSemester}, (_, i) => i + 1).map(semester => (
                      <div 
                        key={semester} 
                        className={`text-center p-2 rounded cursor-pointer transition-colors ${
                          selectedSemester === semester 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                        onClick={() => setSelectedSemester(selectedSemester === semester ? null : semester)}
                      >
                        <p className="text-lg font-bold">
                          {stats.semesterDistribution[semester] || 0}
                        </p>
                        <p className="text-xs">Sem {semester}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Expanded Student Details */}
                {isSelected && (
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold">
                        Students List - {viewMode === 'year' ? 'Year' : 'Semester'} View
                        {selectedSemester && (
                          <span className="text-blue-600 ml-2">(Semester {selectedSemester} only)</span>
                        )}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddStudent(programme.name)
                        }}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Add Student to {programme.name}
                      </button>
                    </div>
                    
                    {programmeStudents.length > 0 ? (
                      <div className="max-h-96 overflow-y-auto">
                        {viewMode === 'year' ? (
                          // Year-wise grouping
                          Object.entries(groupStudentsByYear(programmeStudents))
                            .sort(([a], [b]) => Number(a) - Number(b))
                            .map(([year, yearStudents]) => (
                              <div key={year} className="mb-4">
                                <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                                  <span className={`px-2 py-1 rounded text-sm mr-2 ${getYearBadgeColor(Number(year))}`}>
                                    Year {year}
                                  </span>
                                  <span className="text-gray-600">({yearStudents.length} students)</span>
                                </h4>
                                <div className="space-y-2 ml-4">
                                  {yearStudents.map((student) => (
                                    <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-3">
                                          <div>
                                            <h5 className="font-medium text-gray-900">{student.name}</h5>
                                            <p className="text-sm text-gray-600">{student.email}</p>
                                            <p className="text-xs text-gray-500">Roll: {student.rollNumber}</p>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                                        <button className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))
                        ) : (
                          // Semester-wise grouping (with filter)
                          Object.entries(getFilteredSemesterStudents(programmeStudents))
                            .sort(([a], [b]) => Number(a) - Number(b))
                            .map(([semester, semesterStudents]) => (
                              <div key={semester} className="mb-4">
                                <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                                  <span className={`px-2 py-1 rounded text-sm mr-2 ${getSemesterBadgeColor(Number(semester))}`}>
                                    Semester {semester}
                                  </span>
                                  <span className="text-gray-600">({semesterStudents.length} students)</span>
                                </h4>
                                <div className="space-y-2 ml-4">
                                  {semesterStudents.map((student) => (
                                    <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-3">
                                          <div>
                                            <h5 className="font-medium text-gray-900">{student.name}</h5>
                                            <p className="text-sm text-gray-600">{student.email}</p>
                                            <p className="text-xs text-gray-500">Roll: {student.rollNumber}</p>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                                        <button className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))
                        )}
                        
                        {/* No students found message for filtered semester */}
                        {viewMode === 'semester' && selectedSemester && 
                         Object.keys(getFilteredSemesterStudents(programmeStudents)).length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <p>No students found in Semester {selectedSemester}.</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>No students enrolled in this programme yet.</p>
                        <button
                          onClick={() => handleAddStudent(programme.name)}
                          className="mt-2 text-blue-600 hover:text-blue-800"
                        >
                          Add the first student
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Overall Statistics */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Overall Student Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{students.length}</p>
              <p className="text-gray-600">Total Students</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {students.filter(s => s.year === 1).length}
              </p>
              <p className="text-gray-600">First Year</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">
                {students.filter(s => s.year === 4).length}
              </p>
              <p className="text-gray-600">Final Year</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{programmes.length}</p>
              <p className="text-gray-600">Programmes</p>
            </div>
          </div>

          {/* Programme Distribution Chart */}
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Student Distribution by Programme</h3>
            <div className="space-y-2">
              {programmes.map(programme => {
                const count = getStudentsForProgramme(programme.name).length
                const percentage = students.length > 0 ? (count / students.length) * 100 : 0
                
                return (
                  <div key={programme.id} className="flex items-center space-x-3">
                    <div className="w-32 text-sm text-gray-600 truncate">
                      {programme.name}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-blue-600 h-4 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600 min-w-12">
                      {count} ({percentage.toFixed(1)}%)
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Add Student Modal */}
                {/* Add Student Modal - Compact Version */}
        {showAddStudentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-lg w-full p-5">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">Add New Student</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Roll Number *
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Roll number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Email address"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Programme *
                  </label>
                  <select
                    value={selectedProgrammeForAdd}
                    onChange={(e) => {
                      setSelectedProgrammeForAdd(e.target.value)
                      setSelectedYear('')
                      setSelectedSemesterForAdd('')
                    }}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="">Select programme...</option>
                    {programmes.map((programme) => (
                      <option key={programme.id} value={programme.name}>
                        {programme.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Year *
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value)
                      setSelectedSemesterForAdd('')
                    }}
                    disabled={!selectedProgrammeForAdd}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:bg-gray-100"
                  >
                    <option value="">Select year...</option>
                    {selectedProgrammeForAdd && programmes
                      .find(p => p.name === selectedProgrammeForAdd)
                      ?.duration && 
                      Array.from(
                        { length: programmes.find(p => p.name === selectedProgrammeForAdd)!.duration }, 
                        (_, i) => i + 1
                      ).map(year => (
                        <option key={year} value={year}>
                          Year {year}
                        </option>
                      ))
                    }
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Semester *
                  </label>
                  <select
                    value={selectedSemesterForAdd}
                    onChange={(e) => setSelectedSemesterForAdd(e.target.value)}
                    disabled={!selectedYear}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:bg-gray-100"
                  >
                    <option value="">Select semester...</option>
                    {selectedYear && selectedProgrammeForAdd && 
                      getAvailableSemesters(selectedProgrammeForAdd, Number(selectedYear)).map(semester => (
                        <option key={semester} value={semester}>
                          Semester {semester}
                        </option>
                      ))
                    }
                  </select>
                </div>
              </div>

              {/* Compact Summary */}
              {selectedProgrammeForAdd && selectedYear && selectedSemesterForAdd && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                  <span className="font-medium text-blue-900">Summary:</span>
                  <span className="text-blue-800 ml-2">
                    {selectedProgrammeForAdd} • Year {selectedYear} • Semester {selectedSemesterForAdd}
                  </span>
                </div>
              )}

              {/* Compact Buttons */}
              <div className="flex space-x-3 mt-5">
                <button
                  onClick={() => {
                    if (!selectedProgrammeForAdd || !selectedYear || !selectedSemesterForAdd) {
                      alert('Please fill in all required fields.')
                      return
                    }
                    
                    console.log('Adding new student with details:', {
                      programme: selectedProgrammeForAdd,
                      year: Number(selectedYear),
                      semester: Number(selectedSemesterForAdd)
                    })
                    
                    setSelectedProgrammeForAdd('')
                    setSelectedYear('')
                    setSelectedSemesterForAdd('')
                    setShowAddStudentModal(false)
                  }}
                  disabled={!selectedProgrammeForAdd || !selectedYear || !selectedSemesterForAdd}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Student
                </button>
                <button
                  onClick={() => {
                    setSelectedProgrammeForAdd('')
                    setSelectedYear('')
                    setSelectedSemesterForAdd('')
                    setShowAddStudentModal(false)
                  }}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded text-sm font-medium hover:bg-gray-700"
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
