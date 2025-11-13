import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseCode = request.nextUrl.searchParams.get('courseCode')
    
    if (!courseCode) {
      return NextResponse.json({ success: false, error: 'Course code required' }, { status: 400 })
    }

    const cho = await prisma.courseHandout.findFirst({
      where: {
        facultyId: params.id,
        courseCode
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
    console.error('Error:', error)
    return NextResponse.json({ success: false, error: 'Error fetching CHO' }, { status: 500 })
  }
}
