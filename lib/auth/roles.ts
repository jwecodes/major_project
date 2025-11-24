import { Role } from '@prisma/client'
import prisma from '@/lib/prisma'
import { UserWithRoles } from '@/types'

// Check if email is admin
export function isAdminEmail(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || []
  return adminEmails.includes(email.toLowerCase())
}

// Get all active roles for a user
export async function getUserRoles(userId: string): Promise<Role[]> {
  const userRoles = await prisma.userRole.findMany({
    where: {
      userId,
      isActive: true
    },
    select: {
      role: true
    }
  })
  
  return userRoles.map(ur => ur.role)
}

// Get user with all data including roles
export async function getUserWithRoles(email: string): Promise<UserWithRoles | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      roles: {
        where: { isActive: true },
        select: {
          id: true,
          role: true,
          isActive: true
        }
      },
      faculty: {
        select: {
          id: true,
          facultyId: true,
          department: true
        }
      },
      student: {
        select: {
          id: true,
          studentId: true,
          programmeId: true
        }
      }
    }
  })
  
  return user
}

// Determine redirect URL based on roles
export function getRedirectUrl(roles: Role[], preferredRole?: Role): string {
  // If preferred role is specified and user has it
  if (preferredRole && roles.includes(preferredRole)) {
    return `/${preferredRole.toLowerCase()}/dashboard`
  }
  
  // Default priority: ADMIN > FACULTY > STUDENT
  if (roles.includes('ADMIN')) return '/admin/dashboard'
  if (roles.includes('FACULTY')) return '/faculty/dashboard'
  if (roles.includes('STUDENT')) return '/student/dashboard'
  
  return '/dashboard' // fallback
}

// Assign roles based on email and user type
export async function assignRolesToUser(
  userId: string, 
  email: string,
  userType?: 'FACULTY' | 'STUDENT'
): Promise<Role[]> {
  const roles: Role[] = []
  
  // Check if admin
  if (isAdminEmail(email)) {
    await prisma.userRole.create({
      data: { userId, role: 'ADMIN' }
    })
    roles.push('ADMIN')
  }
  
  // Assign specific role
  if (userType) {
    await prisma.userRole.create({
      data: { userId, role: userType }
    })
    roles.push(userType)
  } else if (!isAdminEmail(email)) {
    // Default to STUDENT if not admin and no type specified
    await prisma.userRole.create({
      data: { userId, role: 'STUDENT' }
    })
    roles.push('STUDENT')
  }
  
  return roles
}
