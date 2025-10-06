'use client'
import { Sidebar } from '@/components/sidebar'
import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'

// Updated interfaces to match new schema
interface Course {
  id: string
  session: string        // Academic session (2024-2025)
  programmeCode: string
  programmeName: string  // Denormalized
  semester: number
  courseCode: string
  courseName: string
  l: number
  t: number
  p: number
  s: number
  credits: number
  totalHours: number
  courseType: CourseType
  roomNo: string | null
  hasAttendance: boolean
  courseNature: CourseNature
  courseMode: CourseMode
  createdAt: string
  updatedAt: string
  programme?: {
    id: string
    programmeCode: string
    programmeName: string
    session: string      // Batch session
  }
  _count?: {
    facultyCourses: number
  }
}

type CourseType = 'INDUSTRY' | 'SKILL' | 'SEC' | 'CORE' | 'OPEN_ELECTIVE' | 'VAC' | 'AEC' | 'DSE' | 'INTERNSHIP' | 'PROJECT' | 'MOOC' | 'CS' | 'OTHER'
type CourseNature = 'MANDATORY' | 'ELECTIVE'
type CourseMode = 'THEORY' | 'PRACTICAL' | 'THEORY_PRACTICAL'

interface Programme {
  id: string
  session: string        // Batch session (2022-2026)
  programmeCode: string
  programmeName: string
  duration: number
  semester: number       // Current semester
  sections: number
  noOfStudents: number
}

// Updated API functions to work with new schema
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
    },
    
    create: async (data: any) => {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create course')
      }
      return response.json()
    },
    
    createBulk: async (data: any[]) => {
      const response = await fetch('/api/courses/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courses: data })
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to bulk upload courses')
      }
      return response.json()
    }
  }
}

export default function CoursesManagementPage() {
  const [programmes, setProgrammes] = useState<Programme[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState('2024-2025') // Academic session
  const [selectedProgrammeCode, setSelectedProgrammeCode] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadPreview, setUploadPreview] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)

  const [newCourse, setNewCourse] = useState({
    session: '2024-2025',
    programmeCode: '',
    programmeName: '',
    semester: 1,
    courseCode: '',
    courseName: '',
    l: 0,
    t: 0,
    s: 0,
    p: 0,
    credits: 0,
    courseType: 'CORE' as CourseType,
    courseNature: 'MANDATORY' as CourseNature,
    courseMode: 'THEORY' as CourseMode,
    hasAttendance: true,
    roomNo: ''
  })

  const sessions = ['2024-2025', '2023-2024', '2025-2026'] // Academic sessions
  const courseTypes: CourseType[] = ['INDUSTRY', 'SKILL', 'SEC', 'CORE', 'OPEN_ELECTIVE', 'VAC', 'AEC', 'DSE', 'INTERNSHIP', 'PROJECT', 'MOOC', 'CS', 'OTHER']
  const courseNatures: CourseNature[] = ['MANDATORY', 'ELECTIVE']
  const courseModes: CourseMode[] = ['THEORY', 'PRACTICAL', 'THEORY_PRACTICAL']

  useEffect(() => {
    fetchProgrammes()
  }, [])

  useEffect(() => {
    fetchCourses()
  }, [selectedSession, selectedProgrammeCode])

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
      setLoading(true)
      const data = await api.courses.getAll(selectedSession, selectedProgrammeCode)
      setCourses(data)
    } catch (error) {
      console.error('Error fetching courses:', error)
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddCourse = async () => {
    if (!newCourse.courseCode || !newCourse.courseName || !newCourse.programmeCode) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const selectedProgramme = programmes.find(p => p.programmeCode === newCourse.programmeCode)
      
      await api.courses.create({
        ...newCourse,
        programmeName: selectedProgramme?.programmeName || '',
        totalHours: newCourse.l + newCourse.t + newCourse.s + newCourse.p
      })

      alert('Course added successfully!')
      fetchCourses()
      setShowAddModal(false)
      setNewCourse({
        session: '2024-2025',
        programmeCode: '',
        programmeName: '',
        semester: 1,
        courseCode: '',
        courseName: '',
        l: 0,
        t: 0,
        s: 0,
        p: 0,
        credits: 0,
        courseType: 'CORE',
        courseNature: 'MANDATORY',
        courseMode: 'THEORY',
        hasAttendance: true,
        roomNo: ''
      })
    } catch (error: any) {
      console.error('Error adding course:', error)
      alert(error.message || 'Failed to add course')
    }
  }

  const downloadTemplate = () => {
    const template = [
      {
        session: '2024-2025',
        programmeCode: 'BTECH_CSE',
        programmeName: 'Bachelor of Technology in Computer Science Engineering',
        semester: 1,
        courseCode: 'ETCCCS101',
        courseName: 'Mathematical Foundations for Computer Science',
        l: 3,
        t: 1,
        s: 0,
        p: 0,
        credits: 4,
        courseType: 'CORE',
        courseNature: 'MANDATORY',
        courseMode: 'THEORY',
        hasAttendance: true,
        roomNo: 'Room-101'
      },
      {
        session: '2024-2025',
        programmeCode: 'BTECH_CSE',
        programmeName: 'Bachelor of Technology in Computer Science Engineering',
        semester: 1,
        courseCode: 'ETCCCS102',
        courseName: 'Programming Fundamentals Lab',
        l: 0,
        t: 0,
        s: 0,
        p: 4,
        credits: 2,
        courseType: 'CORE',
        courseNature: 'MANDATORY',
        courseMode: 'PRACTICAL',
        hasAttendance: true,
        roomNo: 'Lab-101'
      }
    ]

    const ws = XLSX.utils.json_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Course Template')
    XLSX.writeFile(wb, 'course-template.xlsx')
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
      const requiredFields = ['session', 'programmeCode', 'programmeName', 'semester', 'courseCode', 'courseName', 'credits']
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

      // Transform data for new schema
      const coursesToUpload = jsonData.map((row: any) => ({
        session: row.session || selectedSession,
        programmeCode: row.programmeCode,
        programmeName: row.programmeName,
        semester: parseInt(row.semester) || 1,
        courseCode: row.courseCode,
        courseName: row.courseName,
        l: parseInt(row.l) || 0,
        t: parseInt(row.t) || 0,
        s: parseInt(row.s) || 0,
        p: parseInt(row.p) || 0,
        credits: parseFloat(row.credits) || 0,
        totalHours: (parseInt(row.l) || 0) + (parseInt(row.t) || 0) + (parseInt(row.s) || 0) + (parseInt(row.p) || 0),
        courseType: row.courseType || 'CORE',
        courseNature: row.courseNature || 'MANDATORY',
        courseMode: row.courseMode || 'THEORY',
        hasAttendance: row.hasAttendance === true || row.hasAttendance === 'true' || row.hasAttendance === 'Yes',
        roomNo: row.roomNo || null
      }))

      await api.courses.createBulk(coursesToUpload)

      alert(`Successfully uploaded ${coursesToUpload.length} courses!`)
      setShowBulkModal(false)
      setUploadFile(null)
      setUploadPreview([])
      fetchCourses()
    } catch (error: any) {
      console.error('Error uploading courses:', error)
      alert(error.message || 'Failed to upload courses')
    } finally {
      setUploading(false)
    }
  }

  // Enhanced filtering
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.programmeName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSemester = !selectedSemester || course.semester.toString() === selectedSemester
    
    return matchesSearch && matchesSemester
  })

  // Get unique programme codes and semesters for filters
  const availableProgrammeCodes = [...new Set(programmes.map(p => p.programmeCode))]
  const availableSemesters = [...new Set(courses.map(c => c.semester))].sort((a, b) => a - b)

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar role="admin" />
        <div className="flex-1 p-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-3 border-indigo-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading courses...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Management</h1>
            <p className="text-gray-600">Manage academic courses and curriculum structure</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-2"
            >
              <span className="text-lg">+</span>
              <span>Add Course</span>
            </button>
            <button
              onClick={() => setShowBulkModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-2"
            >
              <span>ðŸ“</span>
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
                <h3 className="text-sm font-medium text-gray-500">Total Courses</h3>
                <span className="text-2xl font-bold text-gray-900">{courses.length}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <div className="w-6 h-6 bg-blue-600 rounded"></div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Theory</h3>
                <span className="text-2xl font-bold text-gray-900">
                  {courses.filter(c => c.courseMode === 'THEORY').length}
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
                <h3 className="text-sm font-medium text-gray-500">Practical</h3>
                <span className="text-2xl font-bold text-gray-900">
                  {courses.filter(c => c.courseMode === 'PRACTICAL').length}
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
                <h3 className="text-sm font-medium text-gray-500">Core Courses</h3>
                <span className="text-2xl font-bold text-gray-900">
                  {courses.filter(c => c.courseType === 'CORE').length}
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
                <h3 className="text-sm font-medium text-gray-500">Total Credits</h3>
                <span className="text-2xl font-bold text-gray-900">
                  {courses.reduce((sum, c) => sum + c.credits, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter & Search Courses</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search Courses</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Course code, name, programme..."
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedProgrammeCode('')
                  setSelectedSemester('')
                }}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Courses Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Academic Courses</h2>
                <p className="text-gray-600 mt-1">{selectedSession} Academic Session</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-gray-900">{filteredCourses.length}</span>
                <p className="text-sm text-gray-600">courses</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Course Details</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Programme</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Sem</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Hours (L-T-P-S)</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Credits</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{course.courseCode}</div>
                        <div className="text-sm text-gray-600 mt-1">{course.courseName}</div>
                        <div className="flex items-center mt-2 space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            course.courseNature === 'MANDATORY' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {course.courseNature}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            course.courseMode === 'THEORY' ? 'bg-indigo-100 text-indigo-800' :
                            course.courseMode === 'PRACTICAL' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-violet-100 text-violet-800'
                          }`}>
                            {course.courseMode}
                          </span>
                          {course.roomNo && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              {course.roomNo}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm">
                        <div className="font-semibold text-gray-900">{course.programmeCode}</div>
                        <div className="text-xs text-gray-500 mt-1">{course.programmeName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-indigo-100 text-indigo-800">
                        {course.semester}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm font-mono">
                        <div className="font-semibold text-gray-900">{course.l}-{course.t}-{course.p}-{course.s}</div>
                        <div className="text-xs text-gray-500">Total: {course.totalHours}h</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-lg font-bold text-amber-600">{course.credits}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        course.courseType === 'CORE' ? 'bg-purple-100 text-purple-800' :
                        course.courseType === 'OPEN_ELECTIVE' ? 'bg-blue-100 text-blue-800' :
                        course.courseType === 'PROJECT' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {course.courseType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm px-3 py-1 rounded-md hover:bg-indigo-50 transition-colors">
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-800 font-medium text-sm px-3 py-1 rounded-md hover:bg-red-50 transition-colors">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCourses.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <div className="text-4xl mb-4">ðŸ“š</div>
                      <div className="text-lg font-semibold text-gray-600">No courses found</div>
                      <p className="text-gray-500 mt-2">
                        {courses.length === 0 
                          ? 'No courses available for the selected session'
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

        {/* Add Course Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full p-6 max-h-[95vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add New Course</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  Ã—
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="col-span-2 mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                    ðŸ“‹ Basic Information
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Academic Session *</label>
                  <select
                    value={newCourse.session}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, session: e.target.value }))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  >
                    {sessions.map(session => (
                      <option key={session} value={session}>{session}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Programme *</label>
                  <select
                    value={newCourse.programmeCode}
                    onChange={(e) => {
                      const selectedProgramme = programmes.find(p => p.programmeCode === e.target.value)
                      setNewCourse(prev => ({ 
                        ...prev, 
                        programmeCode: e.target.value,
                        programmeName: selectedProgramme?.programmeName || ''
                      }))
                    }}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  >
                    <option value="">Select Programme</option>
                    {availableProgrammeCodes.map(code => {
                      const programme = programmes.find(p => p.programmeCode === code)
                      return (
                        <option key={code} value={code}>
                          {code} - {programme?.programmeName}
                        </option>
                      )
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Semester *</label>
                  <select
                    value={newCourse.semester}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, semester: parseInt(e.target.value) }))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  >
                    {[1,2,3,4,5,6,7,8].map(sem => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Course Code *</label>
                  <input
                    type="text"
                    value={newCourse.courseCode}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, courseCode: e.target.value }))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    placeholder="e.g., ETCCCS101"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Course Name *</label>
                  <input
                    type="text"
                    value={newCourse.courseName}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, courseName: e.target.value }))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    placeholder="e.g., Mathematical Foundations for Computer Science"
                  />
                </div>

                {/* Contact Hours */}
                <div className="col-span-2 mt-4 mb-3">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                    â° Contact Hours
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Lecture Hours (L)</label>
                  <input
                    type="number"
                    value={newCourse.l}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, l: parseInt(e.target.value) || 0 }))}
                    min="0"
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tutorial Hours (T)</label>
                  <input
                    type="number"
                    value={newCourse.t}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, t: parseInt(e.target.value) || 0 }))}
                    min="0"
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Practical Hours (P)</label>
                  <input
                    type="number"
                    value={newCourse.p}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, p: parseInt(e.target.value) || 0 }))}
                    min="0"
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Self-Study Hours (S)</label>
                  <input
                    type="number"
                    value={newCourse.s}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, s: parseInt(e.target.value) || 0 }))}
                    min="0"
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Credits *</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newCourse.credits}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, credits: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Total Hours</label>
                  <input
                    type="number"
                    value={newCourse.l + newCourse.t + newCourse.p + newCourse.s}
                    readOnly
                    className="w-full bg-gray-100 border border-gray-300 rounded-lg px-4 py-2.5 text-gray-700 font-medium"
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-calculated from L+T+P+S</p>
                </div>

                {/* Course Classification */}
                <div className="col-span-2 mt-4 mb-3">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                    ðŸ“Š Course Classification
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Course Type</label>
                  <select
                    value={newCourse.courseType}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, courseType: e.target.value as CourseType }))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  >
                    {courseTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Course Nature</label>
                  <select
                    value={newCourse.courseNature}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, courseNature: e.target.value as CourseNature }))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  >
                    {courseNatures.map(nature => (
                      <option key={nature} value={nature}>{nature}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Course Mode</label>
                  <select
                    value={newCourse.courseMode}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, courseMode: e.target.value as CourseMode }))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  >
                    {courseModes.map(mode => (
                      <option key={mode} value={mode}>{mode}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Room Number</label>
                  <input
                    type="text"
                    value={newCourse.roomNo}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, roomNo: e.target.value }))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    placeholder="e.g., Room-101 or Lab-A"
                  />
                </div>

                {/* Additional Settings */}
                <div className="col-span-2 mt-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newCourse.hasAttendance}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, hasAttendance: e.target.checked }))}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm font-medium text-gray-700">
                      Attendance Required
                    </label>
                  </div>
                </div>

                {/* Course Summary */}
                <div className="col-span-2 mt-4">
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <h4 className="font-semibold text-indigo-900 mb-2">Course Summary</h4>
                    <div className="text-sm text-indigo-800 space-y-1">
                      <div><strong>Course:</strong> {newCourse.courseCode} - {newCourse.courseName || 'Course Name'}</div>
                      <div><strong>Programme:</strong> {newCourse.programmeCode} - {newCourse.programmeName}</div>
                      <div><strong>Semester:</strong> {newCourse.semester} | <strong>Credits:</strong> {newCourse.credits}</div>
                      <div><strong>Hours:</strong> L:{newCourse.l} T:{newCourse.t} P:{newCourse.p} S:{newCourse.s} = {newCourse.l + newCourse.t + newCourse.p + newCourse.s} total</div>
                      <div><strong>Type:</strong> {newCourse.courseType} | <strong>Nature:</strong> {newCourse.courseNature} | <strong>Mode:</strong> {newCourse.courseMode}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleAddCourse}
                  disabled={!newCourse.courseCode || !newCourse.courseName || !newCourse.programmeCode}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Course
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

        {/* Bulk Upload Modal - Similar to other pages but updated for course fields */}
        {showBulkModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Bulk Upload Courses</h2>
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  Ã—
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-amber-900 mb-3">ðŸ“‹ Required Excel Columns</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm text-amber-800">
                    <div>â€¢ <strong>session</strong> (e.g., 2024-2025)</div>
                    <div>â€¢ <strong>programmeCode</strong> (e.g., BTECH_CSE)</div>
                    <div>â€¢ <strong>programmeName</strong> (Full programme name)</div>
                    <div>â€¢ <strong>semester</strong> (1-8)</div>
                    <div>â€¢ <strong>courseCode</strong> (e.g., ETCCCS101)</div>
                    <div>â€¢ <strong>courseName</strong> (Full course name)</div>
                    <div>â€¢ <strong>l, t, p, s</strong> (Hours for each)</div>
                    <div>â€¢ <strong>credits</strong> (Credit points)</div>
                    <div>â€¢ <strong>courseType</strong> (CORE, ELECTIVE, etc.)</div>
                    <div>â€¢ <strong>courseNature</strong> (MANDATORY/ELECTIVE)</div>
                    <div>â€¢ <strong>courseMode</strong> (THEORY/PRACTICAL/BOTH)</div>
                    <div>â€¢ <strong>hasAttendance, roomNo</strong> (Optional)</div>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    onClick={downloadTemplate}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-2 mx-auto"
                  >
                    <span>ðŸ“¥</span>
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
                    {uploading ? 'Uploading...' : 'ðŸ“¤ Upload Courses'}
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