'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Users, BookOpen, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp, Award, Filter, Search, Eye } from 'lucide-react'
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

export default function CourseCoordinationClient() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [allocations, setAllocations] = useState<CourseAllocation[]>([])
  const [groupedCourses, setGroupedCourses] = useState<GroupedCourse[]>([])
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [loadingStats, setLoadingStats] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'with-coordinator' | 'without-coordinator'>('all')

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

  const loadContentStats = async (group: GroupedCourse) => {
    try {
      setLoadingStats(prev => new Set(prev).add(group.courseCode))
      
      const courseIds = group.instances.map(i => i.id)
      const res = await fetch(`/api/admin/content-stats?courseIds=${courseIds.join(',')}`)
      const data = await res.json()

      if (data.success) {
        setGroupedCourses(prev => 
          prev.map(g => 
            g.courseCode === group.courseCode 
              ? { ...g, stats: data.stats }
              : g
          )
        )
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoadingStats(prev => {
        const next = new Set(prev)
        next.delete(group.courseCode)
        return next
      })
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

    setStats({
      totalCourses: result.length,
      withCoordinator: result.filter(g => g.coordinator).length,
      withoutCoordinator: result.filter(g => !g.coordinator).length,
      totalFaculty: new Set(allocations.map(a => a.facultyId)).size
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

      for (const instance of groupCourse.instances) {
        const courseAllocations = allocations.filter(a => a.courseId === instance.id)

        for (const alloc of courseAllocations) {
          await fetch(`/api/admin/course-allocations/${alloc.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: 'CONTRIBUTOR' })
          })
        }

        const coordinatorAlloc = courseAllocations.find(a => a.facultyId === facultyId)
        if (coordinatorAlloc) {
          await fetch(`/api/admin/course-allocations/${coordinatorAlloc.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: 'COORDINATOR' })
          })
        }
      }

      toast.success('Coordinator updated successfully!')
      loadData()
      setShowCoordinatorModal(false)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error updating coordinator')
    } finally {
      setLoading(false)
    }
  }

  const toggleExpanded = (courseCode: string, group: GroupedCourse) => {
    const newExpanded = new Set(expandedCourses)
    if (newExpanded.has(courseCode)) {
      newExpanded.delete(courseCode)
    } else {
      newExpanded.add(courseCode)
      // Load stats when expanding
      if (group.stats.totalContent === 0) {
        loadContentStats(group)
      }
    }
    setExpandedCourses(newExpanded)
  }

  const viewContributors = (group: GroupedCourse) => {
    if (!group.coordinator) {
      toast.error('Please assign a coordinator first')
      return
    }
    // Navigate to contributor review page
    router.push(`/admin/course-coordination/${group.courseCode}/contributors`)
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Course Coordination</h1>
        <p className="text-gray-600">Manage courses, assign coordinators, and monitor content approval</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-600">
          <p className="text-gray-600 text-sm font-medium">Total Courses</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalCourses}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-600">
          <p className="text-gray-600 text-sm font-medium">With Coordinator</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.withCoordinator}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-600">
          <p className="text-gray-600 text-sm font-medium">Need Coordinator</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{stats.withoutCoordinator}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-600">
          <p className="text-gray-600 text-sm font-medium">Total Faculty</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalFaculty}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filter & Search
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by course code or name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
            >
              <option value="all">All Courses</option>
              <option value="with-coordinator">✅ With Coordinator</option>
              <option value="without-coordinator">⚠️ Without Coordinator</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="bg-blue-50 p-3 rounded-lg w-full">
              <p className="text-sm text-blue-900">
                Showing <span className="font-bold">{filteredCourses.length}</span> of <span className="font-bold">{groupedCourses.length}</span> courses
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grouped Courses List */}
      <div className="space-y-4">
        {filteredCourses.length > 0 ? (
          filteredCourses.map(group => (
            <div key={group.courseCode} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Header */}
              <div
                onClick={() => toggleExpanded(group.courseCode, group)}
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex items-center gap-4">
                    <button className="text-gray-600 hover:text-gray-900 transition-colors">
                      {expandedCourses.has(group.courseCode) ? (
                        <ChevronUp className="h-6 w-6" />
                      ) : (
                        <ChevronDown className="h-6 w-6" />
                      )}
                    </button>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{group.courseCode}</h3>
                      <p className="text-sm text-gray-600 mt-1">{group.courseName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {group.coordinator ? (
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                          <Award className="h-5 w-5 text-green-600" />
                          <div className="text-left">
                            <p className="text-sm font-bold text-green-900">{group.coordinator.faculty.name}</p>
                            <p className="text-xs text-green-700">{group.coordinator.faculty.email}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-lg border border-orange-200">
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                        <span className="text-sm font-semibold text-orange-800">No Coordinator Assigned</span>
                      </div>
                    )}

                    <div className="text-center bg-gray-100 px-4 py-2 rounded-lg">
                      <p className="text-xs text-gray-600 font-medium">Instances</p>
                      <p className="text-lg font-bold text-gray-900">{group.instances.length}</p>
                    </div>

                    <div className="text-center bg-gray-100 px-4 py-2 rounded-lg">
                      <p className="text-xs text-gray-600 font-medium">Faculty</p>
                      <p className="text-lg font-bold text-gray-900">{group.faculty.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedCourses.has(group.courseCode) && (
                <div className="p-6 bg-gradient-to-br from-gray-50 to-white border-t-2 border-gray-200">
                  {/* Instances */}
                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      Course Instances ({group.instances.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {group.instances.map(instance => (
                        <div key={instance.id} className="bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors">
                          <p className="font-bold text-gray-900">{instance.programme}</p>
                          <p className="text-xs text-gray-600 mt-1">📅 Session: {instance.session}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Faculty & Coordinator */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <Users className="h-5 w-5 text-purple-600" />
                        Assigned Faculty ({group.faculty.length})
                      </h4>
                      <div className="flex gap-2">
                        {group.coordinator && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              viewContributors(group)
                            }}
                            className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                            View Contributors
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedGroupCourse(group)
                            setShowCoordinatorModal(true)
                          }}
                          className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                        >
                          {group.coordinator ? 'Change Coordinator' : 'Set Coordinator'}
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      {group.faculty.map(fac => (
                        <div key={fac.id} className="bg-white p-4 rounded-lg border-2 border-gray-200 hover:shadow-md transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-bold text-gray-900">{fac.faculty.name}</p>
                              <p className="text-xs text-gray-600">{fac.faculty.designation}</p>
                              <p className="text-xs text-gray-500 mt-1">{fac.faculty.email}</p>
                            </div>
                            <div>
                              {fac.role === 'COORDINATOR' ? (
                                <span className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
                                  <Award className="h-3 w-3" />
                                  Coordinator
                                </span>
                              ) : (
                                <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                  Contributor
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Content Stats */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      Content Upload Status
                    </h4>
                    {loadingStats.has(group.courseCode) ? (
                      <div className="bg-white p-6 rounded-lg text-center">
                        <div className="animate-spin h-6 w-6 border-3 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                        <p className="text-sm text-gray-600 mt-2">Loading stats...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-3">
                        <div className="bg-white p-4 rounded-lg text-center shadow border-2 border-gray-200">
                          <p className="text-xs text-gray-600 mb-2 font-medium">Total Content</p>
                          <p className="text-2xl font-bold text-gray-900">{group.stats.totalContent}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg text-center shadow border-2 border-green-200">
                          <p className="text-xs text-gray-600 mb-2 font-medium">Approved</p>
                          <p className="text-2xl font-bold text-green-600">{group.stats.approved}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg text-center shadow border-2 border-orange-200">
                          <p className="text-xs text-gray-600 mb-2 font-medium">Pending</p>
                          <p className="text-2xl font-bold text-orange-600">{group.stats.pending}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg text-center shadow border-2 border-red-200">
                          <p className="text-xs text-gray-600 mb-2 font-medium">Rejected</p>
                          <p className="text-2xl font-bold text-red-600">{group.stats.rejected}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center border-2 border-dashed border-gray-300">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-semibold text-lg">No courses found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filter</p>
          </div>
        )}
      </div>

      {/* Set Coordinator Modal */}
      {showCoordinatorModal && selectedGroupCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Coordinator</h2>
            <p className="text-sm text-gray-600 mb-6">
              Select a faculty member to coordinate <strong className="text-blue-600">{selectedGroupCourse.courseCode}</strong>
            </p>

            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
              {selectedGroupCourse.faculty.map(fac => (
                <button
                  key={fac.id}
                  onClick={() => toggleCoordinator(selectedGroupCourse, fac.facultyId)}
                  disabled={loading}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    selectedGroupCourse.coordinator?.facultyId === fac.facultyId
                      ? 'bg-blue-50 border-blue-500 shadow-md'
                      : 'bg-white border-gray-300 hover:bg-gray-50 hover:border-blue-300'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{fac.faculty.name}</p>
                      <p className="text-xs text-gray-600">{fac.faculty.designation}</p>
                      <p className="text-xs text-gray-500 mt-1">{fac.faculty.email}</p>
                    </div>
                    {selectedGroupCourse.coordinator?.facultyId === fac.facultyId && (
                      <CheckCircle className="h-6 w-6 text-blue-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowCoordinatorModal(false)}
              disabled={loading}
              className="w-full px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold transition-colors disabled:opacity-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
