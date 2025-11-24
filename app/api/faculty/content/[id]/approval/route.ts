import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { status, notes } = await request.json()

  if (!['APPROVED', 'REJECTED', 'CHANGES_REQUIRED'].includes(status)) {
    return NextResponse.json(
      { success: false, error: 'Invalid status' },
      { status: 400 }
    )
  }

  if (status === 'CHANGES_REQUIRED' && (!notes || !notes.trim())) {
    return NextResponse.json(
      { success: false, error: 'Feedback is required when requesting changes' },
      { status: 400 }
    )
  }

  await prisma.teachingContent.update({
    where: { id: params.id },
    data: {
      approvalStatus: status,
      coordinatorNotes: status === 'CHANGES_REQUIRED' ? notes : null,
    },
  })

  return NextResponse.json({ success: true })
}
