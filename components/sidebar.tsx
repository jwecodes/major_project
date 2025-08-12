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
          { href: '/admin', label: 'Dashboard', icon: '📊' },
          { href: '/admin/programmes', label: 'Programmes', icon: '🎓' },
          { href: '/admin/faculties', label: 'Faculties', icon: '👨‍🏫' },
          { href: '/admin/students', label: 'Students', icon: '👨‍🎓' },
          { href: '/admin/courses', label: 'All Courses', icon: '📚' },
          { href: '/admin/timetable', label: 'Timetable', icon: '📅' },
          { href: '/admin/content-review', label: 'Content Review', icon: '📋' },
        ]
      case 'faculty':
        return [
          { href: '/faculty', label: 'Dashboard', icon: '📊' },
          { href: '/faculty/courses', label: 'My Courses', icon: '📚' },
          { href: '/faculty/content', label: 'Content Management', icon: '📤' }, // Added this line
          { href: '/faculty/timetable', label: 'My Timetable', icon: '📅' },
        ]
      case 'student':
        return [
          { href: '/student', label: 'Dashboard', icon: '📊' },
          { href: '/student/courses', label: 'My Courses', icon: '📚' },
          { href: '/student/timetable', label: 'My Timetable', icon: '📅' },
        ]
    }
  }

  return (
    <div className="w-64 bg-gray-800 text-white min-h-screen">
      <div className="p-4">
        <Link href="/" className="text-xl font-bold hover:text-gray-300">
          University Portal
        </Link>
        <p className="text-sm text-gray-300 capitalize">{role} Panel</p>
      </div>
      
      <nav className="mt-8">
        {getMenuItems().map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-4 py-3 hover:bg-gray-700 transition-colors ${
              pathname === item.href ? 'bg-gray-700' : ''
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            {item.label}
          </Link>
        ))}
        
        <Link
          href="/"
          className="flex items-center px-4 py-3 hover:bg-gray-700 mt-4 transition-colors"
        >
          <span className="mr-3">🏠</span>
          Back to Home
        </Link>
      </nav>
    </div>
  )
}
