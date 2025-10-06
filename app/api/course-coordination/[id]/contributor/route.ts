import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: courseId } = params
    const body = await request.json()
    const { facultyId } = body

    if (!facultyId) {
      return NextResponse.json(
        { message: 'Faculty ID is required' },
        { status: 400 }
      )
    }

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

    // Check if already assigned
    const existing = await prisma.facultyCourse.findFirst({
      where: {
        courseCode: course.courseCode,
        facultyId: faculty.id
      }
    })

    if (existing) {
      return NextResponse.json(
        { message: 'Faculty is already assigned to this course' },
        { status: 400 }
      )
    }

    // Assign as contributor
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
        role: 'CONTRIBUTOR',
        assignedAt: new Date()
      },
      include: {
        faculty: true
      }
    })

    return NextResponse.json({
      message: 'Contributor assigned successfully',
      assignment
    }, { status: 201 })
  } catch (error) {
    console.error('Error assigning contributor:', error)
    return NextResponse.json(
      { message: 'Failed to assign contributor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: courseId } = params
    const body = await request.json()
    const { facultyId } = body

    if (!facultyId) {
      return NextResponse.json(
        { message: 'Faculty ID is required' },
        { status: 400 }
      )
    }

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

    // Remove contributor assignment
    const deleted = await prisma.facultyCourse.deleteMany({
      where: {
        courseCode: course.courseCode,
        facultyId,
        role: 'CONTRIBUTOR'
      }
    })

    if (deleted.count === 0) {
      return NextResponse.json(
        { message: 'Contributor assignment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Contributor removed successfully'
    })
  } catch (error) {
    console.error('Error removing contributor:', error)
    return NextResponse.json(
      { message: 'Failed to remove contributor' },
      { status: 500 }
    )
  }
}
