// import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'

// export async function PATCH(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const { status } = await request.json()

//     const content = await prisma.teachingContent.update({
//       where: { id: params.id },
//       data: { approvalStatus: status }
//     })

//     return NextResponse.json({
//       success: true,
//       content
//     })
//   } catch (error) {
//     console.error('Error:', error)
//     return NextResponse.json({ success: false, error: 'Error updating status' }, { status: 500 })
//   }
// }
