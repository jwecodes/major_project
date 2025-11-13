import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email')

    if (!email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email required' 
      }, { status: 400 })
    }

    const faculty = await prisma.faculty.findUnique({
      where: { email }
    })

    if (!faculty) {
      return NextResponse.json({ 
        success: false, 
        error: 'Faculty not found' 
      }, { status: 404 })
    }

    // Get all courses where faculty is COORDINATOR
    const allocations = await prisma.courseAllocation.findMany({
      where: {
        facultyId: faculty.id,
        role: 'COORDINATOR'
      },
      include: {
        course: true
      }
    })

    // Group by courseCode
    const grouped: Record<string, { courseCode: string, courseName: string, courseIds: string[] }> = {}

    allocations.forEach(alloc => {
      const key = alloc.course.courseCode
      if (!grouped[key]) {
        grouped[key] = {
          courseCode: alloc.course.courseCode,
          courseName: alloc.course.courseName,
          courseIds: []
        }
      }
      grouped[key].courseIds.push(alloc.course.id)
    })

    return NextResponse.json({
      success: true,
      courses: Object.values(grouped)
    })
  } catch (error) {
    console.error('Error fetching coordinated courses:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Error fetching courses' 
    }, { status: 500 })
  }
}
