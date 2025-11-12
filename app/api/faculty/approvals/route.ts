import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const facultyId = request.headers.get('x-faculty-id')

    if (!facultyId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Fetching coordinator courses for faculty:', facultyId)

    // Find all courses where this faculty is COORDINATOR
    const coordinatedCourses = await prisma.courseAllocation.findMany({
      where: {
        facultyId: facultyId,
        role: 'COORDINATOR'
      },
      select: { courseId: true }
    })

    console.log('Coordinated courses:', coordinatedCourses)

    if (coordinatedCourses.length === 0) {
      console.log('No coordinator courses found')
      return NextResponse.json({ success: true, contents: [] })
    }

    const courseIds = coordinatedCourses.map(c => c.courseId)
    console.log('Course IDs:', courseIds)

    // Get all content from those courses
    const contents = await prisma.teachingContent.findMany({
      where: {
        courseId: { in: courseIds }
      },
      include: {
        faculty: { select: { id: true, name: true, designation: true } },
        course: { select: { courseCode: true, courseName: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log('Found contents:', contents.length)

    return NextResponse.json({ success: true, contents })
  } catch (error: any) {
    console.error('Error in approvals API:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
