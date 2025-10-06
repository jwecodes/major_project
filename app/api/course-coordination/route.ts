import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const session = searchParams.get('session')
    const programmeCode = searchParams.get('programmeCode')

    // First, get all courses for the session/programme
    let courseWhere: any = {}
    if (session) {
      courseWhere.session = session
    }
    if (programmeCode) {
      courseWhere.programmeCode = programmeCode
    }

    const courses = await prisma.course.findMany({
      where: courseWhere,
      include: {
        facultyCourses: {
          include: {
            faculty: true
          }
        }
      },
      orderBy: [
        { session: 'desc' },
        { courseCode: 'asc' }
      ]
    })

    // Transform courses into coordination format
    const coordinations = courses.map(course => {
      const coordinator = course.facultyCourses.find(fc => fc.role === 'COORDINATOR')
      const contributors = course.facultyCourses.filter(fc => fc.role === 'CONTRIBUTOR')

      return {
        id: course.id,
        session: course.session,
        courseId: course.id,
        coordinatorId: coordinator?.facultyId || null,
        isActive: true,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        course: {
          id: course.id,
          session: course.session,
          programmeCode: course.programmeCode,
          programmeName: course.programmeName,
          courseCode: course.courseCode,
          courseName: course.courseName,
          semester: course.semester,
          credits: course.credits,
          l: course.l,
          t: course.t,
          p: course.p,
          s: course.s,
          courseType: course.courseType,
          courseNature: course.courseNature,
          courseMode: course.courseMode
        },
        coordinator: coordinator ? coordinator.faculty : null,
        contributors: contributors,
        courseMaterials: [], // Will be populated when you have CourseMaterial model
        _count: {
          contributors: contributors.length,
          courseMaterials: 0, // Will be actual count when model exists
          pendingApprovals: 0 // Will be actual count when model exists
        }
      }
    })

    return NextResponse.json(coordinations)
  } catch (error) {
    console.error('Error fetching course coordinations:', error)
    return NextResponse.json(
      { message: 'Failed to fetch course coordinations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      session,
      courseId,
      coordinatorId,
      contributorIds = []
    } = body

    // Validate required fields
    if (!session || !courseId) {
      return NextResponse.json(
        { message: 'Missing required fields: session and courseId' },
        { status: 400 }
      )
    }

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    })

    if (!course) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      )
    }

    // Use transaction to create all assignments
    const result = await prisma.$transaction(async (tx) => {
      const assignments = []

      // Assign coordinator if provided
      if (coordinatorId) {
        // Verify faculty exists
        const coordinator = await tx.faculty.findUnique({
          where: { id: coordinatorId }
        })

        if (!coordinator) {
          throw new Error('Coordinator not found')
        }

        // Remove existing coordinator for this course
        await tx.facultyCourse.deleteMany({
          where: {
            session,
            courseCode: course.courseCode,
            role: 'COORDINATOR'
          }
        })

        // Create new coordinator assignment
        const coordinatorAssignment = await tx.facultyCourse.create({
          data: {
            session,
            programmeName: course.programmeName,
            programmeCode: course.programmeCode,
            section: 'A', // Default section
            courseCode: course.courseCode,
            courseName: course.courseName,
            facultyId: coordinator.id,
            facultyName: coordinator.facultyName,
            designation: coordinator.designation,
            email: coordinator.email,
            contactNo: coordinator.contactNo,
            role: 'COORDINATOR',
            assignedAt: new Date()
          },
          include: {
            faculty: true
          }
        })
        assignments.push(coordinatorAssignment)
      }

      // Assign contributors if provided
      if (contributorIds.length > 0) {
        for (const facultyId of contributorIds) {
          const contributor = await tx.faculty.findUnique({
            where: { id: facultyId }
          })

          if (!contributor) {
            throw new Error(`Contributor not found: ${facultyId}`)
          }

          const contributorAssignment = await tx.facultyCourse.create({
            data: {
              session,
              programmeName: course.programmeName,
              programmeCode: course.programmeCode,
              section: 'A', // Default section
              courseCode: course.courseCode,
              courseName: course.courseName,
              facultyId: contributor.id,
              facultyName: contributor.facultyName,
              designation: contributor.designation,
              email: contributor.email,
              contactNo: contributor.contactNo,
              role: 'CONTRIBUTOR',
              assignedAt: new Date()
            },
            include: {
              faculty: true
            }
          })
          assignments.push(contributorAssignment)
        }
      }

      return assignments
    })

    return NextResponse.json({
      message: 'Course coordination created successfully',
      assignments: result
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating course coordination:', error)
    return NextResponse.json(
      { message: 'Failed to create course coordination' },
      { status: 500 }
    )
  }
}
