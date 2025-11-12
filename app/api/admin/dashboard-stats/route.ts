import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get all statistics in parallel
    const [
      totalProgrammes,
      totalCourses,
      totalFaculty,
      totalStudents,
      pendingApprovals,
      approvedContent,
      totalContent,
      recentUploads
    ] = await Promise.all([
      prisma.programme.count(),
      prisma.course.count(),
      prisma.faculty.count(),
      prisma.student.count(),
      prisma.teachingContent.count({ where: { approvalStatus: 'PENDING' } }),
      prisma.teachingContent.count({ where: { approvalStatus: 'APPROVED' } }),
      prisma.teachingContent.count(),
      prisma.teachingContent.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          course: true,
          faculty: true
        }
      })
    ])

    return NextResponse.json({
      success: true,
      stats: {
        totalProgrammes,
        totalCourses,
        totalFaculty,
        totalStudents,
        pendingApprovals,
        approvedContent,
        totalContent,
        recentUploads
      }
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load dashboard stats' },
      { status: 500 }
    )
  }
}
