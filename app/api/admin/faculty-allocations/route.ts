import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const allocations = await prisma.courseAllocation.findMany({
      include: {
        faculty: {
          select: {
            id: true,
            facultyId: true,
            name: true,
            email: true
          }
        },
        course: {
          include: {
            programme: {
              select: {
                id: true,
                programmeCode: true,
                programmeName: true,
                section: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ success: true, allocations })
  } catch (error: any) {
    console.error('Get allocations error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
