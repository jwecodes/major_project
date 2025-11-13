import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cho = await prisma.courseHandout.findUnique({
      where: { id: params.id },
      include: {
        faculty: {
          select: {
            name: true,
            email: true,
            designation: true
          }
        },
        course: {
          select: {
            courseCode: true,
            courseName: true,
            semester: true
          }
        }
      }
    })

    if (!cho) {
      return NextResponse.json({ 
        success: false, 
        error: 'CHO not found' 
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      cho
    })
  } catch (error) {
    console.error('Error fetching CHO:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Error fetching CHO' 
    }, { status: 500 })
  }
}

// Update CHO status (approve/reject)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json()

    if (!['APPROVED', 'REJECTED', 'DRAFT'].includes(status)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid status' 
      }, { status: 400 })
    }

    const cho = await prisma.courseHandout.update({
      where: { id: params.id },
      data: { status }
    })

    return NextResponse.json({
      success: true,
      message: `CHO ${status.toLowerCase()} successfully`,
      cho
    })
  } catch (error) {
    console.error('Error updating CHO:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Error updating CHO' 
    }, { status: 500 })
  }
}
