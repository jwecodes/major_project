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

    const faculty = await prisma.faculty.findUnique({
      where: { userId: user.id }
    })

    if (!faculty) {
      return NextResponse.json(
        { success: false, error: 'Faculty not found' },
        { status: 404 }
      )
    }

    const allocations = await prisma.courseAllocation.findMany({
      where: { facultyId: faculty.id },
      include: {
        course: {
          include: {
            programme: true
          }
        }
      },
      orderBy: {
        course: {
          courseCode: 'asc'
        }
      }
    })

    const courses = allocations.map(allocation => ({
      id: allocation.course.id,
      courseCode: allocation.course.courseCode,
      courseName: allocation.course.courseName,
      semester: allocation.course.semester,
      credits: allocation.course.credits,
      programme: {
        programmeCode: allocation.course.programme.programmeCode,
        programmeName: allocation.course.programme.programmeName,
        section: allocation.course.programme.section
      },
      allocation: {
        role: allocation.role
      }
    }))

    return NextResponse.json({
      success: true,
      courses
    })
  } catch (error) {
    console.error('Error fetching faculty courses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}
