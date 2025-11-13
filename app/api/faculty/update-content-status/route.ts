import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest) {
  try {
    const { contentId, status } = await request.json()

    if (!contentId || !status) {
      return NextResponse.json({ 
        success: false, 
        error: 'Content ID and status required' 
      }, { status: 400 })
    }

    if (!['APPROVED', 'REJECTED', 'PENDING', 'CHANGES_REQUIRED'].includes(status)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid status' 
      }, { status: 400 })
    }

    const content = await prisma.teachingContent.update({
      where: { id: contentId },
      data: { approvalStatus: status }
    })

    return NextResponse.json({
      success: true,
      content
    })
  } catch (error) {
    console.error('Error updating status:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Error updating status' 
    }, { status: 500 })
  }
}
