import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const courseIdsParam = searchParams.get('courseIds')

    if (!courseIdsParam) {
      return NextResponse.json({ error: 'courseIds required' }, { status: 400 })
    }

    const courseIds = courseIdsParam.split(',')

    const [totalContent, approved, pending, rejected] = await Promise.all([
      prisma.teachingContent.count({
        where: { courseId: { in: courseIds } }
      }),
      prisma.teachingContent.count({
        where: {
          courseId: { in: courseIds },
          approvalStatus: 'APPROVED'
        }
      }),
      prisma.teachingContent.count({
        where: {
          courseId: { in: courseIds },
          approvalStatus: 'PENDING'
        }
      }),
      prisma.teachingContent.count({
        where: {
          courseId: { in: courseIds },
          approvalStatus: 'REJECTED'
        }
      })
    ])

    return NextResponse.json({
      success: true,
      stats: {
        totalContent,
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
