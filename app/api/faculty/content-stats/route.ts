import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const faculty = await prisma.faculty.findUnique({
      where: { userId: user.id }
    })

    if (!faculty) {
      return NextResponse.json(
        { success: false, error: 'Faculty not found' },
        { status: 404 }
      )
    }

    const [total, approved, pending, rejected] = await Promise.all([
      prisma.teachingContent.count({
        where: { facultyId: faculty.id }
      }),
      prisma.teachingContent.count({
        where: {
          facultyId: faculty.id,
          approvalStatus: 'APPROVED'
        }
      }),
      prisma.teachingContent.count({
        where: {
          facultyId: faculty.id,
          approvalStatus: 'PENDING'
        }
      }),
      prisma.teachingContent.count({
        where: {
          facultyId: faculty.id,
          approvalStatus: 'REJECTED'
        }
      })
    ])

    return NextResponse.json({
      success: true,
      stats: {
        total,
        approved,
        pending,
        rejected
      }
    })
  } catch (error) {
    console.error('Error fetching content stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content stats' },
      { status: 500 }
    )
  }
}
