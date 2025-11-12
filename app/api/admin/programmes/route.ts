// import { NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'

// export async function GET() {
//   try {
//     const programmes = await prisma.programme.findMany({
//       orderBy: { createdAt: 'desc' }
//     })

//     return NextResponse.json({
//       success: true,
//       programmes
//     })
//   } catch (error) {
//     console.error('Get programmes error:', error)
//     return NextResponse.json(
//       { success: false, error: 'Failed to fetch programmes' },
//       { status: 500 }
//     )
//   }
// }

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get all programmes
export async function GET() {
  try {
    const programmes = await prisma.programme.findMany({
      orderBy: [
        { session: 'desc' },
        { programmeCode: 'asc' },
        { section: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      programmes
    })
  } catch (error) {
    console.error('Get programmes error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch programmes' },
      { status: 500 }
    )
  }
}
