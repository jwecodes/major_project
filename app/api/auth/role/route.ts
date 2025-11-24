// // // // // // app/api/auth/role/route.ts
// // // // // import { NextResponse } from 'next/server'
// // // // // import { createServerSupabaseClient } from '@/lib/supabase-server'
// // // // // import { PrismaClient } from '@prisma/client'

// // // // // const prisma = new PrismaClient()

// // // // // export async function GET() {
// // // // //   const supabase = createServerSupabaseClient()
// // // // //   const {
// // // // //     data: { user },
// // // // //     error,
// // // // //   } = await supabase.auth.getUser()

// // // // //   if (error || !user) {
// // // // //     return NextResponse.json({ role: null }, { status: 401 })
// // // // //   }

// // // // //   // Assuming your Prisma User model is keyed by Supabase user id
// // // // //   const dbUser = await prisma.user.findUnique({
// // // // //     where: { id: user.id },
// // // // //     select: { role: true },
// // // // //   })

// // // // //   if (!dbUser) {
// // // // //     return NextResponse.json({ role: null }, { status: 404 })
// // // // //   }

// // // // //   return NextResponse.json({ role: dbUser.role }, { status: 200 })
// // // // // }

// // // // // app/api/auth/role/route.ts
// // // // import { NextResponse } from 'next/server'
// // // // import { createServerSupabaseClient } from '@/lib/supabase-server'
// // // // import { PrismaClient } from '@prisma/client'

// // // // const prisma = new PrismaClient()

// // // // export async function GET() {
// // // //   const supabase = await createServerSupabaseClient()

// // // //   const {
// // // //     data: { user },
// // // //     error,
// // // //   } = await supabase.auth.getUser()

// // // //   if (error || !user) {
// // // //     return NextResponse.json({ role: null }, { status: 401 })
// // // //   }

// // // //   const dbUser = await prisma.user.findUnique({
// // // //     where: { id: user.id },
// // // //     select: { role: true },
// // // //   })

// // // //   if (!dbUser) {
// // // //     return NextResponse.json({ role: null }, { status: 404 })
// // // //   }

// // // //   return NextResponse.json({ role: dbUser.role }, { status: 200 })
// // // // }

// // // import { NextResponse } from 'next/server'
// // // import { createServerSupabaseClient } from '@/lib/supabase-server'
// // // import { PrismaClient } from '@prisma/client'

// // // const prisma = new PrismaClient()

// // // export async function GET() {
// // //   const supabase = await createServerSupabaseClient()
// // //   const {
// // //     data: { user },
// // //     error,
// // //   } = await supabase.auth.getUser()

// // //   if (error || !user) {
// // //     return NextResponse.json({ roles: [], currentRole: null }, { status: 401 })
// // //   }

// // //   const userId = user.id
// // //   const roles: string[] = []

// // //   // Check User table (ADMIN/STUDENT base role)
// // //   const dbUser = await prisma.user.findUnique({
// // //     where: { id: userId }
// // //   })
// // //   if (dbUser?.role && !roles.includes(dbUser.role)) roles.push(dbUser.role)

// // //   // Check Faculty
// // //   const faculty = await prisma.faculty.findUnique({
// // //     where: { userId }
// // //   })
// // //   if (faculty && !roles.includes('FACULTY')) roles.push('FACULTY')

// // //   // Check Student
// // //   const student = await prisma.student.findUnique({
// // //     where: { userId }
// // //   })
// // //   if (student && !roles.includes('STUDENT')) roles.push('STUDENT')

// // //   if (roles.length === 0) {
// // //     return NextResponse.json(
// // //       { success: false, error: 'No roles found' },
// // //       { status: 404 }
// // //     )
// // //   }

// // //   // Priority: ADMIN > FACULTY > STUDENT
// // //   const currentRole =
// // //     roles.includes('ADMIN') ? 'ADMIN' :
// // //     roles.includes('FACULTY') ? 'FACULTY' : 'STUDENT'

// // //   return NextResponse.json({
// // //     roles,
// // //     currentRole,
// // //     isMultiRole: roles.length > 1
// // //   })
// // // }

// // // import { NextResponse } from 'next/server'
// // // import { createServerSupabaseClient } from '@/lib/supabase-server'
// // // import { PrismaClient } from '@prisma/client'

// // // const prisma = new PrismaClient()

// // // export async function GET() {
// // //   const supabase = await createServerSupabaseClient()
// // //   const {
// // //     data: { user },
// // //     error,
// // //   } = await supabase.auth.getUser()

// // //   if (error || !user) {
// // //     return NextResponse.json({ roles: [], currentRole: null }, { status: 401 })
// // //   }

// // //   const email = user.email
// // //   const roles: string[] = []

// // //   // Check User table (ADMIN/STUDENT base role) by email
// // //   const dbUser = await prisma.user.findUnique({
// // //     where: { email }
// // //   })
// // //   if (dbUser?.role && !roles.includes(dbUser.role)) roles.push(dbUser.role)

// // //   // Check Faculty by email
// // //   const faculty = await prisma.faculty.findUnique({
// // //     where: { email }
// // //   })
// // //   if (faculty && !roles.includes('FACULTY')) roles.push('FACULTY')

// // //   // Check Student by email
// // //   const student = await prisma.student.findUnique({
// // //     where: { email }
// // //   })
// // //   if (student && !roles.includes('STUDENT')) roles.push('STUDENT')

// // //   if (roles.length === 0) {
// // //     return NextResponse.json(
// // //       { success: false, error: 'No roles found' },
// // //       { status: 404 }
// // //     )
// // //   }

// // //   // Priority: ADMIN > FACULTY > STUDENT
// // //   const currentRole =
// // //     roles.includes('ADMIN') ? 'ADMIN'
// // //     : roles.includes('FACULTY') ? 'FACULTY'
// // //     : 'STUDENT'

// // //   return NextResponse.json({
// // //     roles,
// // //     currentRole,
// // //     isMultiRole: roles.length > 1
// // //   })
// // // }

// // // import { NextResponse } from 'next/server'
// // // import { createServerSupabaseClient } from '@/lib/supabase-server'
// // // import { PrismaClient } from '@prisma/client'

// // // const prisma = new PrismaClient()

// // // const ADMIN_EMAILS = [
// // //   'bhoomikajain24@gmail.com',
// // //   'harshmathew@gmail.com',
// // //   'dean.soet@krmangalam.edu.in',
// // //   'shweta.bansal@krmangalam.edu.in',
// // //   'preeti.rathi@krmangalam.edu.in'
// // //   // ...add more admin emails here
// // // ]

// // // export async function GET() {
// // //   const supabase = await createServerSupabaseClient()
// // //   const { data: { user }, error } = await supabase.auth.getUser()

// // //   if (error || !user || !user.email) {
// // //     return NextResponse.json({ roles: [], currentRole: null }, { status: 401 })
// // //   }

// // //   // Normalize email
// // //   const safeEmail = user.email.trim().toLowerCase()
// // //   const roles: string[] = []

// // //   // ADMIN by explicit email list
// // //   if (ADMIN_EMAILS.map(e => e.toLowerCase()).includes(safeEmail)) {
// // //     roles.push('ADMIN')
// // //   }

// // //   // FACULTY by faculty table
// // //   const faculty = await prisma.faculty.findUnique({ where: { email: safeEmail } })
// // //   if (faculty) roles.push('FACULTY')

// // //   // If neither, deny access
// // //   if (roles.length === 0) {
// // //     return NextResponse.json(
// // //       { success: false, error: 'No admin or faculty role found for this email.' },
// // //       { status: 404 }
// // //     )
// // //   }

// // //   // Priority
// // //   const currentRole =
// // //     roles.includes('ADMIN') ? 'ADMIN' :
// // //     roles.includes('FACULTY') ? 'FACULTY' :
// // //     null

// // //   return NextResponse.json({
// // //     roles,
// // //     currentRole,
// // //     isMultiRole: roles.length > 1
// // //   })
// // // }

// // import { NextResponse } from 'next/server'
// // import { createServerSupabaseClient } from '@/lib/supabase-server'
// // import { PrismaClient } from '@prisma/client'

// // const prisma = new PrismaClient()

// // const ADMIN_EMAILS = [
// //   'bhoomikajain24@gmail.com',
// //   'harshmathew@gmail.com',
// //   'dean.soet@krmangalam.edu.in',
// //   'shweta.bansal@krmangalam.edu.in',
// //   'preeti.rathi@krmangalam.edu.in'
// //   // ...add more admin emails here
// // ]

// // export async function GET() {
// //   const supabase = await createServerSupabaseClient()
// //   const { data: { user }, error } = await supabase.auth.getUser()
// //   if (error || !user || !user.email) {
// //     return NextResponse.json({ roles: [], currentRole: null }, { status: 401 })
// //   }

// //   const safeEmail = user.email.trim().toLowerCase()
// //   const roles: string[] = []

// //   // Only assign ADMIN if safeEmail is exactly in the list
// //   if (ADMIN_EMAILS.includes(safeEmail)) {
// //     roles.push('ADMIN')
// //   }

// //   // Only assign FACULTY if in Faculty table
// //   const faculty = await prisma.faculty.findUnique({ where: { email: safeEmail } })
// //   if (faculty) roles.push('FACULTY')

// //   if (roles.length === 0) {
// //     return NextResponse.json(
// //       { success: false, error: 'No admin or faculty role found for this email.' },
// //       { status: 404 }
// //     )
// //   }

// //   const currentRole =
// //     roles.includes('ADMIN') ? 'ADMIN' :
// //     roles.includes('FACULTY') ? 'FACULTY' :
// //     null

// //   return NextResponse.json({
// //     roles,
// //     currentRole,
// //     isMultiRole: roles.length > 1
// //   })
// // }

// // app/api/auth/role/route.ts
// import { NextResponse } from 'next/server'
// import { createServerSupabaseClient } from '@/lib/supabase-server'
// import { PrismaClient } from '@prisma/client'

// const prisma = new PrismaClient()

// // Only care about these two for now
// type Role = 'ADMIN' | 'FACULTY'

// export async function GET() {
//   const supabase = await createServerSupabaseClient()
//   const {
//     data: { user },
//     error,
//   } = await supabase.auth.getUser()

//   // Not logged in → no roles
//   if (error || !user?.email) {
//     return NextResponse.json(
//       { roles: [] as Role[], currentRole: null as Role | null, isMultiRole: false },
//       { status: 200 }
//     )
//   }

//   const safeEmail = user.email.trim().toLowerCase()

//   // Read all roles for this email from UserPortalRole
//   const roleRows = await prisma.userPortalRole.findMany({
//     where: { email: safeEmail },
//     select: { role: true },
//   })

//   // roleRows[i].role is a string from the DB: "ADMIN" | "FACULTY" | "STUDENT"
//   const roles: Role[] = roleRows
//     .map((row) => row.role as string)
//     .filter((r): r is Role => r === 'ADMIN' || r === 'FACULTY')

//   const currentRole: Role | null =
//     roles.includes('ADMIN') ? 'ADMIN'
//     : roles.includes('FACULTY') ? 'FACULTY'
//     : null

//   return NextResponse.json(
//     {
//       roles,
//       currentRole,
//       isMultiRole: roles.length > 1,
//     },
//     { status: 200 }
//   )
// }
