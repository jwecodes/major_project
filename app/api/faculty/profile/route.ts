// import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'
// import { createServerSupabaseClient } from '@/lib/supabase-server'

// export async function GET(request: NextRequest) {
//   const supabase = await createServerSupabaseClient()
//   const { data: { user }, error } = await supabase.auth.getUser()
//   if (error || !user || !user.email)
//     return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })

//   const safeEmail = user.email.trim().toLowerCase()

//   const faculty = await prisma.faculty.findUnique({
//     where: { email: safeEmail },
//     select: {
//       id: true,
//       name: true,
//       email: true,
//       facultyId: true,
//       designation: true,
//       department: true
//     }
//   })

//   if (!faculty)
//     return NextResponse.json({ success: false, error: "Faculty not found" }, { status: 404 })

//   return NextResponse.json({ success: true, profile: faculty })
// }

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user || !user.email)
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })

  const safeEmail = user.email.trim().toLowerCase()
  const faculty = await prisma.faculty.findUnique({
    where: { email: safeEmail },
    select: {
      id: true,
      name: true,
      email: true,
      facultyId: true,
      designation: true,
      department: true
    }
  })

  if (!faculty)
    return NextResponse.json({ success: false, error: "Faculty not found" }, { status: 404 })

  return NextResponse.json({ success: true, profile: faculty })
}

