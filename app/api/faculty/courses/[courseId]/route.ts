import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type RouteParams = Promise<{ courseId: string }>

export async function GET(request: NextRequest, { params }: { params: Awaited<RouteParams> }) {
  try {
    const facultyId = request.headers.get('x-faculty-id')
    const { courseId } = await params

    console.log('=== COURSE DETAIL API ===')
    console.log('Faculty ID:', facultyId)
    console.log('Course ID:', courseId)

    if (!facultyId) {
      console.log('No faculty ID, returning 401')
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Get the course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { programme: true }
    })

    console.log('Course found:', course?.courseCode)

    if (!course) {
      console.log('Course not found')
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 })
    }

    // Check if faculty is assigned to this course
    const assignment = await prisma.courseAllocation.findFirst({
      where: { 
        facultyId,
        courseId 
      }
    })

    console.log('Assignment:', assignment?.role)

    if (!assignment) {
      console.log('Faculty not assigned to this course')
      return NextResponse.json({ success: false, error: 'Not assigned to this course' }, { status: 403 })
    }

    const isCoordinator = assignment.role === 'COORDINATOR'
    console.log('Is Coordinator:', isCoordinator)

    // Get all course team members
    const team = await prisma.courseAllocation.findMany({
      where: { courseId },
      include: { 
        faculty: { 
          select: { 
            id: true,
            name: true, 
            designation: true 
          } 
        } 
      }
    })

    console.log('Team members found:', team.length)
    console.log('Team:', team.map(t => ({ name: t.faculty.name, role: t.role })))

    // Get all content for this course
    const contents = await prisma.teachingContent.findMany({
      where: { courseId },
      include: { 
        faculty: { 
          select: { 
            id: true,
            name: true, 
            designation: true 
          } 
        } 
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log('Total contents in course:', contents.length)
    console.log('Contents:', contents.map(c => ({ title: c.title, status: c.approvalStatus, by: c.facultyId })))

    // If not coordinator, only show approved content
    const visibleContents = isCoordinator 
      ? contents  
      : contents.filter(c => c.approvalStatus === 'APPROVED')

    console.log('Visible contents for this user:', visibleContents.length)

    return NextResponse.json({
      success: true,
      course,
      isCoordinator,
      team: team.map(t => ({ 
        id: t.id, 
        name: t.faculty.name, 
        designation: t.faculty.designation, 
        role: t.role 
      })),
      contents: visibleContents
    })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
