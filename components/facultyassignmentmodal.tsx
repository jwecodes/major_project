import { Faculty, Course } from '@/lib/mokedata'

interface FacultyAssignmentModalProps {
  isOpen: boolean
  course: Course | null
  faculties: Faculty[]
  selectedFacultyId: string
  onFacultySelect: (facultyId: string) => void
  onSave: () => void
  onClose: () => void
}

export function FacultyAssignmentModal({
  isOpen,
  course,
  faculties,
  selectedFacultyId,
  onFacultySelect,
  onSave,
  onClose
}: FacultyAssignmentModalProps) {
  if (!isOpen || !course) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold mb-4">
          {course.facultyId ? 'Reassign Faculty' : 'Assign Faculty'}
        </h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Course
          </label>
          <p className="text-gray-900 font-medium">{course.name}</p>
          <p className="text-gray-500 text-sm">{course.code}</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Faculty
          </label>
          <select
            value={selectedFacultyId}
            onChange={(e) => onFacultySelect(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a faculty...</option>
            {faculties.map((faculty) => (
              <option key={faculty.id} value={faculty.id}>
                {faculty.name} ({faculty.department})
              </option>
            ))}
          </select>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onSave}
            disabled={!selectedFacultyId}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Assignment
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
