// import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'

// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     await prisma.studentEnrollment.delete({
//       where: { id: params.id }
//     })

//     return NextResponse.json({ success: true })
//   } catch (error: any) {
//     console.error('Delete enrollment error:', error)
//     return NextResponse.json(
//       { success: false, error: error.message || 'Failed to delete enrollment' },
//       { status: 500 }
//     )
//   }
// }

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE - Remove enrollment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Enrollment ID is required' },
        { status: 400 }
      )
    }

    const enrollment = await prisma.studentEnrollment.findUnique({
      where: { id }
    })

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: 'Enrollment not found' },
        { status: 404 }
      )
    }

    await prisma.studentEnrollment.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Enrollment removed successfully'
    })
  } catch (error: any) {
    console.error('Delete enrollment error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete enrollment' },
      { status: 500 }
    )
  }
}
