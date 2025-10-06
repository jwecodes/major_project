'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  role: 'admin' | 'faculty' | 'student'
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()

  const getMenuItems = () => {
    switch (role) {
      case 'admin':
        return [
          // Core Management
          { href: '/admin', label: 'Dashboard', icon: '📊' },
          { href: '/admin/programmes', label: 'Programmes', icon: '🎓' },
          { href: '/admin/courses', label: 'Courses', icon: '📚' },
          { href: '/admin/faculty', label: 'Faculty', icon: '👨‍🏫' },
          { href: '/admin/students', label: 'Students', icon: '👨‍🎓' },
          { href: '/admin/course-coordination', label: 'Course Coordination', icon: '🎯' },
          { href: '/admin/timetable', label: 'Timetable', icon: '📅' },
          { href: '/admin/documents', label: 'Document Management', icon: '📁' },
          { href: '/admin/content-review', label: 'Content Review', icon: '📋' },
          { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
        ]
      
      case 'faculty':
        return [
          { href: '/faculty', label: 'Dashboard', icon: '📊' },
          { href: '/faculty/courses', label: 'My Courses', icon: '📚' },
          { href: '/faculty/coordination', label: 'Course Coordination', icon: '🎯' },
          { href: '/faculty/timetable', label: 'My Timetable', icon: '📅' },
          { href: '/faculty/documents', label: 'Course Documents', icon: '📁' },
          { href: '/faculty/content', label: 'Content Management', icon: '📤' },
          { href: '/faculty/profile', label: 'My Profile', icon: '👤' },
        ]
      
      case 'student':
        return [
          { href: '/student', label: 'Dashboard', icon: '📊' },
          { href: '/student/courses', label: 'My Courses', icon: '📚' },
          { href: '/student/timetable', label: 'My Timetable', icon: '📅' },
          { href: '/student/grades', label: 'Grades', icon: '📈' },
          { href: '/student/documents', label: 'Course Materials', icon: '📁' },
          { href: '/student/assignments', label: 'Assignments', icon: '📝' },
          { href: '/student/profile', label: 'My Profile', icon: '👤' },
        ]
    }
  }

  const getRoleColor = () => {
    const colors = {
      admin: 'bg-indigo-600 text-white',
      faculty: 'bg-emerald-600 text-white', 
      student: 'bg-violet-600 text-white'
    }
    return colors[role]
  }

  const getRoleBadge = () => {
    const badges = {
      admin: '👨‍💼 Admin',
      faculty: '👨‍🏫 Faculty',
      student: '🎓 Student'
    }
    return badges[role]
  }

  const menuItems = getMenuItems()

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen shadow-xl">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <Link href="/" className="block">
          <h1 className="text-2xl font-bold text-white mb-1">
            AcadeX
          </h1>
          <p className="text-xs text-gray-400 mb-3">College Management System</p>
        </Link>
        
        {/* Role Badge */}
        <div className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${getRoleColor()}`}>
          {getRoleBadge()}
        </div>
      </div>
      
      {/* Navigation - Simple List */}
      <nav className="mt-4 px-3 flex-1 max-h-[calc(100vh-200px)] overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${
                pathname === item.href
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="mr-3 text-lg group-hover:scale-110 transition-transform duration-200">
                {item.icon}
              </span>
              <span className="font-medium text-sm">{item.label}</span>
              
              {/* Active Indicator */}
              {pathname === item.href && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
              )}
            </Link>
          ))}
        </div>
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-700 mt-auto">
        <Link
          href="/"
          className="flex items-center px-4 py-2.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200 group"
        >
          <span className="mr-3 group-hover:scale-110 transition-transform duration-200">🏠</span>
          <span className="font-medium text-sm">Back to Home</span>
        </Link>
        
        <div className="mt-3 px-4">
          <p className="text-xs text-gray-500">
            © 2025 AcadeX System
          </p>
        </div>
      </div>
    </div>
  )
}
