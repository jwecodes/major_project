import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const fileType = searchParams.get('fileType')
    const search = searchParams.get('search')

    const documents = await prisma.courseDocument.findMany({
      where: {
        ...(courseId && { courseId: parseInt(courseId) }),
        ...(fileType && { fileType }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ]
        }),
        isActive: true
      },
      include: {
        course: {
          select: {
            code: true,
            name: true,
            programme: {
              select: {
                shortName: true
              }
            },
            semester: true
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    })

    // Transform data to match frontend expectations
    const documentsWithUploader = documents.map(doc => ({
      ...doc,
      course: {
        code: doc.course.code,
        name: doc.course.name,
        programmeName: doc.course.programme.shortName,
        semester: doc.course.semester
      },
      uploader: {
        name: 'Faculty Name',  // This will be replaced when you add proper faculty relations
        email: 'faculty@example.com'
      }
    }))

    return NextResponse.json(documentsWithUploader)
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const file = formData.get('file') as File
    const courseId = formData.get('courseId') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const fileType = formData.get('fileType') as string
    const uploadedBy = formData.get('uploadedBy') as string

    if (!file || !courseId || !title || !uploadedBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size too large. Maximum 10MB allowed.' },
        { status: 400 }
      )
    }

    // For now, just save to database without actual file storage
    const document = await prisma.courseDocument.create({
      data: {
        courseId: parseInt(courseId),
        title,
        description: description || null,
        fileName: file.name,
        filePath: `/uploads/documents/${file.name}`, // Mock path
        fileType,
        uploadedBy: parseInt(uploadedBy),
        fileSize: BigInt(file.size),
        mimeType: file.type
      },
      include: {
        course: {
          select: {
            code: true,
            name: true,
            programme: {
              select: {
                shortName: true
              }
            },
            semester: true
          }
        }
      }
    })

    // Transform response to match frontend expectations
    const documentWithUploader = {
      ...document,
      course: {
        code: document.course.code,
        name: document.course.name,
        programmeName: document.course.programme.shortName,
        semester: document.course.semester
      },
      uploader: {
        name: 'Faculty Name',
        email: 'faculty@example.com'
      },
      fileSize: Number(document.fileSize) // Convert BigInt to number for JSON
    }

    return NextResponse.json(documentWithUploader, { status: 201 })
  } catch (error: any) {
    console.error('Error uploading document:', error)
    return NextResponse.json(
      { error: 'Failed to upload document', details: error.message },
      { status: 500 }
    )
  }
}
