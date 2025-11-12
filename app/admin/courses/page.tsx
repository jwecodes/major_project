'use client'
import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Upload as UploadIcon, Search, Zap, Download } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { createCourse, getCourses, updateCourse, deleteCourse, getProgrammes, bulkUploadCourses, syncCoursesAcrossSections } from '@/app/actions/admin'
import BulkUpload from '@/components/admin/BulkUpload'
import * as XLSX from 'xlsx'


interface Programme {
  id: string
  programmeName: string
  programmeCode: string
  session: string
  currentSemester: number
  section: string | null
}


interface Course {
  id: string
  session: string
  semester: number
  courseCode: string
  courseName: string
  l: number
  t: number
  p: number
  s: number
  credits: number
  totalHours: number
  courseType: string
  deliveryMode: string
  roomNo: string | null
  attendance: boolean
  category: string
  programme: Programme
}


export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [programmes, setProgrammes] = useState<Programme[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [selectedSession, setSelectedSession] = useState<string>('all')
  const [selectedProgramme, setSelectedProgramme] = useState<string>('all')
  const [selectedSemester, setSelectedSemester] = useState<string>('all')
  const [selectedCourseType, setSelectedCourseType] = useState<string>('all')
  const [selectedDeliveryMode, setSelectedDeliveryMode] = useState<string>('all')
  const [availableSessions, setAvailableSessions] = useState<string[]>([])
  const [availableProgrammes, setAvailableProgrammes] = useState<{id: string, code: string, name: string, section?: string}[]>([])
  const [availableSemesters, setAvailableSemesters] = useState<number[]>([])
  
  const [formData, setFormData] = useState({
    session: '',
    programmeId: '',
    semester: 1,
    courseCode: '',
    courseName: '',
    l: 3,
    t: 1,
    p: 0,
    s: 0,
    credits: 4,
    totalHours: 4,
    courseType: 'CORE',
    deliveryMode: 'THEORY',
    roomNo: '',
    attendance: true,
    category: 'MANDATORY'
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  const [stats, setStats] = useState({
    totalCourses: 0,
    coreCourses: 0,
    electives: 0,
    theoryCourses: 0,
    practicalCourses: 0
  })

  const courseTypeOptions = [
    { value: 'CORE', label: 'CORE' },
    { value: 'SEC', label: 'SEC' },
    { value: 'INDUSTRY', label: 'INDUSTRY' },
    { value: 'SKILL', label: 'SKILL' },
    { value: 'VAC', label: 'VAC' },
    { value: 'OPEN_ELECTIVE', label: 'OPEN_ELECTIVE' },
    { value: 'AEC', label: 'AEC' },
    { value: 'DSE', label: 'DSE' },
    { value: 'INTERNSHIP', label: 'INTERNSHIP' },
    { value: 'PROJECT', label: 'PROJECT' },
    { value: 'MOOC', label: 'MOOC' },
    { value: 'CS', label: 'CS' },
    { value: 'OTHER', label: 'OTHER' }
  ]

  const deliveryModeOptions = [
    { value: 'THEORY', label: 'THEORY' },
    { value: 'PRACTICAL', label: 'PRACTICAL' },
    { value: 'BOTH', label: 'BOTH' }
  ]


  const sortCourses = (coursesToSort: Course[]): Course[] => {
    return [...coursesToSort].sort((a, b) => {
      if (a.session !== b.session) {
        return b.session.localeCompare(a.session)
      }
      if (a.programme.programmeCode !== b.programme.programmeCode) {
        return a.programme.programmeCode.localeCompare(b.programme.programmeCode)
      }
      if (a.programme.section !== b.programme.section) {
        return (a.programme.section || 'ZZ').localeCompare(b.programme.section || 'ZZ')
      }
      if (a.semester !== b.semester) {
        return a.semester - b.semester
      }
      return a.courseCode.localeCompare(b.courseCode)
    })
  }


  useEffect(() => {
    loadData()
  }, [])


  useEffect(() => {
    let filtered = courses

    if (selectedSession !== 'all') {
      filtered = filtered.filter(course => course.session === selectedSession)
    }
    if (selectedProgramme !== 'all') {
      filtered = filtered.filter(course => course.programme.id === selectedProgramme)
    }
    if (selectedSemester !== 'all') {
      filtered = filtered.filter(course => course.semester === parseInt(selectedSemester))
    }
    if (selectedCourseType !== 'all') {
      filtered = filtered.filter(course => course.courseType === selectedCourseType)
    }
    if (selectedDeliveryMode !== 'all') {
      filtered = filtered.filter(course => course.deliveryMode === selectedDeliveryMode)
    }
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(course => 
        course.programme.programmeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.programme.programmeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.courseName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    const sortedFiltered = sortCourses(filtered)
    setFilteredCourses(sortedFiltered)
  }, [searchTerm, selectedSession, selectedProgramme, selectedSemester, selectedCourseType, selectedDeliveryMode, courses])


    const loadData = async () => {
    const [coursesData, programmesData] = await Promise.all([
      getCourses(),
      getProgrammes()
    ])
    
    const sortedCourses = sortCourses(coursesData)
    setCourses(sortedCourses)
    setFilteredCourses(sortedCourses)
    setProgrammes(programmesData)

    const sessions = Array.from(new Set(coursesData.map(c => c.session))).sort().reverse()
    setAvailableSessions(sessions)

    // ✅ FIXED: Correct type with section included
    const uniqueProgs = Array.from(
      new Map(
        coursesData.map(c => [
          c.programme.id, 
          { 
            id: c.programme.id, 
            code: c.programme.programmeCode, 
            name: c.programme.programmeName, 
            section: c.programme.section || undefined  // ✅ Include section
          }
        ])
      ).values()
    ).sort((a, b) => a.code.localeCompare(b.code))
    
    setAvailableProgrammes(uniqueProgs)

    const semesters = Array.from(new Set(coursesData.map(c => c.semester))).sort((a, b) => a - b)
    setAvailableSemesters(semesters)

    if (sessions.length > 0 && selectedSession === 'all') {
      setSelectedSession(sessions[0])
    }

    const coreCourses = coursesData.filter(c => c.courseType === 'CORE').length
    const electives = coursesData.filter(c => c.category === 'ELECTIVE').length
    const theoryCourses = coursesData.filter(c => c.deliveryMode === 'THEORY').length
    const practicalCourses = coursesData.filter(c => c.deliveryMode === 'PRACTICAL' || c.deliveryMode === 'BOTH').length

    setStats({
      totalCourses: coursesData.length,
      coreCourses,
      electives,
      theoryCourses,
      practicalCourses
    })
  }


  const handleProgrammeChange = (programmeId: string) => {
    const selectedProgramme = programmes.find(p => p.id === programmeId)
    if (selectedProgramme) {
      setFormData({
        ...formData,
        programmeId,
        session: selectedProgramme.session,
        semester: selectedProgramme.currentSemester
      })
    } else {
      setFormData({
        ...formData,
        programmeId,
        session: '',
        semester: 1
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const submitData = {
      session: formData.session,
      programmeId: formData.programmeId,
      semester: formData.semester,
      courseCode: formData.courseCode,
      courseName: formData.courseName,
      l: formData.l,
      t: formData.t,
      p: formData.p,
      s: formData.s,
      credits: formData.credits,
      totalHours: formData.totalHours,
      courseType: formData.courseType,
      deliveryMode: formData.deliveryMode,
      roomNo: formData.roomNo || null,
      attendance: formData.attendance,
      category: formData.category
    }
    
    const result = editingId 
      ? await updateCourse(editingId, submitData)
      : await createCourse(submitData)
    
    if (result.success) {
      toast.success(editingId ? 'Course updated!' : 'Course created!')
      resetForm()
      await loadData()
    } else {
      toast.error(result.error || 'An error occurred')
    }
    
    setLoading(false)
  }

  const resetForm = () => {
    setFormData({
      session: '',
      programmeId: '',
      semester: 1,
      courseCode: '',
      courseName: '',
      l: 3,
      t: 1,
      p: 0,
      s: 0,
      credits: 4,
      totalHours: 4,
      courseType: 'CORE',
      deliveryMode: 'THEORY',
      roomNo: '',
      attendance: true,
      category: 'MANDATORY'
    })
    setShowForm(false)
    setEditingId(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this course?')) return
    
    const result = await deleteCourse(id)
    if (result.success) {
      toast.success('Course deleted!')
      loadData()
    } else {
      toast.error(result.error || 'Failed to delete')
    }
  }

  const handleEdit = (course: Course) => {
    setFormData({
      session: course.session,
      programmeId: course.programme.id,
      semester: course.semester,
      courseCode: course.courseCode,
      courseName: course.courseName,
      l: course.l,
      t: course.t,
      p: course.p,
      s: course.s,
      credits: course.credits,
      totalHours: course.totalHours,
      courseType: course.courseType,
      deliveryMode: course.deliveryMode,
      roomNo: course.roomNo || '',
      attendance: course.attendance,
      category: course.category
    })
    setEditingId(course.id)
    setShowForm(true)
  }

  const handleBulkUpload = async (data: any[]) => {
    const result = await bulkUploadCourses(data)
    if (result.success) {
      await loadData()
    }
    return result
  }

  const handleCloseBulkUpload = () => {
    setShowBulkUploadModal(false)
    loadData()
  }

  const downloadTemplateAndBulkUpload = () => {
    const template = [
      {
        'Session': '2024-2025',
        'Programme Code': 'BTECH-CSE',
        'Course Code': 'CS101',
        'Course Name': 'Data Structures',
        'Semester': 3,
        'Credits': 3,
        'L': 3,
        'T': 0,
        'P': 0,
        'S': 0,
        'Total Hours': 3,
        'Course Type': 'CORE',
        'Delivery Mode': 'THEORY',
        'Category': 'MANDATORY',
        'Room No': 'A-101',
        'Attendance': 'Yes'
      },
      {
        'Session': '2024-2025',
        'Programme Code': 'BTECH-CSE',
        'Course Code': 'CS102',
        'Course Name': 'Web Development',
        'Semester': 4,
        'Credits': 4,
        'L': 2,
        'T': 1,
        'P': 2,
        'S': 0,
        'Total Hours': 5,
        'Course Type': 'OPEN_ELECTIVE',
        'Delivery Mode': 'BOTH',
        'Category': 'ELECTIVE',
        'Room No': 'B-205',
        'Attendance': 'Yes'
      },
      {
        'Session': '2024-2025',
        'Programme Code': 'BTECH-CSE',
        'Course Code': 'CS103',
        'Course Name': 'Database Lab',
        'Semester': 3,
        'Credits': 2,
        'L': 0,
        'T': 0,
        'P': 3,
        'S': 0,
        'Total Hours': 3,
        'Course Type': 'CORE',
        'Delivery Mode': 'PRACTICAL',
        'Category': 'MANDATORY',
        'Room No': 'LAB-01',
        'Attendance': 'Yes'
      }
    ]

    const ws = XLSX.utils.json_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Courses')
    XLSX.writeFile(wb, 'courses_template.xlsx')
    
    setShowBulkUploadModal(true)
  }

  const handleSyncCourses = async () => {
    if (!confirm('This will sync courses from first section to all other sections for each programme. Continue?')) {
      return
    }

    setIsSyncing(true)
    const result = await syncCoursesAcrossSections()
    setIsSyncing(false)

    if (result.success) {
      toast.success(result.message || 'Courses synced successfully!')
      await loadData()
    } else {
      toast.error(result.error || 'Sync failed')
    }
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedSession('all')
    setSelectedProgramme('all')
    setSelectedSemester('all')
    setSelectedCourseType('all')
    setSelectedDeliveryMode('all')
  }


  return (
    <div className="p-6">
      <Toaster position="top-right" />
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Courses Management</h1>
        <p className="text-gray-600">Manage courses across different programmes and semesters</p>
      </div>

      <div className="flex justify-end gap-3 mb-6">
        <button
          onClick={handleSyncCourses}
          disabled={isSyncing}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-indigo-700 disabled:bg-gray-400 transition-colors shadow-sm"
        >
          <Zap className="h-5 w-5" />
          {isSyncing ? 'Syncing...' : 'Sync Across Sections'}
        </button>
        <button
          onClick={downloadTemplateAndBulkUpload}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Download className="h-5 w-5" />
          Download & Upload
        </button>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5" />
          Add Course
        </button>
      </div>

      {showBulkUploadModal && (
        <BulkUpload
          type="courses"
          onUpload={handleBulkUpload}
          onClose={handleCloseBulkUpload}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <div className="w-8 h-8 bg-blue-600 rounded"></div>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Courses</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalCourses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <div className="w-8 h-8 bg-green-600 rounded"></div>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Core Courses</p>
              <p className="text-3xl font-bold text-gray-900">{stats.coreCourses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <div className="w-8 h-8 bg-purple-600 rounded"></div>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Electives</p>
              <p className="text-3xl font-bold text-gray-900">{stats.electives}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <div className="w-8 h-8 bg-orange-600 rounded"></div>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Theory Courses</p>
              <p className="text-3xl font-bold text-gray-900">{stats.theoryCourses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <div className="w-8 h-8 bg-red-600 rounded"></div>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Practical Courses</p>
              <p className="text-3xl font-bold text-gray-900">{stats.practicalCourses}</p>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 max-h-[80vh] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            {editingId ? 'Edit Course' : 'Add New Course'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-800">Programme</label>
                <select
                  value={formData.programmeId}
                  onChange={(e) => handleProgrammeChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                >
                  <option value="">Select Programme</option>
                  {programmes.map((prog) => (
                    <option key={prog.id} value={prog.id}>
                      {prog.programmeCode} - {prog.programmeName} {prog.section ? `(Sec ${prog.section})` : ''} [{prog.session}]
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-800">
                  Session <span className="text-green-600 text-xs">(Auto-filled)</span>
                </label>
                <input
                  type="text"
                  placeholder="2024-2025"
                  value={formData.session}
                  onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-gray-50"
                  required
                  readOnly={!!formData.programmeId}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-800">
                  Semester <span className="text-green-600 text-xs">(Auto-filled)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-gray-50"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-800">Course Code</label>
                <input
                  type="text"
                  placeholder="CS101"
                  value={formData.courseCode}
                  onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-800">Course Name</label>
                <input
                  type="text"
                  placeholder="Data Structures"
                  value={formData.courseName}
                  onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>
            </div>

            <div className="border border-gray-300 p-4 rounded-lg bg-gray-50">
              <h3 className="font-semibold mb-3 text-gray-900">L-T-P-S Credits System</h3>
              <div className="grid grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-800">L (Lecture)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.l}
                    onChange={(e) => setFormData({ ...formData, l: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-800">T (Tutorial)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.t}
                    onChange={(e) => setFormData({ ...formData, t: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-800">P (Practical)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.p}
                    onChange={(e) => setFormData({ ...formData, p: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-800">S (Self-Study)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.s}
                    onChange={(e) => setFormData({ ...formData, s: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-800">Credits</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="border border-gray-300 p-4 rounded-lg bg-gray-50">
              <h3 className="font-semibold mb-3 text-gray-900">Course Type & Delivery Mode</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-800">Course Type *</label>
                  <select
                    value={formData.courseType}
                    onChange={(e) => setFormData({ ...formData, courseType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  >
                    {courseTypeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-800">Delivery Mode *</label>
                  <select
                    value={formData.deliveryMode}
                    onChange={(e) => setFormData({ ...formData, deliveryMode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  >
                    {deliveryModeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-800">Total Hours/Week</label>
                <input
                  type="number"
                  min="0"
                  value={formData.totalHours}
                  onChange={(e) => setFormData({ ...formData, totalHours: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-800">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="MANDATORY">MANDATORY</option>
                  <option value="ELECTIVE">ELECTIVE</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-800">Room No.</label>
                <input
                  type="text"
                  placeholder="A-101"
                  value={formData.roomNo}
                  onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.attendance}
                    onChange={(e) => setFormData({ ...formData, attendance: e.target.checked })}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-800">Attendance Required</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
              >
                {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter & Search Courses</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
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

          {/* ✅ UPDATED: Programme dropdown with section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Programme</label>
            <select
              value={selectedProgramme}
              onChange={(e) => setSelectedProgramme(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
              <option value="all">All Programmes</option>
              {availableProgrammes.map((prog) => {
                const sectionText = prog.section ? ` (Sec ${prog.section})` : ''
                return (
                  <option key={prog.id} value={prog.id}>
                    {prog.code} - {prog.name}{sectionText}
                  </option>
                )
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
              <option value="all">All Semesters</option>
              {availableSemesters.map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course Type</label>
            <select
              value={selectedCourseType}
              onChange={(e) => setSelectedCourseType(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
              <option value="all">All Types</option>
              {courseTypeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Mode</label>
            <select
              value={selectedDeliveryMode}
              onChange={(e) => setSelectedDeliveryMode(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
              <option value="all">All Modes</option>
              {deliveryModeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search Courses</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by programme code/name, course code, or course name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
            />
          </div>
        </div>

        {(searchTerm || selectedSession !== 'all' || selectedProgramme !== 'all' || selectedSemester !== 'all' || selectedCourseType !== 'all' || selectedDeliveryMode !== 'all') && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredCourses.length} of {courses.length} course{filteredCourses.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Academic Courses</h3>
            <p className="text-sm text-gray-600">
              {selectedSession !== 'all' ? `Session: ${selectedSession}` : 'All Sessions'}
              {selectedProgramme !== 'all' && ` • ${availableProgrammes.find(p => p.id === selectedProgramme)?.code}`}
              {selectedSemester !== 'all' && ` • Semester ${selectedSemester}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">{filteredCourses.length}</p>
            <p className="text-sm text-gray-600">courses</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Programme</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Section</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Session</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Sem</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">L-T-P-S</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Cr</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Mode</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-800 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <Search className="h-12 w-12 mb-3 text-gray-400" />
                        <p className="text-lg font-medium">No courses found</p>
                        <p className="text-sm mt-1">
                          {searchTerm || selectedSession !== 'all' || selectedProgramme !== 'all' || selectedSemester !== 'all' || selectedCourseType !== 'all' || selectedDeliveryMode !== 'all'
                            ? 'Try adjusting your filters or search terms' 
                            : 'Start by adding a new course'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-blue-600">{course.courseCode}</td>
                      <td className="px-6 py-4 text-gray-900">{course.courseName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{course.programme.programmeCode}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {course.programme.section ? (
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-cyan-100 text-cyan-900">
                            Section {course.programme.section}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-800">{course.session}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-800">{course.semester}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-800">{course.l}-{course.t}-{course.p}-{course.s}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{course.credits}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-900">
                          {course.courseType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          course.deliveryMode === 'THEORY' ? 'bg-green-100 text-green-900' :
                          course.deliveryMode === 'PRACTICAL' ? 'bg-orange-100 text-orange-900' :
                          'bg-purple-100 text-purple-900'
                        }`}>
                          {course.deliveryMode}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          course.category === 'MANDATORY' ? 'bg-red-100 text-red-900' : 'bg-yellow-100 text-yellow-900'
                        }`}>
                          {course.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button onClick={() => handleEdit(course)} className="text-blue-700 hover:text-blue-900 mr-4 transition-colors" title="Edit">
                          <Edit className="h-5 w-5 inline" />
                        </button>
                        <button onClick={() => handleDelete(course.id)} className="text-red-700 hover:text-red-900 transition-colors" title="Delete">
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
