// import Sidebar from '@/components/admin/Sidebar'
// import Header from '@/components/admin/Header'

// export default function AdminLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <div className="flex h-screen bg-gray-100">
//       <Sidebar />
//       <div className="flex-1 flex flex-col overflow-hidden">
//         <Header />
//         <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
//           {children}
//         </main>
//       </div>
//     </div>
//   )
// }

import Sidebar from '@/components/admin/Sidebar'
import Header from '@/components/admin/Header'
import { RoleSwitcher } from '@/components/RoleSwitcher'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Example: Only display if admin (or via middleware protection)
  // const { currentRole } = useAuth()
  // if (currentRole !== 'ADMIN') return null

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="p-4">
          <RoleSwitcher />
        </div>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
