import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ✅ GET METHOD - This must be present!
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    console.log('👤 Fetching faculty with ID:', id) // Debug log

    const faculty = await prisma.faculty.findUnique({
      where: { id },
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

    if (!faculty) {
      console.log('❌ Faculty not found with ID:', id) // Debug log
      return NextResponse.json(
        { success: false, error: 'Faculty not found' },
        { status: 404 }
      )
    }

    console.log('✅ Faculty found:', faculty.name) // Debug log

    return NextResponse.json({
      success: true,
      faculty
    })
  } catch (error: any) {
    console.error('❌ Get faculty error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

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

    if (!name || !designation || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const faculty = await prisma.faculty.findUnique({
      where: { id }
    })

    if (!faculty) {
      return NextResponse.json(
        { success: false, error: 'Faculty not found' },
        { status: 404 }
      )
    }

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
