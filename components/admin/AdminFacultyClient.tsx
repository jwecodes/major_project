'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Upload as UploadIcon, Search, Grid, List, BookOpen, Users, X } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import BulkUpload from '@/components/admin/BulkUpload'
import { bulkUploadFaculty } from '@/app/actions/admin'

interface Faculty {
  id: string
  facultyId: string
  name: string
  designation: string
  email: string
  contactNo: string | null
  department: string | null
  _count?: {
    courseAllocations: number
  }
}

interface Course {
  id: string
  courseCode: string
  courseName: string
  semester: number
  programme: {
    programmeCode: string
    programmeName: string
    session: string
    section: string | null
  }
}

interface SelectedCourse {
  courseId: string
  role: 'COORDINATOR' | 'CONTRIBUTOR'
}

export default function AdminFacultyClient() {
  const router = useRouter()
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [filteredFaculty, setFilteredFaculty] = useState<Faculty[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [courseSearchTerm, setCourseSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [showCourseDropdown, setShowCourseDropdown] = useState(false)
  
  // Selected data
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null)
  const [selectedCourses, setSelectedCourses] = useState<SelectedCourse[]>([])
  
  // Form data
  const [formData, setFormData] = useState({
    facultyId: '',
    name: '',
    designation: '',
    email: '',
    contactNo: '',
    department: ''
  })

  useEffect(() => {
    loadFaculty()
  }, [])

  useEffect(() => {
    filterFaculty()
  }, [faculty, searchTerm])

  const loadFaculty = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/faculty')
      const data = await res.json()

      if (data.success) {
        setFaculty(data.faculty)
      } else {
        toast.error('Error loading faculty')
      }
    } catch (error) {
      console.error('Error loading faculty:', error)
      toast.error('Error loading faculty')
    } finally {
      setLoading(false)
    }
  }

  const loadCourses = async () => {
    try {
      setLoadingCourses(true)
      console.log('🔄 Loading all courses...')
      
      const res = await fetch('/api/admin/courses')
      const data = await res.json()

      console.log('📚 Courses loaded:', data.courses?.length || 0)

      if (data.success && data.courses) {
        setCourses(data.courses)
        console.log('✅ Courses set in state')
      } else {
        console.error('❌ Failed to load courses:', data)
        toast.error('Error loading courses')
      }
    } catch (error) {
      console.error('❌ Error loading courses:', error)
      toast.error('Error loading courses')
    } finally {
      setLoadingCourses(false)
    }
  }

  const filterFaculty = () => {
    if (!searchTerm.trim()) {
      setFilteredFaculty(faculty)
      return
    }

    const search = searchTerm.toLowerCase()
    const filtered = faculty.filter(
      f =>
        f.name.toLowerCase().includes(search) ||
        f.facultyId.toLowerCase().includes(search) ||
        f.email.toLowerCase().includes(search) ||
        f.designation.toLowerCase().includes(search) ||
        (f.department && f.department.toLowerCase().includes(search))
    )
    setFilteredFaculty(filtered)
  }

  const getFilteredCourses = () => {
    if (!courseSearchTerm.trim()) return courses
    
    const search = courseSearchTerm.toLowerCase()
    return courses.filter(
      c =>
        c.courseCode.toLowerCase().includes(search) ||
        c.courseName.toLowerCase().includes(search) ||
        c.programme.programmeCode.toLowerCase().includes(search) ||
        c.programme.programmeName.toLowerCase().includes(search) ||
        c.programme.session.toLowerCase().includes(search) ||
        (c.programme.section && c.programme.section.toLowerCase().includes(search)) ||
        c.semester.toString().includes(search)
    )
  }

  const handleCourseToggle = (courseId: string) => {
    const exists = selectedCourses.find(c => c.courseId === courseId)
    
    if (exists) {
      setSelectedCourses(selectedCourses.filter(c => c.courseId !== courseId))
    } else {
      setSelectedCourses([...selectedCourses, { courseId, role: 'CONTRIBUTOR' }])
    }
  }

  const handleRoleChange = (courseId: string, role: 'COORDINATOR' | 'CONTRIBUTOR') => {
    setSelectedCourses(
      selectedCourses.map(c =>
        c.courseId === courseId ? { ...c, role } : c
      )
    )
  }

  const removeCourse = (courseId: string) => {
    setSelectedCourses(selectedCourses.filter(c => c.courseId !== courseId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = selectedFaculty
        ? `/api/admin/faculty/${selectedFaculty.id}`
        : '/api/admin/faculty'
      
      const method = selectedFaculty ? 'PUT' : 'POST'

      const payload = {
        facultyId: formData.facultyId,
        name: formData.name,
        designation: formData.designation,
        email: formData.email,
        contactNo: formData.contactNo,
        department: formData.department,
        courses: selectedCourses
      }

      console.log('📤 Submitting payload:', payload)

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      console.log('📥 Response:', data)

      if (data.success) {
        toast.success(selectedFaculty ? 'Faculty updated!' : 'Faculty added!')
        await loadFaculty()
        handleCloseModal()
      } else {
        toast.error(data.error || 'Error saving faculty')
      }
    } catch (error) {
      console.error('❌ Submit error:', error)
      toast.error('Error saving faculty')
    }
  }

  const handleEdit = async (facultyMember: Faculty) => {
    console.log('🖊️ Editing faculty:', facultyMember)
    
    setSelectedFaculty(facultyMember)
    setFormData({
      facultyId: facultyMember.facultyId,
      name: facultyMember.name,
      designation: facultyMember.designation,
      email: facultyMember.email,
      contactNo: facultyMember.contactNo || '',
      department: facultyMember.department || ''
    })
    
    setShowEditModal(true)
    setLoadingCourses(true)
    
    try {
      console.log('1️⃣ Loading courses...')
      await loadCourses()
      
      await new Promise(resolve => setTimeout(resolve, 100))
      
      console.log('2️⃣ Loading existing course allocations...')
      await loadExistingCourses(facultyMember.id)
      
      console.log('✅ Edit data loaded successfully')
    } catch (error) {
      console.error('❌ Error loading edit data:', error)
      toast.error('Error loading course data')
    } finally {
      setLoadingCourses(false)
    }
  }

  const loadExistingCourses = async (facultyId: string) => {
    try {
      console.log('📚 Fetching courses for faculty:', facultyId)
      
      const res = await fetch(`/api/admin/faculty/${facultyId}/courses`)
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      const data = await res.json()
      console.log('📦 Received allocations data:', data)
      
      if (data.success && data.allocations && Array.isArray(data.allocations)) {
        console.log(`Found ${data.allocations.length} allocations`)
        
        const mappedCourses = data.allocations.map((alloc: any) => {
          console.log('🔍 Mapping allocation:', {
            courseId: alloc.course.id,
            courseCode: alloc.course.courseCode,
            role: alloc.role
          })
          return {
            courseId: alloc.course.id,
            role: alloc.role
          }
        })
        
        console.log('✅ Setting selected courses:', mappedCourses)
        setSelectedCourses(mappedCourses)
      } else {
        console.log('⚠️ No allocations found or invalid data')
        setSelectedCourses([])
      }
    } catch (error) {
      console.error('❌ Error loading existing courses:', error)
      toast.error('Error loading assigned courses')
      setSelectedCourses([])
    }
  }

  const handleOpenAddModal = async () => {
    setShowAddModal(true)
    setLoadingCourses(true)
    await loadCourses()
    setLoadingCourses(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this faculty member? This will also remove all course allocations.')) return

    try {
      const res = await fetch(`/api/admin/faculty/${id}`, { method: 'DELETE' })
      const data = await res.json()

      if (data.success) {
        toast.success('Faculty deleted!')
        loadFaculty()
      } else {
        toast.error(data.error || 'Error deleting faculty')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Error deleting faculty')
    }
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setShowEditModal(false)
    setSelectedFaculty(null)
    setSelectedCourses([])
    setCourseSearchTerm('')
    setShowCourseDropdown(false)
    setFormData({
      facultyId: '',
      name: '',
      designation: '',
      email: '',
      contactNo: '',
      department: ''
    })
  }

  const getCourseDetails = (courseId: string) => {
    const course = courses.find(c => c.id === courseId)
    if (!course) {
      console.warn('⚠️ Course not found:', courseId)
    }
    return course
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading faculty...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Faculty Management</h1>
          <p className="text-gray-600">Manage faculty members and their courses</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowBulkUpload(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium transition-colors"
          >
            <UploadIcon className="h-5 w-5" />
            Bulk Upload
          </button>
          <button
            onClick={handleOpenAddModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Faculty
          </button>
        </div>
      </div>

      {/* Search and View Toggle */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex justify-between items-center">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, ID, email, designation..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Grid className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Faculty Count */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredFaculty.length}</span> of{' '}
          <span className="font-semibold text-gray-900">{faculty.length}</span> faculty members
        </p>
      </div>

      {/* Faculty List - Grid/List View */}
      {filteredFaculty.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">No faculty found</p>
          <p className="text-gray-500 text-sm mt-2">
            {searchTerm ? 'Try adjusting your search' : 'Add your first faculty member'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFaculty.map((facultyMember) => (
            <div
              key={facultyMember.id}
              className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{facultyMember.name}</h3>
                      <p className="text-sm text-gray-600">{facultyMember.facultyId}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <p>
                    <span className="font-medium text-gray-700">Designation:</span>{' '}
                    <span className="text-gray-600">{facultyMember.designation}</span>
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">Email:</span>{' '}
                    <span className="text-gray-600">{facultyMember.email}</span>
                  </p>
                  {facultyMember.contactNo && (
                    <p>
                      <span className="font-medium text-gray-700">Contact:</span>{' '}
                      <span className="text-gray-600">{facultyMember.contactNo}</span>
                    </p>
                  )}
                  {facultyMember.department && (
                    <p>
                      <span className="font-medium text-gray-700">Department:</span>{' '}
                      <span className="text-gray-600">{facultyMember.department}</span>
                    </p>
                  )}
                  {facultyMember._count && (
                    <p>
                      <span className="font-medium text-gray-700">Courses:</span>{' '}
                      <span className="text-blue-600 font-semibold">{facultyMember._count.courseAllocations}</span>
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => router.push(`/admin/faculty/${facultyMember.id}`)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    <BookOpen className="h-4 w-4" />
                    Courses & Content
                  </button>
                  <button
                    onClick={() => handleEdit(facultyMember)}
                    className="p-2 text-blue-700 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(facultyMember.id)}
                    className="p-2 text-red-700 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Faculty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Designation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Courses
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFaculty.map((facultyMember) => (
                <tr key={facultyMember.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{facultyMember.name}</div>
                      <div className="text-sm text-gray-500">{facultyMember.facultyId}</div>
                      <div className="text-sm text-gray-500">{facultyMember.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {facultyMember.designation}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {facultyMember.contactNo || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {facultyMember.department || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                      {facultyMember._count?.courseAllocations || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => router.push(`/admin/faculty/${facultyMember.id}`)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Courses & Content"
                      >
                        <BookOpen className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(facultyMember)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(facultyMember.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl my-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-lg">
              <h2 className="text-2xl font-bold">
                {selectedFaculty ? 'Edit Faculty' : 'Add New Faculty'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Faculty ID *
                  </label>
                  <input
                    type="text"
                    value={formData.facultyId}
                    onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Designation *</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                  <input
                    type="tel"
                    value={formData.contactNo}
                    onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              </div>

              {/* COURSE ASSIGNMENT SECTION */}
              <div className="border-t pt-4 mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Courses (Optional)
                  {loadingCourses && (
                    <span className="ml-2 text-xs text-blue-600">Loading...</span>
                  )}
                </label>
                
                {/* Selected Courses Display */}
                {selectedCourses.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {selectedCourses.map((sc) => {
                      const courseDetails = getCourseDetails(sc.courseId)
                      return (
                        <div key={sc.courseId} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">
                              {courseDetails?.courseCode || 'Unknown'} - {courseDetails?.courseName || 'Loading...'}
                            </p>
                            {courseDetails && (
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-medium">
                                  {courseDetails.programme.programmeCode}
                                  {courseDetails.programme.section ? `-${courseDetails.programme.section}` : ''}
                                </span>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium">
                                  Sem {courseDetails.semester}
                                </span>
                                <span className="text-xs text-gray-600">
                                  {courseDetails.programme.session}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={sc.role}
                              onChange={(e) => handleRoleChange(sc.courseId, e.target.value as 'COORDINATOR' | 'CONTRIBUTOR')}
                              className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                            >
                              <option value="CONTRIBUTOR">Contributor</option>
                              <option value="COORDINATOR">Coordinator</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => removeCourse(sc.courseId)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Course Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      if (courses.length === 0 && !loadingCourses) {
                        toast.error('No courses available. Please add courses first.')
                        return
                      }
                      setShowCourseDropdown(!showCourseDropdown)
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white hover:bg-gray-50 text-gray-900"
                    disabled={loadingCourses}
                  >
                    {loadingCourses ? 'Loading courses...' : 
                     selectedCourses.length === 0 ? 'Select courses...' : 
                     `${selectedCourses.length} course(s) selected`}
                  </button>

                  {showCourseDropdown && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                      {/* Search */}
                      <div className="p-3 border-b bg-gray-50 sticky top-0">
                        <div className="relative">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            value={courseSearchTerm}
                            onChange={(e) => setCourseSearchTerm(e.target.value)}
                            placeholder="Search by code, name, programme, semester..."
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Showing {getFilteredCourses().length} of {courses.length} courses
                        </p>
                      </div>

                      {/* Course List */}
                      <div className="max-h-64 overflow-y-auto">
                        {getFilteredCourses().length === 0 ? (
                          <div className="p-4 text-center text-gray-500 text-sm">
                            {courseSearchTerm ? 'No courses match your search' : 'No courses found'}
                          </div>
                        ) : (
                          getFilteredCourses().map((course) => {
                            const isSelected = selectedCourses.some(sc => sc.courseId === course.id)
                            return (
                              <div
                                key={course.id}
                                onClick={() => handleCourseToggle(course.id)}
                                className={`p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 transition-colors ${
                                  isSelected ? 'bg-blue-50' : ''
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {}}
                                    className="mt-1"
                                  />
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900 text-sm">
                                      {course.courseCode} - {course.courseName}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-medium">
                                        {course.programme.programmeCode}
                                        {course.programme.section ? `-${course.programme.section}` : ''}
                                      </span>
                                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium">
                                        Sem {course.semester}
                                      </span>
                                      <span className="text-xs text-gray-600">
                                        {course.programme.session}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-gray-500 mt-1">
                  You can assign courses now or later from the faculty details page
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white">
                <button
                  type="submit"
                  disabled={loadingCourses}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:bg-gray-400"
                >
                  {selectedFaculty ? 'Update Faculty' : 'Add Faculty'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK UPLOAD MODAL */}
      {showBulkUpload && (
        <BulkUpload
          type="faculty"
          onUpload={bulkUploadFaculty}
          onClose={() => {
            setShowBulkUpload(false)
            loadFaculty()
          }}
        />
      )}
    </div>
  )
}
