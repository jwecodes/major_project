import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email')

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 })
    }

    const faculty = await prisma.faculty.findUnique({
      where: { email }
    })

    if (!faculty) {
      return NextResponse.json({ success: false, error: 'Faculty not found' }, { status: 404 })
    }

    const lessonPlans = await prisma.lessonPlan.findMany({
      where: { facultyId: faculty.id },
      include: {
        course: {
          select: {
            courseCode: true,
            courseName: true
          }
        }
      },
      orderBy: { datePlanned: 'desc' }
    })

    return NextResponse.json({ success: true, lessonPlans })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ success: false, error: 'Error fetching lesson plans' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email')

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 })
    }

    const faculty = await prisma.faculty.findUnique({
      where: { email }
    })

    if (!faculty) {
      return NextResponse.json({ success: false, error: 'Faculty not found' }, { status: 404 })
    }

    const body = await request.json()
    const { courseId, title, lectureNumber, datePlanned, dateConducted, topicsCovered, description } = body

    if (!courseId || !title || !datePlanned || !topicsCovered) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const lessonPlan = await prisma.lessonPlan.create({
      data: {
        courseId,
        facultyId: faculty.id,
        title,
        lectureNumber: lectureNumber ? parseInt(lectureNumber) : null,
        datePlanned: new Date(datePlanned),
        dateConducted: dateConducted ? new Date(dateConducted) : null,
        topicsCovered,
        description,
        status: 'DRAFT'
      }
    })

    return NextResponse.json({ success: true, lessonPlan })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ success: false, error: 'Error creating lesson plan' }, { status: 500 })
  }
}
