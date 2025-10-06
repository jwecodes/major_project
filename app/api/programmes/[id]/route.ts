import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const {
      session,
      programmeCode,
      programmeName,
      duration,
      semester,
      section,
      noOfStudents
    } = body

    // Validate required fields
    if (!session || !programmeCode || !programmeName || !duration || !semester) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if programme exists
    const existingProgramme = await prisma.programme.findUnique({
      where: { id }
    })

    if (!existingProgramme) {
      return NextResponse.json(
        { message: 'Programme not found' },
        { status: 404 }
      )
    }

    // Check if programme code already exists (excluding current programme)
    const duplicateProgramme = await prisma.programme.findFirst({
      where: {
        AND: [
          { programmeCode },
          { id: { not: id } }
        ]
      }
    })

    if (duplicateProgramme) {
      return NextResponse.json(
        { message: 'Programme code already exists' },
        { status: 400 }
      )
    }

    const updatedProgramme = await prisma.programme.update({
      where: { id },
      data: {
        session,
        programmeCode,
        programmeName,
        duration: parseInt(duration),
        semester: parseInt(semester),
        section: section || null, // Handle empty string as null
        noOfStudents: parseInt(noOfStudents) || 0
      }
    })

    return NextResponse.json(updatedProgramme)
  } catch (error) {
    console.error('Error updating programme:', error)
    return NextResponse.json(
      { message: 'Failed to update programme' },
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

    // Check if programme exists
    const existingProgramme = await prisma.programme.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            courses: true,
            students: true
          }
        }
      }
    })

    if (!existingProgramme) {
      return NextResponse.json(
        { message: 'Programme not found' },
        { status: 404 }
      )
    }

    // Check if programme has related data
    if (existingProgramme._count.courses > 0 || existingProgramme._count.students > 0) {
      return NextResponse.json(
        { 
          message: `Cannot delete programme with ${existingProgramme._count.courses} courses and ${existingProgramme._count.students} students. Remove related data first.` 
        },
        { status: 400 }
      )
    }

    await prisma.programme.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Programme deleted successfully' })
  } catch (error) {
    console.error('Error deleting programme:', error)
    return NextResponse.json(
      { message: 'Failed to delete programme' },
      { status: 500 }
    )
  }
}
