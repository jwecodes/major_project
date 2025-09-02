'use client'
import { Sidebar } from '@/components/sidebar'
import { programmes, courses } from '@/lib/mokedata'
import { useState } from 'react'

export default function ProgrammesPage() {
  const [selectedSession, setSelectedSession] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterByCode, setFilterByCode] = useState('')
  const [showAddProgrammeModal, setShowAddProgrammeModal] = useState(false)
  
  // Form state for adding new programme
  const [newProgramme, setNewProgramme] = useState({
    name: '',
    code: '',
    duration: 3,
    session: ''
  })

  // Available sessions
  const sessions = [
    '2022-2026',
    '2023-2027',
    '2024-2028',
    '2025-2029',
    '2026-2030'
  ]

  // Extended programme data with sessions
  const extendedProgrammes = programmes.map(programme => ({
    ...programme,
    session: selectedSession || '2024-2028' // Default session for display
  }))

  // Get total credits for a programme
  const getTotalCreditsForProgramme = (programmeName: string) => {
    const programmeCourses = courses.filter(course => course.programme === programmeName)
    return programmeCourses.reduce((sum, course) => sum + course.credits, 0)
  }

  // Get programme statistics
  const getProgrammeStats = (programmeName: string) => {
    const programmeCourses = courses.filter(course => course.programme === programmeName)
    const assignedCourses = programmeCourses.filter(course => course.facultyId).length
    
    return {
      totalCourses: programmeCourses.length,
      assignedCourses,
      unassignedCourses: programmeCourses.length - assignedCourses,
      totalCredits: getTotalCreditsForProgramme(programmeName)
    }
  }

  // Filter programmes based on session, search and code
  const getFilteredProgrammes = () => {
    let filtered = extendedProgrammes

    // Filter by session
    if (selectedSession) {
      filtered = filtered.filter(programme => programme.session === selectedSession)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(programme => 
        programme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        programme.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by programme code
    if (filterByCode) {
      filtered = filtered.filter(programme => programme.code === filterByCode)
    }

    return filtered
  }

  // Handle adding new programme
  const handleAddProgramme = () => {
    if (!newProgramme.name || !newProgramme.code || !selectedSession) {
      alert('Please fill in all required fields and select a session')
      return
    }
    
    console.log('Adding new programme:', {
      ...newProgramme,
      id: Date.now().toString(),
      totalStudents: 0,
      session: selectedSession
    })
    
    setNewProgramme({ name: '', code: '', duration: 3, session: '' })
    setShowAddProgrammeModal(false)
  }

  const filteredProgrammes = getFilteredProgrammes()
  const uniqueCodes = [...new Set(programmes.map(p => p.code))]

  return (
    <div className="flex">
      <Sidebar role="admin" />
      
      <div className="flex-1 p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Programme Management</h1>
            <p className="text-gray-600">Manage programmes across different academic sessions</p>
          </div>
          <button 
            onClick={() => setShowAddProgrammeModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            ➕ Add Programme
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Programmes</h3>
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
                Programme Code
              </label>
              <select
                value={filterByCode}
                onChange={(e) => setFilterByCode(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="">All Codes</option>
                {uniqueCodes.map(code => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Programmes
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
                  setSearchTerm('')
                  setFilterByCode('')
                }}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Programme Statistics */}
        {selectedSession && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-600">Total Programmes</h3>
              <p className="text-3xl font-bold text-blue-600">{filteredProgrammes.length}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-600">Total Credits</h3>
              <p className="text-3xl font-bold text-green-600">
                {filteredProgrammes.reduce((sum, prog) => sum + getTotalCreditsForProgramme(prog.name), 0)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-600">Total Students</h3>
              <p className="text-3xl font-bold text-purple-600">
                {filteredProgrammes.reduce((sum, prog) => sum + prog.totalStudents, 0)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-600">Avg Duration</h3>
              <p className="text-3xl font-bold text-orange-600">
                {filteredProgrammes.length > 0 
                  ? Math.round(filteredProgrammes.reduce((sum, prog) => sum + prog.duration, 0) / filteredProgrammes.length) 
                  : 0} Years
              </p>
            </div>
          </div>
        )}

        {/* Programme Table */}
        {selectedSession ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-blue-600 text-white">
              <h2 className="text-lg font-semibold">
                Programme Details - Academic Session {selectedSession}
              </h2>
            </div>

            {filteredProgrammes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Programme Code</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Programme Name</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Duration</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Session</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total Credits</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total Students</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Courses</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Assignment Rate</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProgrammes.map((programme, index) => {
                      const stats = getProgrammeStats(programme.name)
                      const assignmentRate = stats.totalCourses > 0 
                        ? Math.round((stats.assignedCourses / stats.totalCourses) * 100) 
                        : 0
                      
                      return (
                        <tr key={programme.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                              {programme.code}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">{programme.name}</div>
                            <div className="text-xs text-gray-500">{programme.duration * 2} Semesters</div>
                          </td>
                          <td className="px-4 py-3 text-center text-sm font-medium text-gray-900">
                            {programme.duration} Years
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-900">{programme.session}</td>
                          <td className="px-4 py-3 text-center text-sm font-medium text-green-600">
                            {stats.totalCredits}
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-900">{programme.totalStudents}</td>
                          <td className="px-4 py-3 text-center text-sm text-blue-600">{stats.totalCourses}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center">
                              <div className={`w-12 h-2 rounded-full mr-2 ${
                                assignmentRate >= 80 ? 'bg-green-500' :
                                assignmentRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}></div>
                              <span className="text-sm font-medium">{assignmentRate}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex justify-center space-x-2">
                              <button className="text-blue-600 hover:text-blue-800 text-xs">View</button>
                              <button className="text-green-600 hover:text-green-800 text-xs">Edit</button>
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
                  <div className="text-6xl mb-4">🎓</div>
                  <h3 className="text-xl font-semibold text-gray-600">No Programmes Found</h3>
                  <p className="text-gray-500 mt-2">No programmes available for the selected session and criteria</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-600">Select Academic Session</h3>
              <p className="text-gray-500 mt-2">Please select an academic session to view programme details</p>
            </div>
          </div>
        )}

        {/* Add Programme Modal */}
        {/* Add Programme Modal - Compact Version */}
        {showAddProgrammeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Add New Programme</h2>
                <button
                  onClick={() => setShowAddProgrammeModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Academic Session *
                  </label>
                  <select
                    value={newProgramme.session}
                    onChange={(e) => setNewProgramme(prev => ({ ...prev, session: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Session...</option>
                    {sessions.map(session => (
                      <option key={session} value={session}>{session}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">
                      Programme Code *
                    </label>
                    <input
                      type="text"
                      value={newProgramme.code}
                      onChange={(e) => setNewProgramme(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., CSE"
                      maxLength={5}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">
                      Duration *
                    </label>
                    <select
                      value={newProgramme.duration}
                      onChange={(e) => setNewProgramme(prev => ({ ...prev, duration: Number(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={2}>2 Years</option>
                      <option value={3}>3 Years</option>
                      <option value={4}>4 Years</option>
                      <option value={5}>5 Years</option>
                      <option value={6}>6 Years</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Programme Name *
                  </label>
                  <input
                    type="text"
                    value={newProgramme.name}
                    onChange={(e) => setNewProgramme(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Computer Science Engineering"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600 text-lg">💡</span>
                    <div>
                      <p className="text-sm text-blue-800 font-medium">Programme Summary</p>
                      <p className="text-xs text-blue-700 mt-1">
                        <strong>{newProgramme.code || 'CODE'}</strong> for <strong>{newProgramme.session || 'SESSION'}</strong> will have <strong>{newProgramme.duration * 2} semesters</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-5">
                <button
                  onClick={handleAddProgramme}
                  disabled={!newProgramme.name || !newProgramme.code || !newProgramme.session}
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors text-sm"
                >
                  Create Programme
                </button>
                <button
                  onClick={() => setShowAddProgrammeModal(false)}
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
