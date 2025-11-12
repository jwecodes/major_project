// import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'

// // GET - Get all students
// export async function GET() {
//   try {
//     const students = await prisma.student.findMany({
//       include: {
//         programme: {
//           select: {
//             programmeCode: true,
//             programmeName: true,
//             section: true,
//             session: true
//           }
//         }
//       },
//       orderBy: { createdAt: 'desc' }
//     })

//     return NextResponse.json({
//       success: true,
//       students
//     })
//   } catch (error) {
//     console.error('Get students error:', error)
//     return NextResponse.json(
//       { success: false, error: 'Failed to fetch students' },
//       { status: 500 }
//     )
//   }
// }

// // POST - Create student
// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json()
//     const { studentId, name, email, contactNo, programmeId, currentSemester, section } = body

//     // Create user first
//     const user = await prisma.user.create({
//       data: {
//         email,
//         name,
//         role: 'STUDENT'
//       }
//     })

//     // Create student
//     const student = await prisma.student.create({
//       data: {
//         userId: user.id,
//         studentId,
//         name,
//         email,
//         contactNo: contactNo || null,
//         programmeId,
//         currentSemester,
//         section: section || null
//       }
//     })

//     return NextResponse.json({
//       success: true,
//       student
//     })
//   } catch (error: any) {
//     console.error('Create student error:', error)
    
//     if (error.code === 'P2002') {
//       return NextResponse.json(
//         { success: false, error: 'Email or Student ID already exists' },
//         { status: 400 }
//       )
//     }

//     return NextResponse.json(
//       { success: false, error: error.message || 'Failed to create student' },
//       { status: 500 }
//     )
//   }
// }

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get all students
export async function GET() {
  try {
    const students = await prisma.student.findMany({
      include: {
        programme: true
      },
      orderBy: [
        { programme: { session: 'desc' } },
        { programme: { programmeCode: 'asc' } },
        { section: 'asc' },
        { currentSemester: 'asc' },
        { studentId: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      students
    })
  } catch (error) {
    console.error('Get students error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}

// POST - Create student
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, name, email, contactNo, programmeId, currentSemester, section } = body

    if (!studentId || !name || !email || !programmeId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if student already exists
    const existingStudent = await prisma.student.findFirst({
      where: {
        OR: [
          { studentId },
          { email }
        ]
      }
    })

    if (existingStudent) {
      return NextResponse.json(
        { success: false, error: 'Email or Student ID already exists' },
        { status: 400 }
      )
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email }
    })

    // Create user if doesn't exist
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          role: 'STUDENT'
        }
      })
    }

    // Create student
    const student = await prisma.student.create({
      data: {
        userId: user.id,
        studentId,
        name,
        email,
        contactNo: contactNo || null,
        programmeId,
        currentSemester: parseInt(currentSemester) || 1,
        section: section || null
      },
      include: {
        programme: true
      }
    })

    return NextResponse.json({
      success: true,
      student
    })
  } catch (error: any) {
    console.error('Create student error:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Email or Student ID already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create student' },
      { status: 500 }
    )
  }
}
