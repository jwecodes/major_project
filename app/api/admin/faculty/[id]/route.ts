import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const {
      name,
      designation,
      email,
      contactNo,
      department,
      programmeId
    } = body

    // Validate required fields
    if (!name || !designation || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if faculty exists
    const faculty = await prisma.faculty.findUnique({
      where: { id }
    })

    if (!faculty) {
      return NextResponse.json(
        { success: false, error: 'Faculty not found' },
        { status: 404 }
      )
    }

    // Update faculty
    const updatedFaculty = await prisma.faculty.update({
      where: { id },
      data: {
        name,
        designation,
        email,
        contactNo: contactNo || null,
        department: department || null,
        programmeId: programmeId || null
      },
      include: {
        courseAllocations: {
          include: {
            course: {
              include: {
                programme: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      faculty: updatedFaculty,
      message: 'Faculty updated successfully'
    })
  } catch (error: any) {
    console.error('Update faculty error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const faculty = await prisma.faculty.findUnique({
      where: { id }
    })

    if (!faculty) {
      return NextResponse.json(
        { success: false, error: 'Faculty not found' },
        { status: 404 }
      )
    }

    // Delete faculty (will cascade delete allocations)
    await prisma.faculty.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Faculty deleted successfully'
    })
  } catch (error: any) {
    console.error('Delete faculty error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
