import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 })

    const faculty = await prisma.faculty.findFirst({
      where: { email: email.trim().toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        designation: true,
        department: true,
        // add any other fields you wish to display
      }
    })
    if (!faculty) return NextResponse.json({ success: false, error: 'Faculty not found' }, { status: 404 })

    // Optionally fetch courses/content for their dashboard here

    return NextResponse.json({ success: true, faculty })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
