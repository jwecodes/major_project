import { Role } from '@prisma/client'

export interface UserWithRoles {
  id: string
  email: string
  name: string
  roles: {
    id: string
    role: Role
    isActive: boolean
  }[]
  faculty?: {
    id: string
    facultyId: string
    department: string | null
  } | null
  student?: {
    id: string
    studentId: string
    programmeId: string
  } | null
}

export interface AuthUser {
  id: string
  email: string
  roles: Role[]
}

export type DashboardType = 'admin' | 'faculty' | 'student'
