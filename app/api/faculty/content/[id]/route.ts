import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const email = request.nextUrl.searchParams.get('email')

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 })
    }

    const faculty = await prisma.faculty.findUnique({
      where: { email }
    })

    if (!faculty) {
      return NextResponse.json({ success: false, error: 'Faculty not found' }, { status: 404 })
    }

    // Find content
    const content = await prisma.teachingContent.findUnique({
      where: { id: params.id }
    })

    if (!content) {
      return NextResponse.json({ success: false, error: 'Content not found' }, { status: 404 })
    }

    // Check ownership
    if (content.facultyId !== faculty.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
    }

    // Can't delete approved content
    if (content.approvalStatus === 'APPROVED') {
      return NextResponse.json({ success: false, error: 'Cannot delete approved content' }, { status: 400 })
    }

    // Delete from Supabase Storage
    const { error: deleteError } = await supabase.storage
      .from('teaching-content')
      .remove([content.filePath])

    if (deleteError) {
      console.error('Warning: Could not delete file from storage:', deleteError)
      // Continue anyway - delete database record
    }

    // Delete from database
    await prisma.teachingContent.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting content:', error)
    return NextResponse.json({ success: false, error: 'Error deleting content' }, { status: 500 })
  }
}
