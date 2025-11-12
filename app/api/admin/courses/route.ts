import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        programme: {
          select: {
            id: true,
            programmeCode: true,
            programmeName: true,
            section: true
          }
        }
      },
      orderBy: [{ courseCode: 'asc' }]
    })

    return NextResponse.json({
      success: true,
      courses
    })
  } catch (error) {
    console.error('Get courses error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { courseCode, courseName, semester, programmeId, credits, l, t, p, s, courseType, deliveryMode, category } = body

    if (!courseCode || !courseName || !programmeId || !courseType || !deliveryMode) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const session = new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)

    const course = await prisma.course.create({
      data: {
        courseCode,
        courseName,
        semester,
        programmeId,
        credits: parseInt(credits),
        l: parseInt(l),
        t: parseInt(t),
        p: parseInt(p),
        s: parseInt(s),
        courseType,
        deliveryMode,
        category,
        session,
        totalHours: parseInt(l) + parseInt(t) + parseInt(p)
      },
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
    })

    return NextResponse.json({
      success: true,
      course
    })
  } catch (error: any) {
    console.error('Create course error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create course' },
      { status: 500 }
    )
  }
}
