import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type RouteParams = Promise<{ id: string }>

export async function GET(
  request: NextRequest,
  { params }: { params: Awaited<RouteParams> }
) {
  try {
    const { id } = params

    const course = await prisma.course.findUnique({
      where: { id },
      include: { programme: true }
    })

    return NextResponse.json({ success: true, course })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Awaited<RouteParams> }
) {
  try {
    const { id } = params
    const body = await request.json()

    const course = await prisma.course.update({
      where: { id },
      data: body
    })

    return NextResponse.json({ success: true, course })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Awaited<RouteParams> }
) {
  try {
    const { id } = params

    await prisma.course.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
