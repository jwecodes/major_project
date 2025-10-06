
'use client'
import { Sidebar } from '@/components/sidebar'
import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'

// Updated interfaces to match finalized schema
interface Faculty {
  id: string
  facultyId: string
  facultyName: string
  designation: string
  email: string
  contactNo: string
  createdAt: string
  updatedAt: string
  facultyCourses: FacultyCourse[]
  _count?: {
    facultyCourses: number
    uploadedContent: number
  }
}

interface FacultyCourse {
  id: string
  session: string        // Academic session (2022-2026)
  programmeName: string
  programmeCode: string
  section: string        // Section (A, B, etc.)
  courseCode: string
  courseName: string
  facultyId: string
  facultyName: string
  designation: string
  email: string
  contactNo: string
  role: 'COORDINATOR' | 'CONTRIBUTOR'
  assignedAt: string
}

interface Programme {
  id: string
  session: string        // Batch session (2022-2026)
  programmeCode: string
  programmeName: string
  duration: number
  semester: number       // Current semester
  section: string | null // Updated to match finalized schema
  noOfStudents: number
}

interface Course {
  id: string
  session: string        // Academic session (2022-2026)
  programmeCode: string
  programmeName: string  // Denormalized
  courseCode: string
  courseName: string
  semester: number
  credits: number
}

// API functions updated for finalized schema
const api = {
  programmes: {
    getAll: async () => {
      // Get programmes from all batch sessions
      const batchSessions = ['2022-2026', '2023-2027', '2024-2028', '2025-2029']
      const allProgrammes: Programme[] = []

      for (const batchSession of batchSessions) {
        try {
          const response = await fetch(`/api/programmes?session=${encodeURIComponent(batchSession)}`)
          if (response.ok) {
            const data = await response.json()
            allProgrammes.push(...data)
          }
        } catch (error) {
          // Continue if a batch session has no programmes
        }
      }

      return allProgrammes
    }
  },
  courses: {
    getAll: async (session: string, programmeCode?: string) => {
      const params = new URLSearchParams({ session })
      if (programmeCode) params.append('programmeCode', programmeCode)

      const response = await fetch(`/api/courses?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch courses')
      return response.json()
    }
  },
  faculty: {
    getAll: async () => {
      const response = await fetch('/api/faculty')
      if (!response.ok) throw new Error('Failed to fetch faculty')
      return response.json()
    },

    create: async (data: any) => {
      const response = await fetch('/api/faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create faculty')
      }
      return response.json()
    },

    update: async (id: string, data: any) => {
      const response = await fetch(`/api/faculty/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update faculty')
      }
      return response.json()
    },

    delete: async (id: string) => {
      const response = await fetch(`/api/faculty/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete faculty')
      }
      return response.json()
    },

    createBulk: async (data: any[]) => {
      const response = await fetch('/api/faculty/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faculty: data })
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to bulk upload faculty')
      }
      return response.json()
    }
  }
}

export default function FacultyManagementPage() {
  const [programmes, setProgrammes] = useState<Programme[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [loading, setLoading] = useState(true)

  // Enhanced filter states
  const [selectedSession, setSelectedSession] = useState('2022-2026') // Academic session
  const [selectedProgrammeCode, setSelectedProgrammeCode] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadPreview, setUploadPreview] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)

  const [newFaculty, setNewFaculty] = useState({
    facultyId: '',
    facultyName: '',
    designation: 'Assistant Professor',
    email: '',
    contactNo: ''
  })

  const sessions = ['2022-2026', '2023-2027', '2024-2028', '2025-2029'] // Consistent with programmes
  const designations = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Industry Expert', 'Lab Assistant']
  const roles = ['COORDINATOR', 'CONTRIBUTOR']

  useEffect(() => {
    fetchFaculty()
    fetchProgrammes()
  }, [])

  useEffect(() => {
    if (selectedProgrammeCode) {
      fetchCourses()
    }
  }, [selectedSession, selectedProgrammeCode])

  const fetchFaculty = async () => {
    try {
      setLoading(true)
      const data = await api.faculty.getAll()
      setFaculty(data)
    } catch (error) {
      console.error('Error fetching faculty:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProgrammes = async () => {
    try {
      const data = await api.programmes.getAll()
      setProgrammes(data)
    } catch (error) {
      console.error('Error fetching programmes:', error)
    }
  }

  const fetchCourses = async () => {
    try {
      const data = await api.courses.getAll(selectedSession, selectedProgrammeCode)
      setCourses(data)
    } catch (error) {
      console.error('Error fetching courses:', error)
      setCourses([])
    }
  }

  const handleAddFaculty = async () => {
    if (!newFaculty.facultyId || !newFaculty.facultyName || !newFaculty.email) {
      alert('Please fill in all required fields')
      return
    }

    try {
      await api.faculty.create(newFaculty)
      alert('Faculty added successfully!')
      fetchFaculty()
      setShowAddModal(false)
      resetNewFaculty()
    } catch (error: any) {
      console.error('Error adding faculty:', error)
      alert(error.message || 'Failed to add faculty')
    }
  }

  const handleEditFaculty = (faculty: Faculty) => {
    setEditingFaculty(faculty)
    setNewFaculty({
      facultyId: faculty.facultyId,
      facultyName: faculty.facultyName,
      designation: faculty.designation,
      email: faculty.email,
      contactNo: faculty.contactNo
    })
    setShowEditModal(true)
  }

  const handleUpdateFaculty = async () => {
    if (!editingFaculty || !newFaculty.facultyId || !newFaculty.facultyName || !newFaculty.email) {
      alert('Please fill in all required fields')
      return
    }

    try {
      await api.faculty.update(editingFaculty.id, newFaculty)
      alert('Faculty updated successfully!')
      fetchFaculty()
      setShowEditModal(false)
      setEditingFaculty(null)
      resetNewFaculty()
    } catch (error: any) {
      console.error('Error updating faculty:', error)
      alert(error.message || 'Failed to update faculty')
    }
  }

  const handleDeleteFaculty = async (faculty: Faculty) => {
    if (!confirm(`Are you sure you want to delete "${faculty.facultyName}"? This action cannot be undone.`)) {
      return
    }

    try {
      await api.faculty.delete(faculty.id)
      alert('Faculty deleted successfully!')
      fetchFaculty()
    } catch (error: any) {
      console.error('Error deleting faculty:', error)
      alert(error.message || 'Failed to delete faculty')
    }
  }

  const resetNewFaculty = () => {
    setNewFaculty({
      facultyId: '',
      facultyName: '',
      designation: 'Assistant Professor',
      email: '',
      contactNo: ''
    })
  }

  const downloadTemplate = () => {
    const template = [
      {
        facultyId: 'FAC001',
        facultyName: 'Dr. John Smith',
        designation: 'Professor',
        email: 'john.smith@college.edu',
        contactNo: '+91-9876543210'
      },
      {
        facultyId: 'FAC002',
        facultyName: 'Prof. Sarah Wilson',
        designation: 'Associate Professor',
        email: 'sarah.wilson@college.edu',
        contactNo: '+91-9876543211'
      }
    ]

    const ws = XLSX.utils.json_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Faculty Template')
    XLSX.writeFile(wb, 'faculty-template.xlsx')
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

      // Validate required fields
      const requiredFields = ['facultyId', 'facultyName', 'designation', 'email']
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

      await api.faculty.createBulk(jsonData)

      alert(`Successfully uploaded ${jsonData.length} faculty members!`)
      setShowBulkModal(false)
      setUploadFile(null)
      setUploadPreview([])
      fetchFaculty()
    } catch (error: any) {
      console.error('Error uploading faculty:', error)
      alert(error.message || 'Failed to upload faculty')
    } finally {
      setUploading(false)
    }
  }

  // Enhanced filtering with finalized schema
  const filteredFaculty = faculty.filter(f => {
    const matchesSearch = f.facultyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         f.facultyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         f.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesProgramme = !selectedProgrammeCode || 
      f.facultyCourses.some(fc => fc.programmeCode === selectedProgrammeCode)

    const matchesCourse = !selectedCourse ||
      f.facultyCourses.some(fc => fc.courseCode === selectedCourse)

    const matchesRole = !selectedRole ||
      f.facultyCourses.some(fc => fc.role === selectedRole)

    const matchesSession = !selectedSession ||
      f.facultyCourses.some(fc => fc.session === selectedSession)

    // Search in faculty course assignments
    const matchesProgrammeSearch = !searchTerm || 
      f.facultyCourses.some(fc => 
        fc.programmeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fc.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fc.courseName.toLowerCase().includes(searchTerm.toLowerCase())
      )

    return matchesSearch && matchesProgramme && matchesCourse && matchesRole && matchesSession && matchesProgrammeSearch
  })

  // Get unique programme codes from courses for filtering
  const availableProgrammeCodes = [...new Set(programmes.map(p => p.programmeCode))]

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar role="admin" />
        <div className="flex-1 p-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-3 border-indigo-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading faculty members...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Faculty Management</h1>
            <p className="text-gray-600">Manage faculty members and course assignments</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-2"
            >
              <span className="text-lg">+</span>
              <span>Add Faculty</span>
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <div className="w-6 h-6 bg-indigo-600 rounded"></div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Faculty</h3>
                <span className="text-2xl font-bold text-gray-900">{faculty.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <div className="w-6 h-6 bg-blue-600 rounded"></div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Professors</h3>
                <span className="text-2xl font-bold text-gray-900">
                  {faculty.filter(f => f.designation === 'Professor').length}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <div className="w-6 h-6 bg-emerald-600 rounded"></div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Course Assignments</h3>
                <span className="text-2xl font-bold text-gray-900">
                  {faculty.reduce((total, f) => total + (f._count?.facultyCourses || 0), 0)}
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
                <h3 className="text-sm font-medium text-gray-500">Coordinators</h3>
                <span className="text-2xl font-bold text-gray-900">
                  {faculty.filter(f => f.facultyCourses.some(fc => fc.role === 'COORDINATOR')).length}
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
                <h3 className="text-sm font-medium text-gray-500">Content Uploads</h3>
                <span className="text-2xl font-bold text-gray-900">
                  {faculty.reduce((total, f) => total + (f._count?.uploadedContent || 0), 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter & Search Faculty</h3>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Academic Session</label>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              >
                <option value="">All Sessions</option>
                {sessions.map(session => (
                  <option key={session} value={session}>{session}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Programme</label>
              <select
                value={selectedProgrammeCode}
                onChange={(e) => setSelectedProgrammeCode(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              >
                <option value="">All Programmes</option>
                {availableProgrammeCodes.map(code => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                disabled={!selectedProgrammeCode || courses.length === 0}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all disabled:bg-gray-100"
              >
                <option value="">All Courses</option>
                {courses.filter(c => c.programmeCode === selectedProgrammeCode).map(course => (
                  <option key={course.id} value={course.courseCode}>
                    {course.courseCode} - {course.courseName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              >
                <option value="">All Roles</option>
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search Faculty</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Name, ID, programme, course..."
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedProgrammeCode('')
                  setSelectedCourse('')
                  setSelectedRole('')
                  setSelectedSession('')
                }}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Faculty Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Faculty Directory</h2>
                <p className="text-gray-600 mt-1">Academic Session {selectedSession || 'All Sessions'}</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-gray-900">{filteredFaculty.length}</span>
                <p className="text-sm text-gray-600">faculty members</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Faculty Details</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Designation</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Course Load</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned Courses</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFaculty.map((facultyMember) => (
                  <tr key={facultyMember.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{facultyMember.facultyName}</div>
                        <div className="text-sm text-gray-600">ID: {facultyMember.facultyId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        facultyMember.designation === 'Professor' ? 'bg-purple-100 text-purple-800' :
                        facultyMember.designation === 'Associate Professor' ? 'bg-blue-100 text-blue-800' :
                        facultyMember.designation === 'Assistant Professor' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {facultyMember.designation}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm">
                        <div className="text-gray-900">{facultyMember.email}</div>
                        {facultyMember.contactNo && (
                          <div className="text-gray-500 text-xs mt-1">{facultyMember.contactNo}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${
                        (facultyMember._count?.facultyCourses || 0) > 4 ? 'bg-red-100 text-red-800' :
                        (facultyMember._count?.facultyCourses || 0) > 2 ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        <div className="text-center">
                          <div className="text-lg font-bold">{facultyMember._count?.facultyCourses || 0}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 max-h-20 overflow-y-auto">
                        {facultyMember.facultyCourses.length > 0 ? (
                          facultyMember.facultyCourses.map((assignment) => (
                            <div key={assignment.id} className="text-xs">
                              <span className={`inline-flex px-2 py-1 rounded-full ${
                                assignment.role === 'COORDINATOR' 
                                  ? 'bg-indigo-100 text-indigo-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {assignment.courseCode} - {assignment.programmeName} ({assignment.section})
                                {assignment.role === 'COORDINATOR' && ' 👑'}
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500 italic">No assignments</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <button 
                          onClick={() => handleEditFaculty(facultyMember)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium text-sm px-3 py-1 rounded-md hover:bg-indigo-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteFaculty(facultyMember)}
                          className="text-red-600 hover:text-red-800 font-medium text-sm px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredFaculty.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="text-4xl mb-4">👨‍🏫</div>
                      <div className="text-lg font-semibold text-gray-600">No faculty found</div>
                      <p className="text-gray-500 mt-2">
                        {faculty.length === 0 
                          ? 'No faculty members available'
                          : 'No faculty match your search and filter criteria'
                        }
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Faculty Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add New Faculty</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Faculty ID *</label>
                    <input
                      type="text"
                      value={newFaculty.facultyId}
                      onChange={(e) => setNewFaculty(prev => ({ ...prev, facultyId: e.target.value }))}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                      placeholder="e.g., FAC001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Faculty Name *</label>
                    <input
                      type="text"
                      value={newFaculty.facultyName}
                      onChange={(e) => setNewFaculty(prev => ({ ...prev, facultyName: e.target.value }))}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                      placeholder="e.g., Dr. John Smith"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Designation *</label>
                    <select
                      value={newFaculty.designation}
                      onChange={(e) => setNewFaculty(prev => ({ ...prev, designation: e.target.value }))}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    >
                      {designations.map(designation => (
                        <option key={designation} value={designation}>{designation}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Number</label>
                    <input
                      type="text"
                      value={newFaculty.contactNo}
                      onChange={(e) => setNewFaculty(prev => ({ ...prev, contactNo: e.target.value }))}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                      placeholder="e.g., +91-9876543210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={newFaculty.email}
                    onChange={(e) => setNewFaculty(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    placeholder="e.g., faculty@college.edu"
                  />
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <p className="text-sm text-indigo-800">
                    <strong>Faculty Summary:</strong> {newFaculty.facultyName || 'NAME'} ({newFaculty.facultyId || 'ID'}) - {newFaculty.designation}
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleAddFaculty}
                  disabled={!newFaculty.facultyId || !newFaculty.facultyName || !newFaculty.email}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Faculty
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

        {/* Edit Faculty Modal */}
        {showEditModal && editingFaculty && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Edit Faculty</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Faculty ID *</label>
                    <input
                      type="text"
                      value={newFaculty.facultyId}
                      onChange={(e) => setNewFaculty(prev => ({ ...prev, facultyId: e.target.value }))}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                      placeholder="e.g., FAC001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Faculty Name *</label>
                    <input
                      type="text"
                      value={newFaculty.facultyName}
                      onChange={(e) => setNewFaculty(prev => ({ ...prev, facultyName: e.target.value }))}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                      placeholder="e.g., Dr. John Smith"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Designation *</label>
                    <select
                      value={newFaculty.designation}
                      onChange={(e) => setNewFaculty(prev => ({ ...prev, designation: e.target.value }))}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    >
                      {designations.map(designation => (
                        <option key={designation} value={designation}>{designation}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Number</label>
                    <input
                      type="text"
                      value={newFaculty.contactNo}
                      onChange={(e) => setNewFaculty(prev => ({ ...prev, contactNo: e.target.value }))}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                      placeholder="e.g., +91-9876543210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={newFaculty.email}
                    onChange={(e) => setNewFaculty(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    placeholder="e.g., faculty@college.edu"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Current Course Assignments</h4>
                  <div className="text-sm text-blue-800">
                    {editingFaculty.facultyCourses.length > 0 ? (
                      editingFaculty.facultyCourses.map((assignment, index) => (
                        <div key={index} className="mb-1">
                          <strong>{assignment.courseCode}</strong> - {assignment.courseName} 
                          <span className="text-xs ml-2 px-2 py-1 bg-blue-200 rounded">
                            {assignment.role}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-600 italic">No course assignments</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleUpdateFaculty}
                  disabled={!newFaculty.facultyId || !newFaculty.facultyName || !newFaculty.email}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Faculty
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
                <h2 className="text-xl font-bold text-gray-900">Bulk Upload Faculty</h2>
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
                    <div>• <strong>facultyId</strong> (e.g., FAC001)</div>
                    <div>• <strong>facultyName</strong> (e.g., Dr. John Smith)</div>
                    <div>• <strong>designation</strong> (Professor, Assistant Professor, etc.)</div>
                    <div>• <strong>email</strong> (faculty@college.edu)</div>
                    <div>• <strong>contactNo</strong> (Optional, e.g., +91-9876543210)</div>
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
                    {uploading ? 'Uploading...' : '📤 Upload Faculty'}
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
