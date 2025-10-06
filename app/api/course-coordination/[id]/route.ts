import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assignmentId = parseInt(params.id)
    console.log('🗑️ Removing assignment:', assignmentId)

    await prisma.courseAssignment.update({
      where: { id: assignmentId },
      data: { isActive: false }
    })

    console.log('✅ Assignment removed')
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('❌ Error removing assignment:', error)
    return NextResponse.json(
      { error: 'Failed to remove assignment' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assignmentId = parseInt(params.id)
    const body = await request.json()
    console.log('📝 Updating assignment:', assignmentId, body)

    const assignment = await prisma.courseAssignment.update({
      where: { id: assignmentId },
      data: {
        role: body.role,
        isActive: body.isActive !== undefined ? body.isActive : true
      },
      include: {
        course: true,
        faculty: true
      }
    })

    console.log('✅ Assignment updated')
    return NextResponse.json(assignment)

  } catch (error) {
    console.error('❌ Error updating assignment:', error)
    return NextResponse.json(
      { error: 'Failed to update assignment' },
      { status: 500 }
    )
  }
}
