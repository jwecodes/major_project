// app/api/programmes/route.ts - Fixed version
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/programmes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const session = searchParams.get('session')

    const programmes = await prisma.programme.findMany({
      where: session ? { session } : {},
      include: {
        courses: {
          include: {
            facultyAssignments: true
          }
        },
        _count: {
          select: {
            courses: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Add calculated fields with proper typing
    const programmesWithStats = programmes.map(programme => {
      const totalCredits = programme.courses.reduce((sum: number, course: any) => sum + course.credit, 0)
      const assignedCourses = programme.courses.filter((course: any) => 
        course.facultyAssignments.length > 0
      ).length
      const totalCourses = programme.courses.length

      return {
        ...programme,
        totalCredits,
        assignedCourses,
        unassignedCourses: totalCourses - assignedCourses,
        totalStudents: 0, // You can calculate this based on your student data
        assignmentRate: totalCourses > 0 ? Math.round((assignedCourses / totalCourses) * 100) : 0
      }
    })

    return NextResponse.json(programmesWithStats)
  } catch (error) {
    console.error('Error fetching programmes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch programmes' },
      { status: 500 }
    )
  }
}

// POST /api/programmes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, code, duration, session }: {
      name: string
      code: string
      duration: number
      session: string
    } = body

    // Validate required fields
    if (!name || !code || !duration || !session) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if programme code already exists for this session
    const existingProgramme = await prisma.programme.findFirst({
      where: {
        code,
        session
      }
    })

    if (existingProgramme) {
      return NextResponse.json(
        { error: 'Programme code already exists for this session' },
        { status: 409 }
      )
    }

    const programme = await prisma.programme.create({
      data: {
        name,
        code: code.toUpperCase(),
        duration,
        session,
        semesters: duration * 2
      },
      include: {
        courses: true,
        _count: {
          select: {
            courses: true
          }
        }
      }
    })

    return NextResponse.json(programme, { status: 201 })
  } catch (error) {
    console.error('Error creating programme:', error)
    return NextResponse.json(
      { error: 'Failed to create programme' },
      { status: 500 }
    )
  }
}
