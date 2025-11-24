'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  FileText,
  Settings,
  Building2,
  Award
} from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    {
      label: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard
    },
    {
      label: 'Programmes',
      href: '/admin/programmes',
      icon: Building2
    },
    {
      label: 'Courses',
      href: '/admin/courses',
      icon: BookOpen
    },
    {
      label: 'Faculty',
      href: '/admin/faculty',
      icon: GraduationCap
    },
    {
      label: 'Students',
      href: '/admin/students',
      icon: Users
    },
    {
      label: 'Course Coordination',
      href: '/admin/course-coordination',
      icon: Award // or use any appropriate icon
    },
    {
      label: 'Content Approval',
      href: '/admin/content-approval',
      icon: FileText
    },
    {
      label: 'Settings',
      href: '/admin/settings',
      icon: Settings
    }
  ]

  return (
    <aside className="w-64 bg-gradient-to-b from-purple-600 to-indigo-600 text-white flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-purple-500">
        <h1 className="text-xl font-bold">Admin Panel</h1>
        <p className="text-xs text-purple-200">Teaching Portal</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-white text-purple-600'
                  : 'text-purple-100 hover:bg-purple-500'
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
