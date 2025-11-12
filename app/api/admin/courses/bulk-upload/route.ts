import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { courses } = body

    if (!Array.isArray(courses) || courses.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid courses data' },
        { status: 400 }
      )
    }

    let successCount = 0
    const errors: any[] = []
    const session = new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)

    for (const courseData of courses) {
      try {
        const { 'Course Code': courseCode, 'Course Name': courseName, 'Semester': semester, 'Programme ID': programmeId, 'Credits': credits, 'L': l, 'T': t, 'P': p, 'S': s, 'Course Type': courseType, 'Delivery Mode': deliveryMode, 'Category': category } = courseData

        if (!courseCode || !courseName || !programmeId || !courseType || !deliveryMode) {
          errors.push({
            row: courseCode || 'Unknown',
            error: 'Missing required fields'
          })
          continue
        }

        await prisma.course.create({
          data: {
            courseCode,
            courseName,
            semester: parseInt(semester) || 1,
            programmeId,
            credits: parseInt(credits) || 3,
            l: parseInt(l) || 0,
            t: parseInt(t) || 0,
            p: parseInt(p) || 0,
            s: parseInt(s) || 0,
            courseType,
            deliveryMode,
            category: category || 'MANDATORY',
            session,
            totalHours: (parseInt(l) || 0) + (parseInt(t) || 0) + (parseInt(p) || 0)
          }
        })

        successCount++
      } catch (error: any) {
        errors.push({
          row: courseData['Course Code'] || 'Unknown',
          error: error.message
        })
      }
    }

    return NextResponse.json({
      success: true,
      count: successCount,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error: any) {
    console.error('Bulk upload error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Bulk upload failed' },
      { status: 500 }
    )
  }
}
