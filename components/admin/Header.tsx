import { signOut } from '@/app/actions/auth'
import RoleSwitcher from '@/components/RoleSwitcher'
import { LogOut } from 'lucide-react'
import type { Role } from '@prisma/client'

interface HeaderProps {
  user: {
    id: string
    email: string
    name: string
    roles: Role[]   // 👈 use Prisma Role enum so it matches RoleSwitcher
  }
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        {/* Left: Title + Greeting */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
          <p className="text-sm text-gray-600">
            Welcome, {user.name}{' '}
            <span className="text-xs text-gray-400">({user.email})</span>
          </p>
        </div>

        {/* Right: Role switcher (multi-role only) + Logout */}
        <div className="flex items-center gap-4">
          {/* ✅ Only show if this user actually has multiple roles (multi-role email) */}
          {user.roles.length > 1 && (
            <RoleSwitcher
              userRoles={user.roles}
              currentRole="ADMIN"   // this is the admin header, so current role is ADMIN
            />
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
