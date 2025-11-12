import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const lessonPlan = await prisma.lessonPlan.update({
      where: { id: params.id },
      data: {
        courseId,
        title,
        lectureNumber: lectureNumber ? parseInt(lectureNumber) : null,
        datePlanned: new Date(datePlanned),
        dateConducted: dateConducted ? new Date(dateConducted) : null,
        topicsCovered,
        description
      }
    })

    return NextResponse.json({ success: true, lessonPlan })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ success: false, error: 'Error updating lesson plan' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    await prisma.lessonPlan.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ success: false, error: 'Error deleting lesson plan' }, { status: 500 })
  }
}
