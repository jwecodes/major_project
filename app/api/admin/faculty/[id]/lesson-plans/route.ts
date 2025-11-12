import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const facultyId = params.id

    const lessonPlans = await prisma.lessonPlan.findMany({
      where: { facultyId },
      include: {
        course: {
          select: {
            courseCode: true,
            courseName: true,
            programme: {
              select: {
                programmeName: true,
                programmeCode: true,
                section: true
              }
            }
          }
        }
      },
      orderBy: { datePlanned: 'desc' }
    })

    return NextResponse.json({
      success: true,
      lessonPlans: lessonPlans.map(lp => ({
        id: lp.id,
        title: lp.title,
        lectureNumber: lp.lectureNumber,
        datePlanned: lp.datePlanned.toISOString(),
        dateConducted: lp.dateConducted?.toISOString() || null,
        topicsCovered: lp.topicsCovered,
        description: lp.description,
        status: lp.status,
        courseCode: lp.course.courseCode,
        courseName: lp.course.courseName,
        programmeName: lp.course.programme.programmeName,
        programmeCode: lp.course.programme.programmeCode,
        section: lp.course.programme.section
      }))
    })
  } catch (error) {
    console.error('Error fetching lesson plans:', error)
    return NextResponse.json(
      { success: false, error: 'Error fetching lesson plans' },
      { status: 500 }
    )
  }
}
