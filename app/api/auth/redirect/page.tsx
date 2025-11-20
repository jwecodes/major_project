'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthRedirect() {
  const router = useRouter()

  useEffect(() => {
    const checkRole = async () => {
      const res = await fetch('/api/auth/role')
      const data = await res.json()

      if (!data.currentRole) {
        router.replace('/login')
        return
      }

      if (data.currentRole === 'ADMIN') {
        router.replace('/admin')
      } else if (data.currentRole === 'FACULTY') {
        router.replace('/faculty')
      } else {
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
