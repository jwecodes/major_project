import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: materialId } = params
    const body = await request.json()
    const { action, reason } = body

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { message: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      )
    }

    // Note: This assumes you have a CourseMaterial model
    // If not, you'll need to create it in your schema first
    /*
    const material = await prisma.courseMaterial.findUnique({
      where: { id: materialId },
      include: {
        uploader: true
      }
    })

    if (!material) {
      return NextResponse.json(
        { message: 'Course material not found' },
        { status: 404 }
      )
    }

    if (material.approvalStatus !== 'PENDING') {
      return NextResponse.json(
        { message: 'Material has already been reviewed' },
        { status: 400 }
      )
    }

    if (action === 'reject' && !reason?.trim()) {
      return NextResponse.json(
        { message: 'Rejection reason is required' },
        { status: 400 }
      )
    }

    // Update approval status
    const updateData: any = {
      approvalStatus: action === 'approve' ? 'APPROVED' : 'REJECTED',
      approvedAt: new Date(),
    }

    if (action === 'reject') {
      updateData.rejectionReason = reason
    }

    const updatedMaterial = await prisma.courseMaterial.update({
      where: { id: materialId },
      data: updateData,
      include: {
        uploader: true,
        approver: true
      }
    })

    return NextResponse.json({
      message: `Material ${action}d successfully`,
      material: updatedMaterial
    })
    */

    // Temporary response until CourseMaterial model is implemented
    return NextResponse.json({
      message: `Material ${action}d successfully (mock response - implement CourseMaterial model)`,
      material: { id: materialId, status: action === 'approve' ? 'APPROVED' : 'REJECTED' }
    })
  } catch (error) {
    console.error('Error processing material approval:', error)
    return NextResponse.json(
      { message: 'Failed to process material approval' },
      { status: 500 }
    )
  }
}
