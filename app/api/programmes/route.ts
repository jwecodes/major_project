import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const session = searchParams.get('session')

    let whereClause = {}
    if (session) {
      whereClause = { session }
    }

    const programmes = await prisma.programme.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            courses: true,
            students: true
          }
        }
      },
      orderBy: [
        { session: 'desc' },
        { programmeName: 'asc' }
      ]
    })

    return NextResponse.json(programmes)
  } catch (error) {
    console.error('Error fetching programmes:', error)
    return NextResponse.json(
      { message: 'Failed to fetch programmes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
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

    // Check if programme code already exists
    const existingProgramme = await prisma.programme.findFirst({
      where: {
        OR: [
          { programmeCode },
          { session, programmeCode }
        ]
      }
    })

    if (existingProgramme) {
      return NextResponse.json(
        { message: 'Programme code already exists' },
        { status: 400 }
      )
    }

    const programme = await prisma.programme.create({
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

    return NextResponse.json(programme, { status: 201 })
  } catch (error) {
    console.error('Error creating programme:', error)
    return NextResponse.json(
      { message: 'Failed to create programme' },
      { status: 500 }
    )
  }
}
