import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const allocations = await prisma.courseAllocation.findMany({
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
            email: true,
            designation: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      allocations
    })
  } catch (error) {
    console.error('Get allocations error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch allocations' },
      { status: 500 }
    )
  }
}
