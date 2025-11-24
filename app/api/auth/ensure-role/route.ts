import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email missing' }, { status: 400 })
    }

    // 1️⃣ Check faculty table
    const faculty = await prisma.faculty.findUnique({ where: { email } })

    if (!faculty) {
      return NextResponse.json({ success: true }) // faculty role not needed
    }

    // 2️⃣ Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { roles: true },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // 3️⃣ Check if already has FACULTY role
    const hasFacultyRole = user.roles.some((r) => r.role === 'FACULTY')

    if (!hasFacultyRole) {
      await prisma.userRole.create({
        data: {
          userId: user.id,
          role: 'FACULTY',
          isActive: true,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error ensuring faculty role:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
