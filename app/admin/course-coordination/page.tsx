// 'use client'
// import { useState, useEffect } from 'react'
// import { Crown, Users, Search, ChevronDown, ChevronRight, FileText, Eye, X, Download, Calendar, Filter, BarChart3, CheckCircle, Clock, AlertCircle } from 'lucide-react'
// import toast, { Toaster } from 'react-hot-toast'
// import { getCourses, getCourseAllocations, setCoordinator, getTeachingContentByFaculty } from '@/app/actions/admin'

// interface Course {
//   id: string
//   courseCode: string
//   courseName: string
//   session: string
//   semester: number
//   credits: number
//   programme: {
//     id: string
//     programmeCode: string
//     programmeName: string
//     section: string | null
//   }
// }

// interface Allocation {
//   id: string
//   courseId: string
//   role: 'COORDINATOR' | 'CONTRIBUTOR'
//   faculty: {
//     id: string
//     facultyId: string
//     name: string
//     designation: string
//     email: string
//     department: string | null
//   }
// }

// interface GroupedCourse {
//   courseName: string
//   courseCode: string
//   courses: Course[]
//   allAllocations: (Allocation & { course: Course })[]
// }

// interface TeachingContent {
//   id: string
//   title: string
//   contentType: string
//   fileName: string
//   filePath: string
//   approvalStatus: string
//   createdAt: string
//   lectureNumber: number | null
//   course: {
//     courseCode: string
//     courseName: string
//     programme: {
//       programmeCode: string
//     }
//   }
// }

// export default function CourseCoordinationPage() {
//   const [courses, setCourses] = useState<Course[]>([])
//   const [groupedCourses, setGroupedCourses] = useState<GroupedCourse[]>([])
//   const [filteredGroups, setFilteredGroups] = useState<GroupedCourse[]>([])
//   const [allAllocations, setAllAllocations] = useState<(Allocation & { course: Course })[]>([])
//   const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
//   const [searchTerm, setSearchTerm] = useState('')
//   const [loading, setLoading] = useState(true)
//   const [showContentModal, setShowContentModal] = useState(false)
//   const [selectedFacultyContent, setSelectedFacultyContent] = useState<{
//     faculty: Allocation['faculty']
//     content: TeachingContent[]
//   } | null>(null)
//   const [loadingContent, setLoadingContent] = useState(false)

//   // Filter states
//   const [selectedSession, setSelectedSession] = useState<string>('all')
//   const [selectedSemester, setSelectedSemester] = useState<string>('all')
//   const [coordinatorFilter, setCoordinatorFilter] = useState<'all' | 'assigned' | 'unassigned'>('all')
//   const [availableSessions, setAvailableSessions] = useState<string[]>([])
//   const [availableSemesters, setAvailableSemesters] = useState<number[]>([])
//   const [showFilters, setShowFilters] = useState(false)

//   // Statistics
//   const [stats, setStats] = useState({
//     totalCourseGroups: 0,
//     withCoordinator: 0,
//     withoutCoordinator: 0,
//     totalSections: 0,
//     totalFaculty: 0,
//     pendingContent: 0
//   })

//   useEffect(() => {
//     loadData()
//   }, [])

//   useEffect(() => {
//     applyFilters()
//   }, [searchTerm, selectedSession, selectedSemester, coordinatorFilter, groupedCourses])

//   const loadData = async () => {
//     setLoading(true)
//     const coursesData = await getCourses()
//     setCourses(coursesData)

//     // Load all allocations
//     const allocationsPromises = coursesData.map(async (course: Course) => {
//       const allocs = await getCourseAllocations(course.id)
//       return allocs.map((alloc: Allocation) => ({ ...alloc, course }))
//     })
    
//     const allAllocsData = (await Promise.all(allocationsPromises)).flat()
//     setAllAllocations(allAllocsData)

//     // Extract filter options
//     const sessions = Array.from(new Set(coursesData.map(c => c.session))).sort().reverse()
//     setAvailableSessions(sessions)

//     const semesters = Array.from(new Set(coursesData.map(c => c.semester))).sort((a, b) => a - b)
//     setAvailableSemesters(semesters)

//     if (sessions.length > 0 && selectedSession === 'all') {
//       setSelectedSession(sessions[0])
//     }

//     // Group courses by course name (similar courses)
//     const grouped = groupCoursesByName(coursesData, allAllocsData)
//     setGroupedCourses(grouped)
//     setFilteredGroups(grouped)

//     // Calculate statistics
//     const withCoord = grouped.filter(g => g.allAllocations.some(a => a.role === 'COORDINATOR')).length
//     const totalFaculty = new Set(allAllocsData.map(a => a.faculty.id)).size
    
//     setStats({
//       totalCourseGroups: grouped.length,
//       withCoordinator: withCoord,
//       withoutCoordinator: grouped.length - withCoord,
//       totalSections: coursesData.length,
//       totalFaculty: totalFaculty,
//       pendingContent: 0 // Will be calculated if you have approval data
//     })

//     setLoading(false)
//   }

//   const groupCoursesByName = (coursesData: Course[], allocsData: (Allocation & { course: Course })[]) => {
//     const groups = new Map<string, GroupedCourse>()

//     coursesData.forEach((course: Course) => {
//       const key = `${course.courseName}-${course.courseCode}`
      
//       if (!groups.has(key)) {
//         groups.set(key, {
//           courseName: course.courseName,
//           courseCode: course.courseCode,
//           courses: [],
//           allAllocations: []
//         })
//       }

//       const group = groups.get(key)!
//       group.courses.push(course)
      
//       const courseAllocs = allocsData.filter((alloc: Allocation & { course: Course }) => alloc.courseId === course.id)
//       group.allAllocations.push(...courseAllocs)
//     })

//     return Array.from(groups.values()).sort((a, b) => 
//       a.courseName.localeCompare(b.courseName)
//     )
//   }

//   const applyFilters = () => {
//     let filtered = groupedCourses

//     // Filter by search term
//     if (searchTerm.trim() !== '') {
//       filtered = filtered.filter(group =>
//         group.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         group.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
//       )
//     }

//     // Filter by session
//     if (selectedSession !== 'all') {
//       filtered = filtered.filter(group =>
//         group.courses.some(c => c.session === selectedSession)
//       )
//     }

//     // Filter by semester
//     if (selectedSemester !== 'all') {
//       filtered = filtered.filter(group =>
//         group.courses.some(c => c.semester === parseInt(selectedSemester))
//       )
//     }

//     // Filter by coordinator status
//     if (coordinatorFilter === 'assigned') {
//       filtered = filtered.filter(group =>
//         group.allAllocations.some(a => a.role === 'COORDINATOR')
//       )
//     } else if (coordinatorFilter === 'unassigned') {
//       filtered = filtered.filter(group =>
//         !group.allAllocations.some(a => a.role === 'COORDINATOR')
//       )
//     }

//     setFilteredGroups(filtered)
//   }

//   const toggleGroup = (courseName: string) => {
//     const newExpanded = new Set(expandedGroups)
//     if (newExpanded.has(courseName)) {
//       newExpanded.delete(courseName)
//     } else {
//       newExpanded.add(courseName)
//     }
//     setExpandedGroups(newExpanded)
//   }

//   const expandAll = () => {
//     const allKeys = new Set(filteredGroups.map(g => g.courseName))
//     setExpandedGroups(allKeys)
//   }

//   const collapseAll = () => {
//     setExpandedGroups(new Set())
//   }

//   const handleSetCoordinator = async (courseId: string, allocationId: string, courseName: string) => {
//     if (!confirm(`Set this faculty as coordinator for ${courseName}?`)) return
    
//     const result = await setCoordinator(courseId, allocationId)
//     if (result.success) {
//       toast.success('Coordinator updated successfully!')
//       loadData()
//     } else {
//       toast.error(result.error || 'Failed to set coordinator')
//     }
//   }

//   const handleViewContent = async (faculty: Allocation['faculty']) => {
//     setLoadingContent(true)
//     setShowContentModal(true)
    
//     const content = await getTeachingContentByFaculty(faculty.id)
//     setSelectedFacultyContent({ faculty, content })
//     setLoadingContent(false)
//   }

//   const handleClearFilters = () => {
//     setSearchTerm('')
//     setSelectedSession('all')
//     setSelectedSemester('all')
//     setCoordinatorFilter('all')
//   }

//   const getContentTypeColor = (type: string) => {
//     const colors: Record<string, string> = {
//       'LECTURE_PPT': 'bg-blue-100 text-blue-800',
//       'ASSIGNMENT': 'bg-green-100 text-green-800',
//       'QUESTION_BANK': 'bg-purple-100 text-purple-800',
//       'LAB_MANUAL': 'bg-orange-100 text-orange-800',
//       'SYLLABUS': 'bg-pink-100 text-pink-800',
//       'NOTES': 'bg-yellow-100 text-yellow-800',
//       'COURSE_HANDBOOK': 'bg-indigo-100 text-indigo-800',
//       'REFERENCE_MATERIAL': 'bg-gray-100 text-gray-800'
//     }
//     return colors[type] || 'bg-gray-100 text-gray-800'
//   }

//   const getApprovalStatusColor = (status: string) => {
//     const colors: Record<string, string> = {
//       'PENDING': 'bg-yellow-100 text-yellow-800',
//       'APPROVED': 'bg-green-100 text-green-800',
//       'CHANGES_REQUIRED': 'bg-orange-100 text-orange-800',
//       'REJECTED': 'bg-red-100 text-red-800'
//     }
//     return colors[status] || 'bg-gray-100 text-gray-800'
//   }

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading courses...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="p-6">
//       <Toaster position="top-right" />
      
//       {/* Header */}
//       <div className="mb-6">
//         <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Coordination</h1>
//         <p className="text-gray-600">Manage coordinators for similar courses across different programmes and sections</p>
//       </div>

//       {/* Statistics Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//           <div className="flex items-center gap-3 mb-2">
//             <BarChart3 className="h-8 w-8 text-blue-600" />
//             <div>
//               <p className="text-gray-600 text-sm font-medium">Course Groups</p>
//               <p className="text-3xl font-bold text-gray-900">{stats.totalCourseGroups}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//           <div className="flex items-center gap-3 mb-2">
//             <CheckCircle className="h-8 w-8 text-green-600" />
//             <div>
//               <p className="text-gray-600 text-sm font-medium">With Coordinator</p>
//               <p className="text-3xl font-bold text-green-900">{stats.withCoordinator}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//           <div className="flex items-center gap-3 mb-2">
//             <AlertCircle className="h-8 w-8 text-red-600" />
//             <div>
//               <p className="text-gray-600 text-sm font-medium">Without Coordinator</p>
//               <p className="text-3xl font-bold text-red-900">{stats.withoutCoordinator}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//           <div className="flex items-center gap-3 mb-2">
//             <Users className="h-8 w-8 text-purple-600" />
//             <div>
//               <p className="text-gray-600 text-sm font-medium">Total Faculty</p>
//               <p className="text-3xl font-bold text-gray-900">{stats.totalFaculty}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//           <div className="flex items-center gap-3 mb-2">
//             <FileText className="h-8 w-8 text-orange-600" />
//             <div>
//               <p className="text-gray-600 text-sm font-medium">Total Sections</p>
//               <p className="text-3xl font-bold text-gray-900">{stats.totalSections}</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Content Modal */}
//       {showContentModal && selectedFacultyContent && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
//             <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
//               <div className="flex justify-between items-center">
//                 <div>
//                   <h2 className="text-2xl font-bold text-gray-900">Uploaded Content</h2>
//                   <p className="text-gray-600 mt-1">
//                     {selectedFacultyContent.faculty.name} ({selectedFacultyContent.faculty.facultyId})
//                   </p>
//                 </div>
//                 <button 
//                   onClick={() => setShowContentModal(false)} 
//                   className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-colors"
//                 >
//                   <X className="h-6 w-6" />
//                 </button>
//               </div>
//             </div>

//             <div className="p-6">
//               {loadingContent ? (
//                 <div className="text-center py-12">
//                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//                   <p className="text-gray-600">Loading content...</p>
//                 </div>
//               ) : selectedFacultyContent.content.length === 0 ? (
//                 <div className="text-center py-12">
//                   <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//                   <p className="text-lg font-medium text-gray-900">No content uploaded yet</p>
//                   <p className="text-sm text-gray-600 mt-1">This faculty hasn't uploaded any teaching materials</p>
//                 </div>
//               ) : (
//                 <div className="space-y-3">
//                   {selectedFacultyContent.content.map((content) => (
//                     <div key={content.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-50">
//                       <div className="flex items-start justify-between mb-3">
//                         <div className="flex-1">
//                           <h4 className="font-semibold text-gray-900 mb-1">{content.title}</h4>
//                           <p className="text-sm text-gray-600">
//                             {content.course.courseCode} - {content.course.courseName}
//                           </p>
//                           <p className="text-xs text-gray-500">{content.course.programme.programmeCode}</p>
//                         </div>
//                         <div className="flex flex-col items-end gap-2">
//                           <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getContentTypeColor(content.contentType)}`}>
//                             {content.contentType.replace(/_/g, ' ')}
//                           </span>
//                           <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getApprovalStatusColor(content.approvalStatus)}`}>
//                             {content.approvalStatus}
//                           </span>
//                         </div>
//                       </div>

//                       <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
//                         <div className="flex items-center gap-1">
//                           <FileText className="h-4 w-4" />
//                           <span>{content.fileName}</span>
//                         </div>
//                         {content.lectureNumber && (
//                           <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
//                             Lecture {content.lectureNumber}
//                           </span>
//                         )}
//                         <div className="flex items-center gap-1 ml-auto">
//                           <Calendar className="h-4 w-4" />
//                           <span className="text-xs">
//                             {new Date(content.createdAt).toLocaleDateString('en-US', { 
//                               year: 'numeric', 
//                               month: 'short', 
//                               day: 'numeric' 
//                             })}
//                           </span>
//                         </div>
//                       </div>

//                       <button
//                         onClick={() => window.open(content.filePath, '_blank')}
//                         className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
//                       >
//                         <Download className="h-4 w-4" />
//                         Download File
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Filters Section */}
//       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
//             <Filter className="h-5 w-5" />
//             Filters & Search
//           </h3>
//           <button
//             onClick={() => setShowFilters(!showFilters)}
//             className="text-blue-600 hover:text-blue-700 text-sm font-medium"
//           >
//             {showFilters ? 'Hide Filters' : 'Show Filters'}
//           </button>
//         </div>

//         {/* Search */}
//         <div className="mb-4">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search courses by name or code..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
//             />
//           </div>
//         </div>

//         {/* Advanced Filters */}
//         {showFilters && (
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Session</label>
//               <select
//                 value={selectedSession}
//                 onChange={(e) => setSelectedSession(e.target.value)}
//                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
//               >
//                 <option value="all">All Sessions</option>
//                 {availableSessions.map((session) => (
//                   <option key={session} value={session}>
//                     {session}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
//               <select
//                 value={selectedSemester}
//                 onChange={(e) => setSelectedSemester(e.target.value)}
//                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
//               >
//                 <option value="all">All Semesters</option>
//                 {availableSemesters.map((sem) => (
//                   <option key={sem} value={sem}>
//                     Semester {sem}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Coordinator Status</label>
//               <select
//                 value={coordinatorFilter}
//                 onChange={(e) => setCoordinatorFilter(e.target.value as any)}
//                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
//               >
//                 <option value="all">All Courses</option>
//                 <option value="assigned">With Coordinator</option>
//                 <option value="unassigned">Without Coordinator</option>
//               </select>
//             </div>
//           </div>
//         )}

//         {/* Filter Results */}
//         {(searchTerm || selectedSession !== 'all' || selectedSemester !== 'all' || coordinatorFilter !== 'all') && (
//           <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
//             <p className="text-sm text-gray-600">
//               Showing {filteredGroups.length} of {groupedCourses.length} course group{filteredGroups.length !== 1 ? 's' : ''}
//             </p>
//             <button
//               onClick={handleClearFilters}
//               className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
//             >
//               Clear All Filters
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Expand/Collapse All */}
//       {filteredGroups.length > 0 && (
//         <div className="flex justify-end gap-2 mb-4">
//           <button
//             onClick={expandAll}
//             className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium transition-colors"
//           >
//             Expand All
//           </button>
//           <button
//             onClick={collapseAll}
//             className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
//           >
//             Collapse All
//           </button>
//         </div>
//       )}

//       {/* Grouped Courses */}
//       <div className="space-y-4">
//         {filteredGroups.length === 0 ? (
//           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
//             <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-xl font-semibold text-gray-700 mb-2">No Courses Found</h3>
//             <p className="text-gray-600">
//               {searchTerm || selectedSession !== 'all' || selectedSemester !== 'all' || coordinatorFilter !== 'all'
//                 ? 'No courses match your filter criteria. Try adjusting your filters.'
//                 : 'No courses available in the system.'}
//             </p>
//           </div>
//         ) : (
//           filteredGroups.map((group) => {
//             const isExpanded = expandedGroups.has(group.courseName)
//             const coordinator = group.allAllocations.find(a => a.role === 'COORDINATOR')
//             const totalFaculty = new Set(group.allAllocations.map(a => a.faculty.id)).size

//             return (
//               <div key={group.courseName} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
//                 {/* Group Header */}
//                 <div
//                   className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 cursor-pointer hover:from-gray-100 hover:to-gray-50 transition-colors"
//                   onClick={() => toggleGroup(group.courseName)}
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-4 flex-1">
//                       <div className="text-gray-600 flex-shrink-0">
//                         {isExpanded ? <ChevronDown className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
//                       </div>
//                       <div className="flex-1">
//                         <h3 className="text-xl font-bold text-gray-900 mb-1">{group.courseName}</h3>
//                         <p className="text-sm text-gray-600 font-medium">{group.courseCode}</p>
//                       </div>
//                     </div>
                    
//                     <div className="flex items-center gap-6">
//                       <div className="text-center bg-blue-50 px-4 py-3 rounded-lg">
//                         <p className="text-2xl font-bold text-blue-600">{group.courses.length}</p>
//                         <p className="text-xs text-gray-600 font-medium">Sections</p>
//                       </div>
//                       <div className="text-center bg-green-50 px-4 py-3 rounded-lg">
//                         <p className="text-2xl font-bold text-green-600">{totalFaculty}</p>
//                         <p className="text-xs text-gray-600 font-medium">Faculty</p>
//                       </div>
//                       {coordinator ? (
//                         <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 px-4 py-3 rounded-lg flex items-center gap-3 border border-yellow-200">
//                           <Crown className="h-5 w-5 text-yellow-600 flex-shrink-0" />
//                           <div className="text-left">
//                             <p className="text-xs text-yellow-700 font-semibold mb-0.5">Coordinator</p>
//                             <p className="text-sm text-yellow-900 font-bold">{coordinator.faculty.name}</p>
//                           </div>
//                         </div>
//                       ) : (
//                         <div className="bg-red-50 px-4 py-3 rounded-lg border border-red-200">
//                           <div className="flex items-center gap-2">
//                             <AlertCircle className="h-5 w-5 text-red-600" />
//                             <p className="text-sm text-red-700 font-semibold">No Coordinator</p>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Expanded Content */}
//                 {isExpanded && (
//                   <div className="p-6 bg-gray-50">
//                     {/* Course Sections */}
//                     <div className="mb-6">
//                       <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
//                         <FileText className="h-5 w-5" />
//                         Course Sections ({group.courses.length})
//                       </h4>
//                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
//                         {group.courses.map(course => (
//                           <div key={course.id} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
//                             <div className="flex items-start justify-between mb-2">
//                               <div>
//                                 <p className="font-semibold text-gray-900">{course.programme.programmeCode}</p>
//                                 {course.programme.section && (
//                                   <p className="text-sm text-gray-600 mt-1">Section {course.programme.section}</p>
//                                 )}
//                               </div>
//                               <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">
//                                 Sem {course.semester}
//                               </span>
//                             </div>
//                             <p className="text-xs text-gray-600 mb-1">{course.session}</p>
//                             <p className="text-xs text-gray-500">{course.credits} credits</p>
//                           </div>
//                         ))}
//                       </div>
//                     </div>

//                     {/* All Faculty Assigned */}
//                     <div>
//                       <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
//                         <Users className="h-5 w-5" />
//                         Assigned Faculty ({totalFaculty})
//                       </h4>
                      
//                       {group.allAllocations.length === 0 ? (
//                         <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-gray-300">
//                           <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
//                           <p className="text-gray-600">No faculty assigned to any section yet</p>
//                         </div>
//                       ) : (
//                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//                           {Array.from(new Set(group.allAllocations.map(a => a.faculty.id))).map(facultyId => {
//                             const facultyAllocs = group.allAllocations.filter(a => a.faculty.id === facultyId)
//                             const firstAlloc = facultyAllocs[0]
//                             const isCoordinator = facultyAllocs.some(a => a.role === 'COORDINATOR')

//                             return (
//                               <div
//                                 key={facultyId}
//                                 className={`border-2 rounded-xl p-5 transition-all ${
//                                   isCoordinator 
//                                     ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300 shadow-md' 
//                                     : 'bg-white border-gray-200 hover:shadow-md'
//                                 }`}
//                               >
//                                 <div className="flex items-start justify-between mb-3">
//                                   <div className="flex-1">
//                                     <div className="flex items-center gap-2 mb-1">
//                                       <h5 className="font-bold text-gray-900">{firstAlloc.faculty.name}</h5>
//                                       {isCoordinator && <Crown className="h-5 w-5 text-yellow-600" />}
//                                     </div>
//                                     <p className="text-sm text-gray-600">{firstAlloc.faculty.designation}</p>
//                                     <p className="text-xs text-gray-500 mt-1">{firstAlloc.faculty.email}</p>
//                                   </div>
//                                   <span className={`px-3 py-1 rounded-full text-xs font-bold ${
//                                     isCoordinator 
//                                       ? 'bg-yellow-200 text-yellow-900' 
//                                       : 'bg-gray-200 text-gray-800'
//                                   }`}>
//                                     {isCoordinator ? 'COORDINATOR' : 'CONTRIBUTOR'}
//                                   </span>
//                                 </div>

//                                 <div className="mb-4">
//                                   <p className="text-xs text-gray-600 font-medium mb-2">Teaching sections:</p>
//                                   <div className="flex flex-wrap gap-2">
//                                     {facultyAllocs.map(alloc => (
//                                       <span key={alloc.id} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-md font-semibold">
//                                         {alloc.course.programme.programmeCode}
//                                         {alloc.course.programme.section ? ` (${alloc.course.programme.section})` : ''}
//                                       </span>
//                                     ))}
//                                   </div>
//                                 </div>

//                                 <div className="flex gap-2">
//                                   {!isCoordinator && (
//                                     <button
//                                       onClick={() => handleSetCoordinator(
//                                         facultyAllocs[0].courseId,
//                                         facultyAllocs[0].id,
//                                         group.courseName
//                                       )}
//                                       className="flex-1 bg-yellow-100 text-yellow-700 px-3 py-2.5 rounded-lg hover:bg-yellow-200 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
//                                     >
//                                       <Crown className="h-4 w-4" />
//                                       Make Coordinator
//                                     </button>
//                                   )}
//                                   <button
//                                     onClick={() => handleViewContent(firstAlloc.faculty)}
//                                     className="flex-1 bg-blue-100 text-blue-700 px-3 py-2.5 rounded-lg hover:bg-blue-200 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
//                                   >
//                                     <Eye className="h-4 w-4" />
//                                     View Content
//                                   </button>
//                                 </div>
//                               </div>
//                             )
//                           })}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )
//           })
//         )}
//       </div>
//     </div>
//   )
// }

// 'use client'
// import { useState, useEffect } from 'react'
// import { 
//   Plus, Edit, Trash2, Upload as UploadIcon, BookOpen, X, Search, 
//   Grid, List, BarChart3, Users, Award, Crown, Filter, ChevronDown, 
//   ChevronRight, FileText, Eye, Download, Calendar, CheckCircle, Clock, 
//   AlertCircle, TrendingUp, Target, RefreshCw 
// } from 'lucide-react'
// import toast, { Toaster } from 'react-hot-toast'
// import { 
//   createFaculty, getFaculty, updateFaculty, deleteFaculty, 
//   bulkUploadFaculty, getCourses, allocateFaculty, 
//   getCourseAllocations, removeAllocation, setCoordinator,
//   getTeachingContentByFaculty 
// } from '@/app/actions/admin'
// import BulkUpload from '@/components/admin/BulkUpload'
// import { DndContext, closestCenter, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'

// // ============================================
// // PRISMA SCHEMA ALIGNED INTERFACES
// // ============================================

// interface Faculty {
//   id: string
//   userId: string
//   facultyId: string
//   name: string
//   designation: string
//   email: string
//   contactNo: string
//   department: string | null
//   session: string
//   createdAt: Date
//   updatedAt: Date
// }

// interface Course {
//   id: string
//   session: string
//   programmeId: string
//   semester: number
//   courseCode: string
//   courseName: string
//   l: number // Lecture hours
//   t: number // Tutorial hours
//   p: number // Practical hours
//   s: number // Self-study hours
//   credits: number
//   totalHours: number
//   courseType: 'THEORY' | 'PRACTICAL' | 'LAB'
//   roomNo: string | null
//   attendance: boolean
//   category: 'MANDATORY' | 'ELECTIVE'
//   createdAt: Date
//   updatedAt: Date
//   programme: {
//     id: string
//     session: string
//     programmeCode: string
//     programmeName: string
//     duration: number
//     currentSemester: number
//     section: string | null
//     noOfStudents: number
//     createdAt: Date
//     updatedAt: Date
//   }
// }

// interface Allocation {
//   id: string
//   courseId: string
//   facultyId: string
//   role: 'COORDINATOR' | 'CONTRIBUTOR'
//   createdAt: Date
//   updatedAt: Date
//   faculty: {
//     id: string
//     userId: string
//     facultyId: string
//     name: string
//     designation: string
//     email: string
//     department: string | null
//     session: string
//     createdAt: Date
//     updatedAt: Date
//   }
// }

// interface FacultyWithCourses extends Faculty {
//   allocatedCourses?: number
//   workloadHours?: number
// }

// interface GroupedCourse {
//   courseName: string
//   courseCode: string
//   courses: Course[]
//   allAllocations: (Allocation & { course: Course })[]
// }

// interface TeachingContent {
//   id: string
//   courseId: string
//   facultyId: string
//   contentType: 'LECTURE_PPT' | 'ASSIGNMENT' | 'QUESTION_BANK' | 'LAB_MANUAL' | 'COURSE_HANDBOOK' | 'SYLLABUS' | 'NOTES' | 'REFERENCE_MATERIAL'
//   title: string
//   description: string | null
//   lectureNumber: number | null
//   filePath: string
//   fileName: string
//   fileSize: number | null
//   mimeType: string | null
//   approvalStatus: 'PENDING' | 'APPROVED' | 'CHANGES_REQUIRED' | 'REJECTED'
//   coordinatorNotes: string | null
//   createdAt: Date
//   updatedAt: Date
//   course: {
//     id: string
//     session: string
//     programmeId: string
//     semester: number
//     courseCode: string
//     courseName: string
//     l: number
//     t: number
//     p: number
//     s: number
//     credits: number
//     totalHours: number
//     courseType: 'THEORY' | 'PRACTICAL' | 'LAB'
//     roomNo: string | null
//     attendance: boolean
//     category: 'MANDATORY' | 'ELECTIVE'
//     createdAt: Date
//     updatedAt: Date
//     programme: {
//       id: string
//       session: string
//       programmeCode: string
//       programmeName: string
//       duration: number
//       currentSemester: number
//       section: string | null
//       noOfStudents: number
//       createdAt: Date
//       updatedAt: Date
//     }
//   }
// }

// interface Programme {
//   id: string
//   session: string
//   programmeCode: string
//   programmeName: string
//   duration: number
//   currentSemester: number
//   section: string | null
//   noOfStudents: number
//   createdAt: Date
//   updatedAt: Date
// }

// interface Student {
//   id: string
//   userId: string
//   studentId: string
//   name: string
//   email: string
//   contactNo: string | null
//   programmeId: string
//   currentSemester: number
//   section: string | null
//   createdAt: Date
//   updatedAt: Date
//   programme: Programme
// }

// type TabType = 'overview' | 'faculty' | 'courses' | 'coordination' | 'workload' | 'matrix'

// // ============================================
// // MAIN COMPONENT
// // ============================================

// export default function FacultyCourseManagementPage() {
//   // State management
//   const [faculty, setFaculty] = useState<FacultyWithCourses[]>([])
//   const [filteredFaculty, setFilteredFaculty] = useState<FacultyWithCourses[]>([])
//   const [courses, setCourses] = useState<Course[]>([])
//   const [groupedCourses, setGroupedCourses] = useState<GroupedCourse[]>([])
//   const [filteredGroups, setFilteredGroups] = useState<GroupedCourse[]>([])
//   const [allAllocations, setAllAllocations] = useState<(Allocation & { course: Course })[]>([])
  
//   // UI State
//   const [activeTab, setActiveTab] = useState<TabType>('overview')
//   const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards')
//   const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
//   const [loading, setLoading] = useState(true)
  
//   // Modals
//   const [showForm, setShowForm] = useState(false)
//   const [showBulkUpload, setShowBulkUpload] = useState(false)
//   const [showCourseModal, setShowCourseModal] = useState(false)
//   const [showContentModal, setShowContentModal] = useState(false)
//   const [selectedFacultyForCourses, setSelectedFacultyForCourses] = useState<Faculty | null>(null)
//   const [facultyCourses, setFacultyCourses] = useState<any[]>([])
//   const [selectedCourse, setSelectedCourse] = useState('')
//   const [selectedFacultyContent, setSelectedFacultyContent] = useState<{
//     faculty: Allocation['faculty']
//     content: TeachingContent[]
//   } | null>(null)
//   const [loadingContent, setLoadingContent] = useState(false)
  
//   // Filters
//   const [searchTerm, setSearchTerm] = useState('')
//   const [selectedDesignation, setSelectedDesignation] = useState<string>('all')
//   const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
//   const [selectedSession, setSelectedSession] = useState<string>('all')
//   const [selectedSemester, setSelectedSemester] = useState<string>('all')
//   const [coordinatorFilter, setCoordinatorFilter] = useState<'all' | 'assigned' | 'unassigned'>('all')
//   const [availableDesignations, setAvailableDesignations] = useState<string[]>([])
//   const [availableDepartments, setAvailableDepartments] = useState<string[]>([])
//   const [availableSessions, setAvailableSessions] = useState<string[]>([])
//   const [availableSemesters, setAvailableSemesters] = useState<number[]>([])
  
//   // Form
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
//     avgCoursesPerFaculty: 0,
//     totalCourseGroups: 0,
//     withCoordinator: 0,
//     withoutCoordinator: 0,
//     totalSections: 0
//   })

//   // Workload data
//   const [workloadData, setWorkloadData] = useState<{faculty: string, courses: number, hours: number}[]>([])

//   // Drag and drop
//   const [activeDragFaculty, setActiveDragFaculty] = useState<FacultyWithCourses | null>(null)
//   const sensors = useSensors(
//     useSensor(PointerSensor, {
//       activationConstraint: {
//         distance: 8,
//       },
//     })
//   )

//   useEffect(() => {
//     loadData()
//   }, [])

//   useEffect(() => {
//     applyFacultyFilters()
//   }, [searchTerm, selectedDesignation, selectedDepartment, selectedSession, faculty])

//   useEffect(() => {
//     applyCoordinationFilters()
//   }, [searchTerm, selectedSession, selectedSemester, coordinatorFilter, groupedCourses])

//   const loadData = async () => {
//     setLoading(true)
//     const [facultyData, coursesData] = await Promise.all([
//       getFaculty(),
//       getCourses()
//     ])
    
//     // Load all allocations
//     const allocations = await Promise.all(
//       coursesData.map(course => getCourseAllocations(course.id))
//     )
//     const flatAllocations = allocations.flat()
    
//     const allocsWithCourse = flatAllocations.map(alloc => ({
//       ...alloc,
//       course: coursesData.find(c => c.id === alloc.courseId)!
//     }))
    
//     setAllAllocations(allocsWithCourse)

//     // Calculate workload for each faculty - FIXED: Use alloc.faculty.id
//     const facultyWithWorkload = facultyData.map(fac => {
//       const facAllocations = flatAllocations.filter(alloc => alloc.faculty.id === fac.id)
//       return {
//         ...fac,
//         allocatedCourses: facAllocations.length,
//         workloadHours: facAllocations.length * 4
//       }
//     })
    
//     const sortedFaculty = sortFaculty(facultyWithWorkload)
//     setFaculty(sortedFaculty)
//     setFilteredFaculty(sortedFaculty)
//     setCourses(coursesData)

//     // Generate workload data
//     const workload = facultyWithWorkload
//       .sort((a, b) => (b.allocatedCourses || 0) - (a.allocatedCourses || 0))
//       .slice(0, 10)
//       .map(fac => ({
//         faculty: fac.name.split(' ').slice(-1)[0],
//         courses: fac.allocatedCourses || 0,
//         hours: fac.workloadHours || 0
//       }))
//     setWorkloadData(workload)

//     // Extract filter options
//     const designations = Array.from(new Set(facultyData.map(f => f.designation))).sort()
//     setAvailableDesignations(designations)

//     const departments = Array.from(new Set(facultyData.map(f => f.department).filter(d => d !== null))).sort()
//     setAvailableDepartments(departments as string[])

//     const sessions = Array.from(new Set(coursesData.map(c => c.session))).sort().reverse()
//     setAvailableSessions(sessions)

//     const semesters = Array.from(new Set(coursesData.map(c => c.semester))).sort((a, b) => a - b)
//     setAvailableSemesters(semesters)

//     if (sessions.length > 0 && selectedSession === 'all') {
//       setSelectedSession(sessions[0])
//     }

//     // Group courses
//     const grouped = groupCoursesByName(coursesData, allocsWithCourse)
//     setGroupedCourses(grouped)
//     setFilteredGroups(grouped)

//     // Calculate statistics
//     const professors = facultyData.filter(f => f.designation === 'Professor').length
//     const associateProfs = facultyData.filter(f => f.designation === 'Associate Professor').length
//     const assistantProfs = facultyData.filter(f => f.designation === 'Assistant Professor').length
//     const avgCourses = facultyData.length > 0 ? Math.round(flatAllocations.length / facultyData.length * 10) / 10 : 0
//     const withCoord = grouped.filter(g => g.allAllocations.some(a => a.role === 'COORDINATOR')).length

//     setStats({
//       totalFaculty: facultyData.length,
//       professors: professors,
//       associateProfessors: associateProfs,
//       assistantProfessors: assistantProfs,
//       totalAllocations: flatAllocations.length,
//       avgCoursesPerFaculty: avgCourses,
//       totalCourseGroups: grouped.length,
//       withCoordinator: withCoord,
//       withoutCoordinator: grouped.length - withCoord,
//       totalSections: coursesData.length
//     })

//     setLoading(false)
//   }

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
      
//       if (aOrder !== bOrder) return aOrder - bOrder

//       const aDept = a.department || ''
//       const bDept = b.department || ''
//       if (aDept !== bDept) return aDept.localeCompare(bDept)

//       return a.name.localeCompare(b.name)
//     })
//   }

//   const groupCoursesByName = (coursesData: Course[], allocsData: (Allocation & { course: Course })[]) => {
//     const groups = new Map<string, GroupedCourse>()

//     coursesData.forEach((course: Course) => {
//       const key = `${course.courseName}-${course.courseCode}`
      
//       if (!groups.has(key)) {
//         groups.set(key, {
//           courseName: course.courseName,
//           courseCode: course.courseCode,
//           courses: [],
//           allAllocations: []
//         })
//       }

//       const group = groups.get(key)!
//       group.courses.push(course)
      
//       const courseAllocs = allocsData.filter((alloc: Allocation & { course: Course }) => alloc.courseId === course.id)
//       group.allAllocations.push(...courseAllocs)
//     })

//     return Array.from(groups.values()).sort((a, b) => 
//       a.courseName.localeCompare(b.courseName)
//     )
//   }

//   const applyFacultyFilters = () => {
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
//   }

//   const applyCoordinationFilters = () => {
//     let filtered = groupedCourses

//     if (searchTerm.trim() !== '') {
//       filtered = filtered.filter(group =>
//         group.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         group.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
//       )
//     }

//     if (selectedSession !== 'all') {
//       filtered = filtered.filter(group =>
//         group.courses.some(c => c.session === selectedSession)
//       )
//     }

//     if (selectedSemester !== 'all') {
//       filtered = filtered.filter(group =>
//         group.courses.some(c => c.semester === parseInt(selectedSemester))
//       )
//     }

//     if (coordinatorFilter === 'assigned') {
//       filtered = filtered.filter(group =>
//         group.allAllocations.some(a => a.role === 'COORDINATOR')
//       )
//     } else if (coordinatorFilter === 'unassigned') {
//       filtered = filtered.filter(group =>
//         !group.allAllocations.some(a => a.role === 'COORDINATOR')
//       )
//     }

//     setFilteredGroups(filtered)
//   }

//   const handleClearFilters = () => {
//     setSearchTerm('')
//     setSelectedDesignation('all')
//     setSelectedDepartment('all')
//     setSelectedSession('all')
//     setSelectedSemester('all')
//     setCoordinatorFilter('all')
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
//     // FIXED: Use alloc.faculty.id instead of alloc.facultyId
//     const facCourses = allAllocations.filter(alloc => alloc.faculty.id === fac.id)
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

//   const handleSetCoordinator = async (courseId: string, allocationId: string, courseName: string) => {
//     if (!confirm(`Set this faculty as coordinator for ${courseName}?`)) return
    
//     const result = await setCoordinator(courseId, allocationId)
//     if (result.success) {
//       toast.success('Coordinator updated successfully!')
//       loadData()
//     } else {
//       toast.error(result.error || 'Failed to set coordinator')
//     }
//   }

//   const handleViewContent = async (faculty: Allocation['faculty']) => {
//     setLoadingContent(true)
//     setShowContentModal(true)
    
//     const content = await getTeachingContentByFaculty(faculty.id)
//     setSelectedFacultyContent({ faculty, content })
//     setLoadingContent(false)
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

//   const toggleGroup = (courseName: string) => {
//     const newExpanded = new Set(expandedGroups)
//     if (newExpanded.has(courseName)) {
//       newExpanded.delete(courseName)
//     } else {
//       newExpanded.add(courseName)
//     }
//     setExpandedGroups(newExpanded)
//   }

//   const expandAll = () => {
//     const allKeys = new Set(filteredGroups.map(g => g.courseName))
//     setExpandedGroups(allKeys)
//   }

//   const collapseAll = () => {
//     setExpandedGroups(new Set())
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

//   const getContentTypeColor = (type: string) => {
//     const colors: Record<string, string> = {
//       'LECTURE_PPT': 'bg-blue-100 text-blue-800',
//       'ASSIGNMENT': 'bg-green-100 text-green-800',
//       'QUESTION_BANK': 'bg-purple-100 text-purple-800',
//       'LAB_MANUAL': 'bg-orange-100 text-orange-800',
//       'SYLLABUS': 'bg-pink-100 text-pink-800',
//       'NOTES': 'bg-yellow-100 text-yellow-800',
//       'COURSE_HANDBOOK': 'bg-indigo-100 text-indigo-800',
//       'REFERENCE_MATERIAL': 'bg-gray-100 text-gray-800'
//     }
//     return colors[type] || 'bg-gray-100 text-gray-800'
//   }

//   const getApprovalStatusColor = (status: string) => {
//     const colors: Record<string, string> = {
//       'PENDING': 'bg-yellow-100 text-yellow-800',
//       'APPROVED': 'bg-green-100 text-green-800',
//       'CHANGES_REQUIRED': 'bg-orange-100 text-orange-800',
//       'REJECTED': 'bg-red-100 text-red-800'
//     }
//     return colors[status] || 'bg-gray-100 text-gray-800'
//   }

//   // Drag and drop handlers
//   const handleDragStart = (event: any) => {
//     const { active } = event
//     const draggedFaculty = faculty.find(f => f.id === active.id)
//     setActiveDragFaculty(draggedFaculty || null)
//   }

//   const handleDragEnd = async (event: DragEndEvent) => {
//     const { active, over } = event
//     setActiveDragFaculty(null)

//     if (!over) return

//     const facultyId = active.id as string
//     const courseId = over.id as string

//     const result = await allocateFaculty(courseId, facultyId, 'CONTRIBUTOR')
//     if (result.success) {
//       toast.success('Course allocated successfully via drag & drop!')
//       await loadData()
//     } else {
//       toast.error(result.error || 'Failed to allocate course')
//     }
//   }

//   // Render tab content
//   const renderTabContent = () => {
//     switch(activeTab) {
//       case 'overview':
//         return renderOverviewTab()
//       case 'faculty':
//         return renderFacultyTab()
//       case 'courses':
//         return renderCoursesTab()
//       case 'coordination':
//         return renderCoordinationTab()
//       case 'workload':
//         return renderWorkloadTab()
//       case 'matrix':
//         return renderMatrixTab()
//       default:
//         return renderOverviewTab()
//     }
//   }

//   const renderOverviewTab = () => (
//     <div className="space-y-6">
//       {/* Main Statistics */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//           <div className="flex items-center gap-4">
//             <div className="bg-orange-100 p-3 rounded-lg">
//               <Crown className="h-8 w-8 text-orange-600" />
//             </div>
//             <div>
//               <p className="text-gray-600 text-sm font-medium">Course Groups</p>
//               <p className="text-3xl font-bold text-gray-900">{stats.totalCourseGroups}</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Faculty Distribution & Coordinator Status */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">Faculty Distribution</h3>
//           <div className="space-y-3">
//             <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
//               <div className="flex items-center gap-3">
//                 <Award className="h-6 w-6 text-purple-600" />
//                 <span className="font-medium text-gray-900">Professors</span>
//               </div>
//               <span className="text-2xl font-bold text-purple-600">{stats.professors}</span>
//             </div>
//             <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
//               <div className="flex items-center gap-3">
//                 <Award className="h-6 w-6 text-blue-600" />
//                 <span className="font-medium text-gray-900">Associate Professors</span>
//               </div>
//               <span className="text-2xl font-bold text-blue-600">{stats.associateProfessors}</span>
//             </div>
//             <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
//               <div className="flex items-center gap-3">
//                 <Award className="h-6 w-6 text-green-600" />
//                 <span className="font-medium text-gray-900">Assistant Professors</span>
//               </div>
//               <span className="text-2xl font-bold text-green-600">{stats.assistantProfessors}</span>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">Coordinator Status</h3>
//           <div className="space-y-3">
//             <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
//               <div className="flex items-center gap-3">
//                 <CheckCircle className="h-6 w-6 text-green-600" />
//                 <span className="font-medium text-gray-900">With Coordinator</span>
//               </div>
//               <span className="text-2xl font-bold text-green-600">{stats.withCoordinator}</span>
//             </div>
//             <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
//               <div className="flex items-center gap-3">
//                 <AlertCircle className="h-6 w-6 text-red-600" />
//                 <span className="font-medium text-gray-900">Without Coordinator</span>
//               </div>
//               <span className="text-2xl font-bold text-red-600">{stats.withoutCoordinator}</span>
//             </div>
//             <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//               <div className="flex items-center gap-3">
//                 <FileText className="h-6 w-6 text-gray-600" />
//                 <span className="font-medium text-gray-900">Total Sections</span>
//               </div>
//               <span className="text-2xl font-bold text-gray-600">{stats.totalSections}</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Quick Actions */}
//       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//           <button
//             onClick={() => setShowForm(true)}
//             className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
//           >
//             <Plus className="h-6 w-6 text-gray-600 group-hover:text-blue-600 mx-auto mb-2" />
//             <p className="text-sm font-medium text-gray-900">Add Faculty</p>
//           </button>
//           <button
//             onClick={() => setShowBulkUpload(true)}
//             className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
//           >
//             <UploadIcon className="h-6 w-6 text-gray-600 group-hover:text-green-600 mx-auto mb-2" />
//             <p className="text-sm font-medium text-gray-900">Bulk Upload</p>
//           </button>
//           <button
//             onClick={() => setActiveTab('coordination')}
//             className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group"
//           >
//             <Crown className="h-6 w-6 text-gray-600 group-hover:text-purple-600 mx-auto mb-2" />
//             <p className="text-sm font-medium text-gray-900">Set Coordinators</p>
//           </button>
//           <button
//             onClick={() => setActiveTab('workload')}
//             className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all group"
//           >
//             <BarChart3 className="h-6 w-6 text-gray-600 group-hover:text-orange-600 mx-auto mb-2" />
//             <p className="text-sm font-medium text-gray-900">View Workload</p>
//           </button>
//         </div>
//       </div>

//       {/* Alerts */}
//       {stats.withoutCoordinator > 0 && (
//         <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
//           <div className="flex items-start gap-3">
//             <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
//             <div className="flex-1">
//               <h4 className="font-semibold text-red-900 mb-1">Action Required</h4>
//               <p className="text-sm text-red-800">
//                 {stats.withoutCoordinator} course group{stats.withoutCoordinator > 1 ? 's' : ''} need a coordinator assigned. 
//                 <button 
//                   onClick={() => setActiveTab('coordination')}
//                   className="ml-2 font-semibold underline hover:text-red-900"
//                 >
//                   Assign now →
//                 </button>
//               </p>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )

//   const renderFacultyTab = () => (
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

//       {/* Faculty List - Cards or Table */}
//       {viewMode === 'cards' ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {filteredFaculty.length === 0 ? (
//             <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
//               <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
//               <p className="text-lg font-medium text-gray-900">No faculty found</p>
//               <p className="text-sm text-gray-600 mt-1">Try adjusting your filters</p>
//             </div>
//           ) : (
//             filteredFaculty.map((fac) => (
//               <div 
//                 key={fac.id} 
//                 draggable
//                 onDragStart={() => setActiveDragFaculty(fac)}
//                 onDragEnd={() => setActiveDragFaculty(null)}
//                 className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all cursor-move"
//               >
//                 <div className="flex items-start justify-between mb-4">
//                   <div className="flex items-center gap-3">
//                     <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
//                       {fac.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
//                     </div>
//                     <div>
//                       <h3 className="font-semibold text-gray-900">{fac.name}</h3>
//                       <p className="text-sm text-gray-600">{fac.facultyId}</p>
//                     </div>
//                   </div>
//                   <div className={`w-3 h-3 rounded-full ${getWorkloadColor(fac.allocatedCourses || 0)}`}></div>
//                 </div>

//                 <div className="space-y-2 mb-4">
//                   <div className="flex items-center justify-between text-sm">
//                     <span className="text-gray-600">Designation:</span>
//                     <span className={`px-2 py-1 rounded text-xs font-semibold ${
//                       fac.designation === 'Professor' ? 'bg-purple-100 text-purple-900' :
//                       fac.designation === 'Associate Professor' ? 'bg-blue-100 text-blue-900' :
//                       fac.designation === 'Assistant Professor' ? 'bg-green-100 text-green-900' :
//                       'bg-gray-100 text-gray-800'
//                     }`}>
//                       {fac.designation}
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between text-sm">
//                     <span className="text-gray-600">Department:</span>
//                     <span className="font-medium text-gray-900">{fac.department || '-'}</span>
//                   </div>
//                   <div className="flex items-center justify-between text-sm">
//                     <span className="text-gray-600">Courses:</span>
//                     <span className="font-semibold text-gray-900">{fac.allocatedCourses || 0}</span>
//                   </div>
//                   <div className="flex items-center justify-between text-sm">
//                     <span className="text-gray-600">Status:</span>
//                     <span className="text-gray-900">{getWorkloadStatus(fac.allocatedCourses || 0)}</span>
//                   </div>
//                 </div>

//                 <div className="flex gap-2">
//                   <button
//                     onClick={() => handleManageCourses(fac)}
//                     className="flex-1 bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200 flex items-center justify-center gap-2 font-medium text-sm transition-colors"
//                   >
//                     <BookOpen className="h-4 w-4" />
//                     Manage
//                   </button>
//                   <button 
//                     onClick={() => handleEdit(fac)} 
//                     className="p-2 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
//                   >
//                     <Edit className="h-5 w-5" />
//                   </button>
//                   <button 
//                     onClick={() => handleDelete(fac.id)} 
//                     className="p-2 text-red-700 hover:bg-red-50 rounded-lg transition-colors"
//                   >
//                     <Trash2 className="h-5 w-5" />
//                   </button>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       ) : (
//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase">ID</th>
//                   <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase">Name</th>
//                   <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase">Designation</th>
//                   <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase">Department</th>
//                   <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase">Courses</th>
//                   <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase">Workload</th>
//                   <th className="px-6 py-3 text-right text-xs font-bold text-gray-800 uppercase">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {filteredFaculty.length === 0 ? (
//                   <tr>
//                     <td colSpan={7} className="px-6 py-12 text-center">
//                       <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
//                       <p className="text-lg font-medium text-gray-900">No faculty found</p>
//                     </td>
//                   </tr>
//                 ) : (
//                   filteredFaculty.map((fac) => (
//                     <tr key={fac.id} className="hover:bg-gray-50 transition-colors">
//                       <td className="px-6 py-4 whitespace-nowrap font-semibold text-blue-600">{fac.facultyId}</td>
//                       <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">{fac.name}</td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className={`px-2 py-1 rounded text-xs font-semibold ${
//                           fac.designation === 'Professor' ? 'bg-purple-100 text-purple-900' :
//                           fac.designation === 'Associate Professor' ? 'bg-blue-100 text-blue-900' :
//                           fac.designation === 'Assistant Professor' ? 'bg-green-100 text-green-900' :
//                           'bg-gray-100 text-gray-800'
//                         }`}>
//                           {fac.designation}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-gray-800">{fac.department || '-'}</td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className="font-semibold text-gray-900">{fac.allocatedCourses || 0}</span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center gap-2">
//                           <div className={`w-2 h-2 rounded-full ${getWorkloadColor(fac.allocatedCourses || 0)}`}></div>
//                           <span className="text-sm text-gray-600">{getWorkloadStatus(fac.allocatedCourses || 0)}</span>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-right">
//                         <div className="flex items-center justify-end gap-2">
//                           <button
//                             onClick={() => handleManageCourses(fac)}
//                             className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 flex items-center gap-1.5 font-medium text-sm"
//                           >
//                             <BookOpen className="h-4 w-4" />
//                             Courses
//                           </button>
//                           <button onClick={() => handleEdit(fac)} className="text-blue-700 hover:text-blue-900 p-1.5">
//                             <Edit className="h-5 w-5" />
//                           </button>
//                           <button onClick={() => handleDelete(fac.id)} className="text-red-700 hover:text-red-900 p-1.5">
//                             <Trash2 className="h-5 w-5" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   )

//   const renderCoursesTab = () => (
//     <div className="space-y-6">
//       <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
//         <div className="flex items-start gap-3">
//           <Target className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
//           <div>
//             <h4 className="font-semibold text-blue-900 mb-1">Drag & Drop Feature</h4>
//             <p className="text-sm text-blue-800">
//               Drag faculty members from the Faculty tab and drop them on courses here to quickly allocate them!
//             </p>
//           </div>
//         </div>
//       </div>

//       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Courses</h3>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {courses.map((course) => (
//             <div
//               key={course.id}
//               className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-all"
//             >
//               <div className="flex items-start justify-between mb-2">
//                 <div>
//                   <h4 className="font-semibold text-gray-900">{course.courseCode}</h4>
//                   <p className="text-sm text-gray-600">{course.courseName}</p>
//                 </div>
//                 <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">
//                   Sem {course.semester}
//                 </span>
//               </div>
//               <div className="text-xs text-gray-600 space-y-1">
//                 <p>{course.programme.programmeCode}</p>
//                 <p>{course.session}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   )

//   const renderCoordinationTab = () => {
//     return (
//       <div className="space-y-6">
//         {/* Filters */}
//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Courses</h3>
          
//           <div className="mb-4">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search courses by name or code..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Session</label>
//               <select
//                 value={selectedSession}
//                 onChange={(e) => setSelectedSession(e.target.value)}
//                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
//               >
//                 <option value="all">All Sessions</option>
//                 {availableSessions.map((session) => (
//                   <option key={session} value={session}>{session}</option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
//               <select
//                 value={selectedSemester}
//                 onChange={(e) => setSelectedSemester(e.target.value)}
//                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
//               >
//                 <option value="all">All Semesters</option>
//                 {availableSemesters.map((sem) => (
//                   <option key={sem} value={sem}>Semester {sem}</option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Coordinator Status</label>
//               <select
//                 value={coordinatorFilter}
//                 onChange={(e) => setCoordinatorFilter(e.target.value as any)}
//                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
//               >
//                 <option value="all">All Courses</option>
//                 <option value="assigned">With Coordinator</option>
//                 <option value="unassigned">Without Coordinator</option>
//               </select>
//             </div>
//           </div>

//           {(searchTerm || selectedSession !== 'all' || selectedSemester !== 'all' || coordinatorFilter !== 'all') && (
//             <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
//               <p className="text-sm text-gray-600">
//                 Showing {filteredGroups.length} of {groupedCourses.length} course groups
//               </p>
//               <button
//                 onClick={handleClearFilters}
//                 className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
//               >
//                 Clear Filters
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Expand/Collapse */}
//         {filteredGroups.length > 0 && (
//           <div className="flex justify-end gap-2">
//             <button onClick={expandAll} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium">
//               Expand All
//             </button>
//             <button onClick={collapseAll} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">
//               Collapse All
//             </button>
//           </div>
//         )}

//         {/* Grouped Courses */}
//         <div className="space-y-4">
//           {filteredGroups.length === 0 ? (
//             <div className="bg-white rounded-xl p-12 text-center">
//               <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//               <h3 className="text-xl font-semibold text-gray-700 mb-2">No Courses Found</h3>
//               <p className="text-gray-600">Try adjusting your filters</p>
//             </div>
//           ) : (
//             filteredGroups.map((group) => {
//               const isExpanded = expandedGroups.has(group.courseName)
//               const coordinator = group.allAllocations.find(a => a.role === 'COORDINATOR')
//               const totalFaculty = new Set(group.allAllocations.map(a => a.faculty.id)).size

//               return (
//                 <div key={group.courseName} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
//                   <div
//                     className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 cursor-pointer hover:from-gray-100 hover:to-gray-50 transition-colors"
//                     onClick={() => toggleGroup(group.courseName)}
//                   >
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-4 flex-1">
//                         <div className="text-gray-600 flex-shrink-0">
//                           {isExpanded ? <ChevronDown className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
//                         </div>
//                         <div className="flex-1">
//                           <h3 className="text-xl font-bold text-gray-900 mb-1">{group.courseName}</h3>
//                           <p className="text-sm text-gray-600 font-medium">{group.courseCode}</p>
//                         </div>
//                       </div>
                      
//                       <div className="flex items-center gap-6">
//                         <div className="text-center bg-blue-50 px-4 py-3 rounded-lg">
//                           <p className="text-2xl font-bold text-blue-600">{group.courses.length}</p>
//                           <p className="text-xs text-gray-600 font-medium">Sections</p>
//                         </div>
//                         <div className="text-center bg-green-50 px-4 py-3 rounded-lg">
//                           <p className="text-2xl font-bold text-green-600">{totalFaculty}</p>
//                           <p className="text-xs text-gray-600 font-medium">Faculty</p>
//                         </div>
//                         {coordinator ? (
//                           <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 px-4 py-3 rounded-lg flex items-center gap-3 border border-yellow-200">
//                             <Crown className="h-5 w-5 text-yellow-600 flex-shrink-0" />
//                             <div className="text-left">
//                               <p className="text-xs text-yellow-700 font-semibold mb-0.5">Coordinator</p>
//                               <p className="text-sm text-yellow-900 font-bold">{coordinator.faculty.name}</p>
//                             </div>
//                           </div>
//                         ) : (
//                           <div className="bg-red-50 px-4 py-3 rounded-lg border border-red-200">
//                             <div className="flex items-center gap-2">
//                               <AlertCircle className="h-5 w-5 text-red-600" />
//                               <p className="text-sm text-red-700 font-semibold">No Coordinator</p>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>

//                   {isExpanded && (
//                     <div className="p-6 bg-gray-50">
//                       {/* Course Sections */}
//                       <div className="mb-6">
//                         <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
//                           <FileText className="h-5 w-5" />
//                           Course Sections ({group.courses.length})
//                         </h4>
//                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
//                           {group.courses.map(course => (
//                             <div key={course.id} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
//                               <div className="flex items-start justify-between mb-2">
//                                 <div>
//                                   <p className="font-semibold text-gray-900">{course.programme.programmeCode}</p>
//                                   {course.programme.section && (
//                                     <p className="text-sm text-gray-600 mt-1">Section {course.programme.section}</p>
//                                   )}
//                                 </div>
//                                 <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">
//                                   Sem {course.semester}
//                                 </span>
//                               </div>
//                               <p className="text-xs text-gray-600 mb-1">{course.session}</p>
//                               <p className="text-xs text-gray-500">{course.credits} credits</p>
//                             </div>
//                           ))}
//                         </div>
//                       </div>

//                       {/* Faculty */}
//                       <div>
//                         <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
//                           <Users className="h-5 w-5" />
//                           Assigned Faculty ({totalFaculty})
//                         </h4>
                        
//                         {group.allAllocations.length === 0 ? (
//                           <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-gray-300">
//                             <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
//                             <p className="text-gray-600">No faculty assigned yet</p>
//                           </div>
//                         ) : (
//                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//                             {Array.from(new Set(group.allAllocations.map(a => a.faculty.id))).map(facultyId => {
//                               const facultyAllocs = group.allAllocations.filter(a => a.faculty.id === facultyId)
//                               const firstAlloc = facultyAllocs[0]
//                               const isCoordinator = facultyAllocs.some(a => a.role === 'COORDINATOR')

//                               return (
//                                 <div
//                                   key={facultyId}
//                                   className={`border-2 rounded-xl p-5 transition-all ${
//                                     isCoordinator 
//                                       ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300 shadow-md' 
//                                       : 'bg-white border-gray-200 hover:shadow-md'
//                                   }`}
//                                 >
//                                   <div className="flex items-start justify-between mb-3">
//                                     <div className="flex-1">
//                                       <div className="flex items-center gap-2 mb-1">
//                                         <h5 className="font-bold text-gray-900">{firstAlloc.faculty.name}</h5>
//                                         {isCoordinator && <Crown className="h-5 w-5 text-yellow-600" />}
//                                       </div>
//                                       <p className="text-sm text-gray-600">{firstAlloc.faculty.designation}</p>
//                                       <p className="text-xs text-gray-500 mt-1">{firstAlloc.faculty.email}</p>
//                                     </div>
//                                     <span className={`px-3 py-1 rounded-full text-xs font-bold ${
//                                       isCoordinator 
//                                         ? 'bg-yellow-200 text-yellow-900' 
//                                         : 'bg-gray-200 text-gray-800'
//                                     }`}>
//                                       {isCoordinator ? 'COORDINATOR' : 'CONTRIBUTOR'}
//                                     </span>
//                                   </div>

//                                   <div className="mb-4">
//                                     <p className="text-xs text-gray-600 font-medium mb-2">Teaching sections:</p>
//                                     <div className="flex flex-wrap gap-2">
//                                       {facultyAllocs.map(alloc => (
//                                         <span key={alloc.id} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-md font-semibold">
//                                           {alloc.course.programme.programmeCode}
//                                           {alloc.course.programme.section ? ` (${alloc.course.programme.section})` : ''}
//                                         </span>
//                                       ))}
//                                     </div>
//                                   </div>

//                                   <div className="flex gap-2">
//                                     {!isCoordinator && (
//                                       <button
//                                         onClick={() => handleSetCoordinator(
//                                           facultyAllocs[0].courseId,
//                                           facultyAllocs[0].id,
//                                           group.courseName
//                                         )}
//                                         className="flex-1 bg-yellow-100 text-yellow-700 px-3 py-2.5 rounded-lg hover:bg-yellow-200 font-semibold text-sm flex items-center justify-center gap-2"
//                                       >
//                                         <Crown className="h-4 w-4" />
//                                         Make Coordinator
//                                       </button>
//                                     )}
//                                     <button
//                                       onClick={() => handleViewContent(firstAlloc.faculty)}
//                                       className="flex-1 bg-blue-100 text-blue-700 px-3 py-2.5 rounded-lg hover:bg-blue-200 font-semibold text-sm flex items-center justify-center gap-2"
//                                     >
//                                       <Eye className="h-4 w-4" />
//                                       View Content
//                                     </button>
//                                   </div>
//                                 </div>
//                               )
//                             })}
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )
//             })
//           )}
//         </div>
//       </div>
//     )
//   }

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

//   const renderMatrixTab = () => (
//     <div className="space-y-6">
//       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">Faculty-Course Allocation Matrix</h3>
//         <div className="overflow-x-auto">
//           <table className="min-w-full">
//             <thead>
//               <tr className="border-b">
//                 <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 sticky left-0 bg-white">Faculty</th>
//                 <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Designation</th>
//                 <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Allocated Courses</th>
//                 <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Coordinator Of</th>
//                 <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {faculty.map((fac) => {
//                 const facAllocs = allAllocations.filter(a => a.faculty.id === fac.id)
//                 const coordinating = facAllocs.filter(a => a.role === 'COORDINATOR')

//                 return (
//                   <tr key={fac.id} className="hover:bg-gray-50">
//                     <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white">{fac.name}</td>
//                     <td className="px-4 py-3 text-sm text-gray-600">{fac.designation}</td>
//                     <td className="px-4 py-3 text-sm">
//                       <span className="font-semibold text-gray-900">{fac.allocatedCourses || 0}</span>
//                       <span className="text-gray-600 ml-2">courses</span>
//                     </td>
//                     <td className="px-4 py-3 text-sm">
//                       {coordinating.length > 0 ? (
//                         <div className="flex flex-wrap gap-1">
//                           {coordinating.map(coord => (
//                             <span key={coord.id} className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
//                               <Crown className="h-3 w-3" />
//                               {coord.course.courseCode}
//                             </span>
//                           ))}
//                         </div>
//                       ) : (
//                         <span className="text-gray-400">-</span>
//                       )}
//                     </td>
//                     <td className="px-4 py-3 text-sm">
//                       <div className="flex items-center gap-2">
//                         <div className={`w-2 h-2 rounded-full ${getWorkloadColor(fac.allocatedCourses || 0)}`}></div>
//                         <span>{getWorkloadStatus(fac.allocatedCourses || 0)}</span>
//                       </div>
//                     </td>
//                   </tr>
//                 )
//               })}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   )

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-lg text-gray-600">Loading Faculty & Course Management...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
//       <div className="p-6">
//         <Toaster position="top-right" />
        
//         {/* Header */}
//         <div className="mb-6">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">Faculty & Course Management</h1>
//           <p className="text-gray-600">Unified dashboard for managing faculty, courses, allocations, and coordinators</p>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex justify-end gap-3 mb-6">
//           <button
//             onClick={() => setShowBulkUpload(true)}
//             className="bg-green-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors shadow-sm"
//           >
//             <UploadIcon className="h-5 w-5" />
//             Bulk Upload
//           </button>
//           <button
//             onClick={() => setShowForm(!showForm)}
//             className="bg-blue-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
//           >
//             <Plus className="h-5 w-5" />
//             Add Faculty
//           </button>
//           <button
//             onClick={() => loadData()}
//             className="bg-gray-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-gray-700 transition-colors shadow-sm"
//           >
//             <RefreshCw className="h-5 w-5" />
//             Refresh
//           </button>
//         </div>

//         {/* Modals */}
//         {showBulkUpload && (
//           <BulkUpload
//             type="faculty"
//             onUpload={handleBulkUpload}
//             onClose={handleCloseBulkUpload}
//           />
//         )}

//         {/* Course Modal */}
//         {showCourseModal && selectedFacultyForCourses && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
//               <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
//                 <div className="flex justify-between items-center">
//                   <div>
//                     <h2 className="text-2xl font-bold text-gray-900">Manage Courses</h2>
//                     <p className="text-gray-600 mt-1">{selectedFacultyForCourses.name} ({selectedFacultyForCourses.facultyId})</p>
//                   </div>
//                   <button onClick={() => setShowCourseModal(false)} className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-lg">
//                     <X className="h-6 w-6" />
//                   </button>
//                 </div>
//               </div>

//               <div className="p-6">
//                 <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
//                   <h3 className="font-semibold text-blue-900 mb-3">Allocate New Course</h3>
//                   <div className="flex gap-3">
//                     <select
//                       value={selectedCourse}
//                       onChange={(e) => setSelectedCourse(e.target.value)}
//                       className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
//                     >
//                       <option value="">Select Course...</option>
//                       {courses.map((course) => (
//                         <option key={course.id} value={course.id}>
//                           {course.courseCode} - {course.courseName} (Sem {course.semester}) [{course.session}]
//                         </option>
//                       ))}
//                     </select>
//                     <button
//                       onClick={handleAllocateCourse}
//                       className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 whitespace-nowrap font-medium"
//                     >
//                       Allocate
//                     </button>
//                   </div>
//                 </div>

//                 <div>
//                   <h3 className="font-semibold text-gray-900 mb-3">Allocated Courses ({facultyCourses.length})</h3>
//                   {facultyCourses.length === 0 ? (
//                     <div className="text-center py-8 text-gray-600">
//                       <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
//                       <p>No courses allocated yet</p>
//                     </div>
//                   ) : (
//                     <div className="space-y-2">
//                       {facultyCourses.map((allocation) => {
//                         const course = courses.find(c => c.id === allocation.courseId)
//                         if (!course) return null
//                         return (
//                           <div key={allocation.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
//                             <div className="flex-1">
//                               <div className="font-medium text-gray-900">{course.courseCode} - {course.courseName}</div>
//                               <div className="text-sm text-gray-600">
//                                 {course.programme.programmeCode} • Semester {course.semester} • {course.session}
//                               </div>
//                             </div>
//                             <div className="flex items-center gap-3">
//                               <span className={`px-2 py-1 rounded text-xs font-semibold ${
//                                 allocation.role === 'COORDINATOR' ? 'bg-yellow-100 text-yellow-900' : 'bg-gray-100 text-gray-800'
//                               }`}>
//                                 {allocation.role}
//                               </span>
//                               <button
//                                 onClick={() => handleRemoveCourse(allocation.id)}
//                                 className="text-red-600 hover:text-red-900"
//                               >
//                                 <Trash2 className="h-4 w-4" />
//                               </button>
//                             </div>
//                           </div>
//                         )
//                       })}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Content Modal */}
//         {showContentModal && selectedFacultyContent && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
//               <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
//                 <div className="flex justify-between items-center">
//                   <div>
//                     <h2 className="text-2xl font-bold text-gray-900">Uploaded Content</h2>
//                     <p className="text-gray-600 mt-1">
//                       {selectedFacultyContent.faculty.name} ({selectedFacultyContent.faculty.facultyId})
//                     </p>
//                   </div>
//                   <button 
//                     onClick={() => setShowContentModal(false)} 
//                     className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-lg"
//                   >
//                     <X className="h-6 w-6" />
//                   </button>
//                 </div>
//               </div>

//               <div className="p-6">
//                 {loadingContent ? (
//                   <div className="text-center py-12">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//                     <p className="text-gray-600">Loading content...</p>
//                   </div>
//                 ) : selectedFacultyContent.content.length === 0 ? (
//                   <div className="text-center py-12">
//                     <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//                     <p className="text-lg font-medium text-gray-900">No content uploaded yet</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-3">
//                     {selectedFacultyContent.content.map((content) => (
//                       <div key={content.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-50">
//                         <div className="flex items-start justify-between mb-3">
//                           <div className="flex-1">
//                             <h4 className="font-semibold text-gray-900 mb-1">{content.title}</h4>
//                             <p className="text-sm text-gray-600">{content.course.courseCode} - {content.course.courseName}</p>
//                             <p className="text-xs text-gray-500">{content.course.programme.programmeCode}</p>
//                           </div>
//                           <div className="flex flex-col items-end gap-2">
//                             <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getContentTypeColor(content.contentType)}`}>
//                               {content.contentType.replace(/_/g, ' ')}
//                             </span>
//                             <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getApprovalStatusColor(content.approvalStatus)}`}>
//                               {content.approvalStatus}
//                             </span>
//                           </div>
//                         </div>

//                         <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
//                           <div className="flex items-center gap-1">
//                             <FileText className="h-4 w-4" />
//                             <span>{content.fileName}</span>
//                           </div>
//                           {content.lectureNumber && (
//                             <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
//                               Lecture {content.lectureNumber}
//                             </span>
//                           )}
//                           <div className="flex items-center gap-1 ml-auto">
//                             <Calendar className="h-4 w-4" />
//                             <span className="text-xs">{new Date(content.createdAt).toLocaleDateString()}</span>
//                           </div>
//                         </div>

//                         <button
//                           onClick={() => window.open(content.filePath, '_blank')}
//                           className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
//                         >
//                           <Download className="h-4 w-4" />
//                           Download File
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Form */}
//         {showForm && (
//           <div className="bg-white p-6 rounded-lg shadow-md mb-6">
//             <h2 className="text-xl font-semibold mb-4 text-gray-900">
//               {editingId ? 'Edit Faculty' : 'Add New Faculty'}
//             </h2>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium mb-1 text-gray-800">Faculty ID</label>
//                   <input
//                     type="text"
//                     placeholder="FAC001"
//                     value={formData.facultyId}
//                     onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
//                     required
//                     disabled={!!editingId}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium mb-1 text-gray-800">Full Name</label>
//                   <input
//                     type="text"
//                     placeholder="Dr. John Doe"
//                     value={formData.name}
//                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium mb-1 text-gray-800">Email</label>
//                   <input
//                     type="email"
//                     placeholder="john.doe@university.edu"
//                     value={formData.email}
//                     onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
//                     required
//                     disabled={!!editingId}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium mb-1 text-gray-800">Contact Number</label>
//                   <input
//                     type="tel"
//                     placeholder="+91-9876543210"
//                     value={formData.contactNo}
//                     onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium mb-1 text-gray-800">Designation</label>
//                   <select
//                     value={formData.designation}
//                     onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
//                     required
//                   >
//                     <option value="">Select Designation</option>
//                     <option value="Professor">Professor</option>
//                     <option value="Associate Professor">Associate Professor</option>
//                     <option value="Assistant Professor">Assistant Professor</option>
//                     <option value="Lecturer">Lecturer</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium mb-1 text-gray-800">Department</label>
//                   <input
//                     type="text"
//                     placeholder="Computer Science"
//                     value={formData.department}
//                     onChange={(e) => setFormData({ ...formData, department: e.target.value })}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1 text-gray-800">Session (Joining Year)</label>
//                 <input
//                   type="text"
//                   placeholder="2024-2025"
//                   value={formData.session}
//                   onChange={(e) => setFormData({ ...formData, session: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
//                   required
//                 />
//               </div>

//               <div className="flex gap-2">
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
//                 >
//                   {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
//                 </button>
//                 <button type="button" onClick={resetForm} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 font-medium">
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         )}

//         {/* Tabs Navigation */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
//           <div className="flex overflow-x-auto">
//             <button
//               onClick={() => setActiveTab('overview')}
//               className={`flex-1 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
//                 activeTab === 'overview'
//                   ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
//                   : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
//               }`}
//             >
//               <BarChart3 className="h-5 w-5 inline mr-2" />
//               Overview
//             </button>
//             <button
//               onClick={() => setActiveTab('faculty')}
//               className={`flex-1 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
//                 activeTab === 'faculty'
//                   ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
//                   : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
//               }`}
//             >
//               <Users className="h-5 w-5 inline mr-2" />
//               Faculty
//             </button>
//             <button
//               onClick={() => setActiveTab('courses')}
//               className={`flex-1 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
//                 activeTab === 'courses'
//                   ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
//                   : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
//               }`}
//             >
//               <BookOpen className="h-5 w-5 inline mr-2" />
//               Courses
//             </button>
//             <button
//               onClick={() => setActiveTab('coordination')}
//               className={`flex-1 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
//                 activeTab === 'coordination'
//                   ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
//                   : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
//               }`}
//             >
//               <Crown className="h-5 w-5 inline mr-2" />
//               Coordination
//             </button>
//             <button
//               onClick={() => setActiveTab('workload')}
//               className={`flex-1 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
//                 activeTab === 'workload'
//                   ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
//                   : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
//               }`}
//             >
//               <TrendingUp className="h-5 w-5 inline mr-2" />
//               Workload
//             </button>
//             <button
//               onClick={() => setActiveTab('matrix')}
//               className={`flex-1 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
//                 activeTab === 'matrix'
//                   ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
//                   : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
//               }`}
//             >
//               <Grid className="h-5 w-5 inline mr-2" />
//               Matrix
//             </button>
//           </div>
//         </div>

//         {/* Tab Content */}
//         {renderTabContent()}

//         {/* Drag Overlay */}
//         <DragOverlay>
//           {activeDragFaculty ? (
//             <div className="bg-white rounded-xl shadow-2xl border-2 border-blue-500 p-4 w-64 cursor-grabbing">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
//                   {activeDragFaculty.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
//                 </div>
//                 <div>
//                   <p className="font-semibold text-gray-900">{activeDragFaculty.name}</p>
//                   <p className="text-xs text-gray-600">{activeDragFaculty.designation}</p>
//                 </div>
//               </div>
//             </div>
//           ) : null}
//         </DragOverlay>
//       </div>
//     </DndContext>
//   )
// }

'use client'
import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Users, BookOpen, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp, Award, Filter, Search } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

interface Course {
  id: string
  courseCode: string
  courseName: string
  semester: number
  session: string
  programme: {
    id: string
    programmeCode: string
    programmeName: string
    section: string | null
  }
}

interface Faculty {
  id: string
  name: string
  email: string
  designation: string
}

interface CourseAllocation {
  id: string
  courseId: string
  facultyId: string
  role: 'COORDINATOR' | 'CONTRIBUTOR'
  faculty: Faculty
}

interface GroupedCourse {
  courseCode: string
  courseName: string
  instances: Array<{
    id: string
    programme: string
    session: string
  }>
  faculty: CourseAllocation[]
  coordinator: CourseAllocation | null
  stats: {
    totalContent: number
    approved: number
    pending: number
    rejected: number
  }
}

export default function CourseCoordinationPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [allocations, setAllocations] = useState<CourseAllocation[]>([])
  const [groupedCourses, setGroupedCourses] = useState<GroupedCourse[]>([])
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'with-coordinator' | 'without-coordinator'>('all')

  const [editingAllocation, setEditingAllocation] = useState<string | null>(null)
  const [showCoordinatorModal, setShowCoordinatorModal] = useState(false)
  const [selectedGroupCourse, setSelectedGroupCourse] = useState<GroupedCourse | null>(null)

  const [stats, setStats] = useState({
    totalCourses: 0,
    withCoordinator: 0,
    withoutCoordinator: 0,
    totalFaculty: 0
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    groupCourses()
  }, [courses, allocations])

  const loadData = async () => {
    try {
      setLoading(true)
      const [coursesRes, allocRes] = await Promise.all([
        fetch('/api/admin/courses'),
        fetch('/api/admin/course-allocations')
      ])

      const coursesData = await coursesRes.json()
      const allocData = await allocRes.json()

      if (coursesData.success) {
        setCourses(coursesData.courses)
      }

      if (allocData.success) {
        setAllocations(allocData.allocations)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Error loading data')
    } finally {
      setLoading(false)
    }
  }

  const groupCourses = () => {
    const grouped = new Map<string, GroupedCourse>()

    courses.forEach(course => {
      const key = course.courseCode

      if (!grouped.has(key)) {
        grouped.set(key, {
          courseCode: course.courseCode,
          courseName: course.courseName,
          instances: [],
          faculty: [],
          coordinator: null,
          stats: {
            totalContent: 0,
            approved: 0,
            pending: 0,
            rejected: 0
          }
        })
      }

      const group = grouped.get(key)!
      group.instances.push({
        id: course.id,
        programme: `${course.programme.programmeCode}${course.programme.section ? `-${course.programme.section}` : ''}`,
        session: course.session
      })

      // Get faculty for this course
      const courseFaculty = allocations.filter(a => a.courseId === course.id)
      courseFaculty.forEach(fac => {
        if (!group.faculty.find(f => f.facultyId === fac.facultyId)) {
          group.faculty.push(fac)
          if (fac.role === 'COORDINATOR') {
            group.coordinator = fac
          }
        }
      })
    })

    const result = Array.from(grouped.values()).sort((a, b) => 
      a.courseCode.localeCompare(b.courseCode)
    )

    setGroupedCourses(result)

    // Calculate stats
    setStats({
      totalCourses: result.length,
      withCoordinator: result.filter(g => g.coordinator).length,
      withoutCoordinator: result.filter(g => !g.coordinator).length,
      totalFaculty: allocations.length
    })
  }

  const filteredCourses = groupedCourses.filter(group => {
    if (selectedFilter === 'with-coordinator' && !group.coordinator) return false
    if (selectedFilter === 'without-coordinator' && group.coordinator) return false

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      return (
        group.courseCode.toLowerCase().includes(q) ||
        group.courseName.toLowerCase().includes(q)
      )
    }

    return true
  })

  const toggleCoordinator = async (groupCourse: GroupedCourse, facultyId: string) => {
    try {
      setLoading(true)

      // Update all course instances for this group
      for (const instance of groupCourse.instances) {
        const courseAllocations = allocations.filter(a => a.courseId === instance.id)

        // Set all as CONTRIBUTOR first
        for (const alloc of courseAllocations) {
          await fetch(`/api/admin/course-allocations/${alloc.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: 'CONTRIBUTOR' })
          })
        }

        // Set selected as COORDINATOR
        const coordinatorAlloc = courseAllocations.find(a => a.facultyId === facultyId)
        if (coordinatorAlloc) {
          await fetch(`/api/admin/course-allocations/${coordinatorAlloc.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: 'COORDINATOR' })
          })
        }
      }

      toast.success('Coordinator updated!')
      loadData()
      setShowCoordinatorModal(false)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error updating coordinator')
    } finally {
      setLoading(false)
    }
  }

  const toggleExpanded = (courseCode: string) => {
    const newExpanded = new Set(expandedCourses)
    if (newExpanded.has(courseCode)) {
      newExpanded.delete(courseCode)
    } else {
      newExpanded.add(courseCode)
    }
    setExpandedCourses(newExpanded)
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Course Coordination</h1>
        <p className="text-gray-600">Manage courses, assign coordinators, and approve content</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm font-medium">Total Courses</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalCourses}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm font-medium">With Coordinator</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.withCoordinator}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm font-medium">Without Coordinator</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{stats.withoutCoordinator}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm font-medium">Total Faculty</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalFaculty}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-8 border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filter & Search</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search course..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter</label>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
            >
              <option value="all">All Courses</option>
              <option value="with-coordinator">With Coordinator</option>
              <option value="without-coordinator">Without Coordinator</option>
            </select>
          </div>

          <div className="flex items-end">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium text-blue-600">{filteredCourses.length}</span> of <span className="font-medium">{groupedCourses.length}</span> courses
            </p>
          </div>
        </div>
      </div>

      {/* Grouped Courses List */}
      <div className="space-y-4">
        {filteredCourses.length > 0 ? (
          filteredCourses.map(group => (
            <div key={group.courseCode} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              {/* Header */}
              <div
                onClick={() => toggleExpanded(group.courseCode)}
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors border-b"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <button className="text-gray-600 hover:text-gray-900">
                        {expandedCourses.has(group.courseCode) ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{group.courseCode}</h3>
                        <p className="text-sm text-gray-600">{group.courseName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {group.coordinator ? (
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-lg">
                        <Award className="h-4 w-4 text-green-600" />
                        <span className="text-xs font-medium text-green-800">{group.coordinator.faculty.name}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        <span className="text-xs font-medium text-orange-800">No Coordinator</span>
                      </div>
                    )}

                    <div className="text-right">
                      <p className="text-xs text-gray-600">Instances</p>
                      <p className="text-sm font-bold text-gray-900">{group.instances.length}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-600">Faculty</p>
                      <p className="text-sm font-bold text-gray-900">{group.faculty.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedCourses.has(group.courseCode) && (
                <div className="p-6 bg-gray-50 border-t">
                  {/* Instances */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Course Instances ({group.instances.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {group.instances.map(instance => (
                        <div key={instance.id} className="bg-white p-3 rounded border border-gray-200 text-sm">
                          <p className="font-medium text-gray-900">{instance.programme}</p>
                          <p className="text-xs text-gray-600">Session: {instance.session}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Faculty & Coordinator */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Assigned Faculty ({group.faculty.length})
                      </h4>
                      <button
                        onClick={() => {
                          setSelectedGroupCourse(group)
                          setShowCoordinatorModal(true)
                        }}
                        className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 font-medium"
                      >
                        Set Coordinator
                      </button>
                    </div>

                    <div className="space-y-2">
                      {group.faculty.map(fac => (
                        <div key={fac.id} className="bg-white p-3 rounded border border-gray-200 flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{fac.faculty.name}</p>
                            <p className="text-xs text-gray-600">{fac.faculty.designation}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {fac.role === 'COORDINATOR' ? (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold flex items-center gap-1">
                                <Award className="h-3 w-3" />
                                Coordinator
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                Contributor
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Content Stats */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Content Status</h4>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="bg-white p-3 rounded text-center">
                        <p className="text-xs text-gray-600 mb-1">Total</p>
                        <p className="text-lg font-bold text-gray-900">{group.stats.totalContent}</p>
                      </div>
                      <div className="bg-white p-3 rounded text-center">
                        <p className="text-xs text-gray-600 mb-1">Approved</p>
                        <p className="text-lg font-bold text-green-600">{group.stats.approved}</p>
                      </div>
                      <div className="bg-white p-3 rounded text-center">
                        <p className="text-xs text-gray-600 mb-1">Pending</p>
                        <p className="text-lg font-bold text-orange-600">{group.stats.pending}</p>
                      </div>
                      <div className="bg-white p-3 rounded text-center">
                        <p className="text-xs text-gray-600 mb-1">Rejected</p>
                        <p className="text-lg font-bold text-red-600">{group.stats.rejected}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No courses found</p>
          </div>
        )}
      </div>

      {/* Set Coordinator Modal */}
      {showCoordinatorModal && selectedGroupCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Set Coordinator</h2>
            <p className="text-sm text-gray-600 mb-4">
              Select which faculty member will be the coordinator for <strong>{selectedGroupCourse.courseCode}</strong>
            </p>

            <div className="space-y-2 mb-6">
              {selectedGroupCourse.faculty.map(fac => (
                <button
                  key={fac.id}
                  onClick={() => toggleCoordinator(selectedGroupCourse, fac.facultyId)}
                  className={`w-full p-3 rounded border text-left transition-colors ${
                    selectedGroupCourse.coordinator?.facultyId === fac.facultyId
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <p className="font-medium text-gray-900">{fac.faculty.name}</p>
                  <p className="text-xs text-gray-600">{fac.faculty.designation}</p>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowCoordinatorModal(false)}
              className="w-full px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
