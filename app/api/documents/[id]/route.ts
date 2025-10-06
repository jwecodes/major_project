import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import { join } from 'path'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = parseInt(params.id)

    const document = await prisma.courseDocument.findUnique({
      where: { id: documentId }
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Delete file from disk
    try {
      const filePath = join(process.cwd(), 'public', document.filePath)
      await unlink(filePath)
    } catch (error) {
      console.error('File deletion error:', error)
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    await prisma.courseDocument.delete({
      where: { id: documentId }
    })

    return NextResponse.json({ message: 'Document deleted successfully' })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}
