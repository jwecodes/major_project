'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  FileText,
} from 'lucide-react'

export default function StudentSidebar() {
  const pathname = usePathname()

  const navItems = [
    {
      label: 'Dashboard',
      href: '/student',
      icon: LayoutDashboard,
    },
    {
      label: 'My Courses',
      href: '/student/courses',
      icon: BookOpen,
    },
    {
      label: 'Content Library',
      href: '/student/content',
      icon: FileText,
    },
  ]

  return (
    <aside className="w-64 bg-gradient-to-b from-blue-600 to-indigo-600 text-white flex flex-col">
      {/* Logo / title */}
      <div className="p-4 border-b border-blue-500">
        <h1 className="text-xl font-bold">Student Panel</h1>
        <p className="text-xs text-blue-200">Teaching Portal</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href ||
            (item.href !== '/student' && pathname.startsWith(item.href))

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

      {/* Optional small footer */}
      <div className="p-4 border-t border-blue-500 text-[11px] text-blue-100">
        Academic Session 2024–25
      </div>
    </aside>
  )
}
