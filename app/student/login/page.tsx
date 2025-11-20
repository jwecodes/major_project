// 'use client'
// import { useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { GraduationCap, Lock, Mail } from 'lucide-react'
// import toast, { Toaster } from 'react-hot-toast'

// export default function StudentLoginPage() {
//   const router = useRouter()
//   const [email, setEmail] = useState('')
//   const [loading, setLoading] = useState(false)

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setLoading(true)

//     try {
//       const response = await fetch('/api/auth/student-login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email })
//       })

//       const data = await response.json()

//       if (data.success) {
//         localStorage.setItem('studentUser', JSON.stringify(data.student))
//         toast.success('Login successful!')
//         router.push('/student/dashboard')
//       } else {
//         toast.error(data.error || 'Login failed')
//       }
//     } catch (error) {
//       toast.error('An error occurred. Please try again.')
//     }

//     setLoading(false)
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
//       <Toaster position="top-right" />
      
//       <div className="w-full max-w-md">
//         {/* Logo/Header */}
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
//             <GraduationCap className="h-8 w-8 text-white" />
//           </div>
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Portal</h1>
//           <p className="text-gray-600">Access your course materials and resources</p>
//         </div>

//         {/* Login Form */}
//         <div className="bg-white rounded-2xl shadow-xl p-8">
//           <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome Back</h2>
          
//           <form onSubmit={handleLogin} className="space-y-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Student Email Address
//               </label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                 <input
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="your.email@university.edu"
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
//                   required
//                 />
//               </div>
//               <p className="text-xs text-gray-500 mt-2">
//                 Use your registered university email address
//               </p>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 font-semibold flex items-center justify-center gap-2 transition-colors"
//             >
//               {loading ? (
//                 <>
//                   <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                   Signing in...
//                 </>
//               ) : (
//                 <>
//                   <Lock className="h-5 w-5" />
//                   Sign In
//                 </>
//               )}
//             </button>
//           </form>

//           <div className="mt-6 pt-6 border-t border-gray-200">
//             <p className="text-sm text-gray-600 text-center">
//               Need help? Contact your administrator
//             </p>
//           </div>
//         </div>

//         {/* Footer */}
//         <p className="text-center text-sm text-gray-500 mt-8">
//           © 2025 University Teaching Content Management System
//         </p>
//       </div>
//     </div>
//   )
// }
