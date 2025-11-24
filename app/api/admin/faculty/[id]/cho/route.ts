import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const courseCode = searchParams.get('courseCode')
    
    if (!courseCode) {
      return NextResponse.json({ error: 'courseCode required' }, { status: 400 })
    }

    // Find CHO for this faculty and course
    const cho = await prisma.courseHandout.findFirst({
      where: {
        facultyId: params.id,
        courseCode: courseCode
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      cho
    })
  } catch (error) {
    console.error('Error fetching CHO:', error)
    return NextResponse.json(
      { error: 'Failed to fetch CHO' },
      { status: 500 }
    )
  }
}
