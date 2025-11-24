'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  Upload,
  FileText,
  Crown,
  ClipboardList
} from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    {
      label: 'Dashboard',
      href: '/faculty',
      icon: LayoutDashboard
    },
    {
      label: 'My Courses',
      href: '/faculty/courses',
      icon: BookOpen
    },
    {
      label: 'Course Handout (CHO)',
      href: '/faculty/course-handout',
      icon: FileText
    },
    {
      label: 'Coordination',
      href: '/faculty/coordination',
      icon: Crown
    },
    {
      label: 'Upload Content',
      href: '/faculty/upload',
      icon: Upload
    },
    {
      label: 'My Submissions',
      href: '/faculty/submissions',
      icon: FileText
    }
  ]

  return (
    <aside className="w-64 bg-gradient-to-b from-blue-600 to-indigo-600 text-white flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-blue-500">
        <h1 className="text-xl font-bold">Faculty Panel</h1>
        <p className="text-xs text-blue-200">Teaching Portal</p>
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
                  ? 'bg-white text-blue-600'
                  : 'text-blue-100 hover:bg-blue-500'
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
