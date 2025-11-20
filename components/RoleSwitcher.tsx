'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export function RoleSwitcher() {
  const { currentRole, availableRoles, isMultiRole, switchRole } = useAuth()
  const router = useRouter()

  if (!isMultiRole) return null

  const handleRoleSwitch = (role: 'ADMIN' | 'FACULTY' | 'STUDENT') => {
    switchRole(role)
    if (role === 'ADMIN') router.push('/admin/dashboard')
    if (role === 'FACULTY') router.push('/faculty/dashboard')
    if (role === 'STUDENT') router.push('/student/dashboard')
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
      <span className="text-sm font-medium text-gray-700">Switch Role:</span>
      {availableRoles.map((role) => (
        <button
          key={role}
          onClick={() => handleRoleSwitch(role)}
          className={`px-3 py-1 text-sm rounded ${
            currentRole === role
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {role}
        </button>
      ))}
    </div>
  )
}
