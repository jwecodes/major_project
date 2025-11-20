// import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'

// export async function POST(request: NextRequest) {
//   try {
//     const { email } = await request.json()

//     // Find student by email
//     const student = await prisma.student.findUnique({
//       where: { email },
//       include: {
//         user: true,
//         programme: true
//       }
//     })

//     if (!student) {
//       return NextResponse.json(
//         { success: false, error: 'Student not found. Please contact administrator.' },
//         { status: 404 }
//       )
//     }

//     // Return student info
//     return NextResponse.json({
//       success: true,
//       student: {
//         id: student.id,
//         studentId: student.studentId,
//         name: student.name,
//         email: student.email,
//         currentSemester: student.currentSemester,
//         section: student.section,
//         programme: {
//           id: student.programme.id,
//           programmeCode: student.programme.programmeCode,
//           programmeName: student.programme.programmeName
//         }
//       }
//     })
//   } catch (error) {
//     console.error('Student login error:', error)
//     return NextResponse.json(
//       { success: false, error: 'An error occurred during login' },
//       { status: 500 }
//     )
//   }
// }
