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

    const allocations = await prisma.courseAllocation.findMany({
      where: { facultyId: params.id },
      include: {
        course: {
          include: {
            programme: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      allocations
    })
  } catch (error) {
    console.error('Error fetching course allocations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch course allocations' },
      { status: 500 }
    )
  }
}
