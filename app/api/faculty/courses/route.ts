import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email')

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 })
    }

    const faculty = await prisma.faculty.findUnique({
      where: { email },
      include: {
        courseAllocations: {
          include: {
            course: {
              include: {
                programme: true
              }
            }
          }
        }
      }
    })

    if (!faculty) {
      return NextResponse.json({ success: false, error: 'Faculty not found' }, { status: 404 })
    }

    const courses = faculty.courseAllocations.map(alloc => ({
      id: alloc.course.id,
      courseCode: alloc.course.courseCode,
      courseName: alloc.course.courseName,
      semester: alloc.course.semester,
      session: alloc.course.session,
      programme: {
        programmeName: alloc.course.programme.programmeName,
        programmeCode: alloc.course.programme.programmeCode,
        section: alloc.course.programme.section
      },
      allocation: {
        role: alloc.role
      }
    }))

    return NextResponse.json({ success: true, courses })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json({ success: false, error: 'Error fetching courses' }, { status: 500 })
  }
}
