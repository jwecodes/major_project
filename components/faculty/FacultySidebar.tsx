// // 'use client'
// // import { useState, useEffect } from 'react'
// // import Link from 'next/link'
// // import { usePathname, useRouter } from 'next/navigation'
// // import { 
// //   LayoutDashboard, 
// //   Upload, 
// //   FileText, 
// //   BookOpen, 
// //   LogOut,
// //   Menu,
// //   X
// // } from 'lucide-react'

// // export default function FacultySidebar() {
// //   const pathname = usePathname()
// //   const router = useRouter()
// //   const [faculty, setFaculty] = useState<any>(null)
// //   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

// //   useEffect(() => {
// //     const facultyData = localStorage.getItem('facultyUser')
// //     if (facultyData) {
// //       setFaculty(JSON.parse(facultyData))
// //     } else {
// //       router.push('/faculty/login')
// //     }
// //   }, [router])

// //   const handleLogout = () => {
// //     localStorage.removeItem('facultyUser')
// //     router.push('/faculty/login')
// //   }

// //   const navItems = [
// //     { href: '/faculty/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
// //     { href: '/faculty/upload', icon: Upload, label: 'Upload Content' },
// //     { href: '/faculty/my-content', icon: FileText, label: 'My Content' },
// //     { href: '/faculty/courses', icon: BookOpen, label: 'My Courses' },
// //   ]

// //   return (
// //     <>
// //       {/* Mobile Menu Button */}
// //       <button
// //         onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
// //         className="lg:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white p-2 rounded-lg shadow-lg"
// //       >
// //         {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
// //       </button>

// //       {/* Sidebar */}
// //       <div
// //         className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
// //           isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
// //         }`}
// //       >
// //         <div className="flex flex-col h-full">
// //           {/* Header */}
// //           <div className="p-6 border-b border-gray-200">
// //             <div className="flex items-center gap-3 mb-4">
// //               <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
// //                 <BookOpen className="h-6 w-6 text-white" />
// //               </div>
// //               <div>
// //                 <h1 className="font-bold text-gray-900">Faculty Portal</h1>
// //                 <p className="text-xs text-gray-500">TCMS</p>
// //               </div>
// //             </div>
            
// //             {faculty && (
// //               <div className="bg-blue-50 rounded-lg p-3">
// //                 <p className="font-semibold text-gray-900 text-sm">{faculty.name}</p>
// //                 <p className="text-xs text-gray-600">{faculty.designation}</p>
// //                 <p className="text-xs text-blue-600 mt-1">{faculty.facultyId}</p>
// //               </div>
// //             )}
// //           </div>

// //           {/* Navigation */}
// //           <nav className="flex-1 p-4 space-y-1">
// //             {navItems.map((item) => {
// //               const isActive = pathname === item.href
// //               return (
// //                 <Link
// //                   key={item.href}
// //                   href={item.href}
// //                   onClick={() => setIsMobileMenuOpen(false)}
// //                   className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
// //                     isActive
// //                       ? 'bg-blue-600 text-white'
// //                       : 'text-gray-700 hover:bg-gray-100'
// //                   }`}
// //                 >
// //                   <item.icon className="h-5 w-5" />
// //                   <span className="font-medium">{item.label}</span>
// //                 </Link>
// //               )
// //             })}
// //           </nav>

// //           {/* Logout */}
// //           <div className="p-4 border-t border-gray-200">
// //             <button
// //               onClick={handleLogout}
// //               className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
// //             >
// //               <LogOut className="h-5 w-5" />
// //               <span className="font-medium">Logout</span>
// //             </button>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Overlay for mobile */}
// //       {isMobileMenuOpen && (
// //         <div
// //           className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
// //           onClick={() => setIsMobileMenuOpen(false)}
// //         />
// //       )}
// //     </>
// //   )
// // }

// 'use client'
// import { useState, useEffect } from 'react'
// import Link from 'next/link'
// import { usePathname, useRouter } from 'next/navigation'
// import { 
//   LayoutDashboard, 
//   Upload, 
//   FileText, 
//   BookOpen, 
//   LogOut,
//   Menu,
//   X,
//   CheckCircle
// } from 'lucide-react'


// export default function FacultySidebar() {
//   const pathname = usePathname()
//   const router = useRouter()
//   const [faculty, setFaculty] = useState<any>(null)
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
//   const [mounted, setMounted] = useState(false)


//   useEffect(() => {
//     setMounted(true)

//     const facultyData = localStorage.getItem('faculty') // ✅ Fixed key
//     const facultyId = localStorage.getItem('facultyId')

//     if (facultyData && facultyId) {
//       try {
//         setFaculty(JSON.parse(facultyData))
//       } catch (err) {
//         console.error('Error parsing faculty data:', err)
//         handleLogout()
//       }
//     } else {
//       // Only redirect if we're on a faculty page
//       if (pathname?.startsWith('/faculty') && pathname !== '/faculty/login') {
//         router.push('/faculty/login')
//       }
//     }
//   }, [router, pathname])


//   const handleLogout = () => {
//     localStorage.removeItem('faculty') // ✅ Fixed key
//     localStorage.removeItem('facultyId')
//     router.push('/faculty/login')
//   }


//   const navItems = [
//     { href: '/faculty/dashboard', icon: LayoutDashboard, label: 'Dashboard', description: 'Overview' },
//     { href: '/faculty/courses', icon: BookOpen, label: 'My Courses', description: 'Assigned courses' },
//     { href: '/faculty/upload', icon: Upload, label: 'Upload Content', description: 'Share materials' },
//     { href: '/faculty/my-content', icon: FileText, label: 'My Content', description: 'Track uploads' },
//   ]


//   // Don't render until mounted to avoid hydration issues
//   if (!mounted) {
//     return null
//   }


//   return (
//     <>
//       {/* Mobile Menu Button */}
//       <button
//         onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//         className="lg:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white p-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
//         aria-label="Toggle menu"
//       >
//         {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
//       </button>


//       {/* Sidebar */}
//       <div
//         className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
//           isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
//         }`}
//       >
//         <div className="flex flex-col h-full overflow-y-auto">
//           {/* Header */}
//           <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
//             <div className="flex items-center gap-3 mb-4">
//               <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
//                 <BookOpen className="h-6 w-6 text-white" />
//               </div>
//               <div className="min-w-0">
//                 <h1 className="font-bold text-gray-900 text-sm truncate">Faculty Portal</h1>
//                 <p className="text-xs text-gray-500">TCMS</p>
//               </div>
//             </div>
            
//             {faculty ? (
//               <div className="bg-blue-50 rounded-lg p-3">
//                 <p className="font-semibold text-gray-900 text-sm truncate">{faculty.name}</p>
//                 <p className="text-xs text-gray-600 truncate">{faculty.designation}</p>
//                 <p className="text-xs text-blue-600 mt-1 truncate">📌 {faculty.facultyId}</p>
//               </div>
//             ) : (
//               <div className="bg-gray-100 rounded-lg p-3 animate-pulse">
//                 <div className="h-4 bg-gray-300 rounded mb-2"></div>
//                 <div className="h-3 bg-gray-300 rounded w-3/4"></div>
//               </div>
//             )}
//           </div>


//           {/* Navigation */}
//           <nav className="flex-1 p-4 space-y-1">
//             <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold px-2 mb-2">
//               Main Menu
//             </div>

//             {navItems.map((item) => {
//               const isActive = pathname === item.href
//               return (
//                 <Link
//                   key={item.href}
//                   href={item.href}
//                   onClick={() => setIsMobileMenuOpen(false)}
//                   className={`flex items-start gap-3 px-4 py-3 rounded-lg transition-all group ${
//                     isActive
//                       ? 'bg-blue-600 text-white shadow-md'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                   title={`${item.label} - ${item.description}`}
//                 >
//                   <item.icon className={`h-5 w-5 flex-shrink-0 mt-0.5 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
//                   <div className="min-w-0 flex-1">
//                     <div className="font-medium text-sm leading-tight">{item.label}</div>
//                     <div className={`text-xs leading-tight mt-0.5 ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
//                       {item.description}
//                     </div>
//                   </div>
//                 </Link>
//               )
//             })}
//           </nav>


//           {/* Footer Info */}
//           {faculty && (
//             <div className="p-4 bg-blue-50 border-t border-gray-200 text-xs text-gray-600 text-center">
//               <p>👋 Welcome, {faculty.name.split(' ')[0]}</p>
//               <p className="mt-1">Logged in as {faculty.designation}</p>
//             </div>
//           )}


//           {/* Logout */}
//           <div className="p-4 border-t border-gray-200 sticky bottom-0 bg-white">
//             <button
//               onClick={handleLogout}
//               className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
//             >
//               <LogOut className="h-5 w-5 flex-shrink-0" />
//               <span className="truncate">Logout</span>
//             </button>
//           </div>
//         </div>
//       </div>


//       {/* Overlay for mobile */}
//       {isMobileMenuOpen && (
//         <div
//           className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity"
//           onClick={() => setIsMobileMenuOpen(false)}
//           role="button"
//           tabIndex={-1}
//           aria-label="Close menu"
//         />
//       )}
//     </>
//   )
// }
