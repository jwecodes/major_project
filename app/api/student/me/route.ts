// app/api/student/me/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const student = await prisma.student.findUnique({
    where: { email: user.email.toLowerCase().trim() },
    include: {
      programme: true,
    },
  })

  if (!student) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    student: {
      id: student.id,
      name: student.name,
      email: student.email,
      currentSemester: student.currentSemester,
      programme: student.programme
        ? {
            id: student.programme.id,
            programmeCode: student.programme.programmeCode,
            programmeName: student.programme.programmeName,
          }
        : null,
    },
  })
}
