import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const session = searchParams.get('session')
    const programmeCode = searchParams.get('programmeCode')

    let whereClause: any = {}
    
    if (session) {
      whereClause.session = session
    }
    
    if (programmeCode) {
      whereClause.programmeCode = programmeCode
    }

    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        programme: {
          select: {
            id: true,
            programmeCode: true,
            programmeName: true,
            session: true
          }
        },
        _count: {
          select: {
            facultyCourses: true,
            courseContent: true
          }
        }
      },
      orderBy: [
        { session: 'desc' },
        { programmeCode: 'asc' },
        { semester: 'asc' },
        { courseName: 'asc' }
      ]
    })

    return NextResponse.json(courses)
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { message: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
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

    // Check if course code already exists in the session
    const existingCourse = await prisma.course.findFirst({
      where: {
        session,
        courseCode
      }
    })

    if (existingCourse) {
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

    const course = await prisma.course.create({
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

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { message: 'Failed to create course' },
      { status: 500 }
    )
  }
}
