import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const enrollments = await prisma.studentEnrollment.findMany({
      include: {
        student: {
          include: {
            programme: true
          }
        },
        course: {
          include: {
            programme: true
          }
        }
      },
      orderBy: {
        enrolledAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      enrollments
    })
  } catch (error) {
    console.error('Error fetching enrollments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch enrollments' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { studentId, courseId } = body

    // Check if already enrolled
    const existing = await prisma.studentEnrollment.findFirst({
      where: {
        studentId,
        courseId
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Student already enrolled in this course' },
        { status: 400 }
      )
    }

    const enrollment = await prisma.studentEnrollment.create({
      data: {
        studentId,
        courseId,
        enrolledAt: new Date()
      },
      include: {
        student: true,
        course: true
      }
    })

    return NextResponse.json({
      success: true,
      enrollment
    })
  } catch (error) {
    console.error('Error creating enrollment:', error)
    return NextResponse.json(
      { error: 'Failed to create enrollment' },
      { status: 500 }
    )
  }
}
