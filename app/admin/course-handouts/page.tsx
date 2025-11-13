'use client'
import { useState, useEffect } from 'react'
import { FileText, Eye, CheckCircle, XCircle, Clock, Loader } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface CHO {
  id: string
  courseCode: string
  courseName: string
  semester: number
  facultyName: string
  facultyEmail: string
  facultyDesignation: string
  status: string
  updatedAt: string
}

export default function AdminCourseHandouts() {
  const router = useRouter()
  const [chos, setChos] = useState<CHO[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    loadCHOs()
  }, [])

  const loadCHOs = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/course-handouts')
      const data = await res.json()
      
      if (data.success) {
        setChos(data.chos.map((cho: any) => ({
          id: cho.id,
          courseCode: cho.course.courseCode,
          courseName: cho.course.courseName,
          semester: cho.course.semester,
          facultyName: cho.faculty.name,
          facultyEmail: cho.faculty.email,
          facultyDesignation: cho.faculty.designation,
          status: cho.status,
          updatedAt: cho.updatedAt
        })))
      }
    } catch (error) {
      toast.error('Error loading CHOs')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      DRAFT: 'bg-gray-100 text-gray-700',
      SUBMITTED: 'bg-yellow-100 text-yellow-700',
      APPROVED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700'
    }
    
    const icons = {
      DRAFT: Clock,
      SUBMITTED: Clock,
      APPROVED: CheckCircle,
      REJECTED: XCircle
    }
    
    const Icon = icons[status as keyof typeof icons] || Clock
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${styles[status as keyof typeof styles]}`}>
        <Icon className="h-3 w-3" />
        {status}
      </span>
    )
  }

  const filteredCHOs = chos.filter(cho => {
    if (filter === 'ALL') return true
    return cho.status === filter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <FileText className="h-8 w-8 text-blue-600" />
          Course Handouts (CHO)
        </h1>
        <p className="text-gray-600">Review and manage course handouts submitted by faculty</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2">
        {['ALL', 'SUBMITTED', 'APPROVED', 'REJECTED', 'DRAFT'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status} ({chos.filter(c => status === 'ALL' || c.status === status).length})
          </button>
        ))}
      </div>

      {/* CHO Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        {filteredCHOs.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">No course handouts found</p>
            <p className="text-sm">Faculty haven't submitted any CHOs yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800">
                  <th className="px-4 py-3 text-left text-white font-bold">Course</th>
                  <th className="px-4 py-3 text-left text-white font-bold">Faculty</th>
                  <th className="px-4 py-3 text-left text-white font-bold">Semester</th>
                  <th className="px-4 py-3 text-left text-white font-bold">Status</th>
                  <th className="px-4 py-3 text-left text-white font-bold">Last Updated</th>
                  <th className="px-4 py-3 text-left text-white font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCHOs.map((cho) => (
                  <tr key={cho.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-semibold text-gray-900">{cho.courseCode}</div>
                        <div className="text-sm text-gray-600">{cho.courseName}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900">{cho.facultyName}</div>
                        <div className="text-xs text-gray-500">{cho.facultyDesignation}</div>
                        <div className="text-xs text-gray-500">{cho.facultyEmail}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      Semester {cho.semester}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(cho.status)}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {new Date(cho.updatedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => router.push(`/admin/course-handouts/${cho.id}`)}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1.5 text-sm font-medium transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-sm text-gray-600">Total CHOs</div>
          <div className="text-2xl font-bold text-gray-900">{chos.length}</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg shadow border border-yellow-200">
          <div className="text-sm text-yellow-700">Pending Review</div>
          <div className="text-2xl font-bold text-yellow-900">{chos.filter(c => c.status === 'SUBMITTED').length}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow border border-green-200">
          <div className="text-sm text-green-700">Approved</div>
          <div className="text-2xl font-bold text-green-900">{chos.filter(c => c.status === 'APPROVED').length}</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg shadow border border-red-200">
          <div className="text-sm text-red-700">Rejected</div>
          <div className="text-2xl font-bold text-red-900">{chos.filter(c => c.status === 'REJECTED').length}</div>
        </div>
      </div>
    </div>
  )
}
