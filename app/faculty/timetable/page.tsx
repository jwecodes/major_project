'use client'
import { Sidebar } from '@/components/sidebar'
import { courses, faculties, timeSlots, daysOfWeek, timeSlotOptions } from '@/lib/mokedata'
import { useState } from 'react'

export default function FacultyTimetablePage() {
  // Mock current faculty (in real app, this would come from session)
  const currentFaculty = faculties[0] // Dr. John Smith
  
  // Get faculty's assigned courses
  const facultyCourses = courses.filter(course => course.facultyId === currentFaculty.id)
  
  // Get timetable for faculty's courses
  const getFacultyTimetable = () => {
    return timeSlots.filter(slot => slot.facultyId === currentFaculty.id)
  }

  // Get course details for a time slot
  const getSlotDetails = (slot: any) => {
    const course = courses.find(c => c.id === slot.courseId)
    return { course }
  }

  // Generate timetable grid
  const generateTimetableGrid = () => {
    const timetableData = getFacultyTimetable()
    const grid: { [key: string]: any } = {}
    
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
  const facultyTimetable = getFacultyTimetable()

  // Calculate weekly stats
  const weeklyStats = {
    totalClasses: facultyTimetable.length,
    totalHours: facultyTimetable.length * 1.5, // Assuming 1.5 hours per class
    activeDays: [...new Set(facultyTimetable.map(slot => slot.day))].length,
    courses: facultyCourses.length
  }

  return (
    <div className="flex">
      <Sidebar role="faculty" />
      
      <div className="flex-1 p-8 bg-gray-50">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Teaching Timetable</h1>
          <p className="text-gray-600">
            {currentFaculty.name} • {currentFaculty.department} Department
          </p>
        </div>

        {/* Faculty Info & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Faculty Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Employee ID:</span>
                <span className="font-medium text-gray-900">{currentFaculty.employeeId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Department:</span>
                <span className="font-medium text-gray-900">{currentFaculty.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium text-gray-900">{currentFaculty.email}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Weekly Teaching Load</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Classes:</span>
                <span className="font-medium text-blue-600">{weeklyStats.totalClasses}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Teaching Hours:</span>
                <span className="font-medium text-green-600">{weeklyStats.totalHours} hrs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Days:</span>
                <span className="font-medium text-purple-600">{weeklyStats.activeDays}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Courses Teaching:</span>
                <span className="font-medium text-orange-600">{weeklyStats.courses}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timetable */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-4 bg-green-600 text-white">
            <h2 className="text-xl font-semibold">
              Weekly Teaching Schedule
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
                            <div className="bg-green-100 border border-green-300 rounded p-3 min-h-20">
                              <div className="text-sm font-medium text-green-900 mb-1">
                                {getSlotDetails(slot).course?.name}
                              </div>
                              <div className="text-xs text-green-700 mb-1">
                                {getSlotDetails(slot).course?.code}
                              </div>
                              <div className="text-xs text-green-600">
                                📍 {slot.room}
                              </div>
                              <div className="text-xs text-green-600 mt-1">
                                Sem {slot.semester}
                              </div>
                            </div>
                          ) : (
                            <div className="min-h-20 flex items-center justify-center text-gray-400">
                              <span className="text-xs">Free Period</span>
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

        {/* Course Details */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">My Courses</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {facultyCourses.map(course => (
              <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">{course.name}</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>📚 Code: {course.code}</p>
                  <p>⭐ Credits: {course.credits}</p>
                  <p>📖 Semester: {course.semester}</p>
                  <p>🎓 Programme: {course.programme}</p>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Classes per week: {facultyTimetable.filter(slot => slot.courseId === course.id).length}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
