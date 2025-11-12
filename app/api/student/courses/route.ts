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

    // Get material count for each course
    const coursesWithCount = await Promise.all(
      courses.map(async (course: any) => {
        const materialCount = await prisma.teachingContent.count({
          where: {
            courseId: course.id,
            approvalStatus: 'APPROVED'
          }
        })
        return { ...course, materialCount }
      })
    )

    return NextResponse.json({
      success: true,
      courses: coursesWithCount
    })
  } catch (error) {
    console.error('Student courses error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load courses' },
      { status: 500 }
    )
  }
}
