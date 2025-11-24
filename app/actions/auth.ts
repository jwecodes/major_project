// 'use server'

// import { createClient } from '@/lib/supabase/server'
// import prisma from '@/lib/prisma'
// import { getRedirectUrl } from '@/lib/auth/roles'
// import { redirect } from 'next/navigation'
// import { Role } from '@prisma/client'
// import { revalidatePath } from 'next/cache'

// // =====================================
// // ENSURE USER HAS ALL APPLICABLE ROLES
// // =====================================

// async function ensureUserRoles(userId: string, email: string) {
//   const existingRoles = await prisma.userRole.findMany({
//     where: { userId, isActive: true }
//   })
//   const existingRoleNames = existingRoles.map(r => r.role)

//   // Check if user should be ADMIN
//   const adminEmail = process.env.ADMIN_EMAIL
//   if (adminEmail && email === adminEmail && !existingRoleNames.includes('ADMIN')) {
//     await prisma.userRole.create({
//       data: { userId, role: 'ADMIN', isActive: true }
//     })
//     console.log(`✅ Added ADMIN role for ${email}`)
//   }

//   // Check if user should be FACULTY
//   const faculty = await prisma.faculty.findUnique({ 
//     where: { email } 
//   })
//   if (faculty && !existingRoleNames.includes('FACULTY')) {
//     await prisma.userRole.create({
//       data: { userId, role: 'FACULTY', isActive: true }
//     })
//     console.log(`✅ Added FACULTY role for ${email}`)
//   }

//   // Check if user should be STUDENT
//   const student = await prisma.student.findUnique({ 
//     where: { email } 
//   })
//   if (student && !existingRoleNames.includes('STUDENT')) {
//     await prisma.userRole.create({
//       data: { userId, role: 'STUDENT', isActive: true }
//     })
//     console.log(`✅ Added STUDENT role for ${email}`)
//   }
// }

// // =====================================
// // SEND OTP TO EMAIL
// // =====================================

// export async function sendOTP(formData: FormData) {
//   try {
//     const email = formData.get('email') as string

//     if (!email) {
//       return { error: 'Email is required' }
//     }

//     const cleanEmail = email.toLowerCase().trim()
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//     if (!emailRegex.test(cleanEmail)) {
//       return { error: 'Invalid email format' }
//     }

//     const supabase = await createClient()
//     const { error } = await supabase.auth.signInWithOtp({
//       email: cleanEmail,
//       options: { shouldCreateUser: true }
//     })

//     if (error) {
//       console.error('Send OTP error:', error)
//       return { error: error.message }
//     }

//     return { success: true, message: 'OTP sent to your email' }
//   } catch (error) {
//     console.error('Send OTP exception:', error)
//     return { error: 'Failed to send OTP' }
//   }
// }

// // =====================================
// // VERIFY OTP AND SIGN IN (WITH AUTO ROLE ASSIGNMENT)
// // =====================================

// export async function verifyOTP(formData: FormData) {
//   try {
//     const email = formData.get('email') as string
//     const token = formData.get('otp') as string

//     if (!email || !token) {
//       return { error: 'Email and OTP are required' }
//     }

//     const cleanEmail = email.toLowerCase().trim()
//     const cleanToken = token.trim()

//     if (cleanToken.length !== 6 || !/^\d{6}$/.test(cleanToken)) {
//       return { error: 'OTP must be exactly 6 digits' }
//     }

//     const supabase = await createClient()
//     const { data, error } = await supabase.auth.verifyOtp({
//       email: cleanEmail,
//       token: cleanToken,
//       type: 'email'
//     })

//     if (error) {
//       if (error.message?.includes('expired')) {
//         return { error: 'OTP has expired. Please request a new one.' }
//       }
//       if (error.message?.includes('invalid')) {
//         return { error: 'Invalid OTP. Please check and try again.' }
//       }
//       return { error: error.message || 'Failed to verify OTP' }
//     }
//     if (!data.user) {
//       return { error: 'Invalid OTP' }
//     }

//     // Find or create user
//     let dbUser = await prisma.user.findUnique({
//       where: { id: data.user.id },
//       include: { roles: { where: { isActive: true }, select: { role: true } } }
//     })
    
//     if (!dbUser) {
//       let emailUser = await prisma.user.findUnique({
//         where: { email: data.user.email! },
//         include: { roles: { where: { isActive: true }, select: { role: true } } }
//       })
      
//       if (emailUser) {
//         dbUser = await prisma.user.update({
//           where: { email: data.user.email! },
//           data: { id: data.user.id },
//           include: { roles: { where: { isActive: true }, select: { role: true } } }
//         })
//       } else {
//         dbUser = await prisma.user.create({
//           data: {
//             id: data.user.id,
//             email: data.user.email!,
//             name: data.user.email!.split('@')[0],
//           },
//           include: { roles: { where: { isActive: true }, select: { role: true } } }
//         })
//       }
//     }

//     if (!dbUser) {
//       return { error: 'Unexpected error: user not found after login.' }
//     }

//     // 🔥 NEW: Ensure all applicable roles are assigned
//     await ensureUserRoles(dbUser.id, dbUser.email)

//     // Re-fetch user with all roles
//     dbUser = await prisma.user.findUnique({
//       where: { id: dbUser.id },
//       include: { roles: { where: { isActive: true }, select: { role: true } } }
//     })

//     if (!dbUser || dbUser.roles.length === 0) {
//       return { error: 'No roles assigned to this user. Please contact administrator.' }
//     }

//     const roles = dbUser.roles.map(r => r.role)
//     const redirectUrl = getRedirectUrl(roles)
//     revalidatePath('/', 'layout')
//     redirect(redirectUrl)
//   } catch (error) {
//     if (error instanceof Error && error.message === 'NEXT_REDIRECT') throw error
//     console.error('Verify OTP error:', error)
//     return { error: 'Failed to verify OTP. Please try again.' }
//   }
// }

// // =====================================
// // SIGN OUT
// // =====================================

// export async function signOut() {
//   try {
//     const supabase = await createClient()
//     await supabase.auth.signOut()
//     revalidatePath('/', 'layout')
//   } catch (error) {
//     console.error('Sign out error:', error)
//   }
//   redirect('/login')
// }

// // =====================================
// // SWITCH ROLE
// // =====================================

// export async function switchRole(role: Role) {
//   try {
//     const supabase = await createClient()
//     const { data: { user } } = await supabase.auth.getUser()

//     if (!user) redirect('/login')

//     const userRole = await prisma.userRole.findFirst({
//       where: { userId: user.id, role, isActive: true }
//     })

//     if (!userRole) return { error: 'You do not have access to this role' }

//     revalidatePath('/', 'layout')
//     redirect(`/${role.toLowerCase()}/dashboard`)
//   } catch (error) {
//     if (error instanceof Error && error.message === 'NEXT_REDIRECT') throw error
//     console.error('Switch role error:', error)
//     return { error: 'Failed to switch role' }
//   }
// }

// // =====================================
// // GET CURRENT USER
// // =====================================

// export async function getCurrentUser() {
//   try {
//     const supabase = await createClient()
//     const { data: { user } } = await supabase.auth.getUser()

//     if (!user) return null

//     const dbUser = await prisma.user.findUnique({
//       where: { id: user.id },
//       include: {
//         roles: { where: { isActive: true }, select: { role: true } },
//         faculty: {
//           select: {
//             id: true,
//             facultyId: true,
//             name: true,
//             designation: true,
//             email: true,
//             department: true,
//             contactNo: true
//           }
//         },
//         student: {
//           select: {
//             id: true,
//             studentId: true,
//             name: true,
//             email: true,
//             programmeId: true,
//             currentSemester: true,
//             section: true
//           }
//         }
//       }
//     })

//     if (!dbUser) return null

//     return {
//       id: dbUser.id,
//       email: dbUser.email,
//       name: dbUser.name,
//       createdAt: dbUser.createdAt,
//       updatedAt: dbUser.updatedAt,
//       roles: dbUser.roles.map(r => r.role),
//       faculty: dbUser.faculty,
//       student: dbUser.student
//     }
//   } catch (error) {
//     console.error('Get current user error:', error)
//     return null
//   }
// }

// // =====================================
// // MANUALLY SYNC ROLES (FOR EXISTING USERS)
// // =====================================

// export async function syncUserRoles() {
//   try {
//     const supabase = await createClient()
//     const { data: { user } } = await supabase.auth.getUser()

//     if (!user) {
//       return { success: false, error: 'Not authenticated' }
//     }

//     const dbUser = await prisma.user.findUnique({
//       where: { id: user.id }
//     })

//     if (!dbUser) {
//       return { success: false, error: 'User not found' }
//     }

//     await ensureUserRoles(dbUser.id, dbUser.email)

//     revalidatePath('/', 'layout')
//     return { success: true, message: 'Roles synced successfully' }
//   } catch (error) {
//     console.error('Sync roles error:', error)
//     return { success: false, error: 'Failed to sync roles' }
//   }
// }

// 'use server'

// import { createClient } from '@/lib/supabase/server'
// import prisma from '@/lib/prisma'
// import { getRedirectUrl } from '@/lib/auth/roles'
// import { redirect } from 'next/navigation'
// import { Role } from '@prisma/client'
// import { revalidatePath } from 'next/cache'

// // =====================================
// // ENSURE USER HAS ALL APPLICABLE ROLES
// // =====================================

// async function ensureUserRoles(userId: string, email: string) {
//   const existingRoles = await prisma.userRole.findMany({
//     where: { userId, isActive: true }
//   })
//   const existingRoleNames = existingRoles.map(r => r.role)

//   // Check if user should be ADMIN
//   const adminEmail = process.env.ADMIN_EMAIL
//   if (adminEmail && email === adminEmail && !existingRoleNames.includes('ADMIN')) {
//     await prisma.userRole.create({
//       data: { userId, role: 'ADMIN', isActive: true }
//     })
//     console.log(`✅ Added ADMIN role for ${email}`)
//   }

//   // Check if user should be FACULTY
//   const faculty = await prisma.faculty.findUnique({
//     where: { email }
//   })
//   if (faculty && !existingRoleNames.includes('FACULTY')) {
//     await prisma.userRole.create({
//       data: { userId, role: 'FACULTY', isActive: true }
//     })
//     console.log(`✅ Added FACULTY role for ${email}`)
//   }

//   // Check if user should be STUDENT
//   const student = await prisma.student.findUnique({
//     where: { email }
//   })
//   if (student && !existingRoleNames.includes('STUDENT')) {
//     await prisma.userRole.create({
//       data: { userId, role: 'STUDENT', isActive: true }
//     })
//     console.log(`✅ Added STUDENT role for ${email}`)
//   }
// }

// // =====================================
// // SEND OTP TO EMAIL
// // =====================================

// export async function sendOTP(formData: FormData) {
//   try {
//     const email = formData.get('email') as string

//     if (!email) {
//       return { error: 'Email is required' }
//     }

//     const cleanEmail = email.toLowerCase().trim()
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//     if (!emailRegex.test(cleanEmail)) {
//       return { error: 'Invalid email format' }
//     }

//     const supabase = await createClient()
//     const { error } = await supabase.auth.signInWithOtp({
//       email: cleanEmail,
//       options: { shouldCreateUser: true }
//     })

//     if (error) {
//       console.error('Send OTP error:', error)
//       return { error: error.message }
//     }

//     return { success: true, message: 'OTP sent to your email' }
//   } catch (error) {
//     console.error('Send OTP exception:', error)
//     return { error: 'Failed to send OTP' }
//   }
// }

// // =====================================
// // VERIFY OTP AND SIGN IN (WITH AUTO ROLE ASSIGNMENT)
// // =====================================

// export async function verifyOTP(formData: FormData) {
//   try {
//     const email = formData.get('email') as string
//     const token = formData.get('otp') as string

//     if (!email || !token) {
//       return { error: 'Email and OTP are required' }
//     }

//     const cleanEmail = email.toLowerCase().trim()
//     const cleanToken = token.trim()

//     if (cleanToken.length !== 6 || !/^\d{6}$/.test(cleanToken)) {
//       return { error: 'OTP must be exactly 6 digits' }
//     }

//     const supabase = await createClient()
//     const { data, error } = await supabase.auth.verifyOtp({
//       email: cleanEmail,
//       token: cleanToken,
//       type: 'email'
//     })

//     if (error) {
//       if (error.message?.includes('expired')) {
//         return { error: 'OTP has expired. Please request a new one.' }
//       }
//       if (error.message?.includes('invalid')) {
//         return { error: 'Invalid OTP. Please check and try again.' }
//       }
//       return { error: error.message || 'Failed to verify OTP' }
//     }
//     if (!data.user) {
//       return { error: 'Invalid OTP' }
//     }

//     // Find or create user
//     let dbUser = await prisma.user.findUnique({
//       where: { id: data.user.id },
//       include: { roles: { where: { isActive: true }, select: { role: true } } }
//     })

//     if (!dbUser) {
//       let emailUser = await prisma.user.findUnique({
//         where: { email: data.user.email! },
//         include: { roles: { where: { isActive: true }, select: { role: true } } }
//       })

//       if (emailUser) {
//         dbUser = await prisma.user.update({
//           where: { email: data.user.email! },
//           data: { id: data.user.id },
//           include: { roles: { where: { isActive: true }, select: { role: true } } }
//         })
//       } else {
//         dbUser = await prisma.user.create({
//           data: {
//             id: data.user.id,
//             email: data.user.email!,
//             name: data.user.email!.split('@')[0],
//           },
//           include: { roles: { where: { isActive: true }, select: { role: true } } }
//         })
//       }
//     }

//     if (!dbUser) {
//       return { error: 'Unexpected error: user not found after login.' }
//     }

//     // Ensure all applicable roles are assigned
//     await ensureUserRoles(dbUser.id, dbUser.email)

//     // Re-fetch user with all roles
//     dbUser = await prisma.user.findUnique({
//       where: { id: dbUser.id },
//       include: { roles: { where: { isActive: true }, select: { role: true } } }
//     })

//     if (!dbUser || dbUser.roles.length === 0) {
//       return { error: 'No roles assigned to this user. Please contact administrator.' }
//     }

//     const roles = dbUser.roles.map(r => r.role)
//     const redirectUrl = getRedirectUrl(roles)
//     revalidatePath('/', 'layout')
//     redirect(redirectUrl)
//   } catch (error) {
//     if (error instanceof Error && error.message === 'NEXT_REDIRECT') throw error
//     console.error('Verify OTP error:', error)
//     return { error: 'Failed to verify OTP. Please try again.' }
//   }
// }

// // =====================================
// // SIGN OUT
// // =====================================

// export async function signOut() {
//   try {
//     const supabase = await createClient()
//     await supabase.auth.signOut()
//     revalidatePath('/', 'layout')
//   } catch (error) {
//     console.error('Sign out error:', error)
//   }
//   redirect('/login')
// }

// // =====================================
// // SWITCH ROLE
// // =====================================

// export async function switchRole(role: Role) {
//   try {
//     const supabase = await createClient()
//     const { data: { user } } = await supabase.auth.getUser()

//     if (!user) redirect('/login')

//     const userRole = await prisma.userRole.findFirst({
//       where: { userId: user.id, role, isActive: true }
//     })

//     if (!userRole) return { error: 'You do not have access to this role' }

//     revalidatePath('/', 'layout')
//     redirect(`/${role.toLowerCase()}/dashboard`)
//   } catch (error) {
//     if (error instanceof Error && error.message === 'NEXT_REDIRECT') throw error
//     console.error('Switch role error:', error)
//     return { error: 'Failed to switch role' }
//   }
// }

// // =====================================
// // GET CURRENT USER
// // =====================================

// export async function getCurrentUser() {
//   try {
//     const supabase = await createClient()
//     const { data: { user } } = await supabase.auth.getUser()

//     if (!user) return null

//     const dbUser = await prisma.user.findUnique({
//       where: { id: user.id },
//       include: {
//         roles: { where: { isActive: true }, select: { role: true } },
//         faculty: {
//           select: {
//             id: true,
//             facultyId: true,
//             name: true,
//             designation: true,
//             email: true,
//             department: true,
//             contactNo: true
//           }
//         },
//         student: {
//           select: {
//             id: true,
//             studentId: true,
//             name: true,
//             email: true,
//             programmeId: true,
//             currentSemester: true,
//             section: true
//           }
//         }
//       }
//     })

//     if (!dbUser) return null

//     return {
//       id: dbUser.id,
//       email: dbUser.email,
//       name: dbUser.name,
//       createdAt: dbUser.createdAt,
//       updatedAt: dbUser.updatedAt,
//       roles: dbUser.roles.map(r => r.role),
//       faculty: dbUser.faculty,
//       student: dbUser.student
//     }
//   } catch (error) {
//     console.error('Get current user error:', error)
//     return null
//   }
// }

// // =====================================
// // MANUALLY SYNC ROLES (FOR EXISTING USERS)
// // =====================================

// export async function syncUserRoles() {
//   try {
//     const supabase = await createClient()
//     const { data: { user } } = await supabase.auth.getUser()

//     if (!user) {
//       return { success: false, error: 'Not authenticated' }
//     }

//     const dbUser = await prisma.user.findUnique({
//       where: { id: user.id }
//     })

//     if (!dbUser) {
//       return { success: false, error: 'User not found' }
//     }

//     await ensureUserRoles(dbUser.id, dbUser.email)

//     revalidatePath('/', 'layout')
//     return { success: true, message: 'Roles synced successfully' }
//   } catch (error) {
//     console.error('Sync roles error:', error)
//     return { success: false, error: 'Failed to sync roles' }
//   }
// }

'use server'

import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { getRedirectUrl } from '@/lib/auth/roles'
import { redirect } from 'next/navigation'
import { Role } from '@prisma/client'
import { revalidatePath } from 'next/cache'

// =====================================
// ENSURE USER HAS ALL APPLICABLE ROLES
// =====================================

async function ensureUserRoles(userId: string, email: string) {
  const existingRoles = await prisma.userRole.findMany({
    where: { userId, isActive: true },
  })
  const existingRoleNames = existingRoles.map((r) => r.role)
  const cleanEmail = email.toLowerCase().trim()

  // -------- ADMIN via env (single OR multiple) --------
  // You have: ADMIN_EMAILS="a@gmail.com,b@gmail.com,..."
  const adminEnv =
    process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || ''

  const adminEmails = adminEnv
    .split(/[,\s]+/) // split by comma and/or whitespace
    .map((e) => e.toLowerCase().trim())
    .filter(Boolean)

  if (
    adminEmails.length > 0 &&
    adminEmails.includes(cleanEmail) &&
    !existingRoleNames.includes('ADMIN')
  ) {
    await prisma.userRole.create({
      data: { userId, role: 'ADMIN', isActive: true },
    })
    console.log(`✅ Added ADMIN role for ${email}`)
    existingRoleNames.push('ADMIN')
  }

  // -------- FACULTY via faculty table --------
  const faculty = await prisma.faculty.findUnique({
    where: { email: cleanEmail },
  })
  if (faculty && !existingRoleNames.includes('FACULTY')) {
    await prisma.userRole.create({
      data: { userId, role: 'FACULTY', isActive: true },
    })
    console.log(`✅ Added FACULTY role for ${email}`)
    existingRoleNames.push('FACULTY')
  }

  // -------- STUDENT via students table --------
  const student = await prisma.student.findUnique({
    where: { email: cleanEmail },
  })
  if (student && !existingRoleNames.includes('STUDENT')) {
    await prisma.userRole.create({
      data: { userId, role: 'STUDENT', isActive: true },
    })
    console.log(`✅ Added STUDENT role for ${email}`)
    existingRoleNames.push('STUDENT')
  }
}

// =====================================
// SEND OTP TO EMAIL
// =====================================

export async function sendOTP(formData: FormData) {
  try {
    const email = formData.get('email') as string

    if (!email) {
      return { error: 'Email is required' }
    }

    const cleanEmail = email.toLowerCase().trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      return { error: 'Invalid email format' }
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: { shouldCreateUser: true },
    })

    if (error) {
      console.error('Send OTP error:', error)
      return { error: error.message }
    }

    return { success: true, message: 'OTP sent to your email' }
  } catch (error) {
    console.error('Send OTP exception:', error)
    return { error: 'Failed to send OTP' }
  }
}

// =====================================
// VERIFY OTP AND SIGN IN (WITH AUTO ROLE ASSIGNMENT)
// =====================================

export async function verifyOTP(formData: FormData) {
  try {
    const email = formData.get('email') as string
    const token = formData.get('otp') as string

    if (!email || !token) {
      return { error: 'Email and OTP are required' }
    }

    const cleanEmail = email.toLowerCase().trim()
    const cleanToken = token.trim()

    if (cleanToken.length !== 6 || !/^\d{6}$/.test(cleanToken)) {
      return { error: 'OTP must be exactly 6 digits' }
    }

    const supabase = await createClient()
    const { data, error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: 'email',
    })

    if (error) {
      if (error.message?.toLowerCase().includes('expired')) {
        return { error: 'OTP has expired. Please request a new one.' }
      }
      if (error.message?.toLowerCase().includes('invalid')) {
        return { error: 'Invalid OTP. Please check and try again.' }
      }
      return { error: error.message || 'Failed to verify OTP' }
    }
    if (!data.user) {
      return { error: 'Invalid OTP' }
    }

    // Find or create user in Prisma
    let dbUser = await prisma.user.findUnique({
      where: { id: data.user.id },
      include: {
        roles: { where: { isActive: true }, select: { role: true } },
      },
    })

    if (!dbUser) {
      // Maybe existing user by email but different id
      let emailUser = await prisma.user.findUnique({
        where: { email: data.user.email! },
        include: {
          roles: { where: { isActive: true }, select: { role: true } },
        },
      })

      if (emailUser) {
        dbUser = await prisma.user.update({
          where: { email: data.user.email! },
          data: { id: data.user.id },
          include: {
            roles: { where: { isActive: true }, select: { role: true } },
          },
        })
      } else {
        dbUser = await prisma.user.create({
          data: {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.email!.split('@')[0],
          },
          include: {
            roles: { where: { isActive: true }, select: { role: true } },
          },
        })
      }
    }

    if (!dbUser) {
      return { error: 'Unexpected error: user not found after login.' }
    }

    // Ensure all applicable roles are assigned
    await ensureUserRoles(dbUser.id, dbUser.email)

    // Re-fetch with full roles
    dbUser = await prisma.user.findUnique({
      where: { id: dbUser.id },
      include: {
        roles: { where: { isActive: true }, select: { role: true } },
      },
    })

    if (!dbUser || dbUser.roles.length === 0) {
      return {
        error: 'No roles assigned to this user. Please contact administrator.',
      }
    }

    const roles = dbUser.roles.map((r) => r.role)
    const redirectUrl = getRedirectUrl(roles)
    revalidatePath('/', 'layout')
    redirect(redirectUrl)
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') throw error
    console.error('Verify OTP error:', error)
    return { error: 'Failed to verify OTP. Please try again.' }
  }
}

// =====================================
// SIGN OUT
// =====================================

export async function signOut() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
  } catch (error) {
    console.error('Sign out error:', error)
  }
  redirect('/login')
}

// =====================================
// SWITCH ROLE
// =====================================

export async function switchRole(role: Role) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const userRole = await prisma.userRole.findFirst({
      where: { userId: user.id, role, isActive: true },
    })

    if (!userRole) return { error: 'You do not have access to this role' }

    revalidatePath('/', 'layout')
    redirect(`/${role.toLowerCase()}/dashboard`)
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') throw error
    console.error('Switch role error:', error)
    return { error: 'Failed to switch role' }
  }
}

// =====================================
// GET CURRENT USER
// =====================================

export async function getCurrentUser() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        roles: { where: { isActive: true }, select: { role: true } },
        faculty: {
          select: {
            id: true,
            facultyId: true,
            name: true,
            designation: true,
            email: true,
            department: true,
            contactNo: true,
          },
        },
        student: {
          select: {
            id: true,
            studentId: true,
            name: true,
            email: true,
            programmeId: true,
            currentSemester: true,
            section: true,
          },
        },
      },
    })

    if (!dbUser) return null

    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt,
      roles: dbUser.roles.map((r) => r.role),
      faculty: dbUser.faculty,
      student: dbUser.student,
    }
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

// =====================================
// MANUALLY SYNC ROLES (FOR EXISTING USERS)
// =====================================

export async function syncUserRoles() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    })

    if (!dbUser) {
      return { success: false, error: 'User not found' }
    }

    await ensureUserRoles(dbUser.id, dbUser.email)

    revalidatePath('/', 'layout')
    return { success: true, message: 'Roles synced successfully' }
  } catch (error) {
    console.error('Sync roles error:', error)
    return { success: false, error: 'Failed to sync roles' }
  }
}
