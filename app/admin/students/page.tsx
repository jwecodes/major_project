// 'use client'
// import { useState, useEffect } from 'react'
// import { Plus, Trash2, Upload as UploadIcon, Download, Search, Filter, Grid, List, Users, GraduationCap, BookOpen, Edit } from 'lucide-react'
// import toast, { Toaster } from 'react-hot-toast'
// import * as XLSX from 'xlsx'

// // ============================================
// // PRISMA SCHEMA ALIGNED INTERFACES
// // ============================================

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

// export default function StudentsPage() {
//   const [students, setStudents] = useState<Student[]>([])
//   const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
//   const [programmes, setProgrammes] = useState<Programme[]>([])
//   const [showForm, setShowForm] = useState(false)
//   const [loading, setLoading] = useState(false)
//   const [uploading, setUploading] = useState(false)
//   const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  
//   // Filters
//   const [searchTerm, setSearchTerm] = useState('')
//   const [selectedProgramme, setSelectedProgramme] = useState<string>('all')
//   const [selectedSession, setSelectedSession] = useState<string>('all')
//   const [selectedSemester, setSelectedSemester] = useState<string>('all')
//   const [selectedSection, setSelectedSection] = useState<string>('all')
//   const [availableSessions, setAvailableSessions] = useState<string[]>([])
//   const [availableSemesters, setAvailableSemesters] = useState<number[]>([])
//   const [availableSections, setAvailableSections] = useState<string[]>([])
//   const [showFilters, setShowFilters] = useState(false)
  
//   const [formData, setFormData] = useState({
//     studentId: '',
//     name: '',
//     email: '',
//     contactNo: '',
//     programmeId: '',
//     currentSemester: 1,
//     section: ''
//   })
//   const [editingId, setEditingId] = useState<string | null>(null)

//   // Statistics
//   const [stats, setStats] = useState({
//     totalStudents: 0,
//     activeProgrammes: 0,
//     currentSession: 0,
//     firstYear: 0
//   })

//   useEffect(() => {
//     loadData()
//   }, [])

//   useEffect(() => {
//     applyFilters()
//   }, [searchTerm, selectedProgramme, selectedSession, selectedSemester, selectedSection, students])

//   const loadData = async () => {
//     try {
//       const [studentsRes, programmesRes] = await Promise.all([
//         fetch('/api/admin/students'),
//         fetch('/api/admin/programmes')
//       ])
      
//       const studentsData = await studentsRes.json()
//       const programmesData = await programmesRes.json()
      
//       if (studentsData.success) {
//         const sortedStudents = sortStudents(studentsData.students)
//         setStudents(sortedStudents)
//         setFilteredStudents(sortedStudents)

//         // Extract filter options
//         const sessions = Array.from(new Set(
//           sortedStudents.map((s: Student) => s.programme?.session).filter(Boolean)
//         )).sort().reverse() as string[]
//         setAvailableSessions(sessions)

//         const semesters = Array.from(new Set(
//           sortedStudents.map((s: Student) => s.currentSemester)
//         )).sort((a: number, b: number) => a - b) as number[]
//         setAvailableSemesters(semesters)

//         const sections = Array.from(new Set(
//           sortedStudents.map((s: Student) => s.section).filter(Boolean)
//         )).sort() as string[]
//         setAvailableSections(sections)

//         // Set default session to most recent
//         if (sessions.length > 0 && selectedSession === 'all') {
//           setSelectedSession(sessions[0])
//         }

//         // Calculate statistics
//         const currentSessionStudents = sortedStudents.filter(
//           (s: Student) => s.programme?.session === sessions[0]
//         ).length
//         const firstYearStudents = sortedStudents.filter(
//           (s: Student) => s.currentSemester <= 2
//         ).length

//         setStats({
//           totalStudents: sortedStudents.length,
//           activeProgrammes: programmesData.programmes?.length || 0,
//           currentSession: currentSessionStudents,
//           firstYear: firstYearStudents
//         })
//       }
      
//       if (programmesData.success) setProgrammes(programmesData.programmes)
//     } catch (error) {
//       toast.error('Failed to load data')
//       console.error(error)
//     }
//   }

//   const sortStudents = (studentsToSort: Student[]): Student[] => {
//     return [...studentsToSort].sort((a: Student, b: Student) => {
//       // Sort by session (most recent first)
//       if (a.programme?.session !== b.programme?.session) {
//         return (b.programme?.session || '').localeCompare(a.programme?.session || '')
//       }

//       // Sort by programme code
//       if (a.programme?.programmeCode !== b.programme?.programmeCode) {
//         return (a.programme?.programmeCode || '').localeCompare(b.programme?.programmeCode || '')
//       }

//       // Sort by section
//       const aSection = a.section || ''
//       const bSection = b.section || ''
//       if (aSection !== bSection) {
//         return aSection.localeCompare(bSection)
//       }

//       // Sort by semester
//       if (a.currentSemester !== b.currentSemester) {
//         return a.currentSemester - b.currentSemester
//       }

//       // Sort by student ID
//       return a.studentId.localeCompare(b.studentId)
//     })
//   }

//   const applyFilters = () => {
//     let filtered = students

//     // Filter by programme
//     if (selectedProgramme !== 'all') {
//       filtered = filtered.filter((s: Student) => s.programmeId === selectedProgramme)
//     }

//     // Filter by session
//     if (selectedSession !== 'all') {
//       filtered = filtered.filter((s: Student) => s.programme?.session === selectedSession)
//     }

//     // Filter by semester
//     if (selectedSemester !== 'all') {
//       filtered = filtered.filter((s: Student) => s.currentSemester === parseInt(selectedSemester))
//     }

//     // Filter by section
//     if (selectedSection !== 'all') {
//       filtered = filtered.filter((s: Student) => s.section === selectedSection)
//     }

//     // Filter by search term
//     if (searchTerm.trim() !== '') {
//       filtered = filtered.filter((s: Student) => 
//         s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         (s.programme?.programmeCode || '').toLowerCase().includes(searchTerm.toLowerCase())
//       )
//     }

//     const sortedFiltered = sortStudents(filtered)
//     setFilteredStudents(sortedFiltered)
//   }

//   const handleClearFilters = () => {
//     setSearchTerm('')
//     setSelectedProgramme('all')
//     setSelectedSession('all')
//     setSelectedSemester('all')
//     setSelectedSection('all')
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setLoading(true)

//     try {
//       const response = await fetch('/api/admin/students', {
//         method: editingId ? 'PUT' : 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(editingId ? { id: editingId, ...formData } : formData)
//       })

//       const data = await response.json()

//       if (data.success) {
//         toast.success(editingId ? 'Student updated!' : 'Student created!')
//         resetForm()
//         loadData()
//       } else {
//         toast.error(data.error || 'An error occurred')
//       }
//     } catch (error) {
//       toast.error('Failed to save student')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const resetForm = () => {
//     setFormData({
//       studentId: '',
//       name: '',
//       email: '',
//       contactNo: '',
//       programmeId: '',
//       currentSemester: 1,
//       section: ''
//     })
//     setShowForm(false)
//     setEditingId(null)
//   }

//   const handleEdit = (student: Student) => {
//     setFormData({
//       studentId: student.studentId,
//       name: student.name,
//       email: student.email,
//       contactNo: student.contactNo || '',
//       programmeId: student.programmeId,
//       currentSemester: student.currentSemester,
//       section: student.section || ''
//     })
//     setEditingId(student.id)
//     setShowForm(true)
//   }

//   const handleDelete = async (id: string) => {
//     if (!confirm('Delete this student?')) return

//     try {
//       const response = await fetch(`/api/admin/students/${id}`, { method: 'DELETE' })
//       const data = await response.json()

//       if (data.success) {
//         toast.success('Student deleted!')
//         loadData()
//       } else {
//         toast.error(data.error || 'Failed to delete')
//       }
//     } catch (error) {
//       toast.error('An error occurred')
//     }
//   }

//   const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (!file) return

//     setUploading(true)

//     try {
//       const data = await file.arrayBuffer()
//       const workbook = XLSX.read(data)
//       const worksheet = workbook.Sheets[workbook.SheetNames[0]]
//       const jsonData = XLSX.utils.sheet_to_json(worksheet)

//       const response = await fetch('/api/admin/students/bulk-upload', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ students: jsonData })
//       })

//       const result = await response.json()

//       if (result.success) {
//         toast.success(`Successfully uploaded ${result.count} students!`)
//         loadData()
//       } else {
//         toast.error(result.error || 'Upload failed')
//       }
//     } catch (error) {
//       toast.error('Failed to process file')
//     } finally {
//       setUploading(false)
//       e.target.value = ''
//     }
//   }

//   const downloadTemplate = () => {
//     const template = [
//       {
//         'Student ID': '2024001',
//         'Name': 'John Doe',
//         'Email': 'john.doe@university.edu',
//         'Contact No': '+91-9876543210',
//         'Programme Code': 'BTECH-CSE',
//         'Current Semester': 1,
//         'Section': 'A'
//       }
//     ]

//     const ws = XLSX.utils.json_to_sheet(template)
//     const wb = XLSX.utils.book_new()
//     XLSX.utils.book_append_sheet(wb, ws, 'Students')
//     XLSX.writeFile(wb, 'students_template.xlsx')
//     toast.success('Template downloaded!')
//   }

//   return (
//     <div className="p-6">
//       <Toaster position="top-right" />
      
//       {/* Header */}
//       <div className="mb-6">
//         <h1 className="text-3xl font-bold text-gray-900 mb-2">Students Management</h1>
//         <p className="text-gray-600">Manage student records, enrollments, and academic information</p>
//       </div>

//       {/* Action Buttons */}
//       <div className="flex justify-end gap-3 mb-6">
//         <button
//           onClick={downloadTemplate}
//           className="bg-green-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors shadow-sm"
//         >
//           <Download className="h-5 w-5" />
//           Download Template
//         </button>
//         <label className="bg-purple-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-purple-700 cursor-pointer transition-colors shadow-sm">
//           <UploadIcon className="h-5 w-5" />
//           {uploading ? 'Uploading...' : 'Bulk Upload'}
//           <input
//             type="file"
//             accept=".xlsx,.xls"
//             onChange={handleFileUpload}
//             className="hidden"
//             disabled={uploading}
//           />
//         </label>
//         <button
//           onClick={() => setShowForm(!showForm)}
//           className="bg-blue-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
//         >
//           <Plus className="h-5 w-5" />
//           Add Student
//         </button>
//       </div>

//       {/* Statistics Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//           <div className="flex items-center gap-4">
//             <div className="bg-blue-100 p-3 rounded-lg">
//               <Users className="h-8 w-8 text-blue-600" />
//             </div>
//             <div>
//               <p className="text-gray-600 text-sm font-medium">Total Students</p>
//               <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//           <div className="flex items-center gap-4">
//             <div className="bg-green-100 p-3 rounded-lg">
//               <BookOpen className="h-8 w-8 text-green-600" />
//             </div>
//             <div>
//               <p className="text-gray-600 text-sm font-medium">Active Programmes</p>
//               <p className="text-3xl font-bold text-gray-900">{stats.activeProgrammes}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//           <div className="flex items-center gap-4">
//             <div className="bg-purple-100 p-3 rounded-lg">
//               <GraduationCap className="h-8 w-8 text-purple-600" />
//             </div>
//             <div>
//               <p className="text-gray-600 text-sm font-medium">Current Session</p>
//               <p className="text-3xl font-bold text-gray-900">{stats.currentSession}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//           <div className="flex items-center gap-4">
//             <div className="bg-orange-100 p-3 rounded-lg">
//               <Users className="h-8 w-8 text-orange-600" />
//             </div>
//             <div>
//               <p className="text-gray-600 text-sm font-medium">First Year</p>
//               <p className="text-3xl font-bold text-gray-900">{stats.firstYear}</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Form */}
//       {showForm && (
//         <div className="bg-white p-6 rounded-lg shadow-md mb-6">
//           <h2 className="text-xl font-semibold mb-4 text-gray-900">
//             {editingId ? 'Edit Student' : 'Add New Student'}
//           </h2>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium mb-1 text-gray-800">Student ID</label>
//                 <input
//                   type="text"
//                   placeholder="2024001"
//                   value={formData.studentId}
//                   onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
//                   required
//                   disabled={!!editingId}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-1 text-gray-800">Full Name</label>
//                 <input
//                   type="text"
//                   placeholder="John Doe"
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
//                   placeholder="student@university.edu"
//                   value={formData.email}
//                   onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
//                   required
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
//                 />
//               </div>
//             </div>

//             <div className="grid grid-cols-3 gap-4">
//               <div>
//                 <label className="block text-sm font-medium mb-1 text-gray-800">Programme</label>
//                 <select
//                   value={formData.programmeId}
//                   onChange={(e) => setFormData({ ...formData, programmeId: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
//                   required
//                 >
//                   <option value="">Select Programme</option>
//                   {programmes.map((prog: Programme) => (
//                     <option key={prog.id} value={prog.id}>
//                       {prog.programmeCode} - {prog.programmeName}
//                       {prog.section ? ` (Section ${prog.section})` : ''}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-1 text-gray-800">Current Semester</label>
//                 <input
//                   type="number"
//                   min="1"
//                   max="12"
//                   value={formData.currentSemester}
//                   onChange={(e) => setFormData({ ...formData, currentSemester: parseInt(e.target.value) })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-1 text-gray-800">Section</label>
//                 <input
//                   type="text"
//                   placeholder="A"
//                   value={formData.section}
//                   onChange={(e) => setFormData({ ...formData, section: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
//                 />
//               </div>
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

//       {/* Filters Section */}
//       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
//             <Filter className="h-5 w-5" />
//             Filter & Search Students
//           </h3>
//           <div className="flex gap-2">
//             <button
//               onClick={() => setShowFilters(!showFilters)}
//               className="text-blue-600 hover:text-blue-700 text-sm font-medium"
//             >
//               {showFilters ? 'Hide Filters' : 'Show Filters'}
//             </button>
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

//         {/* Search */}
//         <div className="mb-4">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search by student ID, name, email, or programme..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
//             />
//           </div>
//         </div>

//         {/* Advanced Filters */}
//         {showFilters && (
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Programme</label>
//               <select
//                 value={selectedProgramme}
//                 onChange={(e) => setSelectedProgramme(e.target.value)}
//                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
//               >
//                 <option value="all">All Programmes</option>
//                 {programmes.map((prog: Programme) => (
//                   <option key={prog.id} value={prog.id}>
//                     {prog.programmeCode}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Session</label>
//               <select
//                 value={selectedSession}
//                 onChange={(e) => setSelectedSession(e.target.value)}
//                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
//               >
//                 <option value="all">All Sessions</option>
//                 {availableSessions.map((session: string) => (
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
//                 {availableSemesters.map((sem: number) => (
//                   <option key={sem} value={sem}>
//                     Semester {sem}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
//               <select
//                 value={selectedSection}
//                 onChange={(e) => setSelectedSection(e.target.value)}
//                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
//               >
//                 <option value="all">All Sections</option>
//                 {availableSections.map((section: string) => (
//                   <option key={section} value={section}>
//                     Section {section}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         )}

//         {/* Filter Results */}
//         {(searchTerm || selectedProgramme !== 'all' || selectedSession !== 'all' || selectedSemester !== 'all' || selectedSection !== 'all') && (
//           <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
//             <p className="text-sm text-gray-600">
//               Showing {filteredStudents.length} of {students.length} student{filteredStudents.length !== 1 ? 's' : ''}
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

//       {/* Students List */}
//       {viewMode === 'table' ? (
//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Student ID</th>
//                   <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Name</th>
//                   <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Email</th>
//                   <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Programme</th>
//                   <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Session</th>
//                   <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Semester</th>
//                   <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Section</th>
//                   <th className="px-6 py-3 text-right text-xs font-bold text-gray-800 uppercase tracking-wider">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {filteredStudents.length === 0 ? (
//                   <tr>
//                     <td colSpan={8} className="px-6 py-12 text-center">
//                       <div className="flex flex-col items-center justify-center text-gray-500">
//                         <Search className="h-12 w-12 mb-3 text-gray-400" />
//                         <p className="text-lg font-medium">No students found</p>
//                         <p className="text-sm mt-1">
//                           {searchTerm || selectedProgramme !== 'all' || selectedSession !== 'all' || selectedSemester !== 'all' || selectedSection !== 'all'
//                             ? 'Try adjusting your filters' 
//                             : 'Start by adding a new student'}
//                         </p>
//                       </div>
//                     </td>
//                   </tr>
//                 ) : (
//                   filteredStudents.map((student: Student) => (
//                     <tr key={student.id} className="hover:bg-gray-50 transition-colors">
//                       <td className="px-6 py-4 whitespace-nowrap font-semibold text-blue-600">{student.studentId}</td>
//                       <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">{student.name}</td>
//                       <td className="px-6 py-4 whitespace-nowrap text-gray-800 text-sm">{student.email}</td>
//                       <td className="px-6 py-4 whitespace-nowrap text-gray-800">
//                         {student.programme?.programmeCode}
//                         {student.programme?.section ? ` (${student.programme.section})` : ''}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm">{student.programme?.session}</td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
//                           Sem {student.currentSemester}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-gray-800">{student.section || '-'}</td>
//                       <td className="px-6 py-4 whitespace-nowrap text-right">
//                         <div className="flex items-center justify-end gap-2">
//                           <button 
//                             onClick={() => handleEdit(student)} 
//                             className="text-blue-700 hover:text-blue-900 p-1.5 transition-colors"
//                             title="Edit Student"
//                           >
//                             <Edit className="h-5 w-5" />
//                           </button>
//                           <button 
//                             onClick={() => handleDelete(student.id)} 
//                             className="text-red-700 hover:text-red-900 p-1.5 transition-colors"
//                             title="Delete Student"
//                           >
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
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {filteredStudents.length === 0 ? (
//             <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
//               <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
//               <p className="text-lg font-medium text-gray-900">No students found</p>
//               <p className="text-sm text-gray-600 mt-1">Try adjusting your filters</p>
//             </div>
//           ) : (
//             filteredStudents.map((student: Student) => (
//               <div key={student.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
//                 <div className="flex items-start justify-between mb-4">
//                   <div className="flex items-center gap-3">
//                     <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
//                       {student.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
//                     </div>
//                     <div>
//                       <h3 className="font-semibold text-gray-900">{student.name}</h3>
//                       <p className="text-sm text-gray-600">{student.studentId}</p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="space-y-2 mb-4">
//                   <div className="flex items-center justify-between text-sm">
//                     <span className="text-gray-600">Programme:</span>
//                     <span className="font-medium text-gray-900">{student.programme?.programmeCode}</span>
//                   </div>
//                   <div className="flex items-center justify-between text-sm">
//                     <span className="text-gray-600">Session:</span>
//                     <span className="text-gray-900">{student.programme?.session}</span>
//                   </div>
//                   <div className="flex items-center justify-between text-sm">
//                     <span className="text-gray-600">Semester:</span>
//                     <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
//                       {student.currentSemester}
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between text-sm">
//                     <span className="text-gray-600">Section:</span>
//                     <span className="text-gray-900">{student.section || '-'}</span>
//                   </div>
//                 </div>

//                 <div className="flex gap-2">
//                   <button
//                     onClick={() => handleEdit(student)}
//                     className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 font-medium text-sm transition-colors"
//                   >
//                     Edit
//                   </button>
//                   <button 
//                     onClick={() => handleDelete(student.id)} 
//                     className="p-2 text-red-700 hover:bg-red-50 rounded-lg transition-colors"
//                   >
//                     <Trash2 className="h-5 w-5" />
//                   </button>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       )}
//     </div>
//   )
// }

'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, Upload as UploadIcon, Download, Search, Filter, Grid, List, Users, GraduationCap, BookOpen, Edit, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import * as XLSX from 'xlsx'

// ============================================
// INTERFACES
// ============================================

interface Programme {
  id: string
  session: string
  programmeCode: string
  programmeName: string
  duration: number
  currentSemester: number
  section: string | null
  noOfStudents: number
  createdAt: string
  updatedAt: string
}

interface Student {
  id: string
  userId: string
  studentId: string
  name: string
  email: string
  contactNo: string | null
  programmeId: string
  currentSemester: number
  section: string | null
  createdAt: string
  updatedAt: string
  programme: Programme
}

interface Course {
  id: string
  session: string
  programmeId: string
  semester: number
  courseCode: string
  courseName: string
  l: number
  t: number
  p: number
  s: number
  credits: number
  totalHours: number
  courseType: 'THEORY' | 'PRACTICAL' | 'LAB'
  roomNo: string | null
  attendance: boolean
  category: 'MANDATORY' | 'ELECTIVE'
  createdAt: string
  updatedAt: string
  programme: Programme
}

interface StudentEnrollment {
  id: string
  studentId: string
  courseId: string
  enrolledAt: string
  createdAt: string
  updatedAt: string
  student: Student
  course: Course
}

type TabType = 'directory' | 'enrollments' | 'matrix'

export default function StudentManagementPage() {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  const [activeTab, setActiveTab] = useState<TabType>('directory')
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([])
  const [programmes, setProgrammes] = useState<Programme[]>([])
  
  // UI State
  const [showForm, setShowForm] = useState(false)
  const [showEnrollForm, setShowEnrollForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  
  // Form Data
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    email: '',
    contactNo: '',
    programmeId: '',
    currentSemester: 1,
    section: ''
  })
  const [enrollFormData, setEnrollFormData] = useState({
    studentId: '',
    courseId: ''
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProgramme, setSelectedProgramme] = useState('all')
  const [selectedSession, setSelectedSession] = useState('all')
  const [selectedSemester, setSelectedSemester] = useState('all')
  const [selectedSection, setSelectedSection] = useState('all')
  const [availableSessions, setAvailableSessions] = useState<string[]>([])
  const [availableSemesters, setAvailableSemesters] = useState<number[]>([])
  const [availableSections, setAvailableSections] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Statistics
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeProgrammes: 0,
    currentSession: 0,
    firstYear: 0,
    totalEnrollments: 0,
    enrolledStudents: 0,
    activeCourses: 0
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [searchTerm, selectedProgramme, selectedSession, selectedSemester, selectedSection, students])

  // ============================================
  // DATA LOADING
  // ============================================

  const loadData = async () => {
    try {
      const [studentsRes, coursesRes, enrollmentsRes, programmesRes] = await Promise.all([
        fetch('/api/admin/students'),
        fetch('/api/admin/courses'),
        fetch('/api/admin/enrollments'),
        fetch('/api/admin/programmes')
      ])

      const studentsData = await studentsRes.json()
      const coursesData = await coursesRes.json()
      const enrollmentsData = await enrollmentsRes.json()
      const programmesData = await programmesRes.json()

      console.log('API Response - Students:', studentsData)
      console.log('API Response - Programmes:', programmesData)

      if (studentsData.success && Array.isArray(studentsData.students)) {
        const sortedStudents = sortStudents(studentsData.students)
        setStudents(sortedStudents)
        setFilteredStudents(sortedStudents)

        const sessions = Array.from(new Set(
          sortedStudents.map((s: Student) => s.programme?.session).filter(Boolean)
        )).sort().reverse() as string[]
        setAvailableSessions(sessions)

        const semesters = Array.from(new Set(
          sortedStudents.map((s: Student) => s.currentSemester)
        )).sort((a, b) => a - b)
        setAvailableSemesters(semesters)

        const sections = Array.from(new Set(
          sortedStudents.map((s: Student) => s.section).filter(Boolean)
        )).sort() as string[]
        setAvailableSections(sections)

        if (sessions.length > 0 && selectedSession === 'all') {
          setSelectedSession(sessions[0])
        }

        const currentSessionStudents = sortedStudents.filter(
          (s: Student) => s.programme?.session === sessions[0]
        ).length
        const firstYearStudents = sortedStudents.filter(
          (s: Student) => s.currentSemester <= 2
        ).length

        setStats(prev => ({
          ...prev,
          totalStudents: sortedStudents.length,
          currentSession: currentSessionStudents,
          firstYear: firstYearStudents
        }))
      }

      if (coursesData.success && Array.isArray(coursesData.courses)) {
        setCourses(coursesData.courses)
      }
      
      if (programmesData.success && Array.isArray(programmesData.programmes)) {
        setProgrammes(programmesData.programmes)
        setStats(prev => ({
          ...prev,
          activeProgrammes: programmesData.programmes.length
        }))
      }

      if (enrollmentsData.success && Array.isArray(enrollmentsData.enrollments)) {
        setEnrollments(enrollmentsData.enrollments)
        
        const uniqueStudents = new Set(enrollmentsData.enrollments.map((e: StudentEnrollment) => e.studentId))
        const uniqueCourses = new Set(enrollmentsData.enrollments.map((e: StudentEnrollment) => e.courseId))
        
        setStats(prev => ({
          ...prev,
          totalEnrollments: enrollmentsData.enrollments.length,
          enrolledStudents: uniqueStudents.size,
          activeCourses: uniqueCourses.size
        }))
      }
    } catch (error) {
      toast.error('Failed to load data')
      console.error(error)
    }
  }

  // ============================================
  // SORTING & FILTERING
  // ============================================

  const sortStudents = (studentsToSort: Student[]): Student[] => {
    return [...studentsToSort].sort((a, b) => {
      if (a.programme?.session !== b.programme?.session) {
        return (b.programme?.session || '').localeCompare(a.programme?.session || '')
      }
      if (a.programme?.programmeCode !== b.programme?.programmeCode) {
        return (a.programme?.programmeCode || '').localeCompare(b.programme?.programmeCode || '')
      }
      const aSection = a.section || ''
      const bSection = b.section || ''
      if (aSection !== bSection) return aSection.localeCompare(bSection)
      if (a.currentSemester !== b.currentSemester) return a.currentSemester - b.currentSemester
      return a.studentId.localeCompare(b.studentId)
    })
  }

  const applyFilters = () => {
    let filtered = students

    if (selectedProgramme !== 'all') {
      filtered = filtered.filter((s: Student) => s.programmeId === selectedProgramme)
    }
    if (selectedSession !== 'all') {
      filtered = filtered.filter((s: Student) => s.programme?.session === selectedSession)
    }
    if (selectedSemester !== 'all') {
      filtered = filtered.filter((s: Student) => s.currentSemester === parseInt(selectedSemester))
    }
    if (selectedSection !== 'all') {
      filtered = filtered.filter((s: Student) => s.section === selectedSection)
    }
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter((s: Student) => 
        s.studentId.toLowerCase().includes(term) ||
        s.name.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term) ||
        (s.programme?.programmeCode || '').toLowerCase().includes(term)
      )
    }

    setFilteredStudents(sortStudents(filtered))
  }

  // ============================================
  // STUDENT MANAGEMENT HANDLERS
  // ============================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/students', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId ? { id: editingId, ...formData } : formData)
      })

      const data = await response.json()

      if (data.success) {
        toast.success(editingId ? 'Student updated!' : 'Student created!')
        resetForm()
        loadData()
      } else {
        toast.error(data.error || 'An error occurred')
      }
    } catch (error) {
      toast.error('Failed to save student')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      studentId: '',
      name: '',
      email: '',
      contactNo: '',
      programmeId: '',
      currentSemester: 1,
      section: ''
    })
    setShowForm(false)
    setEditingId(null)
  }

  const handleEdit = (student: Student) => {
    setFormData({
      studentId: student.studentId,
      name: student.name,
      email: student.email,
      contactNo: student.contactNo || '',
      programmeId: student.programmeId,
      currentSemester: student.currentSemester,
      section: student.section || ''
    })
    setEditingId(student.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this student?')) return

    try {
      const response = await fetch(`/api/admin/students/${id}`, { method: 'DELETE' })
      const data = await response.json()

      if (data.success) {
        toast.success('Student deleted!')
        loadData()
      } else {
        toast.error(data.error || 'Failed to delete')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      const response = await fetch('/api/admin/students/bulk-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: jsonData })
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`Successfully uploaded ${result.count} students!`)
        loadData()
      } else {
        toast.error(result.error || 'Upload failed')
      }
    } catch (error) {
      toast.error('Failed to process file')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const downloadTemplate = () => {
    const template = [
      {
        'Student ID': '2024001',
        'Name': 'John Doe',
        'Email': 'john.doe@university.edu',
        'Contact No': '+91-9876543210',
        'Programme Code': 'BTECH-CSE',
        'Current Semester': 1,
        'Section': 'A'
      }
    ]

    const ws = XLSX.utils.json_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Students')
    XLSX.writeFile(wb, 'students_template.xlsx')
    toast.success('Template downloaded!')
  }

  // ============================================
  // ENROLLMENT MANAGEMENT HANDLERS
  // ============================================

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!enrollFormData.studentId || !enrollFormData.courseId) {
      toast.error('Please select both student and course')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/admin/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: enrollFormData.studentId,
          courseId: enrollFormData.courseId
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Student enrolled successfully!')
        setShowEnrollForm(false)
        setEnrollFormData({ studentId: '', courseId: '' })
        loadData()
      } else {
        toast.error(data.error || 'Enrollment failed')
      }
    } catch (error) {
      toast.error('Failed to enroll student')
    } finally {
      setLoading(false)
    }
  }

  const handleBulkEnroll = async () => {
    if (!confirm('Auto-enroll all students in their programme courses for their current semester?')) return

    setBulkLoading(true)

    try {
      const response = await fetch('/api/admin/enrollments/bulk', {
        method: 'POST'
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Successfully enrolled ${data.count} students!`)
        loadData()
      } else {
        toast.error(data.error || 'Bulk enrollment failed')
      }
    } catch (error) {
      toast.error('Failed to bulk enroll')
    } finally {
      setBulkLoading(false)
    }
  }

  const handleRemoveEnrollment = async (id: string) => {
    if (!confirm('Remove this enrollment?')) return

    try {
      const response = await fetch(`/api/admin/enrollments/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Enrollment removed!')
        loadData()
      } else {
        toast.error(data.error || 'Failed to remove')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  // ============================================
  // SMART FILTERING FOR ENROLLMENT FORM
  // ============================================

  const selectedStudent = students.find(s => s.id === enrollFormData.studentId)
  const filteredCourses = selectedStudent
    ? courses.filter(c => 
        c.programmeId === selectedStudent.programmeId && 
        c.semester === selectedStudent.currentSemester
      )
    : []

  const clearAllFilters = () => {
    setSearchTerm('')
    setSelectedProgramme('all')
    setSelectedSession('all')
    setSelectedSemester('all')
    setSelectedSection('all')
  }

  // ============================================
  // RENDER TABS
  // ============================================

  const renderDirectoryTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Search Students
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
            >
              <List className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg ${viewMode === 'cards' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
            >
              <Grid className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student ID, name, email, or programme..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
            />
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Programme</label>
              <select
                value={selectedProgramme}
                onChange={(e) => setSelectedProgramme(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                <option value="all">All Programmes</option>
                {programmes.map((prog: Programme) => (
                  <option key={prog.id} value={prog.id}>
                    {prog.programmeCode}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Session</label>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                <option value="all">All Sessions</option>
                {availableSessions.map((session: string) => (
                  <option key={session} value={session}>{session}</option>
                ))}
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
                {availableSemesters.map((sem: number) => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                <option value="all">All Sections</option>
                {availableSections.map((section: string) => (
                  <option key={section} value={section}>Section {section}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {(searchTerm || selectedProgramme !== 'all' || selectedSession !== 'all' || selectedSemester !== 'all' || selectedSection !== 'all') && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredStudents.length} of {students.length} student{filteredStudents.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            {editingId ? 'Edit Student' : 'Add New Student'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-800">Student ID</label>
                <input
                  type="text"
                  placeholder="2024001"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                  disabled={!!editingId}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-800">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-800">Email</label>
                <input
                  type="email"
                  placeholder="student@university.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-800">Contact Number</label>
                <input
                  type="tel"
                  placeholder="+91-9876543210"
                  value={formData.contactNo}
                  onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-800">Programme</label>
                <select
                  value={formData.programmeId}
                  onChange={(e) => setFormData({ ...formData, programmeId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                >
                  <option value="">Select Programme</option>
                  {programmes.map((prog: Programme) => (
                    <option key={prog.id} value={prog.id}>
                      {prog.programmeCode}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-800">Current Semester</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.currentSemester}
                  onChange={(e) => setFormData({ ...formData, currentSemester: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-800">Section</label>
                <input
                  type="text"
                  placeholder="A"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
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
              <button type="button" onClick={resetForm} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 font-medium">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Students Table/Cards */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Student ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Programme</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Semester</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Section</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-800 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-lg font-medium text-gray-900">No students found</p>
                      <p className="text-sm text-gray-600 mt-1">Try adjusting your filters or add new students</p>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student: Student) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-blue-600">{student.studentId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">{student.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-800 text-sm">{student.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-800">
                        {student.programme?.programmeCode}
                        {student.programme?.section ? ` (${student.programme.section})` : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                          Sem {student.currentSemester}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-800">{student.section || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button 
                          onClick={() => handleEdit(student)} 
                          className="text-blue-700 hover:text-blue-900 p-1.5"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(student.id)} 
                          className="text-red-700 hover:text-red-900 p-1.5"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl p-12 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-lg font-medium text-gray-900">No students found</p>
            </div>
          ) : (
            filteredStudents.map((student: Student) => (
              <div key={student.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg mb-4">
                  {student.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{student.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{student.studentId}</p>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Programme:</span>
                    <span className="text-gray-900">{student.programme?.programmeCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Semester:</span>
                    <span className="text-gray-900">Sem {student.currentSemester}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(student)}
                    className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(student.id)} 
                    className="p-2 text-red-700 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )

  const renderEnrollmentsTab = () => (
    <div className="space-y-6">
      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Smart Enrollment</h4>
            <p className="text-sm text-blue-800">
              Select a student and only courses matching their programme and current semester will appear.
            </p>
          </div>
        </div>
      </div>

      {/* Enrollment Form */}
      {showEnrollForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Enroll Student in Course</h2>
          <form onSubmit={handleEnroll} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-800">Select Student</label>
                <select
                  value={enrollFormData.studentId}
                  onChange={(e) => setEnrollFormData({ ...enrollFormData, studentId: e.target.value, courseId: '' })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  required
                >
                  <option value="">Choose Student</option>
                  {students.map((student: Student) => (
                    <option key={student.id} value={student.id}>
                      {student.studentId} - {student.name} ({student.programme?.programmeCode}, Sem {student.currentSemester})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-800">Select Course</label>
                <select
                  value={enrollFormData.courseId}
                  onChange={(e) => setEnrollFormData({ ...enrollFormData, courseId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white disabled:bg-gray-100"
                  required
                  disabled={!enrollFormData.studentId}
                >
                  <option value="">Choose Course</option>
                  {filteredCourses.map((course: Course) => (
                    <option key={course.id} value={course.id}>
                      {course.courseCode} - {course.courseName}
                    </option>
                  ))}
                </select>
                {enrollFormData.studentId && filteredCourses.length === 0 && (
                  <p className="text-xs text-red-600 mt-2">No courses available for this student's programme/semester</p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading || !enrollFormData.courseId}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
              >
                {loading ? 'Enrolling...' : 'Enroll'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEnrollForm(false)
                  setEnrollFormData({ studentId: '', courseId: '' })
                }}
                className="bg-gray-300 text-gray-800 px-6 py-2.5 rounded-lg hover:bg-gray-400 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Enrollments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase">Student ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase">Course Code</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase">Course Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase">Semester</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase">Enrolled Date</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-800 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {enrollments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-lg font-medium text-gray-900">No enrollments yet</p>
                  </td>
                </tr>
              ) : (
                enrollments.map((enrollment: StudentEnrollment) => (
                  <tr key={enrollment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-900 font-medium">{enrollment.student.name}</td>
                    <td className="px-6 py-4 text-gray-600 font-semibold">{enrollment.student.studentId}</td>
                    <td className="px-6 py-4 text-gray-800 font-semibold">{enrollment.course.courseCode}</td>
                    <td className="px-6 py-4 text-gray-800">{enrollment.course.courseName}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                        Sem {enrollment.course.semester}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {new Date(enrollment.enrolledAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleRemoveEnrollment(enrollment.id)}
                        className="text-red-700 hover:text-red-900 p-2"
                      >
                        <Trash2 className="h-5 w-5" />
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
  )

  const renderMatrixTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Student-Course Enrollment Matrix</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Student</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Programme</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Semester</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Enrolled Courses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.map((student: Student) => {
                const studentEnrollments = enrollments.filter(e => e.studentId === student.id)
                return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{student.programme?.programmeCode}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                        Sem {student.currentSemester}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {studentEnrollments.length > 0 ? (
                          studentEnrollments.map(e => (
                            <span key={e.id} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                              {e.course.courseCode}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400">No enrollments</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Management</h1>
        <p className="text-gray-600">Manage students, enrollments, and course assignments</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Students</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Enrollments</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalEnrollments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Enrolled Students</p>
              <p className="text-3xl font-bold text-gray-900">{stats.enrolledStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <GraduationCap className="h-8 w-8 text-orange-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Active Courses</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeCourses}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={downloadTemplate}
          className="bg-green-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
        >
          <Download className="h-5 w-5" />
          Download Template
        </button>
        <label className="bg-purple-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-purple-700 cursor-pointer transition-colors">
          <UploadIcon className="h-5 w-5" />
          {uploading ? 'Uploading...' : 'Bulk Upload Students'}
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Student
        </button>
        <button
          onClick={() => setShowEnrollForm(!showEnrollForm)}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Enroll Student
        </button>
        <button
          onClick={handleBulkEnroll}
          disabled={bulkLoading}
          className="bg-red-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-red-700 disabled:bg-gray-400 transition-colors"
        >
          <RefreshCw className="h-5 w-5" />
          {bulkLoading ? 'Auto-Enrolling...' : 'Auto-Enroll All'}
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'directory'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="h-5 w-5 inline mr-2" />
            Student Directory
          </button>
          <button
            onClick={() => setActiveTab('enrollments')}
            className={`px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'enrollments'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BookOpen className="h-5 w-5 inline mr-2" />
            Course Enrollments
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'matrix'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Grid className="h-5 w-5 inline mr-2" />
            Enrollment Matrix
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'directory' && renderDirectoryTab()}
      {activeTab === 'enrollments' && renderEnrollmentsTab()}
      {activeTab === 'matrix' && renderMatrixTab()}
    </div>
  )
}
