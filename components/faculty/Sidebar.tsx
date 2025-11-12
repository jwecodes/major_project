'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  BookOpen, 
  Upload, 
  FileText,
  CheckCircle,
  LogOut,
  Menu,
  X
} from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [faculty, setFaculty] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const facultyData = localStorage.getItem('faculty')
    if (facultyData) {
      setFaculty(JSON.parse(facultyData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('faculty')
    localStorage.removeItem('facultyId')
    router.push('/faculty/login')
  }

  const navItems = [
    { href: '/faculty/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/faculty/upload', icon: Upload, label: 'Upload Content' },
    { href: '/faculty/courses', icon: BookOpen, label: 'My Courses' },
    { href: '/faculty/submissions', icon: FileText, label: 'My Submissions' },
    { href: '/faculty/approvals', icon: CheckCircle, label: 'Approvals' },
  ]

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  if (!mounted) return null

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 shadow-sm transform transition-transform duration-300 z-40 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full flex flex-col overflow-y-auto">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">Faculty</h1>
            </div>
            
            {faculty && (
              <div className="bg-blue-50 rounded-lg p-3 text-sm border border-blue-100">
                <p className="font-semibold text-gray-900 truncate">{faculty.name}</p>
                <p className="text-gray-600 text-xs truncate">{faculty.designation}</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold px-2 mb-3">
              Menu
            </div>
            {navItems.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200 sticky bottom-0 bg-white">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm border border-red-200"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
