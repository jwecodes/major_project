import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assignments } = body

    if (!assignments || !Array.isArray(assignments)) {
      return NextResponse.json(
        { message: 'Invalid assignments data' },
        { status: 400 }
      )
    }

    // Validate all assignments first
    const errors = []
    for (let i = 0; i < assignments.length; i++) {
      const assignment = assignments[i]
      if (!assignment.session || !assignment.courseCode) {
        errors.push(`Row ${i + 1}: Missing required fields (session, courseCode)`)
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { message: 'Validation errors', errors },
        { status: 400 }
      )
    }

    // Process assignments in transaction
    const result = await prisma.$transaction(async (tx) => {
      const processedAssignments = []

      for (const assignment of assignments) {
        const { session, courseCode, coordinatorId, contributorIds = [] } = assignment

        // Find the course
        const course = await tx.course.findFirst({
          where: {
            session,
            courseCode
          }
        })

        if (!course) {
          throw new Error(`Course not found: ${courseCode} for session ${session}`)
        }

        // Remove existing assignments for this course
        await tx.facultyCourse.deleteMany({
          where: {
            session,
            courseCode
          }
        })

        // Assign coordinator if provided
        if (coordinatorId) {
          const coordinator = await tx.faculty.findFirst({
            where: { facultyId: coordinatorId }
          })

          if (!coordinator) {
            throw new Error(`Coordinator not found: ${coordinatorId}`)
          }

          const coordAssignment = await tx.facultyCourse.create({
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
            }
          })
          processedAssignments.push(coordAssignment)
        }

        // Assign contributors if provided
        for (const contributorId of contributorIds) {
          if (!contributorId.trim()) continue

          const contributor = await tx.faculty.findFirst({
            where: { facultyId: contributorId.trim() }
          })

          if (!contributor) {
            throw new Error(`Contributor not found: ${contributorId}`)
          }

          const contribAssignment = await tx.facultyCourse.create({
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
            }
          })
          processedAssignments.push(contribAssignment)
        }
      }

      return processedAssignments
    })

    return NextResponse.json({
      message: `Successfully processed ${assignments.length} course assignments`,
      totalAssignments: result.length,
      assignments: result
    }, { status: 201 })
  } catch (error: unknown) {
    console.error('Error processing bulk assignments:', error)
    
    // Type guard for Error instances
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to process bulk assignments'

    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    )
  }
}
