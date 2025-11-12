'use client'
import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Upload as UploadIcon, Search } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { createProgramme, getProgrammes, updateProgramme, deleteProgramme, bulkUploadProgrammes } from '@/app/actions/admin'
import BulkUpload from '@/components/admin/BulkUpload'

interface Programme {
  id: string
  session: string
  programmeCode: string
  programmeName: string
  duration: number
  currentSemester: number
  section: string | null
  noOfStudents: number
}

export default function ProgrammesPage() {
  const [programmes, setProgrammes] = useState<Programme[]>([])
  const [filteredProgrammes, setFilteredProgrammes] = useState<Programme[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSession, setSelectedSession] = useState<string>('all')
  const [availableSessions, setAvailableSessions] = useState<string[]>([])
  const [formData, setFormData] = useState({
    session: '',
    programmeCode: '',
    programmeName: '',
    duration: 4,
    currentSemester: 1,
    section: '',
    noOfStudents: 0
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  // Statistics
  const [stats, setStats] = useState({
    totalProgrammes: 0,
    totalCourses: 0,
    totalStudents: 0,
    totalSections: 0
  })

  // Sorting function for programmes
  const sortProgrammes = (programmesToSort: Programme[]): Programme[] => {
    return [...programmesToSort].sort((a, b) => {
      // First, sort by session (most recent first - descending)
      if (a.session !== b.session) {
        return b.session.localeCompare(a.session)
      }

      // Second, sort by programme code (alphabetically - ascending)
      if (a.programmeCode !== b.programmeCode) {
        return a.programmeCode.localeCompare(b.programmeCode)
      }

      // Third, sort by section (A, B, C... with null sections at the end)
      // Handle null sections
      if (a.section === null && b.section === null) return 0
      if (a.section === null) return 1  // Move null to end
      if (b.section === null) return -1 // Move null to end
      
      // Compare sections alphabetically
      return a.section.localeCompare(b.section)
    })
  }

  useEffect(() => {
    loadProgrammes()
  }, [])

  useEffect(() => {
    // Apply both session filter and search filter
    let filtered = programmes

    // Filter by session
    if (selectedSession !== 'all') {
      filtered = filtered.filter(prog => prog.session === selectedSession)
    }

    // Filter by search term
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(prog => 
        prog.programmeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prog.programmeName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Sort the filtered results
    const sortedFiltered = sortProgrammes(filtered)
    setFilteredProgrammes(sortedFiltered)
  }, [searchTerm, selectedSession, programmes])

  const loadProgrammes = async () => {
    const data = await getProgrammes()
    
    // Sort programmes before setting state
    const sortedData = sortProgrammes(data)
    setProgrammes(sortedData)
    setFilteredProgrammes(sortedData)
    
    // Extract unique sessions and sort them
    const sessions = Array.from(new Set(data.map(p => p.session))).sort().reverse()
    setAvailableSessions(sessions)
    
    // Set default session to the most recent one if available
    if (sessions.length > 0 && selectedSession === 'all') {
      setSelectedSession(sessions[0])
    }

    // Calculate statistics
    const totalStudents = data.reduce((sum, prog) => sum + prog.noOfStudents, 0)
    const totalSections = data.filter(prog => prog.section).length
    
    setStats({
      totalProgrammes: data.length,
      totalCourses: 0, // This should be calculated from actual course data
      totalStudents: totalStudents,
      totalSections: totalSections
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const submitData = {
      ...formData,
      section: formData.section || undefined
    }
    
    const result = editingId 
      ? await updateProgramme(editingId, submitData)
      : await createProgramme(submitData)
    
    if (result.success) {
      toast.success(editingId ? 'Programme updated!' : 'Programme created!')
      resetForm()
      loadProgrammes()
    } else {
      toast.error(result.error || 'An error occurred')
    }
    
    setLoading(false)
  }

  const resetForm = () => {
    setFormData({
      session: '',
      programmeCode: '',
      programmeName: '',
      duration: 4,
      currentSemester: 1,
      section: '',
      noOfStudents: 0
    })
    setShowForm(false)
    setEditingId(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this programme? All related courses will be deleted.')) return
    
    const result = await deleteProgramme(id)
    if (result.success) {
      toast.success('Programme deleted!')
      loadProgrammes()
    } else {
      toast.error(result.error || 'Failed to delete')
    }
  }

  const handleEdit = (programme: Programme) => {
    setFormData({
      session: programme.session,
      programmeCode: programme.programmeCode,
      programmeName: programme.programmeName,
      duration: programme.duration,
      currentSemester: programme.currentSemester,
      section: programme.section || '',
      noOfStudents: programme.noOfStudents
    })
    setEditingId(programme.id)
    setShowForm(true)
  }

  const handleBulkUpload = async (data: any[]) => {
    const result = await bulkUploadProgrammes(data)
    if (result.success) {
      await loadProgrammes()
    }
    return result
  }

  const handleCloseBulkUpload = () => {
    setShowBulkUpload(false)
    loadProgrammes()
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setSelectedSession('all')
  }

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Programme Management</h1>
        <p className="text-gray-600">Manage academic programmes and their batch details</p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mb-6">
        <button
          onClick={() => setShowBulkUpload(true)}
          className="bg-green-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors shadow-sm"
        >
          <UploadIcon className="h-5 w-5" />
          Bulk Upload
        </button>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5" />
          Add Programme
        </button>
      </div>

      {showBulkUpload && (
        <BulkUpload
          type="programmes"
          onUpload={handleBulkUpload}
          onClose={handleCloseBulkUpload}
        />
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <div className="w-8 h-8 bg-blue-600 rounded"></div>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Programmes</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalProgrammes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <div className="w-8 h-8 bg-green-600 rounded"></div>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Courses</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalCourses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <div className="w-8 h-8 bg-orange-600 rounded"></div>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Students</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <div className="w-8 h-8 bg-purple-600 rounded"></div>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Sections</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalSections}</p>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            {editingId ? 'Edit Programme' : 'Add New Programme'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Session</label>
                <input
                  type="text"
                  placeholder="2024-2025"
                  value={formData.session}
                  onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Programme Code</label>
                <input
                  type="text"
                  placeholder="BTECH-CSE"
                  value={formData.programmeCode}
                  onChange={(e) => setFormData({ ...formData, programmeCode: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Programme Name</label>
              <input
                type="text"
                placeholder="B.Tech Computer Science"
                value={formData.programmeName}
                onChange={(e) => setFormData({ ...formData, programmeName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                required
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Duration (Years)</label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Current Semester</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.currentSemester}
                  onChange={(e) => setFormData({ ...formData, currentSemester: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Section (Optional)</label>
                <input
                  type="text"
                  placeholder="A"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">No. of Students</label>
                <input
                  type="number"
                  min="0"
                  value={formData.noOfStudents}
                  onChange={(e) => setFormData({ ...formData, noOfStudents: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter & Search Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter & Search Programmes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Session Dropdown Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Batch Session</label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
              <option value="all">All Sessions</option>
              {availableSessions.map((session) => (
                <option key={session} value={session}>
                  {session}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Programmes</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Clear Search Button */}
        {(searchTerm || selectedSession !== 'all') && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredProgrammes.length} of {programmes.length} programme{filteredProgrammes.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={handleClearSearch}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>

      {/* Academic Programmes Table */}
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Academic Programmes</h3>
            <p className="text-sm text-gray-600">
              Batch: {selectedSession === 'all' ? 'All Sessions' : selectedSession}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">{filteredProgrammes.length}</p>
            <p className="text-sm text-gray-600">programmes</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Batch Session
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Programme Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Current Sem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Section
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Students
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProgrammes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <Search className="h-12 w-12 mb-3 text-gray-400" />
                        <p className="text-lg font-medium">No programmes found</p>
                        <p className="text-sm mt-1">
                          {searchTerm || selectedSession !== 'all' 
                            ? 'Try adjusting your filters or search terms' 
                            : 'Start by adding a new programme'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProgrammes.map((programme) => (
                    <tr key={programme.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-medium">
                        {programme.session}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600">
                        {programme.programmeCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {programme.programmeName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {programme.duration} years
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {programme.currentSemester}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {programme.section || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {programme.noOfStudents}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleEdit(programme)}
                          className="text-blue-600 hover:text-blue-900 mr-4 transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-5 w-5 inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(programme.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
