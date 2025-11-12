import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { facultyId, courseIds } = body

    if (!facultyId || !Array.isArray(courseIds)) {
      return NextResponse.json(
        { success: false, error: 'Invalid data' },
        { status: 400 }
      )
    }

    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId }
    })

    if (!faculty) {
      return NextResponse.json(
        { success: false, error: 'Faculty not found' },
        { status: 404 }
      )
    }

    // Delete existing allocations for this faculty
    await prisma.courseAllocation.deleteMany({
      where: { facultyId }
    })

    // Create new allocations
    let count = 0
    for (const courseId of courseIds) {
      const course = await prisma.course.findUnique({
        where: { id: courseId }
      })

      if (course) {
        await prisma.courseAllocation.create({
          data: {
            facultyId,
            courseId,
            role: 'CONTRIBUTOR'
          }
        })
        count++
      }
    }

    return NextResponse.json({
      success: true,
      count,
      message: `Assigned ${count} courses to faculty`
    })
  } catch (error: any) {
    console.error('Assign courses error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
