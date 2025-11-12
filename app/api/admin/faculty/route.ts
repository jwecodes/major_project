import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const faculty = await prisma.faculty.findMany({
      include: {
        user: {
          select: {
            email: true,
            role: true
          }
        },
        courseAllocations: {
          include: {
            course: {
              include: {
                programme: {
                  select: {
                    id: true,
                    programmeCode: true,
                    programmeName: true,
                    section: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ success: true, faculty })
  } catch (error: any) {
    console.error('Get faculty error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      facultyId,
      name,
      designation,
      email,
      contactNo,
      department,
      programmeId
    } = body

    // Validate required fields
    if (!facultyId || !name || !designation || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if faculty already exists
    const existingFaculty = await prisma.faculty.findFirst({
      where: {
        OR: [{ facultyId }, { email }]
      }
    })

    if (existingFaculty) {
      return NextResponse.json(
        { success: false, error: 'Faculty ID or Email already exists' },
        { status: 400 }
      )
    }

    // Check if user already exists or create new user
    let user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          role: 'FACULTY'
        }
      })
    }

    // Create faculty
    const faculty = await prisma.faculty.create({
      data: {
        userId: user.id,
        facultyId,
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
            course: true
          }
        }
      }
    })

    return NextResponse.json(
      { success: true, faculty, message: 'Faculty created successfully' },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create faculty error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
