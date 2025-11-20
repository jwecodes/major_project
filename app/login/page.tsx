// // 'use client'

// // import { useState, FormEvent } from 'react'
// // import { useRouter } from 'next/navigation'
// // import { useAuth } from '@/contexts/AuthContext'

// // export default function LoginPage() {
// //   const router = useRouter()
// //   const { signInWithOtp, verifyOtp } = useAuth()
// //   const [email, setEmail] = useState('')
// //   const [otp, setOtp] = useState('')
// //   const [step, setStep] = useState<'email' | 'otp'>('email')
// //   const [submitting, setSubmitting] = useState(false)
// //   const [error, setError] = useState<string | null>(null)
// //   const [successMsg, setSuccessMsg] = useState<string | null>(null)

// //   async function handleSendOtp(e: FormEvent) {
// //     e.preventDefault()
// //     setSubmitting(true)
// //     setError(null)
// //     setSuccessMsg(null)
// //     try {
// //       await signInWithOtp(email)
// //       setStep('otp')
// //       setSuccessMsg("OTP sent! Please check your email.")
// //     } catch (err: any) {
// //       setError(err.message ?? 'Failed to send OTP')
// //     } finally {
// //       setSubmitting(false)
// //     }
// //   }

// //   async function handleVerifyOtp(e: FormEvent) {
// //     e.preventDefault()
// //     setSubmitting(true)
// //     setError(null)
// //     setSuccessMsg(null)
// //     try {
// //       await verifyOtp(email, otp)
// //       setSuccessMsg("Login successful! Redirecting…")
// //       setTimeout(() => router.replace('/dashboard'), 500)
// //     } catch (err: any) {
// //       setError(err.message ?? 'Invalid or expired OTP')
// //     } finally {
// //       setSubmitting(false)
// //     }
// //   }

// //   return (
// //     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-sky-200 to-indigo-100">
// //       <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl p-8 sm:p-10 flex flex-col items-center">
// //         <span className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 shadow mb-4">
// //           {/* Beautiful login lock icon */}
// //           <svg
// //             className="h-8 w-8 text-blue-500"
// //             fill="none"
// //             stroke="currentColor"
// //             strokeWidth={2}
// //             viewBox="0 0 24 24"
// //           >
// //             <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.657 0 3-1.343 3-3V6a3 3 0 10-6 0v2c0 1.657 1.343 3 3 3zm7 8v-5a5 5 0 00-10 0v5m10 0H5"/>
// //           </svg>
// //         </span>
// //         <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-blue-800 text-center">Welcome Back!</h2>
// //         <p className="mb-4 text-gray-500 text-center">Sign in with your institutional email</p>

// //         {successMsg && <div className="w-full mb-3 py-2 px-4 bg-green-100 border border-green-300 text-green-700 rounded text-center">{successMsg}</div>}
// //         {error && <div className="w-full mb-3 py-2 px-4 bg-red-100 border border-red-300 text-red-700 rounded text-center">{error}</div>}

// //         {step === 'email' ? (
// //           <form onSubmit={handleSendOtp} className="w-full">
// //             <label className="block mb-2 text-sm text-gray-600 font-semibold" htmlFor="email">
// //               Email Address
// //             </label>
// //             <input
// //               id="email"
// //               type="email"
// //               className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-4 bg-blue-50 placeholder-gray-400 transition"
// //               placeholder="you@university.edu"
// //               value={email}
// //               onChange={(e) => setEmail(e.target.value)}
// //               required
// //               autoFocus
// //               disabled={submitting}
// //             />
// //             <button
// //               type="submit"
// //               disabled={submitting}
// //               className="w-full py-3 rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold shadow hover:from-blue-700 hover:to-indigo-700 transition-colors"
// //             >
// //               {submitting ? 'Sending OTP...' : 'Send OTP'}
// //             </button>
// //           </form>
// //         ) : (
// //           <form onSubmit={handleVerifyOtp} className="w-full">
// //             <label className="block mb-2 text-sm text-gray-600 font-semibold" htmlFor="otp">
// //               Enter the 6-digit OTP sent to <span className="font-mono">{email}</span>
// //             </label>
// //             <input
// //               id="otp"
// //               type="text"
// //               maxLength={6}
// //               className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-4 bg-blue-50 text-center font-mono text-2xl tracking-widest placeholder-gray-400 transition"
// //               placeholder="●●●●●●"
// //               value={otp}
// //               onChange={(e) => setOtp(e.target.value)}
// //               inputMode="numeric"
// //               autoFocus
// //               required
// //               disabled={submitting}
// //             />
// //             <button
// //               type="submit"
// //               disabled={submitting}
// //               className="w-full py-3 rounded-lg text-white bg-gradient-to-r from-indigo-600 to-blue-600 font-semibold shadow hover:from-indigo-700 hover:to-blue-700 transition-colors"
// //             >
// //               {submitting ? 'Verifying…' : 'Verify & Login'}
// //             </button>
// //             <button
// //               type="button"
// //               className="w-full mt-2 text-sm text-blue-600 hover:underline"
// //               disabled={submitting}
// //               onClick={() => {
// //                 setStep('email')
// //                 setOtp('')
// //                 setError(null)
// //                 setSuccessMsg(null)
// //               }}
// //             >
// //               &larr; Change email
// //             </button>
// //           </form>
// //         )}
// //       </div>
// //     </div>
// //   )
// // }

// 'use client'

// import { useState, FormEvent } from 'react'
// import { useRouter } from 'next/navigation'
// import { useAuth } from '@/contexts/AuthContext'

// export default function LoginPage() {
//   const router = useRouter()
//   const { signInWithOtp, verifyOtp } = useAuth()
//   const [email, setEmail] = useState('')
//   const [otp, setOtp] = useState('')
//   const [step, setStep] = useState<'email' | 'otp'>('email')
//   const [submitting, setSubmitting] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [successMsg, setSuccessMsg] = useState<string | null>(null)

//   async function handleSendOtp(e: FormEvent) {
//     e.preventDefault()
//     setSubmitting(true)
//     setError(null)
//     setSuccessMsg(null)
//     try {
//       await signInWithOtp(email)
//       setStep('otp')
//       setSuccessMsg("OTP sent! Please check your email.")
//     } catch (err: any) {
//       setError(err.message ?? 'Failed to send OTP')
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   async function handleVerifyOtp(e: FormEvent) {
//     e.preventDefault()
//     setSubmitting(true)
//     setError(null)
//     setSuccessMsg(null)
//     try {
//       await verifyOtp(email, otp)
//       setSuccessMsg("Login successful! Redirecting…")
//       setTimeout(() => router.replace('/dashboard'), 500)
//     } catch (err: any) {
//       setError(err.message ?? 'Invalid or expired OTP')
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-sky-200 to-indigo-100">
//       <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl p-8 sm:p-10 flex flex-col items-center">
//         <span className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 shadow mb-4">
//           {/* Beautiful login lock icon */}
//           <svg
//             className="h-8 w-8 text-blue-500"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth={2}
//             viewBox="0 0 24 24"
//           >
//             <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.657 0 3-1.343 3-3V6a3 3 0 10-6 0v2c0 1.657 1.343 3 3 3zm7 8v-5a5 5 0 00-10 0v5m10 0H5"/>
//           </svg>
//         </span>
//         <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-blue-800 text-center">Welcome Back!</h2>
//         <p className="mb-4 text-gray-500 text-center">Sign in with your institutional email</p>

//         {successMsg && (
//           <div className="w-full mb-3 py-2 px-4 bg-green-100 border border-green-300 text-green-700 rounded text-center">
//             {successMsg}
//           </div>
//         )}
//         {error && (
//           <div className="w-full mb-3 py-2 px-4 bg-red-100 border border-red-300 text-red-700 rounded text-center">
//             {error}
//           </div>
//         )}

//         {step === 'email' ? (
//           <form onSubmit={handleSendOtp} className="w-full">
//             <label className="block mb-2 text-sm text-gray-600 font-semibold" htmlFor="email">
//               Email Address
//             </label>
//             <input
//               id="email"
//               type="email"
//               className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-4 bg-blue-50 placeholder-gray-400 transition text-gray-900"
//               placeholder="you@university.edu"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               autoFocus
//               disabled={submitting}
//             />
//             <button
//               type="submit"
//               disabled={submitting}
//               className="w-full py-3 rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold shadow hover:from-blue-700 hover:to-indigo-700 transition-colors"
//             >
//               {submitting ? 'Sending OTP...' : 'Send OTP'}
//             </button>
//           </form>
//         ) : (
//           <form onSubmit={handleVerifyOtp} className="w-full">
//             <label className="block mb-2 text-sm text-gray-600 font-semibold" htmlFor="otp">
//               Enter the 6-digit OTP sent to <span className="font-mono">{email}</span>
//             </label>
//             <input
//               id="otp"
//               type="text"
//               maxLength={6}
//               className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-4 bg-blue-50 text-center font-mono text-2xl tracking-widest placeholder-gray-400 transition text-gray-900"
//               placeholder="●●●●●●"
//               value={otp}
//               onChange={(e) => setOtp(e.target.value)}
//               inputMode="numeric"
//               autoFocus
//               required
//               disabled={submitting}
//             />
//             <button
//               type="submit"
//               disabled={submitting}
//               className="w-full py-3 rounded-lg text-white bg-gradient-to-r from-indigo-600 to-blue-600 font-semibold shadow hover:from-indigo-700 hover:to-blue-700 transition-colors"
//             >
//               {submitting ? 'Verifying…' : 'Verify & Login'}
//             </button>
//             <button
//               type="button"
//               className="w-full mt-2 text-sm text-blue-600 hover:underline"
//               disabled={submitting}
//               onClick={() => {
//                 setStep('email')
//                 setOtp('')
//                 setError(null)
//                 setSuccessMsg(null)
//               }}
//             >
//               &larr; Change email
//             </button>
//           </form>
//         )}
//       </div>
//     </div>
//   )
// }

'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { signInWithOtp, verifyOtp } = useAuth()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  async function handleSendOtp(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccessMsg(null)
    try {
      await signInWithOtp(email)
      setStep('otp')
      setSuccessMsg("OTP sent! Please check your email.")
    } catch (err: any) {
      setError(err.message ?? 'Failed to send OTP')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccessMsg(null)
    try {
      await verifyOtp(email, otp)
      setSuccessMsg("Login successful! Redirecting…")
      setTimeout(() => router.replace('/dashboard'), 500)
    } catch (err: any) {
      setError(err.message ?? 'Invalid or expired OTP')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-sky-200 to-indigo-100">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl p-8 sm:p-10 flex flex-col items-center">
        <span className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 shadow mb-4">
          {/* Beautiful login lock icon */}
          <svg
            className="h-8 w-8 text-blue-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.657 0 3-1.343 3-3V6a3 3 0 10-6 0v2c0 1.657 1.343 3 3 3zm7 8v-5a5 5 0 00-10 0v5m10 0H5"/>
          </svg>
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-blue-800 text-center">Welcome Back!</h2>
        <p className="mb-4 text-gray-500 text-center">Sign in with your institutional email</p>

        {successMsg && <div className="w-full mb-3 py-2 px-4 bg-green-100 border border-green-300 text-green-700 rounded text-center">{successMsg}</div>}
        {error && <div className="w-full mb-3 py-2 px-4 bg-red-100 border border-red-300 text-red-700 rounded text-center">{error}</div>}

        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="w-full">
            <label className="block mb-2 text-sm text-gray-600 font-semibold" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-4 bg-blue-50 placeholder-gray-400 transition"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold shadow hover:from-blue-700 hover:to-indigo-700 transition-colors"
            >
              {submitting ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="w-full">
            <label className="block mb-2 text-sm text-gray-600 font-semibold" htmlFor="otp">
              Enter the 6-digit OTP sent to <span className="font-mono">{email}</span>
            </label>
            <input
              id="otp"
              type="text"
              maxLength={6}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-4 bg-blue-50 text-center font-mono text-2xl tracking-widest placeholder-gray-400 transition"
              placeholder="●●●●●●"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              inputMode="numeric"
              autoFocus
              required
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg text-white bg-gradient-to-r from-indigo-600 to-blue-600 font-semibold shadow hover:from-indigo-700 hover:to-blue-700 transition-colors"
            >
              {submitting ? 'Verifying…' : 'Verify & Login'}
            </button>
            <button
              type="button"
              className="w-full mt-2 text-sm text-blue-600 hover:underline"
              disabled={submitting}
              onClick={() => {
                setStep('email')
                setOtp('')
                setError(null)
                setSuccessMsg(null)
              }}
            >
              &larr; Change email
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
