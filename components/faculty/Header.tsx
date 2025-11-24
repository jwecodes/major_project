import { signOut } from '@/app/actions/auth'
import RoleSwitcher from '@/components/RoleSwitcher'
import { LogOut } from 'lucide-react'

interface HeaderProps {
  user: {
    id: string
    email: string
    name: string
    roles: ('ADMIN' | 'FACULTY' | 'STUDENT')[]
  }
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Faculty Portal</h2>
          <p className="text-sm text-gray-600">Welcome, {user.name}</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Role Switcher - Only shown if user has multiple roles */}
          {user.roles.length > 1 && (
            <RoleSwitcher userRoles={user.roles} currentRole="FACULTY" />
          )}

          {/* Logout Button */}
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
