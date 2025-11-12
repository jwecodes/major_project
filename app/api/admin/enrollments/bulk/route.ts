// import { NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'

// export async function POST() {
//   try {
//     // Get all students
//     const students = await prisma.student.findMany({
//       include: {
//         programme: true
//       }
//     })

//     let count = 0
//     const errors: string[] = []

//     for (const student of students) {
//       try {
//         // Get courses for student's programme and semester
//         const courses = await prisma.course.findMany({
//           where: {
//             programmeId: student.programmeId,
//             semester: student.currentSemester
//           }
//         })

//         // Enroll in each course
//         for (const course of courses) {
//           try {
//             const existing = await prisma.studentEnrollment.findUnique({
//               where: {
//                 studentId_courseId: {
//                   studentId: student.id,
//                   courseId: course.id
//                 }
//               }
//             })

//             if (!existing) {
//               await prisma.studentEnrollment.create({
//                 data: {
//                   studentId: student.id,
//                   courseId: course.id
//                 }
//               })
//               count++
//             }
//           } catch (err: any) {
//             console.error(`Failed to enroll ${student.name} in ${course.courseCode}:`, err)
//           }
//         }
//       } catch (err: any) {
//         errors.push(`Failed to process ${student.name}: ${err.message}`)
//       }
//     }

//     return NextResponse.json({ 
//       success: true, 
//       count,
//       message: `Successfully enrolled ${count} students in their courses`,
//       errors: errors.length > 0 ? errors : undefined
//     })
//   } catch (error: any) {
//     console.error('Bulk enrollment error:', error)
//     return NextResponse.json(
//       { success: false, error: error.message },
//       { status: 500 }
//     )
//   }
// }

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Auto-enroll all students
export async function POST(request: NextRequest) {
  try {
    const students = await prisma.student.findMany({
      include: {
        programme: true
      }
    })

    let enrollmentCount = 0

    for (const student of students) {
      const applicableCourses = await prisma.course.findMany({
        where: {
          programmeId: student.programmeId,
          semester: student.currentSemester
        }
      })

      for (const course of applicableCourses) {
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
      count: enrollmentCount
    })
  } catch (error: any) {
    console.error('Bulk enroll error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to bulk enroll' },
      { status: 500 }
    )
  }
}
