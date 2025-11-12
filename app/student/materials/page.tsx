'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Download, FileText, Search, Filter } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

interface Material {
  id: string
  title: string
  contentType: string
  fileName: string
  filePath: string
  fileSize: number
  description: string | null
  lectureNumber: number | null
  createdAt: string
  faculty: {
    name: string
    designation: string
  }
  course: {
    courseCode: string
    courseName: string
  }
}

export default function CourseMaterialsPage() {
  const router = useRouter()
  const [student, setStudent] = useState<any>(null)
  const [materials, setMaterials] = useState<Material[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('ALL')
  const [selectedType, setSelectedType] = useState('ALL')

  useEffect(() => {
    const studentData = localStorage.getItem('studentUser')
    if (!studentData) {
      router.push('/student/login')
      return
    }
    const parsedStudent = JSON.parse(studentData)
    setStudent(parsedStudent)
    loadMaterials(parsedStudent.id)
  }, [router])

  const loadMaterials = async (studentId: string) => {
    try {
      const response = await fetch(`/api/student/materials?studentId=${studentId}`)
      const data = await response.json()
      
      if (data.success) {
        setMaterials(data.materials)
        setCourses(data.courses)
      }
    } catch (error) {
      toast.error('Failed to load materials')
    } finally {
      setLoading(false)
    }
  }

  const getContentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'LECTURE_PPT': 'bg-blue-100 text-blue-800',
      'ASSIGNMENT': 'bg-green-100 text-green-800',
      'QUESTION_BANK': 'bg-purple-100 text-purple-800',
      'LAB_MANUAL': 'bg-orange-100 text-orange-800',
      'SYLLABUS': 'bg-pink-100 text-pink-800',
      'NOTES': 'bg-yellow-100 text-yellow-800',
      'COURSE_HANDBOOK': 'bg-indigo-100 text-indigo-800',
      'REFERENCE_MATERIAL': 'bg-gray-100 text-gray-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = searchTerm === '' || 
      material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.course.courseName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCourse = selectedCourse === 'ALL' || material.course.courseCode === selectedCourse
    const matchesType = selectedType === 'ALL' || material.contentType === selectedType

    return matchesSearch && matchesCourse && matchesType
  })

  // Group materials by course
  const groupedMaterials = filteredMaterials.reduce((acc: any, material) => {
    const courseCode = material.course.courseCode
    if (!acc[courseCode]) {
      acc[courseCode] = {
        courseName: material.course.courseName,
        courseCode: material.course.courseCode,
        materials: []
      }
    }
    acc[courseCode].materials.push(material)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading materials...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Toaster position="top-right" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Materials</h1>
        <p className="text-gray-600">Download lecture notes, assignments, and study materials</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search materials by title or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
              />
            </div>
          </div>

          {/* Course Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
            >
              <option value="ALL">All Courses</option>
              {courses.map((course) => (
                <option key={course.courseCode} value={course.courseCode}>
                  {course.courseCode} - {course.courseName}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
            >
              <option value="ALL">All Types</option>
              <option value="LECTURE_PPT">Lecture PPT</option>
              <option value="ASSIGNMENT">Assignment</option>
              <option value="QUESTION_BANK">Question Bank</option>
              <option value="LAB_MANUAL">Lab Manual</option>
              <option value="SYLLABUS">Syllabus</option>
              <option value="NOTES">Notes</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-end">
            <p className="text-sm text-gray-600">
              Showing {filteredMaterials.length} of {materials.length} materials
            </p>
          </div>
        </div>
      </div>

      {/* Materials List */}
      {Object.keys(groupedMaterials).length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Materials Found</h3>
          <p className="text-gray-600">
            {materials.length === 0 
              ? 'No materials have been uploaded yet.' 
              : 'Try adjusting your filters or search term.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedMaterials).map(([courseCode, group]: [string, any]) => (
            <div key={courseCode} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-purple-50 px-6 py-4 border-b border-purple-100">
                <h2 className="text-lg font-bold text-gray-900">
                  {group.courseCode} - {group.courseName}
                </h2>
                <p className="text-sm text-gray-600">{group.materials.length} materials available</p>
              </div>

              <div className="divide-y divide-gray-200">
                {group.materials.map((material: Material) => (
                  <div key={material.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg">{material.title}</h3>
                          {material.lectureNumber && (
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              Lecture {material.lectureNumber}
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getContentTypeColor(material.contentType)}`}>
                            {material.contentType.replace(/_/g, ' ')}
                          </span>
                        </div>

                        {material.description && (
                          <p className="text-sm text-gray-700 mb-3">{material.description}</p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Uploaded by: {material.faculty.name}</span>
                          <span>•</span>
                          <span>{new Date(material.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            <span>{material.fileName}</span>
                          </div>
                          <span>•</span>
                          <span>{(material.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                      </div>

                      <a
                        href={material.filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 ml-4 whitespace-nowrap"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
