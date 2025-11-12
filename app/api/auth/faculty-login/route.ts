import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Find faculty by email
    const faculty = await prisma.faculty.findUnique({
      where: { email },
      include: {
        user: true
      }
    })

    if (!faculty) {
      return NextResponse.json(
        { success: false, error: 'Faculty not found. Please contact administrator.' },
        { status: 404 }
      )
    }

    // Return faculty info (in production, you'd use proper JWT tokens)
    return NextResponse.json({
      success: true,
      faculty: {
        id: faculty.id,
        facultyId: faculty.facultyId,
        name: faculty.name,
        email: faculty.email,
        designation: faculty.designation,
        department: faculty.department
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
