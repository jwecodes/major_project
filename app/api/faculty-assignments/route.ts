import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const session = searchParams.get('session') || '2024-2025'
    const programmeCode = searchParams.get('programmeCode')

    const assignments = await prisma.facultyAssignment.findMany({
      where: {
        session,
        ...(programmeCode && {
          programme: { programmeCode }
        }),
        isActive: true
      },
      include: {
        programme: {
          select: {
            programmeCode: true,
            programmeName: true
          }
        },
        course: {
          select: {
            code: true,
            name: true
          }
        },
        faculty: {
          select: {
            facultyId: true,
            name: true,
            designation: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: [
        { programme: { programmeName: 'asc' } },
        { course: { name: 'asc' } }
      ]
    })

    return NextResponse.json(assignments)
  } catch (error) {
    console.error('❌ Error fetching faculty assignments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch faculty assignments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const assignment = await prisma.facultyAssignment.create({
      data: {
        session: body.session || '2024-2025',
        programmeId: parseInt(body.programmeId),
        courseId: parseInt(body.courseId),
        facultyId: parseInt(body.facultyId),
        role: body.role || 'coordinator',
        assignedBy: body.assignedBy || 'Admin',
        isActive: true
      },
      include: {
        programme: true,
        course: true,
        faculty: true
      }
    })

    return NextResponse.json(assignment, { status: 201 })
  } catch (error: any) {
    console.error('❌ Error creating faculty assignment:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create faculty assignment',
        details: error.message
      },
      { status: 500 }
    )
  }
}
