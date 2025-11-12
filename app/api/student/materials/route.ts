import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Student ID required' },
        { status: 400 }
      )
    }

    // Get student info
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { programme: true }
    })

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      )
    }

    // Get courses matching student's programme, semester, and session
    const courses = await prisma.course.findMany({
      where: {
        programmeId: student.programmeId,
        semester: student.currentSemester,
        session: student.programme.session
      }
    })

    const courseIds = courses.map((c: any) => c.id)

    // Get all approved materials for these courses
    const materials = await prisma.teachingContent.findMany({
      where: {
        courseId: { in: courseIds },
        approvalStatus: 'APPROVED'
      },
      include: {
        course: true,
        faculty: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      materials,
      courses
    })
  } catch (error) {
    console.error('Student materials error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load materials' },
      { status: 500 }
    )
  }
}
