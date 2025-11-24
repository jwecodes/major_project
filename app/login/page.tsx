// 'use client'
// import { useState, useEffect } from 'react'
// import { sendOTP, verifyOTP } from '@/app/actions/auth'
// import { useRouter, useSearchParams } from 'next/navigation'
// import { Mail, Lock, ArrowRight, Loader } from 'lucide-react'

// export default function LoginPage() {
//   const [email, setEmail] = useState('')
//   const [otp, setOtp] = useState('')
//   const [step, setStep] = useState<'email' | 'otp'>('email')
//   const [loading, setLoading] = useState(false)
//   const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
//   const [countdown, setCountdown] = useState(0)
  
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const redirect = searchParams.get('redirect')

//   useEffect(() => {
//     if (countdown > 0) {
//       const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
//       return () => clearTimeout(timer)
//     }
//   }, [countdown])

//   const handleSendOTP = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setLoading(true)
//     setMessage(null)

//     const cleanEmail = email.toLowerCase().trim()
//     const formData = new FormData()
//     formData.append('email', cleanEmail)

//     try {
//       const result = await sendOTP(formData)

//       if (result.error) {
//         setMessage({ type: 'error', text: result.error })
//       } else {
//         // 🔹 SAVE CURRENT EMAIL FOR FACULTY PAGES
//         if (typeof window !== 'undefined') {
//           localStorage.setItem('facultyEmail', cleanEmail)
//         }

//         setMessage({ type: 'success', text: result.message || 'OTP sent to your email!' })
//         setStep('otp')
//         setCountdown(300) // 5 minutes
//       }
//     } catch (error) {
//       setMessage({ type: 'error', text: 'Failed to send OTP. Please try again.' })
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleVerifyOTP = async (e: React.FormEvent) => {
//     e.preventDefault()
    
//     // Validate OTP format
//     const cleanOtp = otp.trim()
//     if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
//       setMessage({ type: 'error', text: 'OTP must be exactly 6 digits' })
//       return
//     }

//     setLoading(true)
//     setMessage(null)

//     const formData = new FormData()
//     formData.append('email', email.toLowerCase().trim())
//     formData.append('otp', cleanOtp)

//     try {
//       const result = await verifyOTP(formData)

//       if (result?.error) {
//         setMessage({ type: 'error', text: result.error })
//       }
//       // If successful, the server action will redirect automatically
//     } catch (error: any) {
//       console.error('Verify OTP error:', error)
      
//       // Check if it's a redirect (successful login)
//       if (error?.message === 'NEXT_REDIRECT') {
//         return // Let the redirect happen
//       }
      
//       setMessage({ type: 'error', text: 'Failed to verify OTP. Please try again.' })
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleResendOTP = async () => {
//     setOtp('')
//     setMessage(null)
//     await handleSendOTP(new Event('submit') as any)
//   }

//   const formatTime = (seconds: number) => {
//     const mins = Math.floor(seconds / 60)
//     const secs = seconds % 60
//     return `${mins}:${secs.toString().padStart(2, '0')}`
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">Teaching Portal</h1>
//           <p className="text-gray-600">
//             {step === 'email' ? 'Enter your email to continue' : 'Enter the OTP sent to your email'}
//           </p>
//         </div>

//         {/* Messages */}
//         {message && (
//           <div className={`mb-6 p-4 rounded-lg ${
//             message.type === 'success' 
//               ? 'bg-green-50 text-green-700 border border-green-200' 
//               : 'bg-red-50 text-red-700 border border-red-200'
//           }`}>
//             {message.text}
//           </div>
//         )}

//         {step === 'email' ? (
//           <form onSubmit={handleSendOTP} className="space-y-6">
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//                 Email Address
//               </label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                 <input
//                   id="email"
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="your.email@university.edu"
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
//                   required
//                   disabled={loading}
//                 />
//               </div>
//             </div>

//             <button
//               type="submit"
//               disabled={loading || !email}
//               className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
//             >
//               {loading ? (
//                 <>
//                   <Loader className="h-5 w-5 animate-spin" />
//                   Sending...
//                 </>
//               ) : (
//                 <>
//                   Send OTP
//                   <ArrowRight className="h-5 w-5" />
//                 </>
//               )}
//             </button>
//           </form>
//         ) : (
//           <form onSubmit={handleVerifyOTP} className="space-y-6">
//             <div>
//               <label htmlFor="email-display" className="block text-sm font-medium text-gray-700 mb-2">
//                 Email
//               </label>
//               <input
//                 id="email-display"
//                 type="email"
//                 value={email}
//                 disabled
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
//               />
//             </div>

//             <div>
//               <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
//                 One-Time Password
//               </label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                 <input
//                   id="otp"
//                   type="text"
//                   value={otp}
//                   onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
//                   placeholder="Enter 6-digit OTP"
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-center text-2xl tracking-widest"
//                   maxLength={6}
//                   required
//                   disabled={loading}
//                   autoFocus
//                 />
//               </div>
//             </div>

//             {countdown > 0 && (
//               <p className="text-center text-sm text-gray-600">
//                 OTP expires in <span className="font-bold text-blue-600">{formatTime(countdown)}</span>
//               </p>
//             )}

//             <button
//               type="submit"
//               disabled={loading || otp.length !== 6}
//               className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
//             >
//               {loading ? (
//                 <>
//                   <Loader className="h-5 w-5 animate-spin" />
//                   Verifying...
//                 </>
//               ) : (
//                 'Verify & Sign In'
//               )}
//             </button>

//             <div className="flex justify-between text-sm">
//               <button
//                 type="button"
//                 onClick={() => {
//                   setStep('email')
//                   setOtp('')
//                   setMessage(null)
//                 }}
//                 className="text-gray-600 hover:text-gray-900"
//               >
//                 ← Change email
//               </button>
//               <button
//                 type="button"
//                 onClick={handleResendOTP}
//                 disabled={loading}
//                 className="text-blue-600 hover:text-blue-800 disabled:text-gray-400"
//               >
//                 Resend OTP
//               </button>
//             </div>
//           </form>
//         )}
//       </div>
//     </div>
//   )
// }

'use client'

import { useState, useEffect } from 'react'
import { sendOTP, verifyOTP } from '@/app/actions/auth'
import { useSearchParams } from 'next/navigation'
import { Mail, Lock, ArrowRight, Loader } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [countdown, setCountdown] = useState(0)

  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') // kept for future use if you need it

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((s) => s - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const cleanEmail = email.toLowerCase().trim()
    const formData = new FormData()
    formData.append('email', cleanEmail)

    try {
      const result = await sendOTP(formData)

      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        // Store email for faculty portal pages
        if (typeof window !== 'undefined') {
          localStorage.setItem('facultyEmail', cleanEmail)
          // If you ever store facultyId elsewhere, you can also clear it here:
          // localStorage.removeItem('facultyId')
        }

        setMessage({
          type: 'success',
          text: result.message || 'OTP sent to your email!',
        })
        setStep('otp')
        setCountdown(300) // 5 minutes
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to send OTP. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()

    const cleanOtp = otp.trim()
    if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      setMessage({ type: 'error', text: 'OTP must be exactly 6 digits' })
      return
    }

    setLoading(true)
    setMessage(null)

    const formData = new FormData()
    formData.append('email', email.toLowerCase().trim())
    formData.append('otp', cleanOtp)

    try {
      const result = await verifyOTP(formData)

      if (result?.error) {
        setMessage({ type: 'error', text: result.error })
      }
      // On success, the server action will redirect automatically
    } catch (error: any) {
      console.error('Verify OTP error:', error)

      if (error?.message === 'NEXT_REDIRECT') {
        // Successful login; Next.js is handling the redirect
        return
      }

      setMessage({
        type: 'error',
        text: 'Failed to verify OTP. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setOtp('')
    setMessage(null)
    await handleSendOTP(new Event('submit') as any)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-10 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Teaching Portal</h1>
          <p className="text-gray-600 text-sm">
            {step === 'email'
              ? 'Enter your email to continue'
              : 'Enter the OTP sent to your email'}
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@university.edu"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send OTP
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label
                htmlFor="email-display"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                id="email-display"
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                One-Time Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  placeholder="Enter 6-digit OTP"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-center text-2xl tracking-[0.4em]"
                  maxLength={6}
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>

            {countdown > 0 && (
              <p className="text-center text-xs text-gray-600">
                OTP expires in{' '}
                <span className="font-semibold text-blue-600">
                  {formatTime(countdown)}
                </span>
              </p>
            )}

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify & Sign In'
              )}
            </button>

            <div className="flex justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  setStep('email')
                  setOtp('')
                  setMessage(null)
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Change email
              </button>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                className="text-blue-600 hover:text-blue-800 disabled:text-gray-400"
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
