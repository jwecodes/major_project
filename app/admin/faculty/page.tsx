// 'use client'
// import { useState, useEffect } from 'react'
// import { Plus, Edit, Trash2, Upload as UploadIcon, BookOpen, X, Search, Grid, List, BarChart3, Users, Award } from 'lucide-react'
// import toast, { Toaster } from 'react-hot-toast'
// import { createFaculty, getFaculty, updateFaculty, deleteFaculty, bulkUploadFaculty, getCourses, allocateFaculty, getCourseAllocations, removeAllocation } from '@/app/actions/admin'
// import BulkUpload from '@/components/admin/BulkUpload'

// interface Faculty {
//   id: string
//   facultyId: string
//   name: string
//   designation: string
//   email: string
//   contactNo: string
//   department: string | null
//   session: string
// }

// interface Course {
//   id: string
//   courseCode: string
//   courseName: string
//   session: string
//   semester: number
//   programme: {
//     programmeCode: string
//     programmeName: string
//   }
// }

// interface FacultyWithCourses extends Faculty {
//   allocatedCourses?: number
//   workloadHours?: number
// }

// export default function FacultyPage() {
//   const [faculty, setFaculty] = useState<FacultyWithCourses[]>([])
//   const [filteredFaculty, setFilteredFaculty] = useState<FacultyWithCourses[]>([])
//   const [courses, setCourses] = useState<Course[]>([])
//   const [allAllocations, setAllAllocations] = useState<any[]>([])
//   const [showForm, setShowForm] = useState(false)
//   const [showBulkUpload, setShowBulkUpload] = useState(false)
//   const [showCourseModal, setShowCourseModal] = useState(false)
//   const [selectedFacultyForCourses, setSelectedFacultyForCourses] = useState<Faculty | null>(null)
//   const [facultyCourses, setFacultyCourses] = useState<any[]>([])
//   const [selectedCourse, setSelectedCourse] = useState('')
//   const [loading, setLoading] = useState(false)
  
//   // View mode
//   const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
//   const [activeTab, setActiveTab] = useState<'overview' | 'directory' | 'allocations' | 'workload'>('overview')
  
//   // Filter states
//   const [searchTerm, setSearchTerm] = useState('')
//   const [selectedDesignation, setSelectedDesignation] = useState<string>('all')
//   const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
//   const [selectedSession, setSelectedSession] = useState<string>('all')
//   const [availableDesignations, setAvailableDesignations] = useState<string[]>([])
//   const [availableDepartments, setAvailableDepartments] = useState<string[]>([])
//   const [availableSessions, setAvailableSessions] = useState<string[]>([])
  
//   const [formData, setFormData] = useState({
//     facultyId: '',
//     name: '',
//     designation: '',
//     email: '',
//     contactNo: '',
//     department: '',
//     session: ''
//   })
//   const [editingId, setEditingId] = useState<string | null>(null)

//   // Statistics
//   const [stats, setStats] = useState({
//     totalFaculty: 0,
//     professors: 0,
//     associateProfessors: 0,
//     assistantProfessors: 0,
//     totalAllocations: 0,
//     avgCoursesPerFaculty: 0
//   })

//   // Workload data for visualization
//   const [workloadData, setWorkloadData] = useState<{faculty: string, courses: number, hours: number}[]>([])

//   // Sorting function for faculty
//   const sortFaculty = (facultyToSort: FacultyWithCourses[]): FacultyWithCourses[] => {
//     return [...facultyToSort].sort((a, b) => {
//       const designationOrder: Record<string, number> = {
//         'Professor': 1,
//         'Associate Professor': 2,
//         'Assistant Professor': 3,
//         'Lecturer': 4
//       }
      
//       const aOrder = designationOrder[a.designation] || 999
//       const bOrder = designationOrder[b.designation] || 999
      
//       if (aOrder !== bOrder) {
//         return aOrder - bOrder
//       }

//       const aDept = a.department || ''
//       const bDept = b.department || ''
//       if (aDept !== bDept) {
//         return aDept.localeCompare(bDept)
//       }

//       return a.name.localeCompare(b.name)
//     })
//   }

//   useEffect(() => {
//     loadData()
//   }, [])

//   useEffect(() => {
//     let filtered = faculty

//     if (selectedDesignation !== 'all') {
//       filtered = filtered.filter(fac => fac.designation === selectedDesignation)
//     }

//     if (selectedDepartment !== 'all') {
//       filtered = filtered.filter(fac => fac.department === selectedDepartment)
//     }

//     if (selectedSession !== 'all') {
//       filtered = filtered.filter(fac => fac.session === selectedSession)
//     }

//     if (searchTerm.trim() !== '') {
//       filtered = filtered.filter(fac => 
//         fac.facultyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         fac.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         fac.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         fac.contactNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         (fac.department && fac.department.toLowerCase().includes(searchTerm.toLowerCase()))
//       )
//     }

//     const sortedFiltered = sortFaculty(filtered)
//     setFilteredFaculty(sortedFiltered)
//   }, [searchTerm, selectedDesignation, selectedDepartment, selectedSession, faculty])

//   const loadData = async () => {
//     const [facultyData, coursesData] = await Promise.all([
//       getFaculty(),
//       getCourses()
//     ])
    
//     // Load all allocations
//     const allocations = await Promise.all(
//       coursesData.map(course => getCourseAllocations(course.id))
//     )
//     const flatAllocations = allocations.flat()
//     setAllAllocations(flatAllocations)

//     // Calculate workload for each faculty
//     const facultyWithWorkload = facultyData.map(fac => {
//       const facAllocations = flatAllocations.filter(alloc => alloc.facultyId === fac.id)
//       return {
//         ...fac,
//         allocatedCourses: facAllocations.length,
//         workloadHours: facAllocations.length * 4 // Assuming 4 hours per course
//       }
//     })
    
//     const sortedFaculty = sortFaculty(facultyWithWorkload)
//     setFaculty(sortedFaculty)
//     setFilteredFaculty(sortedFaculty)
//     setCourses(coursesData)

//     // Generate workload data
//     const workload = facultyWithWorkload
//       .sort((a, b) => (b.allocatedCourses || 0) - (a.allocatedCourses || 0))
//       .slice(0, 10) // Top 10
//       .map(fac => ({
//         faculty: fac.name.split(' ').slice(-1)[0], // Last name
//         courses: fac.allocatedCourses || 0,
//         hours: fac.workloadHours || 0
//       }))
//     setWorkloadData(workload)

//     const designations = Array.from(new Set(facultyData.map(f => f.designation))).sort()
//     setAvailableDesignations(designations)

//     const departments = Array.from(new Set(facultyData.map(f => f.department).filter(d => d !== null))).sort()
//     setAvailableDepartments(departments as string[])

//     const sessions = Array.from(new Set(facultyData.map(f => f.session))).sort().reverse()
//     setAvailableSessions(sessions)

//     if (sessions.length > 0 && selectedSession === 'all') {
//       setSelectedSession(sessions[0])
//     }

//     const professors = facultyData.filter(f => f.designation === 'Professor').length
//     const associateProfs = facultyData.filter(f => f.designation === 'Associate Professor').length
//     const assistantProfs = facultyData.filter(f => f.designation === 'Assistant Professor').length
//     const avgCourses = facultyData.length > 0 ? Math.round(flatAllocations.length / facultyData.length * 10) / 10 : 0

//     setStats({
//       totalFaculty: facultyData.length,
//       professors: professors,
//       associateProfessors: associateProfs,
//       assistantProfessors: assistantProfs,
//       totalAllocations: flatAllocations.length,
//       avgCoursesPerFaculty: avgCourses
//     })
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setLoading(true)
    
//     const result = editingId 
//       ? await updateFaculty(editingId, formData)
//       : await createFaculty(formData)
    
//     if (result.success) {
//       toast.success(editingId ? 'Faculty updated!' : 'Faculty created!')
//       resetForm()
//       await loadData()
//     } else {
//       toast.error(result.error || 'An error occurred')
//     }
    
//     setLoading(false)
//   }

//   const resetForm = () => {
//     setFormData({
//       facultyId: '',
//       name: '',
//       designation: '',
//       email: '',
//       contactNo: '',
//       department: '',
//       session: ''
//     })
//     setShowForm(false)
//     setEditingId(null)
//   }

//   const handleDelete = async (id: string) => {
//     if (!confirm('Delete this faculty member? All course allocations will also be removed.')) return
    
//     const result = await deleteFaculty(id)
//     if (result.success) {
//       toast.success('Faculty deleted!')
//       loadData()
//     } else {
//       toast.error(result.error || 'Failed to delete')
//     }
//   }

//   const handleEdit = (fac: Faculty) => {
//     setFormData({
//       facultyId: fac.facultyId,
//       name: fac.name,
//       designation: fac.designation,
//       email: fac.email,
//       contactNo: fac.contactNo,
//       department: fac.department || '',
//       session: fac.session
//     })
//     setEditingId(fac.id)
//     setShowForm(true)
//   }

//   const handleManageCourses = async (fac: Faculty) => {
//     setSelectedFacultyForCourses(fac)
//     setShowCourseModal(true)
//     const facCourses = allAllocations.filter(alloc => alloc.facultyId === fac.id)
//     setFacultyCourses(facCourses)
//   }

//   const handleAllocateCourse = async () => {
//     if (!selectedCourse || !selectedFacultyForCourses) {
//       toast.error('Please select a course')
//       return
//     }

//     const result = await allocateFaculty(selectedCourse, selectedFacultyForCourses.id, 'CONTRIBUTOR')
//     if (result.success) {
//       toast.success('Course allocated successfully')
//       setSelectedCourse('')
//       await loadData()
//       handleManageCourses(selectedFacultyForCourses)
//     } else {
//       toast.error(result.error || 'Failed to allocate course')
//     }
//   }

//   const handleRemoveCourse = async (allocationId: string) => {
//     if (!confirm('Remove this course allocation?')) return
    
//     const result = await removeAllocation(allocationId)
//     if (result.success) {
//       toast.success('Course allocation removed')
//       await loadData()
//       if (selectedFacultyForCourses) {
//         handleManageCourses(selectedFacultyForCourses)
//       }
//     } else {
//       toast.error(result.error || 'Failed to remove')
//     }
//   }

//   const handleBulkUpload = async (data: any[]) => {
//     const result = await bulkUploadFaculty(data)
//     if (result.success) {
//       await loadData()
//     }
//     return result
//   }

//   const handleCloseBulkUpload = () => {
//     setShowBulkUpload(false)
//     loadData()
//   }

//   const handleClearFilters = () => {
//     setSearchTerm('')
//     setSelectedDesignation('all')
//     setSelectedDepartment('all')
//     setSelectedSession('all')
//   }

//   const getWorkloadColor = (courses: number) => {
//     if (courses >= 5) return 'bg-red-500'
//     if (courses >= 3) return 'bg-yellow-500'
//     return 'bg-green-500'
//   }

//   const getWorkloadStatus = (courses: number) => {
//     if (courses >= 5) return 'Overloaded'
//     if (courses >= 3) return 'Optimal'
//     return 'Available'
//   }

//   // Render different tabs
//   const renderTabContent = () => {
//     switch(activeTab) {
//       case 'overview':
//         return renderOverviewTab()
//       case 'directory':
//         return renderDirectoryTab()
//       case 'allocations':
//         return renderAllocationsTab()
//       case 'workload':
//         return renderWorkloadTab()
//       default:
//         return renderDirectoryTab()
//     }
//   }

//   const renderOverviewTab = () => (
//     <div className="space-y-6">
//       {/* Statistics Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//           <div className="flex items-center gap-4">
//             <div className="bg-blue-100 p-3 rounded-lg">
//               <Users className="h-8 w-8 text-blue-600" />
//             </div>
//             <div>
//               <p className="text-gray-600 text-sm font-medium">Total Faculty</p>
//               <p className="text-3xl font-bold text-gray-900">{stats.totalFaculty}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//           <div className="flex items-center gap-4">
//             <div className="bg-green-100 p-3 rounded-lg">
//               <BookOpen className="h-8 w-8 text-green-600" />
//             </div>
//             <div>
//               <p className="text-gray-600 text-sm font-medium">Total Allocations</p>
//               <p className="text-3xl font-bold text-gray-900">{stats.totalAllocations}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//           <div className="flex items-center gap-4">
//             <div className="bg-purple-100 p-3 rounded-lg">
//               <BarChart3 className="h-8 w-8 text-purple-600" />
//             </div>
//             <div>
//               <p className="text-gray-600 text-sm font-medium">Avg Courses/Faculty</p>
//               <p className="text-3xl font-bold text-gray-900">{stats.avgCoursesPerFaculty}</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Quick Stats by Designation */}
//       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">Faculty Distribution by Designation</h3>
//         <div className="grid grid-cols-4 gap-4">
//           <div className="text-center p-4 bg-purple-50 rounded-lg">
//             <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
//             <p className="text-2xl font-bold text-gray-900">{stats.professors}</p>
//             <p className="text-sm text-gray-600">Professors</p>
//           </div>
//           <div className="text-center p-4 bg-blue-50 rounded-lg">
//             <Award className="h-8 w-8 text-blue-600 mx-auto mb-2" />
//             <p className="text-2xl font-bold text-gray-900">{stats.associateProfessors}</p>
//             <p className="text-sm text-gray-600">Associate Professors</p>
//           </div>
//           <div className="text-center p-4 bg-green-50 rounded-lg">
//             <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
//             <p className="text-2xl font-bold text-gray-900">{stats.assistantProfessors}</p>
//             <p className="text-sm text-gray-600">Assistant Professors</p>
//           </div>
//           <div className="text-center p-4 bg-gray-50 rounded-lg">
//             <Award className="h-8 w-8 text-gray-600 mx-auto mb-2" />
//             <p className="text-2xl font-bold text-gray-900">
//               {stats.totalFaculty - stats.professors - stats.associateProfessors - stats.assistantProfessors}
//             </p>
//             <p className="text-sm text-gray-600">Others</p>
//           </div>
//         </div>
//       </div>

//       {/* Recent Activity / Quick Actions */}
//       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//           <button
//             onClick={() => setShowForm(true)}
//             className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
//           >
//             <Plus className="h-6 w-6 text-gray-600 mx-auto mb-2" />
//             <p className="text-sm font-medium text-gray-900">Add Faculty</p>
//           </button>
//           <button
//             onClick={() => setShowBulkUpload(true)}
//             className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
//           >
//             <UploadIcon className="h-6 w-6 text-gray-600 mx-auto mb-2" />
//             <p className="text-sm font-medium text-gray-900">Bulk Upload</p>
//           </button>
//           <button
//             onClick={() => setActiveTab('allocations')}
//             className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
//           >
//             <BookOpen className="h-6 w-6 text-gray-600 mx-auto mb-2" />
//             <p className="text-sm font-medium text-gray-900">View Allocations</p>
//           </button>
//           <button
//             onClick={() => setActiveTab('workload')}
//             className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
//           >
//             <BarChart3 className="h-6 w-6 text-gray-600 mx-auto mb-2" />
//             <p className="text-sm font-medium text-gray-900">Workload Analysis</p>
//           </button>
//         </div>
//       </div>
//     </div>
//   )

//   const renderDirectoryTab = () => (
//     <div className="space-y-6">
//       {/* Filters */}
//       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-lg font-semibold text-gray-900">Filter Faculty</h3>
//           <div className="flex gap-2">
//             <button
//               onClick={() => setViewMode('table')}
//               className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
//             >
//               <List className="h-5 w-5" />
//             </button>
//             <button
//               onClick={() => setViewMode('cards')}
//               className={`p-2 rounded-lg ${viewMode === 'cards' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
//             >
//               <Grid className="h-5 w-5" />
//             </button>
//           </div>
//         </div>
        
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
//             <select
//               value={selectedDesignation}
//               onChange={(e) => setSelectedDesignation(e.target.value)}
//               className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
//             >
//               <option value="all">All Designations</option>
//               {availableDesignations.map((designation) => (
//                 <option key={designation} value={designation}>
//                   {designation}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
//             <select
//               value={selectedDepartment}
//               onChange={(e) => setSelectedDepartment(e.target.value)}
//               className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
//             >
//               <option value="all">All Departments</option>
//               {availableDepartments.map((dept) => (
//                 <option key={dept} value={dept}>
//                   {dept}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Joining Session</label>
//             <select
//               value={selectedSession}
//               onChange={(e) => setSelectedSession(e.target.value)}
//               className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
//             >
//               <option value="all">All Sessions</option>
//               {availableSessions.map((session) => (
//                 <option key={session} value={session}>
//                   {session}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Search Faculty</label>
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search by ID, name, email, contact, or department..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
//             />
//           </div>
//         </div>

//         {(searchTerm || selectedDesignation !== 'all' || selectedDepartment !== 'all' || selectedSession !== 'all') && (
//           <div className="mt-4 flex items-center justify-between">
//             <p className="text-sm text-gray-600">
//               Showing {filteredFaculty.length} of {faculty.length} faculty member{filteredFaculty.length !== 1 ? 's' : ''}
//             </p>
//             <button
//               onClick={handleClearFilters}
//               className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
//             >
//               Clear All Filters
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Faculty List */}
//       {viewMode === 'table' ? renderTableView() : renderCardView()}
//     </div>
//   )

//   const renderTableView = () => (
//     <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//       <div className="overflow-x-auto">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">ID</th>
//               <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Name</th>
//               <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Designation</th>
//               <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Department</th>
//               <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Courses</th>
//               <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Workload</th>
//               <th className="px-6 py-3 text-right text-xs font-bold text-gray-800 uppercase tracking-wider">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {filteredFaculty.length === 0 ? (
//               <tr>
//                 <td colSpan={7} className="px-6 py-12 text-center">
//                   <div className="flex flex-col items-center justify-center text-gray-500">
//                     <Search className="h-12 w-12 mb-3 text-gray-400" />
//                     <p className="text-lg font-medium">No faculty members found</p>
//                   </div>
//                 </td>
//               </tr>
//             ) : (
//               filteredFaculty.map((fac) => (
//                 <tr key={fac.id} className="hover:bg-gray-50 transition-colors">
//                   <td className="px-6 py-4 whitespace-nowrap font-semibold text-blue-600">{fac.facultyId}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">{fac.name}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className={`px-2 py-1 rounded text-xs font-semibold ${
//                       fac.designation === 'Professor' ? 'bg-purple-100 text-purple-900' :
//                       fac.designation === 'Associate Professor' ? 'bg-blue-100 text-blue-900' :
//                       fac.designation === 'Assistant Professor' ? 'bg-green-100 text-green-900' :
//                       'bg-gray-100 text-gray-800'
//                     }`}>
//                       {fac.designation}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-gray-800">{fac.department || '-'}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className="font-semibold text-gray-900">{fac.allocatedCourses || 0}</span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center gap-2">
//                       <div className={`w-2 h-2 rounded-full ${getWorkloadColor(fac.allocatedCourses || 0)}`}></div>
//                       <span className="text-sm text-gray-600">{getWorkloadStatus(fac.allocatedCourses || 0)}</span>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-right">
//                     <div className="flex items-center justify-end gap-2">
//                       <button
//                         onClick={() => handleManageCourses(fac)}
//                         className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 flex items-center gap-1.5 font-medium text-sm transition-colors"
//                       >
//                         <BookOpen className="h-4 w-4" />
//                         Courses
//                       </button>
//                       <button 
//                         onClick={() => handleEdit(fac)} 
//                         className="text-blue-700 hover:text-blue-900 p-1.5 transition-colors"
//                       >
//                         <Edit className="h-5 w-5" />
//                       </button>
//                       <button 
//                         onClick={() => handleDelete(fac.id)} 
//                         className="text-red-700 hover:text-red-900 p-1.5 transition-colors"
//                       >
//                         <Trash2 className="h-5 w-5" />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   )

//   const renderCardView = () => (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//       {filteredFaculty.length === 0 ? (
//         <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
//           <Search className="h-12 w-12 mb-3 text-gray-400" />
//           <p className="text-lg font-medium">No faculty members found</p>
//         </div>
//       ) : (
//         filteredFaculty.map((fac) => (
//           <div key={fac.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
//             <div className="flex items-start justify-between mb-4">
//               <div className="flex items-center gap-3">
//                 <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
//                   {fac.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
//                 </div>
//                 <div>
//                   <h3 className="font-semibold text-gray-900">{fac.name}</h3>
//                   <p className="text-sm text-gray-600">{fac.facultyId}</p>
//                 </div>
//               </div>
//               <div className={`w-3 h-3 rounded-full ${getWorkloadColor(fac.allocatedCourses || 0)}`}></div>
//             </div>

//             <div className="space-y-2 mb-4">
//               <div className="flex items-center justify-between text-sm">
//                 <span className="text-gray-600">Designation:</span>
//                 <span className={`px-2 py-1 rounded text-xs font-semibold ${
//                   fac.designation === 'Professor' ? 'bg-purple-100 text-purple-900' :
//                   fac.designation === 'Associate Professor' ? 'bg-blue-100 text-blue-900' :
//                   fac.designation === 'Assistant Professor' ? 'bg-green-100 text-green-900' :
//                   'bg-gray-100 text-gray-800'
//                 }`}>
//                   {fac.designation}
//                 </span>
//               </div>
//               <div className="flex items-center justify-between text-sm">
//                 <span className="text-gray-600">Department:</span>
//                 <span className="font-medium text-gray-900">{fac.department || '-'}</span>
//               </div>
//               <div className="flex items-center justify-between text-sm">
//                 <span className="text-gray-600">Courses:</span>
//                 <span className="font-semibold text-gray-900">{fac.allocatedCourses || 0}</span>
//               </div>
//               <div className="flex items-center justify-between text-sm">
//                 <span className="text-gray-600">Status:</span>
//                 <span className="text-gray-900">{getWorkloadStatus(fac.allocatedCourses || 0)}</span>
//               </div>
//             </div>

//             <div className="flex gap-2">
//               <button
//                 onClick={() => handleManageCourses(fac)}
//                 className="flex-1 bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200 flex items-center justify-center gap-2 font-medium text-sm transition-colors"
//               >
//                 <BookOpen className="h-4 w-4" />
//                 Manage Courses
//               </button>
//               <button 
//                 onClick={() => handleEdit(fac)} 
//                 className="p-2 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
//               >
//                 <Edit className="h-5 w-5" />
//               </button>
//               <button 
//                 onClick={() => handleDelete(fac.id)} 
//                 className="p-2 text-red-700 hover:bg-red-50 rounded-lg transition-colors"
//               >
//                 <Trash2 className="h-5 w-5" />
//               </button>
//             </div>
//           </div>
//         ))
//       )}
//     </div>
//   )

//   const renderAllocationsTab = () => (
//     <div className="space-y-6">
//       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Allocations Matrix</h3>
//         <div className="overflow-x-auto">
//           <table className="min-w-full">
//             <thead>
//               <tr className="border-b">
//                 <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Faculty</th>
//                 <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Designation</th>
//                 <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Allocated Courses</th>
//                 <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {faculty.map((fac) => (
//                 <tr key={fac.id} className="hover:bg-gray-50">
//                   <td className="px-4 py-3 text-sm font-medium text-gray-900">{fac.name}</td>
//                   <td className="px-4 py-3 text-sm text-gray-600">{fac.designation}</td>
//                   <td className="px-4 py-3 text-sm">
//                     <span className="font-semibold text-gray-900">{fac.allocatedCourses || 0}</span>
//                     <span className="text-gray-600 ml-2">courses</span>
//                   </td>
//                   <td className="px-4 py-3 text-sm">
//                     <div className="flex items-center gap-2">
//                       <div className={`w-2 h-2 rounded-full ${getWorkloadColor(fac.allocatedCourses || 0)}`}></div>
//                       <span>{getWorkloadStatus(fac.allocatedCourses || 0)}</span>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   )

//   const renderWorkloadTab = () => (
//     <div className="space-y-6">
//       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">Faculty Workload Distribution (Top 10)</h3>
//         <div className="space-y-3">
//           {workloadData.map((item, index) => {
//             const maxCourses = Math.max(...workloadData.map(d => d.courses))
//             const percentage = maxCourses > 0 ? (item.courses / maxCourses) * 100 : 0
            
//             return (
//               <div key={index} className="space-y-1">
//                 <div className="flex justify-between text-sm">
//                   <span className="font-medium text-gray-900">{item.faculty}</span>
//                   <span className="text-gray-600">{item.courses} courses • {item.hours}h/week</span>
//                 </div>
//                 <div className="w-full bg-gray-200 rounded-full h-2.5">
//                   <div 
//                     className={`h-2.5 rounded-full ${getWorkloadColor(item.courses)}`}
//                     style={{ width: `${percentage}%` }}
//                   ></div>
//                 </div>
//               </div>
//             )
//           })}
//         </div>
//       </div>

//       {/* Workload Summary */}
//       <div className="grid grid-cols-3 gap-4">
//         <div className="bg-green-50 p-6 rounded-xl border border-green-200">
//           <div className="flex items-center gap-3 mb-2">
//             <div className="w-3 h-3 rounded-full bg-green-500"></div>
//             <h4 className="font-semibold text-gray-900">Available</h4>
//           </div>
//           <p className="text-3xl font-bold text-gray-900">
//             {faculty.filter(f => (f.allocatedCourses || 0) < 3).length}
//           </p>
//           <p className="text-sm text-gray-600 mt-1">faculty members</p>
//         </div>

//         <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
//           <div className="flex items-center gap-3 mb-2">
//             <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
//             <h4 className="font-semibold text-gray-900">Optimal Load</h4>
//           </div>
//           <p className="text-3xl font-bold text-gray-900">
//             {faculty.filter(f => (f.allocatedCourses || 0) >= 3 && (f.allocatedCourses || 0) < 5).length}
//           </p>
//           <p className="text-sm text-gray-600 mt-1">faculty members</p>
//         </div>

//         <div className="bg-red-50 p-6 rounded-xl border border-red-200">
//           <div className="flex items-center gap-3 mb-2">
//             <div className="w-3 h-3 rounded-full bg-red-500"></div>
//             <h4 className="font-semibold text-gray-900">Overloaded</h4>
//           </div>
//           <p className="text-3xl font-bold text-gray-900">
//             {faculty.filter(f => (f.allocatedCourses || 0) >= 5).length}
//           </p>
//           <p className="text-sm text-gray-600 mt-1">faculty members</p>
//         </div>
//       </div>
//     </div>
//   )

//   return (
//     <div className="p-6">
//       <Toaster position="top-right" />
      
//       {/* Header */}
//       <div className="mb-6">
//         <h1 className="text-3xl font-bold text-gray-900 mb-2">Faculty Management</h1>
//         <p className="text-gray-600">Manage faculty members, course allocations, and workload distribution</p>
//       </div>

//       {/* Action Buttons */}
//       <div className="flex justify-end gap-3 mb-6">
//         <button
//           onClick={() => setShowBulkUpload(true)}
//           className="bg-green-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors shadow-sm"
//         >
//           <UploadIcon className="h-5 w-5" />
//           Bulk Upload
//         </button>
//         <button
//           onClick={() => setShowForm(!showForm)}
//           className="bg-blue-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
//         >
//           <Plus className="h-5 w-5" />
//           Add Faculty
//         </button>
//       </div>

//       {showBulkUpload && (
//         <BulkUpload
//           type="faculty"
//           onUpload={handleBulkUpload}
//           onClose={handleCloseBulkUpload}
//         />
//       )}

//       {/* Course Allocation Modal */}
//       {showCourseModal && selectedFacultyForCourses && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
//             <div className="flex justify-between items-center mb-4">
//               <div>
//                 <h2 className="text-2xl font-bold text-gray-900">Manage Courses</h2>
//                 <p className="text-gray-600 mt-1">{selectedFacultyForCourses.name} ({selectedFacultyForCourses.facultyId})</p>
//               </div>
//               <button onClick={() => setShowCourseModal(false)} className="text-gray-500 hover:text-gray-700">
//                 <X className="h-6 w-6" />
//               </button>
//             </div>

//             <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
//               <h3 className="font-semibold text-blue-900 mb-3">Allocate New Course</h3>
//               <div className="flex gap-3">
//                 <select
//                   value={selectedCourse}
//                   onChange={(e) => setSelectedCourse(e.target.value)}
//                   className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
//                 >
//                   <option value="">Select Course...</option>
//                   {courses.map((course) => (
//                     <option key={course.id} value={course.id}>
//                       {course.courseCode} - {course.courseName} (Sem {course.semester}) [{course.session}]
//                     </option>
//                   ))}
//                 </select>
//                 <button
//                   onClick={handleAllocateCourse}
//                   className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 whitespace-nowrap font-medium"
//                 >
//                   Allocate
//                 </button>
//               </div>
//             </div>

//             <div>
//               <h3 className="font-semibold text-gray-900 mb-3">Allocated Courses ({facultyCourses.length})</h3>
//               {facultyCourses.length === 0 ? (
//                 <div className="text-center py-8 text-gray-600">
//                   <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
//                   <p>No courses allocated yet</p>
//                 </div>
//               ) : (
//                 <div className="space-y-2">
//                   {facultyCourses.map((allocation) => {
//                     const course = courses.find(c => c.id === allocation.courseId)
//                     if (!course) return null
//                     return (
//                       <div key={allocation.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
//                         <div className="flex-1">
//                           <div className="font-medium text-gray-900">{course.courseCode} - {course.courseName}</div>
//                           <div className="text-sm text-gray-600">
//                             {course.programme.programmeCode} • Semester {course.semester} • {course.session}
//                           </div>
//                         </div>
//                         <div className="flex items-center gap-3">
//                           <span className={`px-2 py-1 rounded text-xs font-semibold ${
//                             allocation.role === 'COORDINATOR' ? 'bg-yellow-100 text-yellow-900' : 'bg-gray-100 text-gray-800'
//                           }`}>
//                             {allocation.role}
//                           </span>
//                           <button
//                             onClick={() => handleRemoveCourse(allocation.id)}
//                             className="text-red-600 hover:text-red-900"
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </button>
//                         </div>
//                       </div>
//                     )
//                   })}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {showForm && (
//         <div className="bg-white p-6 rounded-lg shadow-md mb-6">
//           <h2 className="text-xl font-semibold mb-4 text-gray-900">
//             {editingId ? 'Edit Faculty' : 'Add New Faculty'}
//           </h2>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium mb-1 text-gray-800">Faculty ID</label>
//                 <input
//                   type="text"
//                   placeholder="FAC001"
//                   value={formData.facultyId}
//                   onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
//                   required
//                   disabled={!!editingId}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-1 text-gray-800">Full Name</label>
//                 <input
//                   type="text"
//                   placeholder="Dr. John Doe"
//                   value={formData.name}
//                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
//                   required
//                 />
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium mb-1 text-gray-800">Email</label>
//                 <input
//                   type="email"
//                   placeholder="john.doe@university.edu"
//                   value={formData.email}
//                   onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
//                   required
//                   disabled={!!editingId}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-1 text-gray-800">Contact Number</label>
//                 <input
//                   type="tel"
//                   placeholder="+91-9876543210"
//                   value={formData.contactNo}
//                   onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
//                   required
//                 />
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium mb-1 text-gray-800">Designation</label>
//                 <select
//                   value={formData.designation}
//                   onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
//                   required
//                 >
//                   <option value="">Select Designation</option>
//                   <option value="Professor">Professor</option>
//                   <option value="Associate Professor">Associate Professor</option>
//                   <option value="Assistant Professor">Assistant Professor</option>
//                   <option value="Lecturer">Lecturer</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-1 text-gray-800">Department</label>
//                 <input
//                   type="text"
//                   placeholder="Computer Science"
//                   value={formData.department}
//                   onChange={(e) => setFormData({ ...formData, department: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1 text-gray-800">Session (Joining Year)</label>
//               <input
//                 type="text"
//                 placeholder="2024-2025"
//                 value={formData.session}
//                 onChange={(e) => setFormData({ ...formData, session: e.target.value })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
//                 required
//               />
//             </div>

//             <div className="flex gap-2">
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
//               >
//                 {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
//               </button>
//               <button type="button" onClick={resetForm} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 font-medium">
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* Tabs Navigation */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
//         <div className="flex border-b border-gray-200">
//           <button
//             onClick={() => setActiveTab('overview')}
//             className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
//               activeTab === 'overview'
//                 ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
//                 : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
//             }`}
//           >
//             <BarChart3 className="h-5 w-5 inline mr-2" />
//             Overview
//           </button>
//           <button
//             onClick={() => setActiveTab('directory')}
//             className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
//               activeTab === 'directory'
//                 ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
//                 : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
//             }`}
//           >
//             <Users className="h-5 w-5 inline mr-2" />
//             Directory
//           </button>
//           <button
//             onClick={() => setActiveTab('allocations')}
//             className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
//               activeTab === 'allocations'
//                 ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
//                 : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
//             }`}
//           >
//             <BookOpen className="h-5 w-5 inline mr-2" />
//             Allocations
//           </button>
//           <button
//             onClick={() => setActiveTab('workload')}
//             className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
//               activeTab === 'workload'
//                 ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
//                 : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
//             }`}
//           >
//             <BarChart3 className="h-5 w-5 inline mr-2" />
//             Workload Analysis
//           </button>
//         </div>
//       </div>

//       {/* Tab Content */}
//       {renderTabContent()}
//     </div>
//   )
// }

// 'use client'
// import { useState, useEffect } from 'react'
// import { Plus, Edit, Trash2, Upload as UploadIcon, Search, Grid, List, BookOpen, Users, Award, X, Check, ChevronDown } from 'lucide-react'
// import toast, { Toaster } from 'react-hot-toast'
// import BulkUpload from '@/components/admin/BulkUpload'



// interface Faculty {
//   id: string
//   facultyId: string
//   name: string
//   designation: string
//   email: string
//   contactNo: string | null
//   department: string | null
// }



// interface Course {
//   id: string
//   courseCode: string
//   courseName: string
//   semester: number
//   session: string
//   programme: {
//     id: string
//     programmeCode: string
//     programmeName: string
//     section: string | null
//   }
// }



// interface CourseAllocation {
//   id: string
//   facultyId: string
//   courseId: string
//   role: 'COORDINATOR' | 'CONTRIBUTOR'
//   course: Course
// }



// export default function FacultyPage() {
//   const [faculty, setFaculty] = useState<Faculty[]>([])
//   const [filteredFaculty, setFilteredFaculty] = useState<Faculty[]>([])
//   const [courses, setCourses] = useState<Course[]>([])
//   const [allocations, setAllocations] = useState<CourseAllocation[]>([])
//   const [showForm, setShowForm] = useState(false)
//   const [showBulkUpload, setShowBulkUpload] = useState(false)
//   const [loading, setLoading] = useState(false)
//   const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')


//   const [formData, setFormData] = useState({
//     facultyId: '',
//     name: '',
//     designation: 'Assistant Professor',
//     email: '',
//     contactNo: '',
//     department: '',
//     assignedCourses: [] as string[]
//   })
//   const [editingId, setEditingId] = useState<string | null>(null)


//   const [searchTerm, setSearchTerm] = useState('')
//   const [selectedDesignation, setSelectedDesignation] = useState('all')
//   const [selectedCourseCode, setSelectedCourseCode] = useState('all')
//   const [selectedCourseName, setSelectedCourseName] = useState('all')


//   const [courseSearchTerm, setCourseSearchTerm] = useState('')
//   const [selectedProgrammeFilter, setSelectedProgrammeFilter] = useState('all')
//   const [filteredCourses, setFilteredCourses] = useState<Course[]>([])


//   const [designations, setDesignations] = useState<string[]>([])
//   const [courseCodes, setCourseCodes] = useState<string[]>([])
//   const [courseNames, setCourseNames] = useState<string[]>([])
//   const [programmes, setProgrammes] = useState<string[]>([])


//   const [stats, setStats] = useState({
//     totalFaculty: 0,
//     professors: 0,
//     assocProfs: 0,
//     assistProfs: 0,
//     avgCourses: 0
//   })



//   useEffect(() => {
//     loadData()
//   }, [])



//   useEffect(() => {
//     applyFilters()
//   }, [faculty, searchTerm, selectedDesignation, selectedCourseCode, selectedCourseName, allocations])


//   useEffect(() => {
//     let filtered = courses


//     if (courseSearchTerm.trim()) {
//       const q = courseSearchTerm.toLowerCase()
//       filtered = filtered.filter(c =>
//         c.courseCode.toLowerCase().includes(q) ||
//         c.courseName.toLowerCase().includes(q)
//       )
//     }


//     if (selectedProgrammeFilter !== 'all') {
//       filtered = filtered.filter(c => c.programme.programmeCode === selectedProgrammeFilter)
//     }


//     setFilteredCourses(filtered)
//   }, [courseSearchTerm, selectedProgrammeFilter, courses])



//   const loadData = async () => {
//     try {
//       const [facultyRes, coursesRes, allocRes] = await Promise.all([
//         fetch('/api/admin/faculty'),
//         fetch('/api/admin/courses'),
//         fetch('/api/admin/faculty-allocations')
//       ])


//       const facultyData = await facultyRes.json()
//       const coursesData = await coursesRes.json()
//       const allocData = await allocRes.json()


//       if (facultyData.success && Array.isArray(facultyData.faculty)) {
//         const sorted = facultyData.faculty.sort((a: Faculty, b: Faculty) => a.name.localeCompare(b.name))
//         setFaculty(sorted)


//         const designSet = Array.from(new Set(sorted.map((f: Faculty) => f.designation))) as string[]
//         setDesignations(designSet.sort())


//         const totalCourses = allocData.success ? allocData.allocations.length : 0
//         const avgCourses = sorted.length > 0 ? Math.round((totalCourses / sorted.length) * 10) / 10 : 0


//         setStats({
//           totalFaculty: sorted.length,
//           professors: sorted.filter((f: Faculty) => f.designation === 'Professor').length,
//           assocProfs: sorted.filter((f: Faculty) => f.designation === 'Associate Professor').length,
//           assistProfs: sorted.filter((f: Faculty) => f.designation === 'Assistant Professor').length,
//           avgCourses
//         })
//       }


//       if (coursesData.success && Array.isArray(coursesData.courses)) {
//         setCourses(coursesData.courses)


//         const codeSet = Array.from(new Set(coursesData.courses.map((c: Course) => c.courseCode))) as string[]
//         setCourseCodes(codeSet.sort())


//         const nameSet = Array.from(new Set(coursesData.courses.map((c: Course) => c.courseName))) as string[]
//         setCourseNames(nameSet.sort())


//         const progSet = Array.from(new Set(coursesData.courses.map((c: Course) => c.programme.programmeCode))) as string[]
//         setProgrammes(progSet.sort())


//         setFilteredCourses(coursesData.courses)
//       }


//       if (allocData.success && Array.isArray(allocData.allocations)) {
//         setAllocations(allocData.allocations)
//       }
//     } catch (error) {
//       console.error('Error loading data:', error)
//       toast.error('Error loading data')
//     }
//   }



//   const applyFilters = () => {
//     let result = faculty


//     if (searchTerm.trim()) {
//       const q = searchTerm.toLowerCase()
//       result = result.filter((f: Faculty) =>
//         f.facultyId.toLowerCase().includes(q) ||
//         f.name.toLowerCase().includes(q) ||
//         f.email.toLowerCase().includes(q)
//       )
//     }


//     if (selectedDesignation !== 'all') {
//       result = result.filter((f: Faculty) => f.designation === selectedDesignation)
//     }


//     if (selectedCourseCode !== 'all' || selectedCourseName !== 'all') {
//       result = result.filter(f => {
//         const facultyCourses = allocations
//           .filter(a => a.facultyId === f.id)
//           .map(a => a.course)


//         if (facultyCourses.length === 0) return false


//         return facultyCourses.some(c => {
//           const codeMatch = selectedCourseCode === 'all' || c.courseCode === selectedCourseCode
//           const nameMatch = selectedCourseName === 'all' || c.courseName === selectedCourseName
//           return codeMatch && nameMatch
//         })
//       })
//     }


//     setFilteredFaculty(result)
//   }



//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()


//     if (!formData.facultyId.trim() || !formData.name.trim() || !formData.email.trim()) {
//       toast.error('Please fill all required fields')
//       return
//     }


//     setLoading(true)
//     try {
//       const endpoint = editingId ? `/api/admin/faculty/${editingId}` : '/api/admin/faculty'
//       const method = editingId ? 'PUT' : 'POST'


//       const res = await fetch(endpoint, {
//         method,
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           facultyId: formData.facultyId,
//           name: formData.name,
//           designation: formData.designation,
//           email: formData.email,
//           contactNo: formData.contactNo || null,
//           department: formData.department || null
//         })
//       })


//       const data = await res.json()


//       if (!data.success) {
//         toast.error(data.error || 'Error')
//         return
//       }


//       const facultyId = editingId || data.faculty?.id


//       if (formData.assignedCourses.length > 0) {
//         try {
//           await fetch('/api/admin/faculty-courses', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//               facultyId,
//               courseIds: formData.assignedCourses
//             })
//           })
//         } catch (error) {
//           console.error('Error assigning courses:', error)
//         }
//       }


//       toast.success(editingId ? 'Faculty & courses updated!' : 'Faculty & courses created!')
//       resetForm()
//       loadData()
//     } catch (error) {
//       console.error('Error:', error)
//       toast.error('Error saving faculty')
//     } finally {
//       setLoading(false)
//     }
//   }



//   const handleEdit = (f: Faculty) => {
//     const facultyCourses = allocations
//       .filter(a => a.facultyId === f.id)
//       .map(a => a.courseId)


//     setFormData({
//       facultyId: f.facultyId,
//       name: f.name,
//       designation: f.designation,
//       email: f.email,
//       contactNo: f.contactNo || '',
//       department: f.department || '',
//       assignedCourses: facultyCourses
//     })
//     setEditingId(f.id)
//     setShowForm(true)
//   }



//   const handleDelete = async (id: string) => {
//     if (!confirm('Delete this faculty?')) return


//     try {
//       const res = await fetch(`/api/admin/faculty/${id}`, { method: 'DELETE' })
//       const data = await res.json()


//       if (data.success) {
//         toast.success('Faculty deleted!')
//         loadData()
//       } else {
//         toast.error('Error deleting')
//       }
//     } catch (error) {
//       toast.error('Error')
//     }
//   }


//   // Bulk upload handler
//   const handleBulkUpload = async (data: any[]) => {
//     try {
//       const res = await fetch('/api/admin/faculty/bulk-upload', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ faculty: data })
//       })

//       const result = await res.json()

//       if (result.success) {
//         toast.success(`Uploaded ${result.count} faculty with courses!`)
//         await loadData()
//         return { success: true }
//       } else {
//         toast.error(result.error || 'Upload failed')
//         return { success: false, error: result.error }
//       }
//     } catch (error) {
//       console.error('Error uploading file:', error)
//       toast.error('Error uploading file')
//       return { success: false, error: 'Error uploading file' }
//     }
//   }

//   // Close bulk upload modal
//   const handleCloseBulkUpload = () => {
//     setShowBulkUpload(false)
//     loadData()
//   }



//   const resetForm = () => {
//     setFormData({
//       facultyId: '',
//       name: '',
//       designation: 'Assistant Professor',
//       email: '',
//       contactNo: '',
//       department: '',
//       assignedCourses: []
//     })
//     setCourseSearchTerm('')
//     setSelectedProgrammeFilter('all')
//     setEditingId(null)
//     setShowForm(false)
//   }



//   const getFacultyCourses = (facultyId: string) => {
//     return allocations.filter(a => a.facultyId === facultyId).map(a => a.course)
//   }



//   const toggleCourse = (courseId: string) => {
//     setFormData(prev => ({
//       ...prev,
//       assignedCourses: prev.assignedCourses.includes(courseId)
//         ? prev.assignedCourses.filter(id => id !== courseId)
//         : [...prev.assignedCourses, courseId]
//     }))
//   }



//   const clearAllFilters = () => {
//     setSearchTerm('')
//     setSelectedDesignation('all')
//     setSelectedCourseCode('all')
//     setSelectedCourseName('all')
//   }



//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <Toaster position="top-right" />


//       <div className="mb-6">
//         <h1 className="text-3xl font-bold text-gray-900 mb-2">Faculty Management</h1>
//         <p className="text-gray-600">Manage faculty & assign courses</p>
//       </div>


//       <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
//         <div className="bg-white p-6 rounded-lg shadow">
//           <p className="text-gray-600 text-sm font-medium">Total Faculty</p>
//           <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalFaculty}</p>
//         </div>
//         <div className="bg-white p-6 rounded-lg shadow">
//           <p className="text-gray-600 text-sm font-medium">Professors</p>
//           <p className="text-3xl font-bold text-purple-600 mt-2">{stats.professors}</p>
//         </div>
//         <div className="bg-white p-6 rounded-lg shadow">
//           <p className="text-gray-600 text-sm font-medium">Associate Prof.</p>
//           <p className="text-3xl font-bold text-green-600 mt-2">{stats.assocProfs}</p>
//         </div>
//         <div className="bg-white p-6 rounded-lg shadow">
//           <p className="text-gray-600 text-sm font-medium">Assistant Prof.</p>
//           <p className="text-3xl font-bold text-orange-600 mt-2">{stats.assistProfs}</p>
//         </div>
//         <div className="bg-white p-6 rounded-lg shadow">
//           <p className="text-gray-600 text-sm font-medium">Avg Courses/Faculty</p>
//           <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.avgCourses}</p>
//         </div>
//       </div>


//       <div className="flex gap-3 mb-8 flex-wrap">
//         <button
//           onClick={() => setShowForm(!showForm)}
//           className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium transition-colors shadow-sm"
//         >
//           <Plus className="h-5 w-5" />
//           Add Faculty
//         </button>

//         <button
//           onClick={() => setShowBulkUpload(true)}
//           className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium transition-colors shadow-sm"
//         >
//           <UploadIcon className="h-5 w-5" />
//           Bulk Upload
//         </button>
//       </div>

//       {showBulkUpload && (
//         <BulkUpload
//           type="faculty"
//           onUpload={handleBulkUpload}
//           onClose={handleCloseBulkUpload}
//         />
//       )}


//       {showForm && (
//         <div className="bg-white p-6 rounded-lg shadow mb-8 border border-gray-200">
//           <h2 className="text-2xl font-bold mb-6 text-gray-900">
//             {editingId ? 'Edit Faculty & Assign Courses' : 'Add Faculty & Assign Courses'}
//           </h2>


//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div>
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Faculty Information</h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Faculty ID *</label>
//                   <input
//                     type="text"
//                     value={formData.facultyId}
//                     onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
//                     placeholder="FAC001"
//                     disabled={!!editingId}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-gray-900"
//                     required
//                   />
//                 </div>


//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
//                   <input
//                     type="text"
//                     value={formData.name}
//                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                     placeholder="Dr. John Doe"
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
//                     required
//                   />
//                 </div>


//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
//                   <input
//                     type="email"
//                     value={formData.email}
//                     onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                     placeholder="john@university.edu"
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
//                     required
//                   />
//                 </div>


//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Contact No</label>
//                   <input
//                     type="tel"
//                     value={formData.contactNo}
//                     onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
//                     placeholder="+91-9876543210"
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
//                   />
//                 </div>


//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
//                   <select
//                     value={formData.designation}
//                     onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
//                   >
//                     <option value="Professor">Professor</option>
//                     <option value="Associate Professor">Associate Professor</option>
//                     <option value="Assistant Professor">Assistant Professor</option>
//                     <option value="Lecturer">Lecturer</option>
//                   </select>
//                 </div>


//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
//                   <input
//                     type="text"
//                     value={formData.department}
//                     onChange={(e) => setFormData({ ...formData, department: e.target.value })}
//                     placeholder="Computer Science"
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
//                   />
//                 </div>
//               </div>
//             </div>


//             <div className="border-t pt-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Courses ({formData.assignedCourses.length} selected)</h3>
              
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Search Courses</label>
//                   <div className="relative">
//                     <Search className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
//                     <input
//                       type="text"
//                       value={courseSearchTerm}
//                       onChange={(e) => setCourseSearchTerm(e.target.value)}
//                       placeholder="Search by code or name..."
//                       className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
//                     />
//                   </div>
//                 </div>


//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Programme</label>
//                   <select
//                     value={selectedProgrammeFilter}
//                     onChange={(e) => setSelectedProgrammeFilter(e.target.value)}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
//                   >
//                     <option value="all">All Programmes</option>
//                     {programmes.map(prog => (
//                       <option key={prog} value={prog}>{prog}</option>
//                     ))}
//                   </select>
//                 </div>


//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Results</label>
//                   <div className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-800">
//                     {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
//                   </div>
//                 </div>
//               </div>


//               <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto border p-4 rounded-lg bg-gray-50">
//                 {filteredCourses.length === 0 ? (
//                   <p className="text-gray-600 col-span-2 text-center py-8">No courses available</p>
//                 ) : (
//                   filteredCourses.map(course => (
//                     <label key={course.id} className="flex items-start gap-3 p-3 bg-white rounded border border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors">
//                       <input
//                         type="checkbox"
//                         checked={formData.assignedCourses.includes(course.id)}
//                         onChange={() => toggleCourse(course.id)}
//                         className="w-5 h-5 text-blue-600 rounded mt-1 flex-shrink-0"
//                       />
//                       <div className="flex-1 min-w-0">
//                         <p className="font-semibold text-gray-900 text-sm">{course.courseCode}</p>
//                         <p className="text-xs text-gray-600 truncate">{course.courseName}</p>
//                         <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
//                           <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">{course.programme.programmeCode}</span>
//                           {course.programme.section && (
//                             <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded font-medium">Sec {course.programme.section}</span>
//                           )}
//                           <span>Sem {course.semester}</span>
//                         </div>
//                       </div>
//                     </label>
//                   ))
//                 )}
//               </div>
//             </div>


//             <div className="flex gap-3 pt-4 border-t">
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium flex items-center gap-2 transition-colors"
//               >
//                 <Check className="h-5 w-5" />
//                 {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
//               </button>
//               <button type="button" onClick={resetForm} className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500 font-medium transition-colors">
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       )}


//       <div className="bg-white p-6 rounded-lg shadow mb-8 border border-gray-200">
//         <div className="flex justify-between items-center mb-6">
//           <h3 className="text-lg font-medium text-gray-900">Filter & Search</h3>
//           <div className="flex gap-2">
//             <button
//               onClick={() => setViewMode('table')}
//               className={`p-2.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
//             >
//               <List className="h-5 w-5" />
//             </button>
//             <button
//               onClick={() => setViewMode('cards')}
//               className={`p-2.5 rounded-lg transition-colors ${viewMode === 'cards' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
//             >
//               <Grid className="h-5 w-5" />
//             </button>
//           </div>
//         </div>


//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
//             <div className="relative">
//               <Search className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
//               <input
//                 type="text"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 placeholder="Search faculty..."
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
//               />
//             </div>
//           </div>


//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
//             <select
//               value={selectedDesignation}
//               onChange={(e) => setSelectedDesignation(e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white hover:border-gray-400"
//             >
//               <option value="all">All Designations</option>
//               {designations.map(d => (
//                 <option key={d} value={d}>{d}</option>
//               ))}
//             </select>
//           </div>


//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Course Code</label>
//             <select
//               value={selectedCourseCode}
//               onChange={(e) => setSelectedCourseCode(e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white hover:border-gray-400"
//             >
//               <option value="all">All Course Codes</option>
//               {courseCodes.map(code => (
//                 <option key={code} value={code}>{code}</option>
//               ))}
//             </select>
//           </div>


//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Course Name</label>
//             <select
//               value={selectedCourseName}
//               onChange={(e) => setSelectedCourseName(e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white hover:border-gray-400"
//             >
//               <option value="all">All Course Names</option>
//               {courseNames.map(name => (
//                 <option key={name} value={name}>{name}</option>
//               ))}
//             </select>
//           </div>
//         </div>


//         {(searchTerm || selectedDesignation !== 'all' || selectedCourseCode !== 'all' || selectedCourseName !== 'all') && (
//           <div className="mt-4 pt-4 border-t flex items-center justify-between">
//             <p className="text-sm text-gray-700">
//               Showing <span className="text-blue-600 font-medium">{filteredFaculty.length}</span> of <span className="font-medium">{faculty.length}</span> faculty
//             </p>
//             <button
//               onClick={clearAllFilters}
//               className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
//             >
//               Clear All Filters
//             </button>
//           </div>
//         )}
//       </div>


//       {viewMode === 'table' ? (
//         <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-800">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-sm font-medium text-white">ID</th>
//                   <th className="px-6 py-3 text-left text-sm font-medium text-white">Name</th>
//                   <th className="px-6 py-3 text-left text-sm font-medium text-white">Designation</th>
//                   <th className="px-6 py-3 text-left text-sm font-medium text-white">Department</th>
//                   <th className="px-6 py-3 text-left text-sm font-medium text-white">Assigned Courses</th>
//                   <th className="px-6 py-3 text-center text-sm font-medium text-white">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredFaculty.length > 0 ? (
//                   filteredFaculty.map((f, i) => {
//                     const courses = getFacultyCourses(f.id)
//                     return (
//                       <tr key={f.id} className={`border-b ${i % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'} transition-colors`}>
//                         <td className="px-6 py-4 text-sm font-medium text-blue-600">{f.facultyId}</td>
//                         <td className="px-6 py-4 text-sm text-gray-900">{f.name}</td>
//                         <td className="px-6 py-4 text-sm text-gray-800">{f.designation}</td>
//                         <td className="px-6 py-4 text-sm text-gray-800">{f.department || '-'}</td>
//                         <td className="px-6 py-4 text-sm">
//                           {courses.length === 0 ? (
//                             <span className="text-gray-600 text-xs">No courses</span>
//                           ) : (
//                             <div className="space-y-1">
//                               {courses.map(c => (
//                                 <div key={c.id} className="flex items-center gap-2">
//                                   <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">{c.courseCode}</span>
//                                   {c.programme.section && (
//                                     <span className="px-1.5 py-0.5 bg-cyan-100 text-cyan-700 rounded text-xs">{c.programme.section}</span>
//                                   )}
//                                 </div>
//                               ))}
//                             </div>
//                           )}
//                         </td>
//                         <td className="px-6 py-4 text-sm text-center">
//                           <button
//                             onClick={() => handleEdit(f)}
//                             className="text-blue-600 hover:text-blue-900 mr-3 transition-colors"
//                           >
//                             <Edit className="h-5 w-5" />
//                           </button>
//                           <button
//                             onClick={() => handleDelete(f.id)}
//                             className="text-red-600 hover:text-red-900 transition-colors"
//                           >
//                             <Trash2 className="h-5 w-5" />
//                           </button>
//                         </td>
//                       </tr>
//                     )
//                   })
//                 ) : (
//                   <tr>
//                     <td colSpan={6} className="px-6 py-12 text-center text-gray-600">
//                       No faculty found
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {filteredFaculty.length > 0 ? (
//             filteredFaculty.map(f => {
//               const courses = getFacultyCourses(f.id)
//               return (
//                 <div key={f.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition border border-gray-200">
//                   <div className="flex items-center gap-3 mb-4">
//                     <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
//                       <span className="text-sm font-medium text-blue-600">
//                         {f.name.split(' ').map(n => n[0]).join('')}
//                       </span>
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <h3 className="font-medium text-gray-900 truncate">{f.name}</h3>
//                       <p className="text-sm text-gray-600">{f.facultyId}</p>
//                     </div>
//                   </div>


//                   <div className="space-y-2 text-sm mb-4">
//                     <p><span className="font-medium text-gray-800">Designation:</span> <span className="text-gray-700">{f.designation}</span></p>
//                     <p><span className="font-medium text-gray-800">Dept:</span> <span className="text-gray-700">{f.department || '-'}</span></p>
//                   </div>


//                   {courses.length > 0 && (
//                     <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
//                       <p className="text-xs font-medium text-gray-800 mb-2">Courses ({courses.length}):</p>
//                       <div className="space-y-1">
//                         {courses.map(c => (
//                           <div key={c.id} className="flex items-center gap-2 text-xs">
//                             <span className="px-2 py-1 bg-blue-200 text-blue-700 rounded font-medium">{c.courseCode}</span>
//                             {c.programme.section && (
//                               <span className="px-1.5 py-0.5 bg-cyan-200 text-cyan-700 rounded">Sec {c.programme.section}</span>
//                             )}
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}


//                   <div className="flex gap-2 pt-4 border-t">
//                     <button
//                       onClick={() => handleEdit(f)}
//                       className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm font-medium hover:bg-blue-200 transition-colors"
//                     >
//                       Edit
//                     </button>
//                     <button
//                       onClick={() => handleDelete(f.id)}
//                       className="p-2 text-red-700 hover:bg-red-50 rounded transition-colors"
//                     >
//                       <Trash2 className="h-5 w-5" />
//                     </button>
//                   </div>
//                 </div>
//               )
//             })
//           ) : (
//             <div className="col-span-full text-center py-12">
//               <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
//               <p className="text-gray-600">No faculty found</p>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   )
// }

// 'use client'
// import { useState, useEffect } from 'react'
// import { Plus, Edit, Trash2, Upload as UploadIcon, Search, Grid, List, BookOpen, Users, Award, X, Check, ChevronDown, Eye, FileText, File, Download, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react'
// import toast, { Toaster } from 'react-hot-toast'
// import BulkUpload from '@/components/admin/BulkUpload'

// interface Faculty {
//   id: string
//   facultyId: string
//   name: string
//   designation: string
//   email: string
//   contactNo: string | null
//   department: string | null
// }

// interface Course {
//   id: string
//   courseCode: string
//   courseName: string
//   semester: number
//   session: string
//   programme: {
//     id: string
//     programmeCode: string
//     programmeName: string
//     section: string | null
//   }
// }

// interface CourseAllocation {
//   id: string
//   facultyId: string
//   courseId: string
//   role: 'COORDINATOR' | 'CONTRIBUTOR'
//   course: Course
// }

// interface ContentItem {
//   id: string
//   title: string
//   type: string
//   uploadDate: string
//   status: 'PENDING' | 'APPROVED' | 'CHANGES_REQUIRED' | 'REJECTED'
//   courseCode: string
//   courseName: string
//   fileName: string
//   fileSize: number | null
//   fileUrl: string
//   lectureNumber?: number | null
//   description?: string | null
// }

// interface LessonPlan {
//   id: string
//   title: string
//   lectureNumber?: number | null
//   datePlanned: string
//   dateConducted?: string | null
//   topicsCovered: string
//   description?: string | null
//   status: string
//   courseCode: string
//   courseName: string
//   programmeName: string
//   programmeCode: string
//   section: string | null
// }

// export default function AdminFacultyPage() {
//   const [faculty, setFaculty] = useState<Faculty[]>([])
//   const [filteredFaculty, setFilteredFaculty] = useState<Faculty[]>([])
//   const [loading, setLoading] = useState(true)
//   const [searchTerm, setSearchTerm] = useState('')
//   const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
//   // Modals
//   const [showAddModal, setShowAddModal] = useState(false)
//   const [showEditModal, setShowEditModal] = useState(false)
//   const [showBulkUpload, setShowBulkUpload] = useState(false)
//   const [showCoursesModal, setShowCoursesModal] = useState(false)
//   const [showContentModal, setShowContentModal] = useState(false)
//   const [showFileViewer, setShowFileViewer] = useState(false)
  
//   // Selected data
//   const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null)
//   const [selectedFacultyCourses, setSelectedFacultyCourses] = useState<CourseAllocation[]>([])
//   const [selectedFacultyContent, setSelectedFacultyContent] = useState<{
//     faculty: Faculty | null
//     content: ContentItem[]
//     lessonPlans: LessonPlan[]
//   }>({
//     faculty: null,
//     content: [],
//     lessonPlans: []
//   })
//   const [viewingFileUrl, setViewingFileUrl] = useState('')
  
//   // Loading states
//   const [loadingCourses, setLoadingCourses] = useState(false)
//   const [loadingContent, setLoadingContent] = useState(false)
  
//   // Tab state
//   const [activeContentTab, setActiveContentTab] = useState<'content' | 'lessons'>('content')
  
//   // Form data
//   const [formData, setFormData] = useState({
//     facultyId: '',
//     name: '',
//     designation: '',
//     email: '',
//     contactNo: '',
//     department: ''
//   })

//   useEffect(() => {
//     loadFaculty()
//   }, [])

//   useEffect(() => {
//     filterFaculty()
//   }, [faculty, searchTerm])

//   const loadFaculty = async () => {
//     try {
//       setLoading(true)
//       const res = await fetch('/api/admin/faculty')
//       const data = await res.json()

//       if (data.success) {
//         setFaculty(data.faculty)
//       } else {
//         toast.error('Error loading faculty')
//       }
//     } catch (error) {
//       toast.error('Error loading faculty')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const filterFaculty = () => {
//     if (!searchTerm.trim()) {
//       setFilteredFaculty(faculty)
//       return
//     }

//     const search = searchTerm.toLowerCase()
//     const filtered = faculty.filter(
//       f =>
//         f.name.toLowerCase().includes(search) ||
//         f.facultyId.toLowerCase().includes(search) ||
//         f.email.toLowerCase().includes(search) ||
//         f.designation.toLowerCase().includes(search) ||
//         (f.department && f.department.toLowerCase().includes(search))
//     )
//     setFilteredFaculty(filtered)
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()

//     try {
//       const url = selectedFaculty
//         ? `/api/admin/faculty/${selectedFaculty.id}`
//         : '/api/admin/faculty'
      
//       const method = selectedFaculty ? 'PUT' : 'POST'

//       const res = await fetch(url, {
//         method,
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData)
//       })

//       const data = await res.json()

//       if (data.success) {
//         toast.success(selectedFaculty ? 'Faculty updated!' : 'Faculty added!')
//         loadFaculty()
//         handleCloseModal()
//       } else {
//         toast.error(data.error || 'Error saving faculty')
//       }
//     } catch (error) {
//       toast.error('Error saving faculty')
//     }
//   }

//   const handleEdit = (facultyMember: Faculty) => {
//     setSelectedFaculty(facultyMember)
//     setFormData({
//       facultyId: facultyMember.facultyId,
//       name: facultyMember.name,
//       designation: facultyMember.designation,
//       email: facultyMember.email,
//       contactNo: facultyMember.contactNo || '',
//       department: facultyMember.department || ''
//     })
//     setShowEditModal(true)
//   }

//   const handleDelete = async (id: string) => {
//     if (!confirm('Delete this faculty member? This will also remove all course allocations.')) return

//     try {
//       const res = await fetch(`/api/admin/faculty/${id}`, { method: 'DELETE' })
//       const data = await res.json()

//       if (data.success) {
//         toast.success('Faculty deleted!')
//         loadFaculty()
//       } else {
//         toast.error(data.error || 'Error deleting faculty')
//       }
//     } catch (error) {
//       toast.error('Error deleting faculty')
//     }
//   }

//   const handleCloseModal = () => {
//     setShowAddModal(false)
//     setShowEditModal(false)
//     setSelectedFaculty(null)
//     setFormData({
//       facultyId: '',
//       name: '',
//       designation: '',
//       email: '',
//       contactNo: '',
//       department: ''
//     })
//   }

//   const loadFacultyCourses = async (facultyMember: Faculty) => {
//     setLoadingCourses(true)
//     setShowCoursesModal(true)
//     setSelectedFaculty(facultyMember)
//     setSelectedFacultyCourses([])
    
//     try {
//       const res = await fetch(`/api/admin/faculty/${facultyMember.id}/courses`)
//       const data = await res.json()
      
//       if (data.success) {
//         setSelectedFacultyCourses(data.allocations)
//       } else {
//         toast.error('Error loading courses')
//       }
//     } catch (error) {
//       toast.error('Error loading courses')
//     } finally {
//       setLoadingCourses(false)
//     }
//   }

//   const loadFacultyContent = async (facultyMember: Faculty) => {
//     setLoadingContent(true)
//     setShowContentModal(true)
//     setActiveContentTab('content')
//     setSelectedFacultyContent({
//       faculty: facultyMember,
//       content: [],
//       lessonPlans: []
//     })
    
//     try {
//       const [contentRes, lessonPlansRes] = await Promise.all([
//         fetch(`/api/admin/faculty/${facultyMember.id}/content`),
//         fetch(`/api/admin/faculty/${facultyMember.id}/lesson-plans`)
//       ])
      
//       const contentData = await contentRes.json()
//       const lessonPlansData = await lessonPlansRes.json()
      
//       setSelectedFacultyContent({
//         faculty: facultyMember,
//         content: contentData.success ? contentData.content : [],
//         lessonPlans: lessonPlansData.success ? lessonPlansData.lessonPlans : []
//       })
      
//       if (!contentData.success || !lessonPlansData.success) {
//         toast.error('Error loading some data')
//       }
//     } catch (error) {
//       console.error('Error:', error)
//       toast.error('Error loading data')
//     } finally {
//       setLoadingContent(false)
//     }
//   }

//   const handleViewFile = (fileUrl: string) => {
//     setViewingFileUrl(fileUrl)
//     setShowFileViewer(true)
//   }

//   const formatFileSize = (bytes: number | null): string => {
//     if (!bytes) return 'Unknown'
//     if (bytes < 1024) return bytes + ' B'
//     if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
//     return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
//   }

//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case 'APPROVED':
//         return (
//           <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
//             <CheckCircle className="h-3 w-3" />
//             Approved
//           </span>
//         )
//       case 'PENDING':
//         return (
//           <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
//             <Clock className="h-3 w-3" />
//             Pending
//           </span>
//         )
//       case 'CHANGES_REQUIRED':
//         return (
//           <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
//             <AlertCircle className="h-3 w-3" />
//             Changes Required
//           </span>
//         )
//       case 'REJECTED':
//         return (
//           <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
//             <XCircle className="h-3 w-3" />
//             Rejected
//           </span>
//         )
//       default:
//         return null
//     }
//   }

//   const getContentIcon = (type: string) => {
//     switch (type.toUpperCase()) {
//       case 'COURSE_HANDOUT':
//         return '📘'
//       case 'LECTURE_PPT':
//         return '📊'
//       case 'ASSIGNMENT':
//         return '📝'
//       case 'QUESTION_BANK':
//         return '❓'
//       case 'QUESTION_PAPER':
//         return '📄'
//       case 'LAB_MANUAL':
//         return '🔬'
//       case 'REFERENCE_MATERIAL':
//         return '📚'
//       default:
//         return '📄'
//     }
//   }

//   const getContentGroupedByCourse = (content: ContentItem[]) => {
//     const grouped = content.reduce((acc, item) => {
//       const key = `${item.courseCode} - ${item.courseName}`
//       if (!acc[key]) acc[key] = []
//       acc[key].push(item)
//       return acc
//     }, {} as Record<string, ContentItem[]>)

//     return Object.entries(grouped)
//   }

//   const groupContentByType = (content: ContentItem[]) => {
//     const grouped = content.reduce((acc, item) => {
//       const displayType = item.type.replace(/_/g, ' ')
//       if (!acc[displayType]) acc[displayType] = []
//       acc[displayType].push(item)
//       return acc
//     }, {} as Record<string, ContentItem[]>)

//     return grouped
//   }

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading faculty...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="p-6">
//       <Toaster position="top-right" />

//       {/* Header */}
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Faculty Management</h1>
//           <p className="text-gray-600">Manage faculty members and their courses</p>
//         </div>
//         <div className="flex gap-3">
//           <button
//             onClick={() => setShowBulkUpload(true)}
//             className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium transition-colors"
//           >
//             <UploadIcon className="h-5 w-5" />
//             Bulk Upload
//           </button>
//           <button
//             onClick={() => setShowAddModal(true)}
//             className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium transition-colors"
//           >
//             <Plus className="h-5 w-5" />
//             Add Faculty
//           </button>
//         </div>
//       </div>

//       {/* Search and View Toggle */}
//       <div className="bg-white p-4 rounded-lg shadow mb-6 flex justify-between items-center">
//         <div className="flex-1 max-w-md">
//           <div className="relative">
//             <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//             <input
//               type="text"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               placeholder="Search by name, ID, email, designation..."
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//         </div>

//         <div className="flex gap-2">
//           <button
//             onClick={() => setViewMode('grid')}
//             className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
//           >
//             <Grid className="h-5 w-5" />
//           </button>
//           <button
//             onClick={() => setViewMode('list')}
//             className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
//           >
//             <List className="h-5 w-5" />
//           </button>
//         </div>
//       </div>

//       {/* Faculty Count */}
//       <div className="mb-4">
//         <p className="text-gray-600">
//           Showing <span className="font-semibold text-gray-900">{filteredFaculty.length}</span> of{' '}
//           <span className="font-semibold text-gray-900">{faculty.length}</span> faculty members
//         </p>
//       </div>

//       {/* Faculty List */}
//       {filteredFaculty.length === 0 ? (
//         <div className="bg-white p-12 rounded-lg shadow text-center">
//           <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
//           <p className="text-gray-600 text-lg font-medium">No faculty found</p>
//           <p className="text-gray-500 text-sm mt-2">
//             {searchTerm ? 'Try adjusting your search' : 'Add your first faculty member'}
//           </p>
//         </div>
//       ) : viewMode === 'grid' ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {filteredFaculty.map((facultyMember) => (
//             <div
//               key={facultyMember.id}
//               className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-lg transition-shadow"
//             >
//               <div className="p-6">
//                 <div className="flex items-start justify-between mb-4">
//                   <div className="flex items-center gap-3">
//                     <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
//                       <Users className="h-6 w-6 text-blue-600" />
//                     </div>
//                     <div>
//                       <h3 className="font-semibold text-gray-900 text-lg">{facultyMember.name}</h3>
//                       <p className="text-sm text-gray-600">{facultyMember.facultyId}</p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="space-y-2 text-sm mb-4">
//                   <p>
//                     <span className="font-medium text-gray-700">Designation:</span>{' '}
//                     <span className="text-gray-600">{facultyMember.designation}</span>
//                   </p>
//                   <p>
//                     <span className="font-medium text-gray-700">Email:</span>{' '}
//                     <span className="text-gray-600">{facultyMember.email}</span>
//                   </p>
//                   {facultyMember.contactNo && (
//                     <p>
//                       <span className="font-medium text-gray-700">Contact:</span>{' '}
//                       <span className="text-gray-600">{facultyMember.contactNo}</span>
//                     </p>
//                   )}
//                   {facultyMember.department && (
//                     <p>
//                       <span className="font-medium text-gray-700">Department:</span>{' '}
//                       <span className="text-gray-600">{facultyMember.department}</span>
//                     </p>
//                   )}
//                 </div>

//                 <div className="flex flex-wrap gap-2">
//                   <button
//                     onClick={() => loadFacultyCourses(facultyMember)}
//                     className="flex-1 bg-indigo-100 text-indigo-700 px-3 py-2 rounded text-sm font-medium hover:bg-indigo-200 transition-colors flex items-center justify-center gap-1"
//                   >
//                     <BookOpen className="h-4 w-4" />
//                     Courses
//                   </button>
//                   <button
//                     onClick={() => loadFacultyContent(facultyMember)}
//                     className="flex-1 bg-purple-100 text-purple-700 px-3 py-2 rounded text-sm font-medium hover:bg-purple-200 transition-colors flex items-center justify-center gap-1"
//                   >
//                     <FileText className="h-4 w-4" />
//                     Content
//                   </button>
//                   <button
//                     onClick={() => handleEdit(facultyMember)}
//                     className="p-2 text-blue-700 hover:bg-blue-50 rounded transition-colors"
//                   >
//                     <Edit className="h-5 w-5" />
//                   </button>
//                   <button
//                     onClick={() => handleDelete(facultyMember.id)}
//                     className="p-2 text-red-700 hover:bg-red-50 rounded transition-colors"
//                   >
//                     <Trash2 className="h-5 w-5" />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className="bg-white rounded-lg shadow overflow-hidden">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Faculty
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Designation
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Contact
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Department
//                 </th>
//                 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredFaculty.map((facultyMember) => (
//                 <tr key={facultyMember.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div>
//                       <div className="font-medium text-gray-900">{facultyMember.name}</div>
//                       <div className="text-sm text-gray-500">{facultyMember.facultyId}</div>
//                       <div className="text-sm text-gray-500">{facultyMember.email}</div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                     {facultyMember.designation}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                     {facultyMember.contactNo || '-'}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                     {facultyMember.department || '-'}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                     <div className="flex justify-end gap-2">
//                       <button
//                         onClick={() => loadFacultyCourses(facultyMember)}
//                         className="text-indigo-600 hover:text-indigo-900"
//                         title="View Courses"
//                       >
//                         <BookOpen className="h-5 w-5" />
//                       </button>
//                       <button
//                         onClick={() => loadFacultyContent(facultyMember)}
//                         className="text-purple-600 hover:text-purple-900"
//                         title="View Content"
//                       >
//                         <FileText className="h-5 w-5" />
//                       </button>
//                       <button
//                         onClick={() => handleEdit(facultyMember)}
//                         className="text-blue-600 hover:text-blue-900"
//                         title="Edit"
//                       >
//                         <Edit className="h-5 w-5" />
//                       </button>
//                       <button
//                         onClick={() => handleDelete(facultyMember.id)}
//                         className="text-red-600 hover:text-red-900"
//                         title="Delete"
//                       >
//                         <Trash2 className="h-5 w-5" />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* ADD/EDIT MODAL */}
//       {(showAddModal || showEditModal) && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
//             <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-lg">
//               <h2 className="text-2xl font-bold">
//                 {selectedFaculty ? 'Edit Faculty' : 'Add New Faculty'}
//               </h2>
//             </div>

//             <form onSubmit={handleSubmit} className="p-6 space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Faculty ID *</label>
//                 <input
//                   type="text"
//                   value={formData.facultyId}
//                   onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                   disabled={!!selectedFaculty}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
//                 <input
//                   type="text"
//                   value={formData.name}
//                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Designation *</label>
//                 <input
//                   type="text"
//                   value={formData.designation}
//                   onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
//                 <input
//                   type="email"
//                   value={formData.email}
//                   onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
//                 <input
//                   type="tel"
//                   value={formData.contactNo}
//                   onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
//                 <input
//                   type="text"
//                   value={formData.department}
//                   onChange={(e) => setFormData({ ...formData, department: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>

//               <div className="flex gap-3 pt-4">
//                 <button
//                   type="submit"
//                   className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
//                 >
//                   {selectedFaculty ? 'Update' : 'Add Faculty'}
//                 </button>
//                 <button
//                   type="button"
//                   onClick={handleCloseModal}
//                   className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 font-medium"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* BULK UPLOAD MODAL */}
//       {showBulkUpload && (
//         <BulkUpload
//           onClose={() => setShowBulkUpload(false)}
//           onSuccess={() => {
//             setShowBulkUpload(false)
//             loadFaculty()
//           }}
//         />
//       )}

//       {/* COURSES MODAL */}
//       {showCoursesModal && selectedFaculty && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
//             <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6">
//               <div className="flex justify-between items-start">
//                 <div>
//                   <h2 className="text-2xl font-bold">{selectedFaculty.name}</h2>
//                   <p className="text-blue-100 text-sm mt-1">Course Allocations</p>
//                 </div>
//                 <button
//                   onClick={() => setShowCoursesModal(false)}
//                   className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
//                 >
//                   <X className="h-6 w-6" />
//                 </button>
//               </div>
//             </div>

//             <div className="flex-1 overflow-y-auto p-6">
//               {loadingCourses ? (
//                 <div className="flex items-center justify-center py-12">
//                   <div className="text-center">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//                     <p className="text-gray-600">Loading courses...</p>
//                   </div>
//                 </div>
//               ) : selectedFacultyCourses.length === 0 ? (
//                 <div className="text-center py-12">
//                   <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
//                   <p className="text-gray-600 text-lg font-medium">No courses assigned</p>
//                 </div>
//               ) : (
//                 <div className="space-y-3">
//                   {selectedFacultyCourses.map((allocation) => (
//                     <div
//                       key={allocation.id}
//                       className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
//                     >
//                       <div className="flex items-start justify-between">
//                         <div className="flex-1">
//                           <div className="flex items-center gap-2 mb-2">
//                             <h3 className="font-semibold text-gray-900">
//                               {allocation.course.courseName}
//                             </h3>
//                             <span
//                               className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
//                                 allocation.role === 'COORDINATOR' ? 'bg-purple-600' : 'bg-blue-600'
//                               }`}
//                             >
//                               {allocation.role === 'COORDINATOR' ? '👑 Coordinator' : '👤 Contributor'}
//                             </span>
//                           </div>
//                           <p className="text-sm text-gray-600 mb-2">
//                             <span className="font-medium">Code:</span> {allocation.course.courseCode}
//                           </p>
//                           <div className="text-sm text-gray-600 space-y-1">
//                             <p>
//                               <span className="font-medium">Programme:</span>{' '}
//                               {allocation.course.programme.programmeName}
//                               {allocation.course.programme.section && ` - Section ${allocation.course.programme.section}`}
//                             </p>
//                             <p>
//                               <span className="font-medium">Semester:</span> {allocation.course.semester}
//                             </p>
//                             <p>
//                               <span className="font-medium">Session:</span> {allocation.course.session}
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <div className="bg-gray-50 px-6 py-4 border-t flex justify-end">
//               <button
//                 onClick={() => setShowCoursesModal(false)}
//                 className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* CONTENT & LESSON PLANS VIEWER MODAL */}
//       {showContentModal && selectedFacultyContent.faculty && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
//             {/* Modal Header */}
//             <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
//               <div className="flex justify-between items-start">
//                 <div>
//                   <h2 className="text-2xl font-bold">{selectedFacultyContent.faculty.name}</h2>
//                   <p className="text-blue-100 text-sm mt-1">
//                     {selectedFacultyContent.faculty.facultyId} • {selectedFacultyContent.faculty.designation}
//                   </p>
//                 </div>
//                 <button
//                   onClick={() => setShowContentModal(false)}
//                   className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
//                 >
//                   <X className="h-6 w-6" />
//                 </button>
//               </div>

//               {/* Tabs */}
//               <div className="flex gap-2 mt-6">
//                 <button
//                   onClick={() => setActiveContentTab('content')}
//                   className={`px-6 py-2 rounded-lg font-medium transition-colors ${
//                     activeContentTab === 'content'
//                       ? 'bg-white text-blue-600'
//                       : 'bg-blue-500 text-white hover:bg-blue-400'
//                   }`}
//                 >
//                   <div className="flex items-center gap-2">
//                     <FileText className="h-4 w-4" />
//                     <span>Teaching Content ({selectedFacultyContent.content.length})</span>
//                   </div>
//                 </button>
//                 <button
//                   onClick={() => setActiveContentTab('lessons')}
//                   className={`px-6 py-2 rounded-lg font-medium transition-colors ${
//                     activeContentTab === 'lessons'
//                       ? 'bg-white text-blue-600'
//                       : 'bg-blue-500 text-white hover:bg-blue-400'
//                   }`}
//                 >
//                   <div className="flex items-center gap-2">
//                     <BookOpen className="h-4 w-4" />
//                     <span>Lesson Plans ({selectedFacultyContent.lessonPlans.length})</span>
//                   </div>
//                 </button>
//               </div>
//             </div>

//             {/* Modal Body */}
//             <div className="flex-1 overflow-y-auto p-6">
//               {loadingContent ? (
//                 <div className="flex items-center justify-center py-12">
//                   <div className="text-center">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//                     <p className="text-gray-600">Loading data...</p>
//                   </div>
//                 </div>
//               ) : activeContentTab === 'content' ? (
//                 // TEACHING CONTENT TAB
//                 selectedFacultyContent.content.length === 0 ? (
//                   <div className="text-center py-12">
//                     <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
//                     <p className="text-gray-600 text-lg font-medium">No content uploaded yet</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-6">
//                     {/* Content Summary */}
//                     <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
//                       <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
//                         <div className="text-center">
//                           <p className="text-3xl font-bold text-blue-600">{selectedFacultyContent.content.length}</p>
//                           <p className="text-sm text-gray-600 mt-1">Total Items</p>
//                         </div>
//                         <div className="text-center">
//                           <p className="text-3xl font-bold text-green-600">
//                             {selectedFacultyContent.content.filter(c => c.status === 'APPROVED').length}
//                           </p>
//                           <p className="text-sm text-gray-600 mt-1">Approved</p>
//                         </div>
//                         <div className="text-center">
//                           <p className="text-3xl font-bold text-yellow-600">
//                             {selectedFacultyContent.content.filter(c => c.status === 'PENDING').length}
//                           </p>
//                           <p className="text-sm text-gray-600 mt-1">Pending</p>
//                         </div>
//                         <div className="text-center">
//                           <p className="text-3xl font-bold text-orange-600">
//                             {selectedFacultyContent.content.filter(c => c.status === 'CHANGES_REQUIRED').length}
//                           </p>
//                           <p className="text-sm text-gray-600 mt-1">Changes Req</p>
//                         </div>
//                         <div className="text-center">
//                           <p className="text-3xl font-bold text-red-600">
//                             {selectedFacultyContent.content.filter(c => c.status === 'REJECTED').length}
//                           </p>
//                           <p className="text-sm text-gray-600 mt-1">Rejected</p>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Content organized by Course */}
//                     {getContentGroupedByCourse(selectedFacultyContent.content).map(([courseName, courseItems]) => (
//                       <div key={courseName} className="border border-gray-300 rounded-lg overflow-hidden">
//                         {/* Course Header */}
//                         <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 flex items-center justify-between">
//                           <div className="flex items-center gap-2">
//                             <BookOpen className="h-5 w-5" />
//                             <h3 className="font-semibold text-lg">{courseName}</h3>
//                           </div>
//                           <span className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
//                             {courseItems.length} items
//                           </span>
//                         </div>

//                         {/* Content by Type */}
//                         <div className="divide-y">
//                           {Object.entries(groupContentByType(courseItems)).map(([displayType, items]) => (
//                             <div key={displayType} className="border-t border-gray-200">
//                               <div className="bg-gray-50 px-4 py-2 flex items-center gap-2 border-b">
//                                 <span className="text-2xl">{getContentIcon(items[0].type)}</span>
//                                 <h4 className="font-medium text-gray-900 text-sm">{displayType}</h4>
//                                 <span className="ml-auto bg-gray-300 text-gray-800 px-2 py-0.5 rounded text-xs font-medium">
//                                   {items.length}
//                                 </span>
//                               </div>
//                               <div className="divide-y">
//                                 {items.map((item) => (
//                                   <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
//                                     <div className="flex items-start justify-between gap-4">
//                                       <div className="flex-1 min-w-0">
//                                         <div className="flex items-center gap-2 mb-2 flex-wrap">
//                                           <h5 className="font-medium text-gray-900 text-sm">{item.title}</h5>
//                                           {getStatusBadge(item.status)}
//                                           {item.lectureNumber && (
//                                             <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
//                                               #{item.lectureNumber}
//                                             </span>
//                                           )}
//                                         </div>
//                                         <div className="flex items-center gap-3 text-xs text-gray-600 flex-wrap mb-2">
//                                           <span>{item.fileName}</span>
//                                           <span>•</span>
//                                           <span>{formatFileSize(item.fileSize)}</span>
//                                           <span>•</span>
//                                           <span>{new Date(item.uploadDate).toLocaleDateString()}</span>
//                                         </div>
//                                         {item.description && (
//                                           <p className="text-xs text-gray-600 mt-1">{item.description}</p>
//                                         )}
//                                       </div>
//                                       {item.fileUrl && (
//                                         <div className="flex gap-2">
//                                           <button
//                                             onClick={() => handleViewFile(item.fileUrl)}
//                                             className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors text-xs font-medium"
//                                           >
//                                             <Eye className="h-3 w-3" />
//                                             View
//                                           </button>
//                                           <a
//                                             href={item.fileUrl}
//                                             target="_blank"
//                                             rel="noopener noreferrer"
//                                             className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs font-medium"
//                                           >
//                                             <Download className="h-3 w-3" />
//                                             Download
//                                           </a>
//                                         </div>
//                                       )}
//                                     </div>
//                                   </div>
//                                 ))}
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )
//               ) : (
//                 // LESSON PLANS TAB
//                 selectedFacultyContent.lessonPlans.length === 0 ? (
//                   <div className="text-center py-12">
//                     <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
//                     <p className="text-gray-600 text-lg font-medium">No lesson plans yet</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-4">
//                     {selectedFacultyContent.lessonPlans.map((plan) => (
//                       <div key={plan.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
//                         <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
//                           <div className="flex items-center gap-3">
//                             <BookOpen className="h-5 w-5 text-blue-600" />
//                             <div>
//                               <h4 className="font-semibold text-gray-900">{plan.title}</h4>
//                               <p className="text-xs text-gray-600">{plan.courseCode} - {plan.courseName}</p>
//                             </div>
//                           </div>
//                           <span className={`px-3 py-1 rounded-full text-xs font-medium ${
//                             plan.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
//                             plan.status === 'SUBMITTED' ? 'bg-yellow-100 text-yellow-700' :
//                             'bg-gray-100 text-gray-700'
//                           }`}>
//                             {plan.status}
//                           </span>
//                         </div>
//                         <div className="p-4 space-y-3">
//                           {plan.lectureNumber && (
//                             <p className="text-sm">
//                               <span className="font-medium text-gray-700">Lecture:</span> {plan.lectureNumber}
//                             </p>
//                           )}
//                           <div className="grid grid-cols-2 gap-4 text-sm">
//                             <p>
//                               <span className="font-medium text-gray-700">Date Planned:</span><br/>
//                               <span className="text-gray-900 font-medium">{new Date(plan.datePlanned).toLocaleDateString()}</span>
//                             </p>
//                             {plan.dateConducted && (
//                               <p>
//                                 <span className="font-medium text-gray-700">Date Conducted:</span><br/>
//                                 <span className="text-gray-900 font-medium">{new Date(plan.dateConducted).toLocaleDateString()}</span>
//                               </p>
//                             )}
//                           </div>
//                           <div>
//                             <p className="font-medium text-gray-700 text-sm mb-1">Topics Covered:</p>
//                             <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded border border-blue-200">{plan.topicsCovered}</p>
//                           </div>
//                           {plan.description && (
//                             <div>
//                               <p className="font-medium text-gray-700 text-sm mb-1">Description:</p>
//                               <p className="text-sm text-gray-600">{plan.description}</p>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )
//               )}
//             </div>

//             {/* Modal Footer */}
//             <div className="bg-gray-50 px-6 py-4 border-t flex justify-end">
//               <button
//                 onClick={() => setShowContentModal(false)}
//                 className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* FILE VIEWER MODAL */}
//       {showFileViewer && viewingFileUrl && (
//         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
//           <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
//             <div className="bg-gray-800 text-white p-4 flex justify-between items-center rounded-t-lg">
//               <h3 className="font-semibold">File Preview</h3>
//               <button
//                 onClick={() => {
//                   setShowFileViewer(false)
//                   setViewingFileUrl('')
//                 }}
//                 className="text-white hover:bg-gray-700 p-2 rounded transition-colors"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             </div>
//             <div className="flex-1 overflow-hidden">
//               <iframe
//                 src={viewingFileUrl}
//                 className="w-full h-full"
//                 title="File Preview"
//               />
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// 'use client'
// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import { Plus, Edit, Trash2, Upload as UploadIcon, Search, Grid, List, BookOpen, Users } from 'lucide-react'
// import toast, { Toaster } from 'react-hot-toast'
// import BulkUpload from '@/components/admin/BulkUpload'

// interface Faculty {
//   id: string
//   facultyId: string
//   name: string
//   designation: string
//   email: string
//   contactNo: string | null
//   department: string | null
// }

// export default function AdminFacultyPage() {
//   const router = useRouter()
//   const [faculty, setFaculty] = useState<Faculty[]>([])
//   const [filteredFaculty, setFilteredFaculty] = useState<Faculty[]>([])
//   const [loading, setLoading] = useState(true)
//   const [searchTerm, setSearchTerm] = useState('')
//   const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
//   // Modals
//   const [showAddModal, setShowAddModal] = useState(false)
//   const [showEditModal, setShowEditModal] = useState(false)
//   const [showBulkUpload, setShowBulkUpload] = useState(false)
  
//   // Selected data
//   const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null)
  
//   // Form data
//   const [formData, setFormData] = useState({
//     facultyId: '',
//     name: '',
//     designation: '',
//     email: '',
//     contactNo: '',
//     department: ''
//   })

//   useEffect(() => {
//     loadFaculty()
//   }, [])

//   useEffect(() => {
//     filterFaculty()
//   }, [faculty, searchTerm])

//   const loadFaculty = async () => {
//     try {
//       setLoading(true)
//       const res = await fetch('/api/admin/faculty')
//       const data = await res.json()

//       if (data.success) {
//         setFaculty(data.faculty)
//       } else {
//         toast.error('Error loading faculty')
//       }
//     } catch (error) {
//       toast.error('Error loading faculty')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const filterFaculty = () => {
//     if (!searchTerm.trim()) {
//       setFilteredFaculty(faculty)
//       return
//     }

//     const search = searchTerm.toLowerCase()
//     const filtered = faculty.filter(
//       f =>
//         f.name.toLowerCase().includes(search) ||
//         f.facultyId.toLowerCase().includes(search) ||
//         f.email.toLowerCase().includes(search) ||
//         f.designation.toLowerCase().includes(search) ||
//         (f.department && f.department.toLowerCase().includes(search))
//     )
//     setFilteredFaculty(filtered)
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()

//     try {
//       const url = selectedFaculty
//         ? `/api/admin/faculty/${selectedFaculty.id}`
//         : '/api/admin/faculty'
      
//       const method = selectedFaculty ? 'PUT' : 'POST'

//       const res = await fetch(url, {
//         method,
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData)
//       })

//       const data = await res.json()

//       if (data.success) {
//         toast.success(selectedFaculty ? 'Faculty updated!' : 'Faculty added!')
//         loadFaculty()
//         handleCloseModal()
//       } else {
//         toast.error(data.error || 'Error saving faculty')
//       }
//     } catch (error) {
//       toast.error('Error saving faculty')
//     }
//   }

//   const handleEdit = (facultyMember: Faculty) => {
//     setSelectedFaculty(facultyMember)
//     setFormData({
//       facultyId: facultyMember.facultyId,
//       name: facultyMember.name,
//       designation: facultyMember.designation,
//       email: facultyMember.email,
//       contactNo: facultyMember.contactNo || '',
//       department: facultyMember.department || ''
//     })
//     setShowEditModal(true)
//   }

//   const handleDelete = async (id: string) => {
//     if (!confirm('Delete this faculty member? This will also remove all course allocations.')) return

//     try {
//       const res = await fetch(`/api/admin/faculty/${id}`, { method: 'DELETE' })
//       const data = await res.json()

//       if (data.success) {
//         toast.success('Faculty deleted!')
//         loadFaculty()
//       } else {
//         toast.error(data.error || 'Error deleting faculty')
//       }
//     } catch (error) {
//       toast.error('Error deleting faculty')
//     }
//   }

//   const handleCloseModal = () => {
//     setShowAddModal(false)
//     setShowEditModal(false)
//     setSelectedFaculty(null)
//     setFormData({
//       facultyId: '',
//       name: '',
//       designation: '',
//       email: '',
//       contactNo: '',
//       department: ''
//     })
//   }

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading faculty...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="p-6">
//       <Toaster position="top-right" />

//       {/* Header */}
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Faculty Management</h1>
//           <p className="text-gray-600">Manage faculty members and their courses</p>
//         </div>
//         <div className="flex gap-3">
//           <button
//             onClick={() => setShowBulkUpload(true)}
//             className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium transition-colors"
//           >
//             <UploadIcon className="h-5 w-5" />
//             Bulk Upload
//           </button>
//           <button
//             onClick={() => setShowAddModal(true)}
//             className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium transition-colors"
//           >
//             <Plus className="h-5 w-5" />
//             Add Faculty
//           </button>
//         </div>
//       </div>

//       {/* Search and View Toggle */}
//       <div className="bg-white p-4 rounded-lg shadow mb-6 flex justify-between items-center">
//         <div className="flex-1 max-w-md">
//           <div className="relative">
//             <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//             <input
//               type="text"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               placeholder="Search by name, ID, email, designation..."
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//         </div>

//         <div className="flex gap-2">
//           <button
//             onClick={() => setViewMode('grid')}
//             className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
//           >
//             <Grid className="h-5 w-5" />
//           </button>
//           <button
//             onClick={() => setViewMode('list')}
//             className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
//           >
//             <List className="h-5 w-5" />
//           </button>
//         </div>
//       </div>

//       {/* Faculty Count */}
//       <div className="mb-4">
//         <p className="text-gray-600">
//           Showing <span className="font-semibold text-gray-900">{filteredFaculty.length}</span> of{' '}
//           <span className="font-semibold text-gray-900">{faculty.length}</span> faculty members
//         </p>
//       </div>

//       {/* Faculty List */}
//       {filteredFaculty.length === 0 ? (
//         <div className="bg-white p-12 rounded-lg shadow text-center">
//           <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
//           <p className="text-gray-600 text-lg font-medium">No faculty found</p>
//           <p className="text-gray-500 text-sm mt-2">
//             {searchTerm ? 'Try adjusting your search' : 'Add your first faculty member'}
//           </p>
//         </div>
//       ) : viewMode === 'grid' ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {filteredFaculty.map((facultyMember) => (
//             <div
//               key={facultyMember.id}
//               className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-lg transition-shadow"
//             >
//               <div className="p-6">
//                 <div className="flex items-start justify-between mb-4">
//                   <div className="flex items-center gap-3">
//                     <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
//                       <Users className="h-6 w-6 text-blue-600" />
//                     </div>
//                     <div>
//                       <h3 className="font-semibold text-gray-900 text-lg">{facultyMember.name}</h3>
//                       <p className="text-sm text-gray-600">{facultyMember.facultyId}</p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="space-y-2 text-sm mb-4">
//                   <p>
//                     <span className="font-medium text-gray-700">Designation:</span>{' '}
//                     <span className="text-gray-600">{facultyMember.designation}</span>
//                   </p>
//                   <p>
//                     <span className="font-medium text-gray-700">Email:</span>{' '}
//                     <span className="text-gray-600">{facultyMember.email}</span>
//                   </p>
//                   {facultyMember.contactNo && (
//                     <p>
//                       <span className="font-medium text-gray-700">Contact:</span>{' '}
//                       <span className="text-gray-600">{facultyMember.contactNo}</span>
//                     </p>
//                   )}
//                   {facultyMember.department && (
//                     <p>
//                       <span className="font-medium text-gray-700">Department:</span>{' '}
//                       <span className="text-gray-600">{facultyMember.department}</span>
//                     </p>
//                   )}
//                 </div>

//                 <div className="flex flex-wrap gap-2">
//                   <button
//                     onClick={() => router.push(`/admin/faculty/${facultyMember.id}/courses-content`)}
//                     className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 shadow-md"
//                   >
//                     <BookOpen className="h-4 w-4" />
//                     Courses & Content
//                   </button>
//                   <button
//                     onClick={() => handleEdit(facultyMember)}
//                     className="p-2 text-blue-700 hover:bg-blue-50 rounded transition-colors"
//                   >
//                     <Edit className="h-5 w-5" />
//                   </button>
//                   <button
//                     onClick={() => handleDelete(facultyMember.id)}
//                     className="p-2 text-red-700 hover:bg-red-50 rounded transition-colors"
//                   >
//                     <Trash2 className="h-5 w-5" />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className="bg-white rounded-lg shadow overflow-hidden">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Faculty
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Designation
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Contact
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Department
//                 </th>
//                 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredFaculty.map((facultyMember) => (
//                 <tr key={facultyMember.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div>
//                       <div className="font-medium text-gray-900">{facultyMember.name}</div>
//                       <div className="text-sm text-gray-500">{facultyMember.facultyId}</div>
//                       <div className="text-sm text-gray-500">{facultyMember.email}</div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                     {facultyMember.designation}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                     {facultyMember.contactNo || '-'}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                     {facultyMember.department || '-'}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                     <div className="flex justify-end gap-2">
//                       <button
//                         onClick={() => router.push(`/admin/faculty/${facultyMember.id}/courses-content`)}
//                         className="text-indigo-600 hover:text-indigo-900"
//                         title="Courses & Content"
//                       >
//                         <BookOpen className="h-5 w-5" />
//                       </button>
//                       <button
//                         onClick={() => handleEdit(facultyMember)}
//                         className="text-blue-600 hover:text-blue-900"
//                         title="Edit"
//                       >
//                         <Edit className="h-5 w-5" />
//                       </button>
//                       <button
//                         onClick={() => handleDelete(facultyMember.id)}
//                         className="text-red-600 hover:text-red-900"
//                         title="Delete"
//                       >
//                         <Trash2 className="h-5 w-5" />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* ADD/EDIT MODAL */}
//       {(showAddModal || showEditModal) && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
//             <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-lg">
//               <h2 className="text-2xl font-bold">
//                 {selectedFaculty ? 'Edit Faculty' : 'Add New Faculty'}
//               </h2>
//             </div>

//             <form onSubmit={handleSubmit} className="p-6 space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Faculty ID *</label>
//                 <input
//                   type="text"
//                   value={formData.facultyId}
//                   onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                   disabled={!!selectedFaculty}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
//                 <input
//                   type="text"
//                   value={formData.name}
//                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Designation *</label>
//                 <input
//                   type="text"
//                   value={formData.designation}
//                   onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
//                 <input
//                   type="email"
//                   value={formData.email}
//                   onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
//                 <input
//                   type="tel"
//                   value={formData.contactNo}
//                   onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
//                 <input
//                   type="text"
//                   value={formData.department}
//                   onChange={(e) => setFormData({ ...formData, department: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>

//               <div className="flex gap-3 pt-4">
//                 <button
//                   type="submit"
//                   className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
//                 >
//                   {selectedFaculty ? 'Update' : 'Add Faculty'}
//                 </button>
//                 <button
//                   type="button"
//                   onClick={handleCloseModal}
//                   className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 font-medium"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* BULK UPLOAD MODAL */}
//       {showBulkUpload && (
//         <BulkUpload
//           onClose={() => setShowBulkUpload(false)}
//           onSuccess={() => {
//             setShowBulkUpload(false)
//             loadFaculty()
//           }}
//         />
//       )}
//     </div>
//   )
// }

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

export default function AdminFacultyPage() {
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
        facultyId: formData.facultyId,  // ✅ Make sure to include facultyId
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
    
    // Set selected faculty and form data
    setSelectedFaculty(facultyMember)
    setFormData({
      facultyId: facultyMember.facultyId,
      name: facultyMember.name,
      designation: facultyMember.designation,
      email: facultyMember.email,
      contactNo: facultyMember.contactNo || '',
      department: facultyMember.department || ''
    })
    
    // Show modal
    setShowEditModal(true)
    
    // Start loading
    setLoadingCourses(true)
    
    try {
      // Load courses first
      console.log('1️⃣ Loading courses...')
      await loadCourses()
      
      // Wait a bit for state to update
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Load existing allocations
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

      {/* Faculty List - Grid/List View (keeping same as before) */}
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
                
                {/* Debug info */}
                {selectedFaculty && (
                  <div className="mb-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                    Debug: {selectedCourses.length} courses selected | {courses.length} total courses loaded
                  </div>
                )}
                
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
