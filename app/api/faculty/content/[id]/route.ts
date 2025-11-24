import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'   // ✅ use server helper

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const email = request.nextUrl.searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email required' },
        { status: 400 }
      )
    }

    const faculty = await prisma.faculty.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (!faculty) {
      return NextResponse.json(
        { success: false, error: 'Faculty not found' },
        { status: 404 }
      )
    }

    // Find content
    const content = await prisma.teachingContent.findUnique({
      where: { id: params.id },
    })

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content not found' },
        { status: 404 }
      )
    }

    // Check ownership
    if (content.facultyId !== faculty.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Can't delete approved content
    if (content.approvalStatus === 'APPROVED') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete approved content' },
        { status: 400 }
      )
    }

    // ✅ Supabase client
    const supabase = await createClient()

    // ✅ make sure the path is relative to the bucket
    const bucket = 'teaching-content'
    const rawPath = content.filePath || ''
    const path = rawPath.startsWith(`${bucket}/`)
      ? rawPath.replace(`${bucket}/`, '')
      : rawPath

    // Delete from Supabase Storage (best-effort)
    const { error: deleteError } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (deleteError) {
      console.error('Warning: Could not delete file from storage:', deleteError)
      // continue anyway – we'll still delete the DB record
    }

    // Delete from database
    await prisma.teachingContent.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting content:', error)
    return NextResponse.json(
      { success: false, error: 'Error deleting content' },
      { status: 500 }
    )
  }
}
