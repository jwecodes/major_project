'use client'
import { Sidebar } from '@/components/sidebar'
import { programmeApi } from '@/lib/api'
import { useState, useEffect } from 'react'

interface Programme {
  id: number
  name: string
  code: string
  duration: number
  session: string
  semesters: number
  totalCredits: number
  totalStudents: number
  assignedCourses: number
  unassignedCourses: number
  assignmentRate: number
  _count: {
    courses: number
  }
}

interface FacultyAssignment {
  id: number
  facultyId: string
  courseCode: string
  programmeCode: string
  programmeName: string
  courseName: string
  assignedAt: Date
}

interface Course {
  id: number
  session: string
  programmeCode: string
  programmeName: string
  code: string
  name: string
  credit: number
  type: string
  numStudents: number
  L: number
  T: number
  P: number
  hours: number
  roomNo: string
  facultyAssignments: FacultyAssignment[]
}

interface Programme {
  id: number
  name: string
  code: string
  duration: number
  session: string
  semesters: number
  totalCredits: number
  totalStudents: number
  assignedCourses: number
  unassignedCourses: number
  assignmentRate: number
  courses: Course[]
  _count: {
    courses: number
  }
}

export default function ProgrammesPage() {
  const [programmes, setProgrammes] = useState<Programme[]>([])
  const [loading, setLoading] = useState(false)
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

  // Fetch programmes from database
  const fetchProgrammes = async (session?: string) => {
    setLoading(true)
    try {
      const data = await programmeApi.getAll(session)
      setProgrammes(data)
    } catch (error) {
      console.error('Error fetching programmes:', error)
      alert('Failed to load programmes')
    } finally {
      setLoading(false)
    }
  }

  // Fetch programmes when session changes
  useEffect(() => {
    if (selectedSession) {
      fetchProgrammes(selectedSession)
    }
  }, [selectedSession])

  // Filter programmes based on search and code
  const getFilteredProgrammes = () => {
    let filtered = programmes

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
  const handleAddProgramme = async () => {
    if (!newProgramme.name || !newProgramme.code || !selectedSession) {
      alert('Please fill in all required fields and select a session')
      return
    }
    
    setLoading(true)
    try {
      await programmeApi.create({
        ...newProgramme,
        session: selectedSession
      })
      
      // Refresh the programmes list
      await fetchProgrammes(selectedSession)
      
      // Reset form and close modal
      setNewProgramme({ name: '', code: '', duration: 3, session: '' })
      setShowAddProgrammeModal(false)
      alert('Programme created successfully!')
    } catch (error: any) {
      console.error('Error creating programme:', error)
      alert(error.message || 'Failed to create programme')
    } finally {
      setLoading(false)
    }
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
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50"
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
                disabled={loading}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:opacity-50"
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
                disabled={loading}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:opacity-50"
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
                disabled={loading}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:opacity-50"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedSession('')
                  setSearchTerm('')
                  setFilterByCode('')
                  setProgrammes([])
                }}
                disabled={loading}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center mb-6">
            <div className="text-blue-600 mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-4">Loading programmes...</p>
            </div>
          </div>
        )}

        {/* Programme Statistics */}
        {selectedSession && programmes.length > 0 && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-600">Total Programmes</h3>
              <p className="text-3xl font-bold text-blue-600">{filteredProgrammes.length}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-600">Total Credits</h3>
              <p className="text-3xl font-bold text-green-600">
                {filteredProgrammes.reduce((sum, prog) => sum + (prog.totalCredits || 0), 0)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-600">Total Students</h3>
              <p className="text-3xl font-bold text-purple-600">
                {filteredProgrammes.reduce((sum, prog) => sum + (prog.totalStudents || 0), 0)}
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

            {!loading && filteredProgrammes.length > 0 ? (
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
                    {filteredProgrammes.map((programme, index) => (
                      <tr key={programme.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                            {programme.code}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">{programme.name}</div>
                          <div className="text-xs text-gray-500">{programme.semesters} Semesters</div>
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-medium text-gray-900">
                          {programme.duration} Years
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-900">{programme.session}</td>
                        <td className="px-4 py-3 text-center text-sm font-medium text-green-600">
                          {programme.totalCredits || 0}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-900">{programme.totalStudents || 0}</td>
                        <td className="px-4 py-3 text-center text-sm text-blue-600">{programme._count.courses}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center">
                            <div className={`w-12 h-2 rounded-full mr-2 ${
                              programme.assignmentRate >= 80 ? 'bg-green-500' :
                              programme.assignmentRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></div>
                            <span className="text-sm font-medium">{programme.assignmentRate}%</span>
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
                    ))}
                  </tbody>
                </table>
              </div>
            ) : !loading ? (
              <div className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <div className="text-6xl mb-4">🎓</div>
                  <h3 className="text-xl font-semibold text-gray-600">No Programmes Found</h3>
                  <p className="text-gray-500 mt-2">No programmes available for the selected session and criteria</p>
                </div>
              </div>
            ) : null}
          </div>
        ) : !loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-600">Select Academic Session</h3>
              <p className="text-gray-500 mt-2">Please select an academic session to view programme details</p>
            </div>
          </div>
        ) : null}

        {/* Add Programme Modal */}
        {showAddProgrammeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Add New Programme</h2>
                <button
                  onClick={() => setShowAddProgrammeModal(false)}
                  disabled={loading}
                  className="text-gray-400 hover:text-gray-600 text-xl disabled:opacity-50"
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
                    value={selectedSession}
                    onChange={(e) => setSelectedSession(e.target.value)}
                    disabled={loading}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
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
                      disabled={loading}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
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
                      disabled={loading}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
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
                    disabled={loading}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    placeholder="e.g., Computer Science Engineering"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600 text-lg">💡</span>
                    <div>
                      <p className="text-sm text-blue-800 font-medium">Programme Summary</p>
                      <p className="text-xs text-blue-700 mt-1">
                        <strong>{newProgramme.code || 'CODE'}</strong> for <strong>{selectedSession || 'SESSION'}</strong> will have <strong>{newProgramme.duration * 2} semesters</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-5">
                <button
                  onClick={handleAddProgramme}
                  disabled={!newProgramme.name || !newProgramme.code || !selectedSession || loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors text-sm"
                >
                  {loading ? 'Creating...' : 'Create Programme'}
                </button>
                <button
                  onClick={() => setShowAddProgrammeModal(false)}
                  disabled={loading}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 font-medium transition-colors text-sm disabled:opacity-50"
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
