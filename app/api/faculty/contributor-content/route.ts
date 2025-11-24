import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const facultyId = searchParams.get('facultyId')
  const courseIdsParam = searchParams.get('courseIds') // can be 'ALL' or csv

  if (!facultyId) {
    return NextResponse.json(
      { success: false, error: 'Missing facultyId' },
      { status: 400 }
    )
  }

  let where: any = { facultyId }

  // If courseIds provided and not "ALL", filter by them
  if (courseIdsParam && courseIdsParam !== 'ALL') {
    const courseIds = courseIdsParam.split(',').filter(Boolean)
    if (courseIds.length) {
      where.courseId = { in: courseIds }
    }
  }

  const content = await prisma.teachingContent.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      course: true,
      faculty: true,
    },
  })

  const mapped = content.map(item => ({
    id: item.id,
    title: item.title,
    contentType: item.contentType,
    fileName: item.fileName,
    filePath: item.filePath,
    approvalStatus: item.approvalStatus,
    coordinatorNotes: item.coordinatorNotes ?? undefined,
    courseId: item.courseId,
    createdAt: item.createdAt,
    uploadDate: item.createdAt, // for CoordinationPage
    // TODO: if you have a helper for Supabase public URL, use that here
    fileUrl: item.filePath,     // temporary: coordination page expects fileUrl
    updatedFromId: item.updatedFromId,

    // For coordination page – harmless extra data for contributor dashboard
    contributor: {
      name: item.faculty.name,
      email: item.faculty.email,
    },
    course: {
      courseCode: item.course.courseCode,
      courseName: item.course.courseName,
    },
  }))

  return NextResponse.json({ success: true, content: mapped })
}
