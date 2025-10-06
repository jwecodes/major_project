import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { courses } = body

    if (!courses || !Array.isArray(courses)) {
      return NextResponse.json(
        { message: 'Invalid courses data' },
        { status: 400 }
      )
    }

    // Validate all courses first
    const errors = []
    for (let i = 0; i < courses.length; i++) {
      const course = courses[i]
      if (!course.session || !course.programmeCode || !course.semester || !course.courseCode || !course.courseName || !course.credits) {
        errors.push(`Row ${i + 1}: Missing required fields`)
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { message: 'Validation errors', errors },
        { status: 400 }
      )
    }

    // Check for duplicate course codes within the same session
    const courseCodes = courses.map(c => ({ session: c.session, courseCode: c.courseCode }))
    
    // Check existing courses in database
    const existingCourses = await prisma.course.findMany({
      where: {
        OR: courseCodes.map(({ session, courseCode }) => ({
          session,
          courseCode
        }))
      },
      select: {
        session: true,
        courseCode: true
      }
    })

    const existingKeys = existingCourses.map(c => `${c.session}-${c.courseCode}`)
    const duplicates = courseCodes.filter(({ session, courseCode }) => 
      existingKeys.includes(`${session}-${courseCode}`)
    )

    if (duplicates.length > 0) {
      return NextResponse.json(
        { 
          message: 'Duplicate course codes found',
          duplicates: duplicates.map(d => `${d.courseCode} in ${d.session}`)
        },
        { status: 400 }
      )
    }

    // Get programme names for validation
    const programmeCodes = [...new Set(courses.map(c => c.programmeCode))]
    const programmes = await prisma.programme.findMany({
      where: {
        programmeCode: {
          in: programmeCodes
        }
      },
      select: {
        programmeCode: true,
        programmeName: true
      }
    })

    const programmeMap = Object.fromEntries(programmes.map(p => [p.programmeCode, p.programmeName]))

    // Process and create courses
    const processedCourses = courses.map(course => ({
      session: course.session,
      programmeCode: course.programmeCode,
      programmeName: course.programmeName || programmeMap[course.programmeCode] || '',
      semester: parseInt(course.semester),
      courseCode: course.courseCode,
      courseName: course.courseName,
      l: parseInt(course.l) || 0,
      t: parseInt(course.t) || 0,
      p: parseInt(course.p) || 0,
      s: parseInt(course.s) || 0,
      credits: parseFloat(course.credits),
      totalHours: parseInt(course.totalHours) || (parseInt(course.l) || 0) + (parseInt(course.t) || 0) + (parseInt(course.p) || 0) + (parseInt(course.s) || 0),
      courseType: course.courseType || 'CORE',
      roomNo: course.roomNo || null,
      hasAttendance: course.hasAttendance !== false,
      courseNature: course.courseNature || 'MANDATORY',
      courseMode: course.courseMode || 'THEORY'
    }))

    // Use transaction for bulk insert
    const result = await prisma.$transaction(async (tx) => {
      const createdCourses = []
      for (const courseData of processedCourses) {
        const created = await tx.course.create({
          data: courseData
        })
        createdCourses.push(created)
      }
      return createdCourses
    })

    return NextResponse.json({
      message: `Successfully created ${result.length} courses`,
      courses: result
    }, { status: 201 })
  } catch (error) {
    console.error('Error bulk creating courses:', error)
    return NextResponse.json(
      { message: 'Failed to bulk create courses' },
      { status: 500 }
    )
  }
}
