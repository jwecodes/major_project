import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const {
      session,
      programmeCode,
      programmeName,
      semester,
      courseCode,
      courseName,
      l,
      t,
      p,
      s,
      credits,
      totalHours,
      courseType,
      roomNo,
      hasAttendance,
      courseNature,
      courseMode
    } = body

    // Validate required fields
    if (!session || !programmeCode || !semester || !courseCode || !courseName || !credits) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id }
    })

    if (!existingCourse) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      )
    }

    // Check if course code already exists (excluding current course)
    const duplicateCourse = await prisma.course.findFirst({
      where: {
        AND: [
          { session },
          { courseCode },
          { id: { not: id } }
        ]
      }
    })

    if (duplicateCourse) {
      return NextResponse.json(
        { message: 'Course code already exists for this session' },
        { status: 400 }
      )
    }

    // Verify programme exists
    const programme = await prisma.programme.findFirst({
      where: {
        programmeCode
      }
    })

    if (!programme) {
      return NextResponse.json(
        { message: 'Programme not found' },
        { status: 400 }
      )
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        session,
        programmeCode,
        programmeName: programmeName || programme.programmeName,
        semester: parseInt(semester),
        courseCode,
        courseName,
        l: parseInt(l) || 0,
        t: parseInt(t) || 0,
        p: parseInt(p) || 0,
        s: parseInt(s) || 0,
        credits: parseFloat(credits),
        totalHours: parseInt(totalHours) || (parseInt(l) || 0) + (parseInt(t) || 0) + (parseInt(p) || 0) + (parseInt(s) || 0),
        courseType: courseType || 'CORE',
        roomNo: roomNo || null,
        hasAttendance: hasAttendance !== false,
        courseNature: courseNature || 'MANDATORY',
        courseMode: courseMode || 'THEORY'
      }
    })

    return NextResponse.json(updatedCourse)
  } catch (error) {
    console.error('Error updating course:', error)
    return NextResponse.json(
      { message: 'Failed to update course' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            facultyCourses: true,
            courseContent: true
          }
        }
      }
    })

    if (!existingCourse) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      )
    }

    // Check if course has related data
    if (existingCourse._count.facultyCourses > 0 || existingCourse._count.courseContent > 0) {
      return NextResponse.json(
        { 
          message: `Cannot delete course with ${existingCourse._count.facultyCourses} faculty assignments and ${existingCourse._count.courseContent} content items. Remove related data first.` 
        },
        { status: 400 }
      )
    }

    await prisma.course.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Course deleted successfully' })
  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json(
      { message: 'Failed to delete course' },
      { status: 500 }
    )
  }
}
