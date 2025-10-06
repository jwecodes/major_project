import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: courseId } = params
    const body = await request.json()
    const { facultyId } = body

    // Get course details
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    })

    if (!course) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      )
    }

    // Remove existing coordinator
    await prisma.facultyCourse.deleteMany({
      where: {
        courseCode: course.courseCode,
        role: 'COORDINATOR'
      }
    })

    if (facultyId) {
      // Verify faculty exists
      const faculty = await prisma.faculty.findUnique({
        where: { id: facultyId }
      })

      if (!faculty) {
        return NextResponse.json(
          { message: 'Faculty not found' },
          { status: 404 }
        )
      }

      // Assign new coordinator
      const assignment = await prisma.facultyCourse.create({
        data: {
          session: course.session,
          programmeName: course.programmeName,
          programmeCode: course.programmeCode,
          section: 'A', // Default section
          courseCode: course.courseCode,
          courseName: course.courseName,
          facultyId: faculty.id,
          facultyName: faculty.facultyName,
          designation: faculty.designation,
          email: faculty.email,
          contactNo: faculty.contactNo,
          role: 'COORDINATOR',
          assignedAt: new Date()
        },
        include: {
          faculty: true
        }
      })

      return NextResponse.json({
        message: 'Coordinator assigned successfully',
        assignment
      })
    } else {
      return NextResponse.json({
        message: 'Coordinator removed successfully'
      })
    }
  } catch (error) {
    console.error('Error assigning coordinator:', error)
    return NextResponse.json(
      { message: 'Failed to assign coordinator' },
      { status: 500 }
    )
  }
}
