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

    const allocations = await prisma.courseAllocation.findMany({
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
            email: true,
            designation: true
          }
        },
        course: {
          select: {
            id: true,
            courseCode: true,
            courseName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      allocations
    })
  } catch (error) {
    console.error('Error fetching allocations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch allocations' },
      { status: 500 }
    )
  }
}
