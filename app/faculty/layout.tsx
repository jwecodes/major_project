'use client'
import { ReactNode, useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, BookOpen, Upload, FileText, LogOut, Menu, X, Crown } from 'lucide-react'

export default function FacultyLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    // Check if we're on login page
    if (pathname === '/faculty/login') {
      return
    }

    // Get email from localStorage
    const storedEmail = localStorage.getItem('facultyEmail')
    
    if (!storedEmail) {
      // Not logged in, redirect to login
      router.push('/faculty/login')
      return
    }

    setEmail(storedEmail)
  }, [pathname, router])

  // If on login page, don't show layout
  if (pathname === '/faculty/login') {
    return <>{children}</>
  }

  // If not logged in and not on login page, don't render anything yet
  if (!email) {
    return null
  }

    const navItems = [
    {
      label: 'Dashboard',
      href: '/faculty',
      icon: LayoutDashboard,
      active: pathname === '/faculty'
    },
    {
      label: 'My Courses',
      href: '/faculty/courses',
      icon: BookOpen,
      active: pathname === '/faculty/courses'
    },
    {
      label: 'Course Handout (CHO)',
      href: '/faculty/course-handout',
      icon: FileText,
      active: pathname === '/faculty/course-handout'
    },
    {
      label: 'Coordination',
      href: '/faculty/coordination',
      icon: Crown, // Import Crown from lucide-react
      active: pathname === '/faculty/coordination'
    },
    {
      label: 'Lesson Plans',
      href: '/faculty/lesson-plans',
      icon: FileText,  // or use a different icon
      active: pathname === '/faculty/lesson-plans'
    },
    {
      label: 'Upload Content',
      href: '/faculty/upload',
      icon: Upload,
      active: pathname === '/faculty/upload'
    },
    {
      label: 'My Submissions',
      href: '/faculty/submissions',
      icon: FileText,
      active: pathname === '/faculty/submissions'
    }
  ]

  const handleLogout = () => {
    localStorage.removeItem('facultyEmail')
    localStorage.removeItem('facultyId')
    router.push('/faculty/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-blue-600 to-indigo-600 text-white transition-all duration-300 flex flex-col fixed h-screen`}>
        {/* Logo */}
        <div className="p-4 border-b border-blue-500">
          <div className="flex items-center justify-between">
            {sidebarOpen && <h1 className="text-lg font-bold">Faculty Panel</h1>}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 hover:bg-blue-500 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* User Email */}
        {sidebarOpen && (
          <div className="p-4 border-b border-blue-500">
            <p className="text-xs text-blue-100 mb-1">Logged in as</p>
            <p className="text-sm font-medium text-white truncate">{email}</p>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  item.active
                    ? 'bg-white text-blue-600'
                    : 'text-blue-100 hover:bg-blue-500'
                }`}
                title={sidebarOpen ? '' : item.label}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-blue-500">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-blue-100 hover:bg-blue-500 transition-colors"
            title={sidebarOpen ? '' : 'Logout'}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`${sidebarOpen ? 'ml-64' : 'ml-20'} flex-1 flex flex-col transition-all duration-300`}>
        {/* Top Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Faculty Dashboard</h1>
          <p className="text-gray-600 text-sm">Manage your courses and teaching materials</p>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
