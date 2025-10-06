import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = parseInt(params.id)

    const document = await prisma.courseDocument.findUnique({
      where: { id: documentId },
      include: {
        course: {
          select: {
            code: true,
            name: true
          }
        }
      }
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Read file from disk
    const filePath = join(process.cwd(), 'public', document.filePath)
    
    try {
      const fileBuffer = await readFile(filePath)
      
      // Convert Buffer to Uint8Array for NextResponse
      const uint8Array = new Uint8Array(fileBuffer)
      
      // Set appropriate headers for download
      const response = new NextResponse(uint8Array, {
        status: 200,
        headers: {
          'Content-Disposition': `attachment; filename="${document.fileName}"`,
          'Content-Type': 'application/octet-stream',
          'Content-Length': fileBuffer.length.toString(),
        }
      })
      
      return response
    } catch (error) {
      console.error('File read error:', error)
      return NextResponse.json(
        { error: 'File not found on server' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error downloading document:', error)
    return NextResponse.json(
      { error: 'Failed to download document' },
      { status: 500 }
    )
  }
}
