// // // app/dashboard/page.tsx
// // import { redirect } from 'next/navigation'
// // import { createServerSupabaseClient } from '@/lib/supabase-server'
// // import { PrismaClient } from '@prisma/client'

// // const prisma = new PrismaClient()

// // export default async function DashboardPage() {
// //   const supabase = await createServerSupabaseClient()
// //   const {
// //     data: { user },
// //   } = await supabase.auth.getUser()

// //   if (!user) {
// //     redirect('/login')
// //   }

// //   const dbUser = await prisma.user.findUnique({
// //     where: { id: user.id },
// //     select: { role: true, name: true },
// //   })

// //   const role = dbUser?.role

// //   if (role === 'ADMIN') {
// //     redirect('/admin/dashboard')
// //   }

// //   if (role === 'FACULTY') {
// //     redirect('/faculty/dashboard')
// //   }

// //   if (role === 'STUDENT') {
// //     redirect('/student/dashboard')
// //   }

// //   return (
// //     <div className="p-8">
// //       <h1 className="text-2xl font-semibold">Dashboard</h1>
// //       <p>No specific role dashboard found.</p>
// //     </div>
// //   )
// // }

// 'use client'

// import { useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import { useAuth } from '@/contexts/AuthContext'

// export default function DashboardPage() {
//   const router = useRouter()
//   const { currentRole, loading } = useAuth()

//   useEffect(() => {
//     if (loading) return
//     if (!currentRole) { router.replace('/login'); return }
//     if (currentRole === 'ADMIN') router.replace('/admin/dashboard')
//     else if (currentRole === 'FACULTY') router.replace('/faculty/dashboard')
//     else if (currentRole === 'STUDENT') router.replace('/student/dashboard')
//   }, [currentRole, loading, router])

//   return (
//     <div className="min-h-screen flex items-center justify-center">
//       <div className="text-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//         <p className="mt-4 text-gray-600">Redirecting to your dashboard...</p>
//       </div>
//     </div>
//   )
// }

'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthRedirect() {
  const router = useRouter()

  useEffect(() => {
    const checkRole = async () => {
      try {
        const res = await fetch('/api/auth/role', { credentials: 'include' })
        if (!res.ok) {
          router.replace('/login')
          return
        }

        const data = await res.json()
        const roles: string[] = data.roles ?? []

        // Prefer FACULTY, then ADMIN
        if (roles.includes('FACULTY')) {
          router.replace('/faculty/dashboard')
        } else if (roles.includes('ADMIN')) {
          router.replace('/admin/dashboard')
        } else {
          router.replace('/login')
        }
      } catch {
        router.replace('/login')
      }
    }
    checkRole()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}
