'use client'

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Teaching Content Management System
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Admin User
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
            A
          </div>
        </div>
      </div>
    </header>
  )
}
