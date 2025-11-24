'use client'

import { switchRole } from '@/app/actions/auth'
import { Role } from '@prisma/client'
import { useState, useTransition } from 'react'

interface RoleSwitcherProps {
  userRoles: Role[]
  currentRole: Role
}

export default function RoleSwitcher({ userRoles, currentRole }: RoleSwitcherProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (userRoles.length <= 1) return null

  const handleRoleSwitch = (role: Role) => {
    setError(null)
    startTransition(async () => {
      const result = await switchRole(role)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  const getRoleColor = (role: Role): string => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-600 hover:bg-purple-700'
      case 'FACULTY':
        return 'bg-blue-600 hover:bg-blue-700'
      case 'STUDENT':
        return 'bg-green-600 hover:bg-green-700'
      default:
        return 'bg-gray-600 hover:bg-gray-700'
    }
  }

  const getRoleLabel = (role: Role): string => {
    return role.charAt(0) + role.slice(1).toLowerCase()
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Switch Dashboard
      </h3>
      
      {error && (
        <div className="mb-3 text-xs text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
      
      <div className="flex flex-wrap gap-2">
        {userRoles.map((role) => (
          <button
            key={role}
            onClick={() => handleRoleSwitch(role)}
            disabled={currentRole === role || isPending}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              currentRole === role
                ? getRoleColor(role) + ' cursor-not-allowed'
                : getRoleColor(role)
            }`}
          >
            {getRoleLabel(role)}
            {currentRole === role && (
              <span className="ml-2 text-xs">✓</span>
            )}
          </button>
        ))}
      </div>
      
      {isPending && (
        <p className="mt-2 text-xs text-gray-500">Switching...</p>
      )}
    </div>
  )
}
