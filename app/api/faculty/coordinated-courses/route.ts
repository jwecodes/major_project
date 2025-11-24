import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json(
      { success: false, error: 'Missing email' },
      { status: 400 }
    )
  }

  // Directly find allocations where the linked User has this email
  const allocations = await prisma.courseAllocation.findMany({
    where: {
      role: 'COORDINATOR',
      faculty: {
        user: {
          email,            // User.email
        },
      },
    },
    include: {
      course: true,
    },
  })

  // Group by courseCode; keep list of courseIds for that code
  const map = new Map<
    string,
    { courseCode: string; courseName: string; courseIds: string[] }
  >()

  for (const a of allocations) {
    const key = a.course.courseCode
    if (!map.has(key)) {
      map.set(key, {
        courseCode: a.course.courseCode,
        courseName: a.course.courseName,
        courseIds: [a.courseId],
      })
    } else {
      const existing = map.get(key)!
      if (!existing.courseIds.includes(a.courseId)) {
        existing.courseIds.push(a.courseId)
      }
    }
  }

  const courses = Array.from(map.values())

  // Always success; if there are no coordinator courses, `courses` will be []
  return NextResponse.json({ success: true, courses })
}
