// 'use client'
// import { useState } from 'react'
// import { useRouter } from 'next/navigation'

// export default function FacultyLogin() {
//   const router = useRouter()
//   const [email, setEmail] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError('')
//     setLoading(true)

//     try {
//       const res = await fetch('/api/faculty/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email: email.trim().toLowerCase() })
//       })

//       const data = await res.json()

//       if (!data.success) {
//         setError(data.error)
//         setLoading(false)
//         return
//       }

//       localStorage.setItem('faculty', JSON.stringify(data.faculty))
//       localStorage.setItem('facultyId', data.faculty.id)
      
//       router.push('/faculty/dashboard')
//     } catch (err: any) {
//       setError(err.message)
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-blue-600 flex items-center justify-center p-4">
//       <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
//         <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Faculty Login</h1>
        
//         {error && <div className="p-3 bg-red-100 text-red-700 rounded mb-4 text-sm">{error}</div>}

//         <form onSubmit={handleLogin} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="your@email.com"
//               className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
//               required
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
//           >
//             {loading ? 'Logging in...' : 'Login'}
//           </button>
//         </form>
//       </div>
//     </div>
//   )
// }

'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader, AlertCircle } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

export default function FacultyLogin() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!email || !email.includes('@')) {
        setError('Please enter a valid email address')
        setLoading(false)
        return
      }

      const res = await fetch(`/api/faculty/verify?email=${encodeURIComponent(email)}`)
      const data = await res.json()

      if (!data.success) {
        setError('No faculty account found with this email')
        setLoading(false)
        return
      }

      // Store in localStorage
      localStorage.setItem('facultyEmail', email)
      localStorage.setItem('facultyId', data.facultyId)
      
      toast.success('Login successful!')
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push('/faculty')
      }, 500)
    } catch (error) {
      console.error('Error:', error)
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center p-4">
      <Toaster position="top-right" />

      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Faculty Login</h1>
          <p className="text-gray-600 mb-6">Enter your email to access your dashboard</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                placeholder="your.email@university.edu"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">Use your registered university email</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Not a faculty member? <a href="/" className="text-blue-600 hover:text-blue-700 font-medium">Go Home</a>
          </p>
        </div>
      </div>
    </div>
  )
}
