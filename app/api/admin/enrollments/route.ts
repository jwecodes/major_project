// import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'

// export async function GET() {
//   try {
//     const enrollments = await prisma.studentEnrollment.findMany({
//       include: {
//         student: {
//           select: {
//             id: true,
//             studentId: true,
//             name: true,
//             email: true
//           }
//         },
//         course: {
//           select: {
//             id: true,
//             courseCode: true,
//             courseName: true,
//             semester: true
//           }
//         }
//       },
//       orderBy: { enrolledAt: 'desc' }
//     })

//     return NextResponse.json({ success: true, enrollments })
//   } catch (error) {
//     console.error('Get enrollments error:', error)
//     return NextResponse.json(
//       { success: false, error: 'Failed to fetch enrollments' },
//       { status: 500 }
//     )
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const { studentId, courseId } = await request.json()

//     // Check if already enrolled
//     const existing = await prisma.studentEnrollment.findUnique({
//       where: {
//         studentId_courseId: { studentId, courseId }
//       }
//     })

//     if (existing) {
//       return NextResponse.json(
//         { success: false, error: 'Student already enrolled in this course' },
//         { status: 400 }
//       )
//     }

//     const enrollment = await prisma.studentEnrollment.create({
//       data: { studentId, courseId },
//       include: {
//         student: true,
//         course: true
//       }
//     })

//     return NextResponse.json({ success: true, enrollment })
//   } catch (error: any) {
//     console.error('Create enrollment error:', error)
//     return NextResponse.json(
//       { success: false, error: error.message },
//       { status: 500 }
//     )
//   }
// }

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get all enrollments
export async function GET() {
  try {
    const enrollments = await prisma.studentEnrollment.findMany({
      include: {
        student: {
          include: {
            programme: true
          }
        },
        course: {
          include: {
            programme: true
          }
        }
      },
      orderBy: {
        enrolledAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      enrollments
    })
  } catch (error) {
    console.error('Get enrollments error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch enrollments' },
      { status: 500 }
    )
  }
}

// POST - Create enrollment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, courseId } = body

    if (!studentId || !courseId) {
      return NextResponse.json(
        { success: false, error: 'Student ID and Course ID are required' },
        { status: 400 }
      )
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.studentEnrollment.findFirst({
      where: {
        studentId,
        courseId
      }
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { success: false, error: 'Student is already enrolled in this course' },
        { status: 400 }
      )
    }

    const enrollment = await prisma.studentEnrollment.create({
      data: {
        studentId,
        courseId
      },
      include: {
        student: {
          include: {
            programme: true
          }
        },
        course: {
          include: {
            programme: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      enrollment
    })
  } catch (error: any) {
    console.error('Create enrollment error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create enrollment' },
      { status: 500 }
    )
  }
}

// POST - Bulk enroll students
export async function PATCH(request: NextRequest) {
  try {
    // Get all students and their applicable courses
    const students = await prisma.student.findMany({
      include: {
        programme: true
      }
    })

    let enrollmentCount = 0

    for (const student of students) {
      // Find courses for this student's programme and current semester
      const applicableCourses = await prisma.course.findMany({
        where: {
          programmeId: student.programmeId,
          semester: student.currentSemester
        }
      })

      for (const course of applicableCourses) {
        // Check if already enrolled
        const existing = await prisma.studentEnrollment.findFirst({
          where: {
            studentId: student.id,
            courseId: course.id
          }
        })

        if (!existing) {
          await prisma.studentEnrollment.create({
            data: {
              studentId: student.id,
              courseId: course.id
            }
          })
          enrollmentCount++
        }
      }
    }

    return NextResponse.json({
      success: true,
      count: enrollmentCount,
      message: `Successfully enrolled students in ${enrollmentCount} courses`
    })
  } catch (error: any) {
    console.error('Bulk enrollment error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to bulk enroll' },
      { status: 500 }
    )
  }
}
