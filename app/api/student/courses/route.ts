// app/api/student/courses/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email required' },
        { status: 400 }
      )
    }

    const student = await prisma.student.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      )
    }

    const enrollments = await prisma.studentEnrollment.findMany({
      where: { studentId: student.id },
      include: {
        course: {
          include: {
            programme: true,
          },
        },
      },
      orderBy: {
        course: {
          courseCode: 'asc',
        },
      },
    })

    const courses = enrollments.map(e => ({
      id: e.course.id,
      courseCode: e.course.courseCode,
      courseName: e.course.courseName,
      semester: e.course.semester,
      session: e.course.session,
      programmeName: e.course.programme?.programmeName ?? '',
      programmeCode: e.course.programme?.programmeCode ?? '',
    }))

    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        currentSemester: student.currentSemester,
        programmeId: student.programmeId,
      },
      courses,
    })
  } catch (error) {
    console.error('Error fetching student courses:', error)
    return NextResponse.json(
      { success: false, error: 'Error fetching courses' },
      { status: 500 }
    )
  }
}
