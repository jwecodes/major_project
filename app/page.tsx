import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          University Management System
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Select your role to access the portal
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link 
            href="/admin" 
            className="bg-blue-600 hover:bg-blue-700 text-white p-8 rounded-lg shadow-lg transition-colors"
          >
            <div className="text-6xl mb-4">🔧</div>
            <h2 className="text-2xl font-semibold mb-2">Admin Panel</h2>
            <p className="text-blue-100">Manage programmes, faculties, and students</p>
          </Link>
          
          <Link 
            href="/faculty" 
            className="bg-green-600 hover:bg-green-700 text-white p-8 rounded-lg shadow-lg transition-colors"
          >
            <div className="text-6xl mb-4">👨‍🏫</div>
            <h2 className="text-2xl font-semibold mb-2">Faculty Panel</h2>
            <p className="text-green-100">View courses and manage content</p>
          </Link>
          
          <Link 
            href="/student" 
            className="bg-purple-600 hover:bg-purple-700 text-white p-8 rounded-lg shadow-lg transition-colors"
          >
            <div className="text-6xl mb-4">🎓</div>
            <h2 className="text-2xl font-semibold mb-2">Student Panel</h2>
            <p className="text-purple-100">Access courses and academic content</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
