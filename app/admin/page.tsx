'use client'
import { useEffect, useState } from 'react'
import { getDashboardStats } from '@/app/actions/admin'
import { GraduationCap, BookOpen, Users, Clock } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProgrammes: 0,
    totalCourses: 0,
    totalFaculty: 0,
    pendingApprovals: 0
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const data = await getDashboardStats()
    setStats(data)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Programmes</p>
              <p className="text-3xl font-bold mt-1">{stats.totalProgrammes}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <GraduationCap className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Courses</p>
              <p className="text-3xl font-bold mt-1">{stats.totalCourses}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Faculty</p>
              <p className="text-3xl font-bold mt-1">{stats.totalFaculty}</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending Approvals</p>
              <p className="text-3xl font-bold mt-1">{stats.pendingApprovals}</p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
        </div>
        <div className="p-6 grid grid-cols-3 gap-4">
          <a href="/admin/programmes" className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition">
            <h3 className="font-semibold text-blue-700">Manage Programmes</h3>
            <p className="text-sm text-gray-600 mt-1">Add or edit academic programmes</p>
          </a>
          <a href="/admin/courses" className="p-4 border-2 border-green-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition">
            <h3 className="font-semibold text-green-700">Manage Courses</h3>
            <p className="text-sm text-gray-600 mt-1">Add or edit course details</p>
          </a>
          <a href="/admin/course-coordination" className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition">
            <h3 className="font-semibold text-purple-700">Course Coordination</h3>
            <p className="text-sm text-gray-600 mt-1">Allocate faculty to courses</p>
          </a>
        </div>
      </div>
    </div>
  )
}
