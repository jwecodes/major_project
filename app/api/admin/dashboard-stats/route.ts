import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Check authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const userRoles = await prisma.userRole.findMany({
      where: {
        userId: user.id,
        isActive: true
      },
      select: { role: true }
    })

    const roles = userRoles.map(r => r.role)
    
    if (!roles.includes('ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch all stats in parallel
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
      // Total Programmes
      prisma.programme.count(),
      
      // Total Courses
      prisma.course.count(),
      
      // Total Faculty
      prisma.faculty.count(),
      
      // Total Students
      prisma.student.count(),
      
      // Pending Approvals
      prisma.teachingContent.count({
        where: {
          approvalStatus: 'PENDING'
        }
      }),
      
      // Approved Content
      prisma.teachingContent.count({
        where: {
          approvalStatus: 'APPROVED'
        }
      }),
      
      // Total Content
      prisma.teachingContent.count(),
      
      // Recent Uploads (last 5)
      prisma.teachingContent.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          course: {
            select: {
              courseCode: true,
              courseName: true
            }
          },
          faculty: {
            select: {
              name: true,
              facultyId: true
            }
          }
        }
      })
    ])

    const stats = {
      totalProgrammes,
      totalCourses,
      totalFaculty,
      totalStudents,
      pendingApprovals,
      approvedContent,
      totalContent,
      recentUploads
    }

    return NextResponse.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
