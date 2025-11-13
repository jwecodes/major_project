import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch CHO for a course
export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email')
    const courseId = request.nextUrl.searchParams.get('courseId')

    if (!email || !courseId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email and courseId required' 
      }, { status: 400 })
    }

    const faculty = await prisma.faculty.findUnique({
      where: { email }
    })

    if (!faculty) {
      return NextResponse.json({ 
        success: false, 
        error: 'Faculty not found' 
      }, { status: 404 })
    }

    const cho = await prisma.courseHandout.findFirst({
      where: {
        facultyId: faculty.id,
        courseId
      }
    })

    return NextResponse.json({
      success: true,
      cho: cho || null
    })
  } catch (error) {
    console.error('Error fetching CHO:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Error fetching CHO' 
    }, { status: 500 })
  }
}

// POST - Save/Update CHO
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, courseId, choData, status } = body

    if (!email || !courseId || !choData) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    const faculty = await prisma.faculty.findUnique({
      where: { email }
    })

    if (!faculty) {
      return NextResponse.json({ 
        success: false, 
        error: 'Faculty not found' 
      }, { status: 404 })
    }

    // Check if CHO already exists
    const existing = await prisma.courseHandout.findFirst({
      where: {
        facultyId: faculty.id,
        courseId
      }
    })

    let cho
    if (existing) {
      // Update existing
      cho = await prisma.courseHandout.update({
        where: { id: existing.id },
        data: {
          schoolName: choData.schoolName,
          programme: choData.programme,
          courseTitle: choData.courseTitle,
          courseCode: choData.courseCode,
          ltpStructure: choData.ltpStructure,
          credits: choData.credits,
          prerequisite: choData.prerequisite,
          totalSessions: choData.totalSessions,
          courseFaculty: choData.courseFaculty,
          facultyEmail: choData.facultyEmail,
          coursePerspective: choData.coursePerspective,
          programOutcomes: choData.programOutcomes,
          programSpecificOutcomes: choData.programSpecificOutcomes,
          courseOutcomes: choData.courseOutcomes,
          syllabus: choData.syllabus,
          assessmentStrategy: choData.assessmentStrategy,
          correlationMatrix: choData.correlationMatrix,
          sessionPlan: choData.sessionPlan,
          status: status || 'DRAFT'
        }
      })
    } else {
      // Create new
      cho = await prisma.courseHandout.create({
        data: {
          facultyId: faculty.id,
          courseId,
          schoolName: choData.schoolName,
          programme: choData.programme,
          courseTitle: choData.courseTitle,
          courseCode: choData.courseCode,
          ltpStructure: choData.ltpStructure,
          credits: choData.credits,
          prerequisite: choData.prerequisite,
          totalSessions: choData.totalSessions,
          courseFaculty: choData.courseFaculty,
          facultyEmail: choData.facultyEmail,
          coursePerspective: choData.coursePerspective,
          programOutcomes: choData.programOutcomes,
          programSpecificOutcomes: choData.programSpecificOutcomes,
          courseOutcomes: choData.courseOutcomes,
          syllabus: choData.syllabus,
          assessmentStrategy: choData.assessmentStrategy,
          correlationMatrix: choData.correlationMatrix,
          sessionPlan: choData.sessionPlan,
          status: status || 'DRAFT'
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: status === 'SUBMITTED' ? 'CHO submitted successfully' : 'CHO saved as draft',
      cho
    })
  } catch (error) {
    console.error('Error saving CHO:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Error saving CHO' 
    }, { status: 500 })
  }
}
