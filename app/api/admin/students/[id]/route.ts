// import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'

// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const student = await prisma.student.findUnique({
//       where: { id: params.id }
//     })

//     if (student) {
//       await prisma.user.delete({
//         where: { id: student.userId }
//       })
//     }

//     return NextResponse.json({ success: true })
//   } catch (error) {
//     console.error('Delete student error:', error)
//     return NextResponse.json(
//       { success: false, error: 'Failed to delete student' },
//       { status: 500 }
//     )
//   }
// }

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT - Update student
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { name, email, contactNo, programmeId, currentSemester, section } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required' },
        { status: 400 }
      )
    }

    const student = await prisma.student.update({
      where: { id },
      data: {
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
    console.error('Update student error:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update student' },
      { status: 500 }
    )
  }
}

// DELETE - Delete student
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required' },
        { status: 400 }
      )
    }

    // Find student first
    const student = await prisma.student.findUnique({
      where: { id }
    })

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      )
    }

    // Delete enrollments first (foreign key constraint)
    await prisma.studentEnrollment.deleteMany({
      where: { studentId: id }
    })

    // Delete student
    await prisma.student.delete({
      where: { id }
    })

    // Optionally delete user (if no other references)
    try {
      await prisma.user.delete({
        where: { id: student.userId }
      })
    } catch (error) {
      console.warn('Could not delete user:', student.userId)
    }

    return NextResponse.json({
      success: true,
      message: 'Student deleted successfully'
    })
  } catch (error: any) {
    console.error('Delete student error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete student' },
      { status: 500 }
    )
  }
}
