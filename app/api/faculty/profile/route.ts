import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const faculty = await prisma.faculty.findUnique({
      where: { userId: user.id }
    })

    if (!faculty) {
      return NextResponse.json(
        { success: false, error: 'Faculty profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      profile: faculty
    })
  } catch (error) {
    console.error('Error fetching faculty profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}
