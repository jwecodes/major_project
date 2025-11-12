import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    const faculty = await prisma.faculty.findFirst({
      where: { email: email.toLowerCase() },
      select: { id: true, facultyId: true, name: true, designation: true, email: true, department: true }
    })

    if (!faculty) {
      return NextResponse.json({ success: false, error: 'Faculty not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, faculty })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
