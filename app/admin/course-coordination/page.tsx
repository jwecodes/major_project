
'use client'
import { Sidebar } from '@/components/sidebar'
import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'

// Updated interfaces to match finalized schema
interface CourseCoordination {
  id: string
  session: string          // Academic session (2022-2026)
  courseId: string
  coordinatorId: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  course: {
    id: string
    session: string        // Academic session (2022-2026)
    programmeCode: string
    programmeName: string
    courseCode: string
    courseName: string
    semester: number
    credits: number
    l: number
    t: number
    p: number
    s: number
    courseType: string
    courseNature: string
    courseMode: string
  }
  coordinator: Faculty | null
  contributors: FacultyCourse[]
  courseMaterials: CourseMaterial[]
  _count?: {
    contributors: number
    courseMaterials: number
    pendingApprovals: number
  }
}

interface Faculty {
  id: string
  facultyId: string
  facultyName: string
  designation: string
  email: string
  contactNo: string
}

interface FacultyCourse {
  id: string
  session: string
  programmeName: string
  programmeCode: string
  section: string
  courseCode: string
  courseName: string
  facultyId: string
  facultyName: string
  designation: string
  email: string
  contactNo: string
  role: 'COORDINATOR' | 'CONTRIBUTOR'
  assignedAt: string
  faculty: Faculty
}

interface CourseMaterial {
  id: string
  title: string
  description: string
  materialType: 'COURSE_HANDBOOK' | 'ASSIGNMENT' | 'LECTURE_PPT' | 'QUESTION_BANK' | 'LAB_MANUAL' | 'QUESTION_PAPER' | 'ANSWER_KEY' | 'OTHER'
  fileName: string
  filePath: string
  fileSize: number
  uploadedById: string
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
  approvedById: string | null
  approvedAt: string | null
  rejectionReason: string | null
  lectureNumber: number | null
  weekNumber: number | null
  isPublic: boolean
  downloadCount: number
  createdAt: string
  updatedAt: string
  uploader: Faculty
  approver: Faculty | null
}

interface Programme {
  id: string
  session: string        // Batch session (2022-2026)
  programmeCode: string
  programmeName: string
  duration: number
  semester: number       // Current semester
  section: string | null
  noOfStudents: number
}

interface Course {
  id: string
  session: string
  programmeCode: string
  programmeName: string
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
    }
  },
  courseCoordination: {
    getAll: async (session: string, programmeCode?: string) => {
      const params = new URLSearchParams({ session })
      if (programmeCode) params.append('programmeCode', programmeCode)

      const response = await fetch(`/api/course-coordination?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch course coordinations')
      return response.json()
    },

    create: async (data: any) => {
      const response = await fetch('/api/course-coordination', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create coordination')
      }
      return response.json()
    },

    assignCoordinator: async (coordinationId: string, facultyId: string) => {
      const response = await fetch(`/api/course-coordination/${coordinationId}/coordinator`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facultyId })
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to assign coordinator')
      }
      return response.json()
    },

    assignContributor: async (coordinationId: string, facultyId: string) => {
      const response = await fetch(`/api/course-coordination/${coordinationId}/contributors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facultyId })
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to assign contributor')
      }
      return response.json()
    },

    removeContributor: async (coordinationId: string, facultyId: string) => {
      const response = await fetch(`/api/course-coordination/${coordinationId}/contributors`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facultyId })
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to remove contributor')
      }
      return response.json()
    },

    approveMaterial: async (materialId: string, action: 'approve' | 'reject', reason?: string) => {
      const response = await fetch(`/api/course-materials/${materialId}/approval`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason })
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to process approval')
      }
      return response.json()
    },

    bulkAssign: async (assignments: any[]) => {
      const response = await fetch('/api/course-coordination/bulk-assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignments })
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to bulk assign')
      }
      return response.json()
    }
  }
}

export default function CourseCoordinationPage() {
  const [programmes, setProgrammes] = useState<Programme[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [coordinations, setCoordinations] = useState<CourseCoordination[]>([])
  const [loading, setLoading] = useState(true)

  // Filter states
  const [selectedSession, setSelectedSession] = useState('2022-2026')  // Academic session
  const [selectedProgrammeCode, setSelectedProgrammeCode] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('')
  const [coordinationStatus, setCoordinationStatus] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Modal states
  const [showCoordinatorModal, setShowCoordinatorModal] = useState(false)
  const [showContributorModal, setShowContributorModal] = useState(false)
  const [showMaterialsModal, setShowMaterialsModal] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false)
  const [selectedCoordination, setSelectedCoordination] = useState<CourseCoordination | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<CourseMaterial | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadPreview, setUploadPreview] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)

  const sessions = ['2022-2026', '2023-2027', '2024-2028', '2025-2029'] // Academic sessions
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8]
  const coordinationStatuses = ['WITH_COORDINATOR', 'WITHOUT_COORDINATOR', 'PENDING_APPROVALS', 'ACTIVE']

  const materialTypes = [
    { key: 'COURSE_HANDBOOK', label: 'Course Handbook (CHO)', icon: '📚' },
    { key: 'ASSIGNMENT', label: 'Assignment', icon: '📝' },
    { key: 'LECTURE_PPT', label: 'Lecture PPT', icon: '📊' },
    { key: 'QUESTION_BANK', label: 'Question Bank', icon: '❓' },
    { key: 'LAB_MANUAL', label: 'Lab Manual', icon: '🔬' },
    { key: 'QUESTION_PAPER', label: 'Question Paper', icon: '📄' },
    { key: 'ANSWER_KEY', label: 'Answer Key', icon: '🔑' },
    { key: 'OTHER', label: 'Other', icon: '📎' }
  ]

  useEffect(() => {
    fetchData()
  }, [selectedSession, selectedProgrammeCode])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [programmesData, facultyData, coordinationsData, coursesData] = await Promise.all([
        api.programmes.getAll(),
        api.faculty.getAll(),
        api.courseCoordination.getAll(selectedSession, selectedProgrammeCode),
        api.courses.getAll(selectedSession, selectedProgrammeCode)
      ])
      setProgrammes(programmesData)
      setFaculty(facultyData)
      setCoordinations(coordinationsData)
      setCourses(coursesData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignCoordinator = async (coordinationId: string, facultyId: string) => {
    try {
      await api.courseCoordination.assignCoordinator(coordinationId, facultyId)
      alert('Coordinator assigned successfully!')
      fetchData()
      setShowCoordinatorModal(false)
    } catch (error: any) {
      console.error('Error assigning coordinator:', error)
      alert(error.message || 'Failed to assign coordinator')
    }
  }

  const handleAssignContributor = async (coordinationId: string, facultyId: string) => {
    try {
      await api.courseCoordination.assignContributor(coordinationId, facultyId)
      alert('Contributor assigned successfully!')
      fetchData()
    } catch (error: any) {
      console.error('Error assigning contributor:', error)
      alert(error.message || 'Failed to assign contributor')
    }
  }

  const handleRemoveContributor = async (coordinationId: string, facultyId: string) => {
    if (!confirm('Are you sure you want to remove this contributor?')) {
      return
    }

    try {
      await api.courseCoordination.removeContributor(coordinationId, facultyId)
      alert('Contributor removed successfully!')
      fetchData()
    } catch (error: any) {
      console.error('Error removing contributor:', error)
      alert(error.message || 'Failed to remove contributor')
    }
  }

  const handleMaterialApproval = async (action: 'approve' | 'reject') => {
    if (!selectedMaterial) return

    try {
      await api.courseCoordination.approveMaterial(
        selectedMaterial.id, 
        action, 
        action === 'reject' ? rejectionReason : undefined
      )
      alert(`Material ${action}d successfully!`)
      fetchData()
      setShowApprovalModal(false)
      setSelectedMaterial(null)
      setRejectionReason('')
    } catch (error: any) {
      console.error('Error processing approval:', error)
      alert(error.message || 'Failed to process approval')
    }
  }

  const downloadBulkTemplate = () => {
    const template = [
      {
        session: '2022-2026',
        courseCode: 'ETCCCS101',
        coordinatorId: 'FAC001',
        contributorIds: 'FAC002,FAC003'
      },
      {
        session: '2022-2026',
        courseCode: 'ETCCCS102',
        coordinatorId: 'FAC004',
        contributorIds: 'FAC005'
      }
    ]

    const ws = XLSX.utils.json_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Course Assignment Template')
    XLSX.writeFile(wb, 'course-assignment-template.xlsx')
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
      const requiredFields = ['session', 'courseCode', 'coordinatorId']
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

  const handleBulkAssign = async () => {
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

      // Process assignments
      const assignments = jsonData.map((row: any) => ({
        session: row.session,
        courseCode: row.courseCode,
        coordinatorId: row.coordinatorId,
        contributorIds: row.contributorIds ? row.contributorIds.split(',').map((id: string) => id.trim()) : []
      }))

      await api.courseCoordination.bulkAssign(assignments)

      alert(`Successfully processed ${assignments.length} assignments!`)
      setShowBulkAssignModal(false)
      setUploadFile(null)
      setUploadPreview([])
      fetchData()
    } catch (error: any) {
      console.error('Error bulk assigning:', error)
      alert(error.message || 'Failed to process bulk assignment')
    } finally {
      setUploading(false)
    }
  }

  // Enhanced filtering
  const filteredCoordinations = coordinations.filter(coordination => {
    const matchesSearch = 
      coordination.course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coordination.course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coordination.course.programmeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coordination.course.programmeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (coordination.coordinator?.facultyName.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesSemester = !selectedSemester || coordination.course.semester.toString() === selectedSemester

    const matchesStatus = !coordinationStatus || 
      (coordinationStatus === 'WITH_COORDINATOR' && coordination.coordinator) ||
      (coordinationStatus === 'WITHOUT_COORDINATOR' && !coordination.coordinator) ||
      (coordinationStatus === 'PENDING_APPROVALS' && (coordination._count?.pendingApprovals || 0) > 0) ||
      (coordinationStatus === 'ACTIVE' && coordination.isActive)

    return matchesSearch && matchesSemester && matchesStatus
  })

  // Get unique programme codes for filtering
  const availableProgrammeCodes = [...new Set(programmes.map(p => p.programmeCode))]
  const availableSemesters = [...new Set(coordinations.map(c => c.course.semester))].sort((a, b) => a - b)

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar role="admin" />
        <div className="flex-1 p-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-3 border-indigo-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading course coordinations...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Coordination</h1>
            <p className="text-gray-600">Manage course coordinators, contributors, and approve academic materials</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowBulkAssignModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-2"
            >
              <span>📁</span>
              <span>Bulk Assign</span>
            </button>
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
              <span className="text-sm text-gray-600">Session: </span>
              <span className="font-semibold text-gray-900">{selectedSession}</span>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <div className="w-6 h-6 bg-indigo-600 rounded"></div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Courses</h3>
                <span className="text-2xl font-bold text-gray-900">{coordinations.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <div className="w-6 h-6 bg-emerald-600 rounded"></div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">With Coordinators</h3>
                <span className="text-2xl font-bold text-gray-900">
                  {coordinations.filter(c => c.coordinator).length}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <div className="w-6 h-6 bg-red-600 rounded"></div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Unassigned</h3>
                <span className="text-2xl font-bold text-gray-900">
                  {coordinations.filter(c => !c.coordinator).length}
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
                <h3 className="text-sm font-medium text-gray-500">Pending Approvals</h3>
                <span className="text-2xl font-bold text-gray-900">
                  {coordinations.reduce((sum, c) => sum + (c._count?.pendingApprovals || 0), 0)}
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
                <h3 className="text-sm font-medium text-gray-500">Total Materials</h3>
                <span className="text-2xl font-bold text-gray-900">
                  {coordinations.reduce((sum, c) => sum + (c._count?.courseMaterials || 0), 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <div className="w-6 h-6 bg-blue-600 rounded"></div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Contributors</h3>
                <span className="text-2xl font-bold text-gray-900">
                  {coordinations.reduce((sum, c) => sum + (c._count?.contributors || 0), 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter & Search Courses</h3>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Academic Session</label>
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">Semester</label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              >
                <option value="">All Semesters</option>
                {availableSemesters.map(sem => (
                  <option key={sem} value={sem.toString()}>Semester {sem}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                value={coordinationStatus}
                onChange={(e) => setCoordinationStatus(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              >
                <option value="">All Status</option>
                <option value="WITH_COORDINATOR">With Coordinator</option>
                <option value="WITHOUT_COORDINATOR">Without Coordinator</option>
                <option value="PENDING_APPROVALS">Pending Approvals</option>
                <option value="ACTIVE">Active</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search Courses</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Course code, name, coordinator..."
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedProgrammeCode('')
                  setSelectedSemester('')
                  setCoordinationStatus('')
                }}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Course Coordination Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Course Coordination Management</h2>
                <p className="text-gray-600 mt-1">Academic Session: {selectedSession}</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-gray-900">{filteredCoordinations.length}</span>
                <p className="text-sm text-gray-600">courses</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Course Details</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Coordinator</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Contributors</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Materials</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Approvals</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCoordinations.map((coordination) => (
                  <tr key={coordination.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {coordination.course.courseCode}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {coordination.course.courseName}
                        </div>
                        <div className="flex items-center mt-2 space-x-2">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                            {coordination.course.programmeCode}
                          </span>
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                            Sem {coordination.course.semester}
                          </span>
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-violet-100 text-violet-800">
                            {coordination.course.credits} Credits
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {coordination.coordinator ? (
                        <div className="text-sm">
                          <div className="font-semibold text-gray-900 flex items-center justify-center">
                            👑 {coordination.coordinator.facultyName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {coordination.coordinator.designation}
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Not Assigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-bold text-blue-600">
                          {coordination._count?.contributors || 0}
                        </span>
                        <span className="text-xs text-gray-500">Contributors</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-bold text-violet-600">
                          {coordination._count?.courseMaterials || 0}
                        </span>
                        <span className="text-xs text-gray-500">Materials</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className={`text-lg font-bold ${
                          (coordination._count?.pendingApprovals || 0) > 0 
                            ? 'text-amber-600' 
                            : 'text-emerald-600'
                        }`}>
                          {coordination._count?.pendingApprovals || 0}
                        </span>
                        <span className="text-xs text-gray-500">Pending</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        coordination.isActive 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {coordination.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center space-x-1 flex-wrap gap-1">
                        <button
                          onClick={() => {
                            setSelectedCoordination(coordination)
                            setShowCoordinatorModal(true)
                          }}
                          className="text-indigo-600 hover:text-indigo-800 font-medium text-xs px-2 py-1 rounded-md hover:bg-indigo-50 transition-colors"
                        >
                          {coordination.coordinator ? 'Change' : 'Assign'} Coord
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCoordination(coordination)
                            setShowContributorModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium text-xs px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
                        >
                          Contributors
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCoordination(coordination)
                            setShowMaterialsModal(true)
                          }}
                          className="text-emerald-600 hover:text-emerald-800 font-medium text-xs px-2 py-1 rounded-md hover:bg-emerald-50 transition-colors"
                        >
                          Materials
                        </button>
                        {(coordination._count?.pendingApprovals || 0) > 0 && (
                          <button
                            onClick={() => {
                              setSelectedCoordination(coordination)
                              setShowApprovalModal(true)
                            }}
                            className="text-amber-600 hover:text-amber-800 font-medium text-xs px-2 py-1 rounded-md hover:bg-amber-50 transition-colors"
                          >
                            Review
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCoordinations.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <div className="text-4xl mb-4">📚</div>
                      <div className="text-lg font-semibold text-gray-600">No courses found</div>
                      <p className="text-gray-500 mt-2">
                        {coordinations.length === 0 
                          ? 'No course coordinations available for the selected session'
                          : 'No courses match your search and filter criteria'
                        }
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Coordinator Assignment Modal */}
        {showCoordinatorModal && selectedCoordination && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-3xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Assign Course Coordinator</h2>
                <button
                  onClick={() => setShowCoordinatorModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <h3 className="font-semibold text-indigo-900">
                    {selectedCoordination.course.courseCode} - {selectedCoordination.course.courseName}
                  </h3>
                  <p className="text-sm text-indigo-700 mt-1">
                    {selectedCoordination.course.programmeCode} | Semester {selectedCoordination.course.semester} | {selectedCoordination.course.credits} Credits
                  </p>
                </div>

                {selectedCoordination.coordinator && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="font-semibold text-amber-900 mb-2">👑 Current Coordinator</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-amber-800 font-medium">
                          {selectedCoordination.coordinator.facultyName}
                        </p>
                        <p className="text-sm text-amber-700">
                          {selectedCoordination.coordinator.designation} | {selectedCoordination.coordinator.email}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAssignCoordinator(selectedCoordination.id, '')}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-all"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <h4 className="font-semibold text-emerald-900 mb-3">Available Faculty</h4>
                  <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto">
                    {faculty
                      .filter(f => f.id !== selectedCoordination.coordinator?.id)
                      .map((facultyMember) => (
                      <div key={facultyMember.id} className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-emerald-300 transition-colors">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">
                            {facultyMember.facultyName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {facultyMember.designation} | {facultyMember.email}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {facultyMember.facultyId}
                          </div>
                        </div>
                        <button
                          onClick={() => handleAssignCoordinator(selectedCoordination.id, facultyMember.id)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                        >
                          Assign as Coordinator
                        </button>
                      </div>
                    ))}
                  </div>

                  {faculty.length === 0 && (
                    <p className="text-emerald-700 text-sm">No faculty members available.</p>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCoordinatorModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contributors Management Modal */}
        {showContributorModal && selectedCoordination && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Manage Contributors</h2>
                <button
                  onClick={() => setShowContributorModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <h3 className="font-semibold text-indigo-900">
                    {selectedCoordination.course.courseCode} - {selectedCoordination.course.courseName}
                  </h3>
                  <p className="text-sm text-indigo-700 mt-1">
                    Coordinator: {selectedCoordination.coordinator?.facultyName || 'Not Assigned'}
                  </p>
                </div>

                {/* Current Contributors */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-3">
                    Current Contributors ({selectedCoordination.contributors.length})
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedCoordination.contributors.map((contributor) => (
                      <div key={contributor.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">
                            {contributor.faculty.facultyName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {contributor.faculty.designation} | {contributor.faculty.email}
                          </div>
                          <div className="text-xs text-gray-500">
                            Added: {new Date(contributor.assignedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveContributor(selectedCoordination.id, contributor.facultyId)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-all"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    {selectedCoordination.contributors.length === 0 && (
                      <p className="text-blue-700 text-sm">No contributors assigned yet.</p>
                    )}
                  </div>
                </div>

                {/* Available Faculty for Assignment */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <h4 className="font-semibold text-emerald-900 mb-3">Assign New Contributors</h4>
                  <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                    {faculty
                      .filter(f => 
                        f.id !== selectedCoordination.coordinator?.id &&
                        !selectedCoordination.contributors.some(c => c.facultyId === f.id)
                      )
                      .map((facultyMember) => (
                      <div key={facultyMember.id} className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-emerald-300 transition-colors">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">
                            {facultyMember.facultyName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {facultyMember.designation} | {facultyMember.email}
                          </div>
                        </div>
                        <button
                          onClick={() => handleAssignContributor(selectedCoordination.id, facultyMember.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                        >
                          Add as Contributor
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowContributorModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Course Materials Modal */}
        {showMaterialsModal && selectedCoordination && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-7xl w-full p-6 max-h-[95vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Course Materials</h2>
                <button
                  onClick={() => setShowMaterialsModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <h3 className="font-semibold text-indigo-900">
                    {selectedCoordination.course.courseCode} - {selectedCoordination.course.courseName}
                  </h3>
                  <div className="text-sm text-indigo-700 mt-2 grid grid-cols-2 gap-4">
                    <div>Coordinator: {selectedCoordination.coordinator?.facultyName || 'Not Assigned'}</div>
                    <div>Contributors: {selectedCoordination.contributors.length}</div>
                    <div>Total Materials: {selectedCoordination._count?.courseMaterials || 0}</div>
                    <div>Pending Approvals: {selectedCoordination._count?.pendingApprovals || 0}</div>
                  </div>
                </div>

                {/* Material Types Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {materialTypes.map((type) => {
                    const typeMaterials = selectedCoordination.courseMaterials.filter(
                      m => m.materialType === type.key
                    )
                    const approved = typeMaterials.filter(m => m.approvalStatus === 'APPROVED').length
                    const pending = typeMaterials.filter(m => m.approvalStatus === 'PENDING').length
                    const rejected = typeMaterials.filter(m => m.approvalStatus === 'REJECTED').length

                    return (
                      <div key={type.key} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <span className="text-2xl mr-3">{type.icon}</span>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm">{type.label}</h4>
                            <div className="text-xs text-gray-600 grid grid-cols-3 gap-1 mt-1">
                              <span className="text-emerald-600">✓ {approved}</span>
                              <span className="text-amber-600">⏳ {pending}</span>
                              <span className="text-red-600">✗ {rejected}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {typeMaterials.slice(0, 3).map((material) => (
                            <div key={material.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                              <div className="flex-1 truncate">
                                <div className="font-medium text-gray-900 truncate">
                                  {material.title}
                                </div>
                                <div className="text-gray-500">
                                  {material.uploader.facultyName}
                                </div>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                material.approvalStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                                material.approvalStatus === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {material.approvalStatus}
                              </span>
                            </div>
                          ))}

                          {typeMaterials.length > 3 && (
                            <div className="text-xs text-gray-500 text-center py-1">
                              +{typeMaterials.length - 3} more
                            </div>
                          )}

                          {typeMaterials.length === 0 && (
                            <div className="text-xs text-gray-500 text-center py-4">
                              No materials uploaded
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Recent Materials */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Recent Materials</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedCoordination.courseMaterials
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .slice(0, 5)
                      .map((material) => (
                      <div key={material.id} className="flex items-center justify-between p-3 bg-white rounded border">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">
                            {materialTypes.find(t => t.key === material.materialType)?.icon}
                          </span>
                          <div>
                            <div className="font-medium text-gray-900">{material.title}</div>
                            <div className="text-sm text-gray-600">
                              by {material.uploader.facultyName} • {new Date(material.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          material.approvalStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                          material.approvalStatus === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {material.approvalStatus}
                        </span>
                      </div>
                    ))}
                    {selectedCoordination.courseMaterials.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No materials uploaded yet</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowMaterialsModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Material Approval Modal */}
        {showApprovalModal && selectedCoordination && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-5xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Pending Material Approvals</h2>
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <h3 className="font-semibold text-indigo-900">
                    {selectedCoordination.course.courseCode} - {selectedCoordination.course.courseName}
                  </h3>
                </div>

                {selectedCoordination.courseMaterials
                  .filter(m => m.approvalStatus === 'PENDING')
                  .map((material) => (
                    <div key={material.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            <span className="text-2xl mr-3">
                              {materialTypes.find(t => t.key === material.materialType)?.icon}
                            </span>
                            <div>
                              <h4 className="font-semibold text-gray-900">{material.title}</h4>
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                                {materialTypes.find(t => t.key === material.materialType)?.label}
                              </span>
                            </div>
                          </div>

                          {material.description && (
                            <p className="text-sm text-gray-600 mb-3">{material.description}</p>
                          )}

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500 mb-3">
                            <div>
                              <span className="font-medium">Uploader:</span><br />
                              {material.uploader.facultyName}
                            </div>
                            <div>
                              <span className="font-medium">File:</span><br />
                              {material.fileName}
                            </div>
                            <div>
                              <span className="font-medium">Size:</span><br />
                              {(material.fileSize / (1024 * 1024)).toFixed(2)} MB
                            </div>
                            <div>
                              <span className="font-medium">Uploaded:</span><br />
                              {new Date(material.createdAt).toLocaleDateString()}
                            </div>
                          </div>

                          {(material.lectureNumber || material.weekNumber) && (
                            <div className="flex space-x-4 text-sm text-gray-600 mb-3">
                              {material.lectureNumber && (
                                <span>Lecture: {material.lectureNumber}</span>
                              )}
                              {material.weekNumber && (
                                <span>Week: {material.weekNumber}</span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => {
                              setSelectedMaterial(material)
                              handleMaterialApproval('approve')
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => setSelectedMaterial(material)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                          >
                            ✗ Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                {selectedCoordination.courseMaterials.filter(m => m.approvalStatus === 'PENDING').length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-4">✅</div>
                    <div className="text-lg font-semibold">No pending approvals</div>
                    <p className="text-gray-400 mt-2">All materials have been reviewed</p>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Assignment Modal */}
        {showBulkAssignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Bulk Assignment Upload</h2>
                <button
                  onClick={() => setShowBulkAssignModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-amber-900 mb-3">📋 Required Excel Columns</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm text-amber-800">
                    <div>• <strong>session</strong> (e.g., 2022-2026)</div>
                    <div>• <strong>courseCode</strong> (e.g., ETCCCS101)</div>
                    <div>• <strong>coordinatorId</strong> (Faculty ID for coordinator)</div>
                    <div>• <strong>contributorIds</strong> (Comma-separated Faculty IDs)</div>
                  </div>
                  <div className="mt-2 text-xs text-amber-700">
                    <strong>Note:</strong> contributorIds should be comma-separated like "FAC002,FAC003,FAC004"
                  </div>
                </div>

                <div className="text-center">
                  <button
                    onClick={downloadBulkTemplate}
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
                    onClick={handleBulkAssign}
                    disabled={!uploadFile || uploading}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? 'Processing...' : '📤 Process Assignments'}
                  </button>
                  <button
                    onClick={() => setShowBulkAssignModal(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Reason Modal */}
        {selectedMaterial && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Rejection Reason</h2>
                <button
                  onClick={() => setSelectedMaterial(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">
                    <strong>Material:</strong> {selectedMaterial.title}
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    Uploaded by: {selectedMaterial.uploader.facultyName}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Rejection *</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full h-32 bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all resize-none"
                    placeholder="Please provide a detailed reason for rejecting this material..."
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => handleMaterialApproval('reject')}
                  disabled={!rejectionReason.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reject Material
                </button>
                <button
                  onClick={() => setSelectedMaterial(null)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold transition-all"
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
