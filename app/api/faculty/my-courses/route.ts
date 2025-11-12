import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const facultyId = request.headers.get('x-faculty-id')

    console.log('API: Received faculty ID:', facultyId)

    if (!facultyId) {
      console.log('API: No faculty ID, returning 401')
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const assignments = await prisma.courseAllocation.findMany({
      where: { facultyId },
      include: {
        course: {
          include: { programme: { select: { programmeCode: true, programmeName: true, section: true } } }
        }
      }
    })

    console.log('API: Found assignments:', assignments.length)

    return NextResponse.json({ success: true, assignments })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
