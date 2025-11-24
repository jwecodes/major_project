import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { role } = body

    await prisma.courseAllocation.update({
      where: { id: params.id },
      data: { role }
    })

    return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error('Error updating allocation:', error)
    return NextResponse.json(
      { error: 'Failed to update allocation' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.courseAllocation.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error('Error deleting allocation:', error)
    return NextResponse.json(
      { error: 'Failed to delete allocation' },
      { status: 500 }
    )
  }
}
