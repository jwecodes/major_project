'use client'
import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Calendar, BookOpen, Loader, CheckCircle, Clock, Eye, X } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface Course {
  id: string
  courseCode: string
  courseName: string
}

interface LessonPlan {
  id: string
  title: string
  lectureNumber?: number | null
  datePlanned: string
  dateConducted?: string | null
  topicsCovered: string
  description?: string | null
  status: string
  course: {
    courseCode: string
    courseName: string
  }
}

export default function LessonPlansPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<LessonPlan | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    lectureNumber: '',
    datePlanned: '',
    dateConducted: '',
    topicsCovered: '',
    description: ''
  })

  useEffect(() => {
    const email = localStorage.getItem('facultyEmail')
    if (!email) {
      router.push('/faculty/login')
      return
    }
    loadData(email)
  }, [router])

  const loadData = async (email: string) => {
    try {
      setLoading(true)
      const [coursesRes, plansRes] = await Promise.all([
        fetch(`/api/faculty/courses?email=${encodeURIComponent(email)}`),
        fetch(`/api/faculty/lesson-plans?email=${encodeURIComponent(email)}`)
      ])

      const coursesData = await coursesRes.json()
      const plansData = await plansRes.json()

      if (coursesData.success) {
        setCourses(coursesData.courses)
      }

      if (plansData.success) {
        setLessonPlans(plansData.lessonPlans)
      }
    } catch (error) {
      toast.error('Error loading data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.courseId || !formData.title || !formData.datePlanned || !formData.topicsCovered) {
      toast.error('Please fill all required fields')
      return
    }

    const email = localStorage.getItem('facultyEmail')
    if (!email) return

    setSubmitting(true)
    try {
      const url = editingId 
        ? `/api/faculty/lesson-plans/${editingId}?email=${encodeURIComponent(email)}`
        : `/api/faculty/lesson-plans?email=${encodeURIComponent(email)}`
      
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (data.success) {
        toast.success(editingId ? 'Lesson plan updated!' : 'Lesson plan created!')
        resetForm()
        loadData(email)
      } else {
        toast.error(data.error || 'Error saving lesson plan')
      }
    } catch (error) {
      toast.error('Error saving lesson plan')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (plan: LessonPlan) => {
    setFormData({
      courseId: plan.course.courseCode, // This needs course ID, you might need to fetch it
      title: plan.title,
      lectureNumber: plan.lectureNumber?.toString() || '',
      datePlanned: plan.datePlanned.split('T')[0],
      dateConducted: plan.dateConducted ? plan.dateConducted.split('T')[0] : '',
      topicsCovered: plan.topicsCovered,
      description: plan.description || ''
    })
    setEditingId(plan.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this lesson plan?')) return

    const email = localStorage.getItem('facultyEmail')
    if (!email) return

    try {
      const res = await fetch(`/api/faculty/lesson-plans/${id}?email=${encodeURIComponent(email)}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Lesson plan deleted!')
        loadData(email)
      } else {
        toast.error('Error deleting')
      }
    } catch (error) {
      toast.error('Error deleting')
    }
  }

  const resetForm = () => {
    setFormData({
      courseId: '',
      title: '',
      lectureNumber: '',
      datePlanned: '',
      dateConducted: '',
      topicsCovered: '',
      description: ''
    })
    setEditingId(null)
    setShowForm(false)
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'APPROVED':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle className="h-3 w-3" /> Approved</span>
      case 'SUBMITTED':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700"><Clock className="h-3 w-3" /> Submitted</span>
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Draft</span>
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lesson Plans</h1>
          <p className="text-gray-600">Create and manage your lesson plans</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium transition-colors"
        >
          <Plus className="h-5 w-5" />
          New Lesson Plan
        </button>
      </div>

      {/* Lesson Plans List */}
      {lessonPlans.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center border border-gray-200">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No lesson plans yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            Create your first lesson plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessonPlans.map(plan => (
            <div key={plan.id} className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{plan.title}</h3>
                  <p className="text-sm text-blue-600 font-mono">{plan.course.courseCode}</p>
                </div>
                {getStatusBadge(plan.status)}
              </div>

              {plan.lectureNumber && (
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Lecture:</span> {plan.lectureNumber}
                </p>
              )}

              <div className="space-y-1 text-sm text-gray-600 mb-4">
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Planned: {new Date(plan.datePlanned).toLocaleDateString()}
                </p>
                {plan.dateConducted && (
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Conducted: {new Date(plan.dateConducted).toLocaleDateString()}
                  </p>
                )}
              </div>

              <p className="text-sm text-gray-700 line-clamp-2 mb-4">{plan.topicsCovered}</p>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => {
                    setSelectedPlan(plan)
                    setShowViewModal(true)
                  }}
                  className="flex-1 bg-indigo-100 text-indigo-700 px-3 py-2 rounded text-sm font-medium hover:bg-indigo-200 transition-colors flex items-center justify-center gap-1"
                >
                  <Eye className="h-4 w-4" />
                  View
                </button>
                <button
                  onClick={() => handleEdit(plan)}
                  className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm font-medium hover:bg-blue-200 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="p-2 text-red-700 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 sticky top-0">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{editingId ? 'Edit' : 'New'} Lesson Plan</h2>
                <button
                  onClick={resetForm}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Course *</label>
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData(prev => ({ ...prev, courseId: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  required
                >
                  <option value="">Select course...</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.courseCode} - {course.courseName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="E.g., Introduction to Data Structures"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Lecture Number (Optional)</label>
                <input
                  type="number"
                  value={formData.lectureNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, lectureNumber: e.target.value }))}
                  placeholder="1, 2, 3..."
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date Planned *</label>
                  <input
                    type="date"
                    value={formData.datePlanned}
                    onChange={(e) => setFormData(prev => ({ ...prev, datePlanned: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date Conducted</label>
                  <input
                    type="date"
                    value={formData.dateConducted}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateConducted: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Topics Covered *</label>
                <textarea
                  value={formData.topicsCovered}
                  onChange={(e) => setFormData(prev => ({ ...prev, topicsCovered: e.target.value }))}
                  placeholder="List the topics covered..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Additional notes..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 sticky top-0">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{selectedPlan.title}</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 font-semibold">Course</p>
                <p className="text-lg font-semibold text-gray-900">{selectedPlan.course.courseCode}</p>
                <p className="text-sm text-gray-600">{selectedPlan.course.courseName}</p>
              </div>

              {selectedPlan.lectureNumber && (
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Lecture Number</p>
                  <p className="text-gray-900">{selectedPlan.lectureNumber}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Date Planned</p>
                  <p className="text-gray-900">{new Date(selectedPlan.datePlanned).toLocaleDateString()}</p>
                </div>
                {selectedPlan.dateConducted && (
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Date Conducted</p>
                    <p className="text-gray-900">{new Date(selectedPlan.dateConducted).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-600 font-semibold mb-2">Topics Covered</p>
                <p className="text-gray-900 whitespace-pre-wrap">{selectedPlan.topicsCovered}</p>
              </div>

              {selectedPlan.description && (
                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-2">Description</p>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedPlan.description}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600 font-semibold mb-2">Status</p>
                {getStatusBadge(selectedPlan.status)}
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
