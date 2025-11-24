// app/api/student/content/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email')
    const courseId = request.nextUrl.searchParams.get('courseId') // optional

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

    // All courses the student is enrolled in
    const enrollments = await prisma.studentEnrollment.findMany({
      where: { studentId: student.id },
      select: { courseId: true },
    })

    let courseIds = enrollments.map(e => e.courseId)

    // If courseId filter is present, restrict to that one
    if (courseId) {
      if (!courseIds.includes(courseId)) {
        // Student is not enrolled in this course → no content
        return NextResponse.json({ success: true, content: [] })
      }
      courseIds = [courseId]
    }

    if (courseIds.length === 0) {
      return NextResponse.json({ success: true, content: [] })
    }

    const contents = await prisma.teachingContent.findMany({
      where: {
        courseId: { in: courseIds },
        approvalStatus: 'APPROVED',
      },
      include: {
        course: {
          select: {
            id: true,
            courseCode: true,
            courseName: true,
            semester: true,
          },
        },
        faculty: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const mapped = contents.map(c => ({
      id: c.id,
      title: c.title,
      contentType: c.contentType,
      description: c.description,
      lectureNumber: c.lectureNumber,
      fileName: c.fileName,
      filePath: c.filePath,
      fileSize: c.fileSize,
      approvalStatus: c.approvalStatus,
      uploadDate: c.createdAt,
      courseId: c.courseId,
      course: {
        id: c.course.id,
        courseCode: c.course.courseCode,
        courseName: c.course.courseName,
        semester: c.course.semester,
      },
      facultyName: c.faculty?.name ?? 'Faculty',
    }))

    return NextResponse.json({ success: true, content: mapped })
  } catch (error) {
    console.error('Error fetching student content:', error)
    return NextResponse.json(
      { success: false, error: 'Error fetching content' },
      { status: 500 }
    )
  }
}
