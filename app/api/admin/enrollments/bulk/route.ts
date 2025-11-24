import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all students
    const students = await prisma.student.findMany()

    let enrollmentCount = 0

    for (const student of students) {
      // Find courses for this student's programme and semester
      const courses = await prisma.course.findMany({
        where: {
          programmeId: student.programmeId,
          semester: student.currentSemester
        }
      })

      for (const course of courses) {
        // Check if already enrolled
        const existing = await prisma.studentEnrollment.findFirst({
          where: {
            studentId: student.id,
            courseId: course.id
          }
        })

        if (!existing) {
          await prisma.studentEnrollment.create({
            data: {
              studentId: student.id,
              courseId: course.id,
              enrolledAt: new Date()
            }
          })
          enrollmentCount++
        }
      }
    }

    return NextResponse.json({
      success: true,
      count: enrollmentCount
    })
  } catch (error) {
    console.error('Error bulk enrolling:', error)
    return NextResponse.json(
      { error: 'Failed to bulk enroll students' },
      { status: 500 }
    )
  }
}
