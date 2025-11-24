import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  // Fetch root + all linked revisions (forward only–can expand to full chain if needed)
  const chain = await prisma.teachingContent.findMany({
    where: {
      OR: [
        { id: params.id },
        { updatedFromId: params.id }
      ]
    },
    orderBy: { createdAt: 'asc' }
  })
  return NextResponse.json({ success: true, revisions: chain })
}
