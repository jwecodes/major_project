import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const facultyId = params.id

    console.log('📚 Fetching courses for faculty ID:', facultyId)

    // Fetch course allocations with full details
    const allocations = await prisma.courseAllocation.findMany({
      where: {
        facultyId: facultyId
      },
      include: {
        course: {
          include: {
            programme: true
          }
        }
      },
      orderBy: {
        course: {
          semester: 'asc'
        }
      }
    })

    console.log('✅ Found allocations:', allocations.length)

    if (allocations.length === 0) {
      return NextResponse.json({
        success: true,
        allocations: [],
        message: 'No courses allocated to this faculty'
      })
    }

    // Format the response
    const formattedAllocations = allocations.map(alloc => ({
      id: alloc.id,
      facultyId: alloc.facultyId,
      courseId: alloc.courseId,
      role: alloc.role,
      course: {
        id: alloc.course.id,
        courseCode: alloc.course.courseCode,
        courseName: alloc.course.courseName,
        semester: alloc.course.semester,
        session: alloc.course.session,
        programme: {
          id: alloc.course.programme.id,
          programmeCode: alloc.course.programme.programmeCode,
          programmeName: alloc.course.programme.programmeName,
          section: alloc.course.programme.section
        }
      }
    }))

    return NextResponse.json({
      success: true,
      allocations: formattedAllocations
    })
  } catch (error) {
    console.error('❌ Error fetching course allocations:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error fetching course allocations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
