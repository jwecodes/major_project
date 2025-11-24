import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

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

    const student = await prisma.student.findUnique({
      where: { id: params.id }
    })

    if (student) {
      // Delete student (cascading will handle enrollments)
      await prisma.student.delete({
        where: { id: params.id }
      })
      
      // Optionally delete user
      await prisma.user.delete({
        where: { id: student.userId }
      })
    }

    return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error('Error deleting student:', error)
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    )
  }
}
