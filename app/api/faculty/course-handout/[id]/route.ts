import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const cho = await prisma.courseHandout.findUnique({
      where: { id }
    })

    if (!cho) {
      return NextResponse.json({ 
        success: false, 
        error: 'CHO not found' 
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      cho
    })
  } catch (error) {
    console.error('Error fetching CHO:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Error fetching CHO' 
    }, { status: 500 })
  }
}
