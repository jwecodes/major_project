'use client'
import { Sidebar } from '@/components/sidebar'
import { programmes, courses, faculties, timeSlots, rooms, timeSlotOptions, daysOfWeek } from '@/lib/mokedata'
import { useState } from 'react'

interface TimeSlot {
  id: string
  day: string
  startTime: string
  endTime: string
  courseId: string
  facultyId: string
  room: string
  programmeId: string
  semester: number
  section?: string
}

export default function TimetablePage() {
  const [selectedProgramme, setSelectedProgramme] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('')
  const [selectedSection, setSelectedSection] = useState('A')
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view')
  const [showAddSlotModal, setShowAddSlotModal] = useState(false)
  
  // Form states for adding new time slot
  const [newSlot, setNewSlot] = useState({
    day: '',
    startTime: '',
    endTime: '',
    courseId: '',
    facultyId: '',
    room: '',
    section: 'A'
  })

  // Get timetable for selected programme and semester
  const getTimetableData = () => {
    if (!selectedProgramme || !selectedSemester) return []
    
    return timeSlots.filter(slot => 
      slot.programmeId === selectedProgramme && 
      slot.semester === Number(selectedSemester) &&
      slot.section === selectedSection
    )
  }

  // Get available courses for selected programme and semester
  const getAvailableCourses = () => {
    if (!selectedProgramme || !selectedSemester) return []
    
    const programme = programmes.find(p => p.id === selectedProgramme)
    return courses.filter(course => 
      course.programme === programme?.name && 
      course.semester === Number(selectedSemester)
    )
  }

  // Handle adding new time slot
  const handleAddTimeSlot = () => {
    if (!newSlot.day || !newSlot.startTime || !newSlot.courseId || !newSlot.facultyId || !newSlot.room) {
      alert('Please fill in all required fields')
      return
    }
    
    console.log('Adding new time slot:', {
      ...newSlot,
      programmeId: selectedProgramme,
      semester: Number(selectedSemester)
    })
    
    // Reset form
    setNewSlot({
      day: '',
      startTime: '',
      endTime: '',
      courseId: '',
      facultyId: '',
      room: '',
      section: 'A'
    })
    setShowAddSlotModal(false)
  }

  // Get course and faculty details for a time slot
  const getSlotDetails = (slot: TimeSlot) => {
    const course = courses.find(c => c.id === slot.courseId)
    const faculty = faculties.find(f => f.id === slot.facultyId)
    return { course, faculty }
  }

  // Generate timetable grid
  const generateTimetableGrid = () => {
    const timetableData = getTimetableData()
    const grid: { [key: string]: TimeSlot | null } = {}
    
    daysOfWeek.forEach(day => {
      timeSlotOptions.forEach(timeOption => {
        const key = `${day}-${timeOption.start}`
        const slot = timetableData.find(s => 
          s.day === day && 
          s.startTime === timeOption.start
        )
        grid[key] = slot || null
      })
    })
    
    return grid
  }

  const timetableGrid = generateTimetableGrid()
  const availableCourses = getAvailableCourses()

  return (
    <div className="flex">
      <Sidebar role="admin" />
      
      <div className="flex-1 p-8 bg-gray-50">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Timetable Management</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => setViewMode(viewMode === 'view' ? 'edit' : 'view')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              {viewMode === 'view' ? 'Edit Mode' : 'View Mode'}
            </button>
            {viewMode === 'edit' && (
              <button
                onClick={() => setShowAddSlotModal(true)}
                disabled={!selectedProgramme || !selectedSemester}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Add Time Slot
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Timetable Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Programme *
              </label>
              <select
                value={selectedProgramme}
                onChange={(e) => {
                  setSelectedProgramme(e.target.value)
                  setSelectedSemester('')
                }}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="">Select Programme...</option>
                {programmes.map(programme => (
                  <option key={programme.id} value={programme.id}>
                    {programme.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Semester *
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                disabled={!selectedProgramme}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:bg-gray-100"
              >
                <option value="">Select Semester...</option>
                {selectedProgramme && 
                  Array.from(
                    { length: programmes.find(p => p.id === selectedProgramme)!.duration * 2 }, 
                    (_, i) => i + 1
                  ).map(sem => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))
                }
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Section
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedProgramme('')
                  setSelectedSemester('')
                  setSelectedSection('A')
                }}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Timetable Display */}
        {selectedProgramme && selectedSemester ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 bg-blue-600 text-white">
              <h2 className="text-xl font-semibold">
                {programmes.find(p => p.id === selectedProgramme)?.name} - 
                Semester {selectedSemester} - Section {selectedSection}
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Time
                    </th>
                    {daysOfWeek.map(day => (
                      <th key={day} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {timeSlotOptions.map(timeOption => (
                    <tr key={timeOption.start}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {timeOption.start} - {timeOption.end}
                      </td>
                      {daysOfWeek.map(day => {
                        const key = `${day}-${timeOption.start}`
                        const slot = timetableGrid[key]
                        
                        return (
                          <td key={key} className="px-2 py-3 text-center">
                            {slot ? (
                              <div className="bg-blue-100 border border-blue-300 rounded p-2 min-h-16">
                                <div className="text-sm font-medium text-blue-900">
                                  {getSlotDetails(slot).course?.name}
                                </div>
                                <div className="text-xs text-blue-700">
                                  {getSlotDetails(slot).faculty?.name}
                                </div>
                                <div className="text-xs text-blue-600">
                                  {slot.room}
                                </div>
                                {viewMode === 'edit' && (
                                  <button className="text-red-600 hover:text-red-800 text-xs mt-1">
                                    Remove
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="min-h-16 flex items-center justify-center">
                                {viewMode === 'edit' && (
                                  <button
                                    onClick={() => {
                                      setNewSlot(prev => ({
                                        ...prev,
                                        day,
                                        startTime: timeOption.start,
                                        endTime: timeOption.end
                                      }))
                                      setShowAddSlotModal(true)
                                    }}
                                    className="text-gray-400 hover:text-blue-600 text-xs"
                                  >
                                    + Add
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 mb-4">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-600">Select Programme and Semester</h3>
              <p className="text-gray-500 mt-2">Choose a programme and semester to view the timetable</p>
            </div>
          </div>
        )}

        {/* Add Time Slot Modal */}
        {showAddSlotModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-lg w-full p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Add Time Slot</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Day *
                  </label>
                  <select
                    value={newSlot.day}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, day: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="">Select Day...</option>
                    {daysOfWeek.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Time Slot *
                  </label>
                  <select
                    value={newSlot.startTime}
                    onChange={(e) => {
                      const selectedOption = timeSlotOptions.find(opt => opt.start === e.target.value)
                      setNewSlot(prev => ({ 
                        ...prev, 
                        startTime: e.target.value,
                        endTime: selectedOption?.end || ''
                      }))
                    }}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="">Select Time...</option>
                    {timeSlotOptions.map(option => (
                      <option key={option.start} value={option.start}>
                        {option.start} - {option.end}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Course *
                  </label>
                  <select
                    value={newSlot.courseId}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, courseId: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="">Select Course...</option>
                    {availableCourses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.name} ({course.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Faculty *
                  </label>
                  <select
                    value={newSlot.facultyId}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, facultyId: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="">Select Faculty...</option>
                    {faculties.map(faculty => (
                      <option key={faculty.id} value={faculty.id}>
                        {faculty.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Room *
                  </label>
                  <select
                    value={newSlot.room}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, room: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="">Select Room...</option>
                    {rooms.map(room => (
                      <option key={room.id} value={room.name}>
                        {room.name} ({room.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleAddTimeSlot}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                >
                  Add Time Slot
                </button>
                <button
                  onClick={() => setShowAddSlotModal(false)}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
