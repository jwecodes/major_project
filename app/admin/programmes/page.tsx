
'use client'
import { Sidebar } from '@/components/sidebar'
import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'

// Updated interface to match the finalized schema
interface Programme {
  id: string
  session: string        // Batch session (2022-2026)
  programmeCode: string
  programmeName: string
  duration: number
  semester: number       // Current semester
  section: string | null // Changed to nullable string (matches schema)
  noOfStudents: number
  createdAt: string
  updatedAt: string
  _count?: {
    courses: number
  }
}

const api = {
  programmes: {
    getAll: async (session: string) => {
      const response = await fetch(`/api/programmes?session=${encodeURIComponent(session)}`)
      if (!response.ok) throw new Error('Failed to fetch programmes')
      return response.json()
    },

    create: async (data: any) => {
      const response = await fetch('/api/programmes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create programme')
      }
      return response.json()
    },

    createBulk: async (data: any[]) => {
      const response = await fetch('/api/programmes/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programmes: data })
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to bulk upload programmes')
      }
      return response.json()
    },

    update: async (id: string, data: any) => {
      const response = await fetch(`/api/programmes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update programme')
      }
      return response.json()
    },

    delete: async (id: string) => {
      const response = await fetch(`/api/programmes/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete programme')
      }
      return response.json()
    }
  }
}

export default function ProgrammesManagementPage() {
  const [programmes, setProgrammes] = useState<Programme[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState('2022-2026') // Batch session
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingProgramme, setEditingProgramme] = useState<Programme | null>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadPreview, setUploadPreview] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)

  const [newProgramme, setNewProgramme] = useState({
    session: '2022-2026',     // Batch session
    programmeCode: '',
    programmeName: '',
    duration: 4,
    semester: 1,              // Current semester
    section: '',              // Changed to singular, nullable
    noOfStudents: 0
  })

  // Batch sessions (programme sessions)
  const sessions = ['2022-2026', '2023-2027', '2024-2028', '2025-2029']

  useEffect(() => {
    fetchProgrammes()
  }, [selectedSession])

  const fetchProgrammes = async () => {
    try {
      setLoading(true)
      const data = await api.programmes.getAll(selectedSession)
      setProgrammes(data)
    } catch (error) {
      console.error('Error fetching programmes:', error)
      setProgrammes([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddProgramme = async () => {
    if (!newProgramme.programmeCode || !newProgramme.programmeName || !newProgramme.duration) {
      alert('Please fill in all required fields')
      return
    }

    try {
      // Convert empty string to null for section field
      const programmeData = {
        ...newProgramme,
        section: newProgramme.section.trim() || null
      }

      await api.programmes.create(programmeData)

      alert('Programme added successfully!')
      fetchProgrammes()
      setShowAddModal(false)
      setNewProgramme({
        session: '2022-2026',
        programmeCode: '',
        programmeName: '',
        duration: 4,
        semester: 1,
        section: '',
        noOfStudents: 0
      })
    } catch (error: any) {
      console.error('Error adding programme:', error)
      alert(error.message || 'Failed to add programme')
    }
  }

  const handleEditProgramme = (programme: Programme) => {
    setEditingProgramme(programme)
    setNewProgramme({
      session: programme.session,
      programmeCode: programme.programmeCode,
      programmeName: programme.programmeName,
      duration: programme.duration,
      semester: programme.semester,
      section: programme.section || '',
      noOfStudents: programme.noOfStudents
    })
    setShowEditModal(true)
  }

  const handleUpdateProgramme = async () => {
    if (!editingProgramme || !newProgramme.programmeCode || !newProgramme.programmeName || !newProgramme.duration) {
      alert('Please fill in all required fields')
      return
    }

    try {
      // Convert empty string to null for section field
      const programmeData = {
        ...newProgramme,
        section: newProgramme.section.trim() || null
      }

      await api.programmes.update(editingProgramme.id, programmeData)

      alert('Programme updated successfully!')
      fetchProgrammes()
      setShowEditModal(false)
      setEditingProgramme(null)
      setNewProgramme({
        session: '2022-2026',
        programmeCode: '',
        programmeName: '',
        duration: 4,
        semester: 1,
        section: '',
        noOfStudents: 0
      })
    } catch (error: any) {
      console.error('Error updating programme:', error)
      alert(error.message || 'Failed to update programme')
    }
  }

  const handleDeleteProgramme = async (programme: Programme) => {
    if (!confirm(`Are you sure you want to delete "${programme.programmeName}"? This action cannot be undone.`)) {
      return
    }

    try {
      await api.programmes.delete(programme.id)
      alert('Programme deleted successfully!')
      fetchProgrammes()
    } catch (error: any) {
      console.error('Error deleting programme:', error)
      alert(error.message || 'Failed to delete programme')
    }
  }

  const downloadTemplate = () => {
    const template = [
      {
        session: '2022-2026',
        programmeCode: 'BTECH_CSE',
        programmeName: 'Bachelor of Technology in Computer Science and Engineering',
        duration: 4,
        semester: 7,
        section: 'A, B, C',
        noOfStudents: 120
      },
      {
        session: '2023-2027',
        programmeCode: 'BSC_CS',
        programmeName: 'Bachelor of Science in Computer Science',
        duration: 3,
        semester: 5,
        section: 'Section-1, Section-2',
        noOfStudents: 60
      },
      {
        session: '2024-2028',
        programmeCode: 'MCA',
        programmeName: 'Master of Computer Applications',
        duration: 2,
        semester: 3,
        section: null, // Example of null section
        noOfStudents: 80
      }
    ]

    const ws = XLSX.utils.json_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Programme Template')
    XLSX.writeFile(wb, 'programme-template.xlsx')
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadFile(file)

    try {
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      // Validate required fields for updated schema
      const requiredFields = ['session', 'programmeCode', 'programmeName', 'duration', 'semester', 'noOfStudents']
      const isValid = jsonData.every((row: any) => 
        requiredFields.every(field => row.hasOwnProperty(field))
      )

      if (!isValid) {
        alert('Excel file is missing required columns. Please use the template.')
        return
      }

      setUploadPreview(jsonData.slice(0, 5))
    } catch (error) {
      console.error('Error reading file:', error)
      alert('Error reading Excel file')
    }
  }

  const handleBulkUpload = async () => {
    if (!uploadFile) {
      alert('Please select a file first')
      return
    }

    try {
      setUploading(true)

      const arrayBuffer = await uploadFile.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      // Process data to match updated schema
      const processedData = jsonData.map((row: any) => ({
        session: row.session,
        programmeCode: row.programmeCode,
        programmeName: row.programmeName,
        duration: parseInt(row.duration),
        semester: parseInt(row.semester),
        section: row.section && row.section.toString().trim() ? row.section.toString() : null, // Handle null sections
        noOfStudents: parseInt(row.noOfStudents)
      }))

      await api.programmes.createBulk(processedData)

      alert(`Successfully uploaded ${processedData.length} programmes!`)
      setShowBulkModal(false)
      setUploadFile(null)
      setUploadPreview([])
      fetchProgrammes()
    } catch (error: any) {
      console.error('Error uploading programmes:', error)
      alert(error.message || 'Failed to upload programmes')
    } finally {
      setUploading(false)
    }
  }

  const filteredProgrammes = programmes.filter(programme => 
    programme.programmeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    programme.programmeCode.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Helper function to display section (handle null)
  const displaySection = (section: string | null) => {
    if (!section) return 'No sections'
    return section
  }

  // Helper function to count sections (handle null)
  const countSections = (section: string | null) => {
    if (!section) return 0
    return section.split(',').filter(s => s.trim()).length
  }

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar role="admin" />
        <div className="flex-1 p-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-3 border-indigo-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading programmes...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar role="admin" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Programme Management</h1>
            <p className="text-gray-600">Manage academic programmes and their batch details</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-2"
            >
              <span className="text-lg">+</span>
              <span>Add Programme</span>
            </button>
            <button
              onClick={() => setShowBulkModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-2"
            >
              <span>📁</span>
              <span>Bulk Upload</span>
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <div className="w-6 h-6 bg-indigo-600 rounded"></div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Programmes</h3>
                <span className="text-2xl font-bold text-gray-900">{programmes.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <div className="w-6 h-6 bg-emerald-600 rounded"></div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Courses</h3>
                <span className="text-2xl font-bold text-gray-900">
                  {programmes.reduce((sum, p) => sum + (p._count?.courses || 0), 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-amber-100 rounded-lg">
                <div className="w-6 h-6 bg-amber-600 rounded"></div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Students</h3>
                <span className="text-2xl font-bold text-gray-900">
                  {programmes.reduce((sum, p) => sum + p.noOfStudents, 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-violet-100 rounded-lg">
                <div className="w-6 h-6 bg-violet-600 rounded"></div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Sections</h3>
                <span className="text-2xl font-bold text-gray-900">
                  {programmes.reduce((sum, p) => sum + countSections(p.section), 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter & Search Programmes</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Batch Session</label>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              >
                {sessions.map(session => (
                  <option key={session} value={session}>{session}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search Programmes</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or code..."
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setSearchTerm('')}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all"
              >
                Clear Search
              </button>
            </div>
          </div>
        </div>

        {/* Programmes Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Academic Programmes</h2>
                <p className="text-gray-600 mt-1">Batch: {selectedSession}</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-gray-900">{filteredProgrammes.length}</span>
                <p className="text-sm text-gray-600">programmes</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Batch Session</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Programme Name</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Current Sem</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Section</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Students</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProgrammes.map((programme) => (
                  <tr key={programme.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                        {programme.session}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900">{programme.programmeCode}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{programme.programmeName}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-emerald-100 text-emerald-800">
                        {programme.duration} Years
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                        Semester {programme.semester}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm">
                        <div className="font-semibold text-violet-600">{displaySection(programme.section)}</div>
                        {programme.section && (
                          <div className="text-xs text-gray-500">{countSections(programme.section)} sections</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-lg font-bold text-amber-600">{programme.noOfStudents}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <button 
                          onClick={() => handleEditProgramme(programme)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium text-sm px-3 py-1 rounded-md hover:bg-indigo-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteProgramme(programme)}
                          className="text-red-600 hover:text-red-800 font-medium text-sm px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProgrammes.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      <div className="text-4xl mb-4">🎓</div>
                      <div className="text-lg font-semibold text-gray-600">No programmes found</div>
                      <p className="text-gray-500 mt-2">
                        {programmes.length === 0 
                          ? 'No programmes available for the selected batch'
                          : 'No programmes match your search criteria'
                        }
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Programme Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add New Programme</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Batch Session *</label>
                    <select
                      value={newProgramme.session}
                      onChange={(e) => setNewProgramme(prev => ({ ...prev, session: e.target.value }))}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    >
                      {sessions.map(session => (
                        <option key={session} value={session}>{session}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Programme Code *</label>
                    <input
                      type="text"
                      value={newProgramme.programmeCode}
                      onChange={(e) => setNewProgramme(prev => ({ ...prev, programmeCode: e.target.value.toUpperCase() }))}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                      placeholder="e.g., BTECH_CSE"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Programme Name *</label>
                  <input
                    type="text"
                    value={newProgramme.programmeName}
                    onChange={(e) => setNewProgramme(prev => ({ ...prev, programmeName: e.target.value }))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    placeholder="e.g., Bachelor of Technology in Computer Science Engineering"
                  />
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (Years) *</label>
                    <select
                      value={newProgramme.duration}
                      onChange={(e) => setNewProgramme(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    >
                      {[1,2,3,4,5,6].map(year => (
                        <option key={year} value={year}>{year} Years</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Current Semester *</label>
                    <select
                      value={newProgramme.semester}
                      onChange={(e) => setNewProgramme(prev => ({ ...prev, semester: parseInt(e.target.value) }))}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    >
                      {[1,2,3,4,5,6,7,8].map(sem => (
                        <option key={sem} value={sem}>Semester {sem}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Section</label>
                    <input
                      type="text"
                      value={newProgramme.section}
                      onChange={(e) => setNewProgramme(prev => ({ ...prev, section: e.target.value }))}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                      placeholder="e.g., A, B, C (optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Students</label>
                    <input
                      type="number"
                      value={newProgramme.noOfStudents}
                      onChange={(e) => setNewProgramme(prev => ({ ...prev, noOfStudents: parseInt(e.target.value) || 0 }))}
                      min="0"
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    />
                  </div>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <p><strong>Section format examples:</strong></p>
                  <p>• "A, B, C" for simple section names</p>
                  <p>• "Section-1, Section-2, Section-3" for numbered sections</p>
                  <p>• Leave blank if no specific sections</p>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <div className="text-sm text-indigo-800">
                    <div><strong>Programme Summary:</strong></div>
                    <div className="mt-2 space-y-1">
                      <div>{newProgramme.programmeCode || 'CODE'} - {newProgramme.programmeName || 'Programme Name'}</div>
                      <div><strong>Batch:</strong> {newProgramme.session} | <strong>Duration:</strong> {newProgramme.duration} years</div>
                      <div><strong>Currently in:</strong> Semester {newProgramme.semester} | <strong>Section:</strong> {newProgramme.section || 'None'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleAddProgramme}
                  disabled={!newProgramme.programmeCode || !newProgramme.programmeName}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Programme
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Programme Modal */}
        {showEditModal && editingProgramme && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Edit Programme</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Batch Session *</label>
                    <select
                      value={newProgramme.session}
                      onChange={(e) => setNewProgramme(prev => ({ ...prev, session: e.target.value }))}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    >
                      {sessions.map(session => (
                        <option key={session} value={session}>{session}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Programme Code *</label>
                    <input
                      type="text"
                      value={newProgramme.programmeCode}
                      onChange={(e) => setNewProgramme(prev => ({ ...prev, programmeCode: e.target.value.toUpperCase() }))}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                      placeholder="e.g., BTECH_CSE"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Programme Name *</label>
                  <input
                    type="text"
                    value={newProgramme.programmeName}
                    onChange={(e) => setNewProgramme(prev => ({ ...prev, programmeName: e.target.value }))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    placeholder="e.g., Bachelor of Technology in Computer Science Engineering"
                  />
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (Years) *</label>
                    <select
                      value={newProgramme.duration}
                      onChange={(e) => setNewProgramme(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    >
                      {[1,2,3,4,5,6].map(year => (
                        <option key={year} value={year}>{year} Years</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Current Semester *</label>
                    <select
                      value={newProgramme.semester}
                      onChange={(e) => setNewProgramme(prev => ({ ...prev, semester: parseInt(e.target.value) }))}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    >
                      {[1,2,3,4,5,6,7,8].map(sem => (
                        <option key={sem} value={sem}>Semester {sem}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Section</label>
                    <input
                      type="text"
                      value={newProgramme.section}
                      onChange={(e) => setNewProgramme(prev => ({ ...prev, section: e.target.value }))}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                      placeholder="e.g., A, B, C (optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Students</label>
                    <input
                      type="number"
                      value={newProgramme.noOfStudents}
                      onChange={(e) => setNewProgramme(prev => ({ ...prev, noOfStudents: parseInt(e.target.value) || 0 }))}
                      min="0"
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleUpdateProgramme}
                  disabled={!newProgramme.programmeCode || !newProgramme.programmeName}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Programme
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Upload Modal */}
        {showBulkModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Bulk Upload Programmes</h2>
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-amber-900 mb-3">📋 Required Excel Columns</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm text-amber-800">
                    <div>• <strong>session</strong> (e.g., 2022-2026) - Batch session</div>
                    <div>• <strong>programmeCode</strong> (e.g., BTECH_CSE)</div>
                    <div>• <strong>programmeName</strong> (Full programme name)</div>
                    <div>• <strong>duration</strong> (Years, e.g., 4)</div>
                    <div>• <strong>semester</strong> (Current semester, e.g., 7)</div>
                    <div>• <strong>section</strong> (e.g., "A, B, C" or leave blank)</div>
                    <div>• <strong>noOfStudents</strong> (Current count)</div>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    onClick={downloadTemplate}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-2 mx-auto"
                  >
                    <span>📥</span>
                    <span>Download Excel Template</span>
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Excel File</label>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>

                {uploadPreview.length > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">Preview (First 5 rows)</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-200">
                          <tr>
                            {Object.keys(uploadPreview[0]).map(key => (
                              <th key={key} className="px-3 py-2 text-left font-semibold text-gray-700">{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {uploadPreview.map((row, index) => (
                            <tr key={index} className="border-b border-gray-200">
                              {Object.values(row).map((value, i) => (
                                <td key={i} className="px-3 py-2 text-gray-600">{String(value)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={handleBulkUpload}
                    disabled={!uploadFile || uploading}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? 'Uploading...' : '📤 Upload Programmes'}
                  </button>
                  <button
                    onClick={() => setShowBulkModal(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
