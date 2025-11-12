// 'use client'
// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'
// import Sidebar from '@/components/faculty/Sidebar'

// export default function Courses() {
//   const router = useRouter()
//   const [courses, setCourses] = useState<any[]>([])
//   const [filtered, setFiltered] = useState<any[]>([])
//   const [loading, setLoading] = useState(true)
//   const [search, setSearch] = useState('')
//   const [filterRole, setFilterRole] = useState('ALL')
//   const [authorized, setAuthorized] = useState(false)

//   useEffect(() => {
//     const facultyId = localStorage.getItem('facultyId')
//     const faculty = localStorage.getItem('faculty')

//     console.log('Courses page - Faculty ID:', facultyId)
//     console.log('Courses page - Faculty Data:', faculty)

//     if (!facultyId || !faculty) {
//       console.log('No auth data found, redirecting to login')
//       router.push('/faculty/login')
//       return
//     }

//     setAuthorized(true)
//     loadCourses(facultyId)
//   }, [router])

//   useEffect(() => {
//     let result = courses

//     if (filterRole !== 'ALL') {
//       result = result.filter(c => c.role === filterRole)
//     }

//     if (search.trim()) {
//       const q = search.toLowerCase()
//       result = result.filter(c =>
//         c.course.courseCode.toLowerCase().includes(q) ||
//         c.course.courseName.toLowerCase().includes(q)
//       )
//     }

//     setFiltered(result)
//   }, [courses, search, filterRole])

//   const loadCourses = async (facultyId: string) => {
//     try {
//       console.log('Loading courses for faculty:', facultyId)
      
//       const res = await fetch(`/api/faculty/my-courses`, {
//         method: 'GET',
//         headers: { 
//           'x-faculty-id': facultyId,
//           'Content-Type': 'application/json'
//         }
//       })

//       console.log('Response status:', res.status)

//       if (res.status === 401) {
//         console.log('Unauthorized, redirecting to login')
//         localStorage.removeItem('faculty')
//         localStorage.removeItem('facultyId')
//         router.push('/faculty/login')
//         return
//       }

//       const data = await res.json()
//       console.log('Courses data:', data)

//       if (data.success) {
//         setCourses(data.assignments || [])
//       } else {
//         console.error('Error loading courses:', data.error)
//       }
//     } catch (err) {
//       console.error('Error loading courses:', err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   if (!authorized) {
//     return null
//   }

//   return (
//     <>
//       <Sidebar />
      
//       <div className="lg:ml-64 min-h-screen bg-gray-50">
//         <main className="p-4 md:p-6">
//           <h1 className="text-3xl font-bold text-gray-900 mb-8">My Courses</h1>

//           {/* Filters */}
//           <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-col md:flex-row gap-4 border border-gray-200">
//             <input
//               type="text"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               placeholder="Search courses..."
//               className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
//             />
//             <select
//               value={filterRole}
//               onChange={(e) => setFilterRole(e.target.value)}
//               className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 min-w-max"
//             >
//               <option value="ALL">All Roles</option>
//               <option value="COORDINATOR">Coordinator</option>
//               <option value="CONTRIBUTOR">Contributor</option>
//             </select>
//           </div>

//           {/* Grid */}
//           {loading ? (
//             <div className="text-center py-12 text-gray-600">Loading courses...</div>
//           ) : filtered.length > 0 ? (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {filtered.map((course: any) => (
//                 <div key={course.id} className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-lg transition-shadow">
//                   <div className="flex justify-between items-start mb-3">
//                     <h3 className="font-semibold text-lg text-gray-900 flex-1">{course.course.courseCode}</h3>
//                     <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ml-2 ${
//                       course.role === 'COORDINATOR'
//                         ? 'bg-purple-100 text-purple-800'
//                         : 'bg-blue-100 text-blue-800'
//                     }`}>
//                       {course.role}
//                     </span>
//                   </div>
//                   <p className="text-sm text-gray-600 mb-2 line-clamp-2">{course.course.courseName}</p>
//                   <p className="text-xs text-gray-500 mb-4">
//                     📚 {course.course.programme?.programmeCode}
//                     {course.course.semester && ` • Sem ${course.course.semester}`}
//                   </p>
//                   <Link
//                     href={`/faculty/courses/${course.course.id}`}
//                     className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
//                   >
//                     View Course
//                   </Link>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-12 text-gray-600 bg-white rounded-lg border border-gray-200">
//               {courses.length === 0 ? 'No courses found' : 'No courses match your filter'}
//             </div>
//           )}
//         </main>
//       </div>
//     </>
//   )
// }

'use client'
import { useState, useEffect } from 'react'
import { BookOpen, Loader } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface Course {
  id: string
  courseCode: string
  courseName: string
  semester: number
  programme: {
    programmeName: string
    section: string | null
  }
  allocation: {
    role: 'COORDINATOR' | 'CONTRIBUTOR'
  }
}

export default function CoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const email = localStorage.getItem('facultyEmail')
    if (!email) {
      router.push('/faculty/login')
      return
    }
    loadCourses(email)
  }, [router])

  const loadCourses = async (email: string) => {
    try {
      const res = await fetch(`/api/faculty/courses?email=${encodeURIComponent(email)}`)
      const data = await res.json()

      if (data.success && Array.isArray(data.courses)) {
        setCourses(data.courses)
      } else {
        toast.error('Error loading courses')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error loading courses')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <Toaster position="top-right" />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Assigned Courses</h1>
        <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
          {courses.length} Course{courses.length !== 1 ? 's' : ''}
        </span>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center border border-gray-200">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No courses assigned yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course.id} className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{course.courseName}</h3>
                  <p className="text-sm font-mono text-blue-600">{course.courseCode}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold text-white whitespace-nowrap ml-2 ${
                  course.allocation.role === 'COORDINATOR' ? 'bg-purple-600' : 'bg-blue-600'
                }`}>
                  {course.allocation.role === 'COORDINATOR' ? '👑 Coordinator' : '👤 Contributor'}
                </span>
              </div>

              <div className="space-y-2 text-sm border-t pt-4">
                <p><span className="font-medium text-gray-800">Programme:</span> {course.programme.programmeName}</p>
                <p><span className="font-medium text-gray-800">Semester:</span> {course.semester}</p>
                {course.programme.section && (
                  <p><span className="font-medium text-gray-800">Section:</span> {course.programme.section}</p>
                )}
              </div>

              {course.allocation.role === 'COORDINATOR' && (
                <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded text-xs text-purple-700">
                  👑 You coordinate this course
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
