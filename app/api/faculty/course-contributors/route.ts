import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const courseIds = (searchParams.get('courseIds') || '')
    .split(',')
    .filter(Boolean)

  if (!courseIds.length) {
    return NextResponse.json(
      { success: false, error: 'Missing courseIds' },
      { status: 400 }
    )
  }

  const allocations = await prisma.courseAllocation.findMany({
    where: { courseId: { in: courseIds }, role: 'CONTRIBUTOR' },
    include: { faculty: true },
  })

  // Count teaching contents per contributor for these courses
  const contentCounts = await prisma.teachingContent.groupBy({
    by: ['facultyId'],
    where: {
      courseId: { in: courseIds },
    },
    _count: { _all: true },
  })

  const countMap = new Map<string, number>()
  contentCounts.forEach(c => {
    // @ts-ignore for _count typing
    countMap.set(c.facultyId, c._count._all)
  })

  const contributorsRaw = allocations.map(a => ({
    id: a.faculty.id,
    name: a.faculty.name,
    email: a.faculty.email,
    designation: a.faculty.designation ?? '',
    contentCount: countMap.get(a.faculty.id) ?? 0,
  }))

  // Unique contributors (in case of multiple allocations)
  const unique = Array.from(
    new Map(contributorsRaw.map(c => [c.id, c])).values()
  )

  return NextResponse.json({ success: true, contributors: unique })
}
