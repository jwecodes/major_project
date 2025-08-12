'use client'
import { Sidebar } from '@/components/sidebar'
import { programmes, courses, faculties, timeSlots, students, daysOfWeek, timeSlotOptions } from '@/lib/mokedata'
import { useState } from 'react'

export default function StudentTimetablePage() {
  // Mock current student (in real app, this would come from session)
  const currentStudent = students[0] // Alice Wilson
  
  // Get student's programme details
  const studentProgramme = programmes.find(p => p.name === currentStudent.programme)
  
  // Get timetable for student's programme and year/semester
  const getStudentTimetable = () => {
    if (!studentProgramme) return []
    
    return timeSlots.filter(slot => 
      slot.programmeId === studentProgramme.id && 
      slot.semester <= currentStudent.year * 2 // Assuming current semester based on year
    )
  }

  // Get course and faculty details for a time slot
  const getSlotDetails = (slot: any) => {
    const course = courses.find(c => c.id === slot.courseId)
    const faculty = faculties.find(f => f.id === slot.facultyId)
    return { course, faculty }
  }

  // Generate timetable grid
  const generateTimetableGrid = () => {
    const timetableData = getStudentTimetable()
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
  const studentTimetable = getStudentTimetable()

  return (
    <div className="flex">
      <Sidebar role="student" />
      
      <div className="flex-1 p-8 bg-gray-50">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Timetable</h1>
          <p className="text-gray-600">
            {currentStudent.name} • {currentStudent.programme} • Year {currentStudent.year}
          </p>
        </div>

        {/* Student Info Card */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Academic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-700">Student Name:</span>
              <p className="text-gray-900">{currentStudent.name}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Roll Number:</span>
              <p className="text-gray-900">{currentStudent.rollNumber}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Programme:</span>
              <p className="text-gray-900">{currentStudent.programme}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Current Year:</span>
              <p className="text-gray-900">Year {currentStudent.year}</p>
            </div>
          </div>
        </div>

        {/* Timetable */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-blue-600 text-white">
            <h2 className="text-xl font-semibold">
              Weekly Timetable - {currentStudent.programme}
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
                            <div className="bg-blue-100 border border-blue-300 rounded p-3 min-h-20">
                              <div className="text-sm font-medium text-blue-900 mb-1">
                                {getSlotDetails(slot).course?.name}
                              </div>
                              <div className="text-xs text-blue-700 mb-1">
                                {getSlotDetails(slot).faculty?.name}
                              </div>
                              <div className="text-xs text-blue-600">
                                📍 {slot.room}
                              </div>
                            </div>
                          ) : (
                            <div className="min-h-20 flex items-center justify-center text-gray-400">
                              <span className="text-xs">Free</span>
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

        {/* Course Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">My Courses This Semester</h3>
            <div className="space-y-3">
              {courses.filter(course => course.programme === currentStudent.programme).map(course => (
                <div key={course.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-gray-900">{course.name}</p>
                    <p className="text-sm text-gray-600">{course.code} • {course.credits} credits</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {faculties.find(f => f.id === course.facultyId)?.name || 'TBA'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Timetable Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Classes per Week:</span>
                <span className="font-medium text-gray-900">{studentTimetable.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Credits:</span>
                <span className="font-medium text-gray-900">
                  {courses.filter(c => c.programme === currentStudent.programme)
                    .reduce((sum, course) => sum + course.credits, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Days:</span>
                <span className="font-medium text-gray-900">
                  {[...new Set(studentTimetable.map(slot => slot.day))].length}
                </span>
              </div>
              <div className="pt-3 border-t">
                <p className="text-sm text-gray-600">
                  💡 <strong>Tip:</strong> Check your course materials regularly and don't miss any classes!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
