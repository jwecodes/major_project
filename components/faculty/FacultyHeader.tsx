'use client'

export default function FacultyHeader() {
  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Welcome, Dr. Faculty Name
          </h2>
          <p className="text-sm text-gray-500">Computer Science Department</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600 text-right">
            <div className="font-medium">FAC001</div>
            <div className="text-xs">faculty@university.edu</div>
          </div>
          <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
            F
          </div>
        </div>
      </div>
    </header>
  )
}
