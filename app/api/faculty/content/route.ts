import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'
import { ContentType } from '@prisma/client'

// GET - Fetch faculty's content
export async function GET(request: NextRequest) {
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

    const content = await prisma.teachingContent.findMany({
      where: { facultyId: faculty.id },
      include: {
        course: {
          select: {
            courseCode: true,
            courseName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Generate public URLs for all content
    const contentWithUrls = content.map(item => {
      const { data } = supabase.storage
        .from('teaching-content')
        .getPublicUrl(item.filePath)

      return {
        id: item.id,
        title: item.title,
        fileName: item.fileName,
        filePath: item.filePath,
        contentType: item.contentType,
        lectureNumber: item.lectureNumber,
        description: item.description,
        fileSize: item.fileSize,
        approvalStatus: item.approvalStatus,
        coordinatorNotes: item.coordinatorNotes,
        uploadDate: item.createdAt.toISOString(),
        fileUrl: data.publicUrl,
        courseId: item.courseId,
        course: item.course
      }
    })

    return NextResponse.json({ success: true, content: contentWithUrls })
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json({ success: false, error: 'Error fetching content' }, { status: 500 })
  }
}

// POST - Upload new content
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const courseId = formData.get('courseId') as string
    const contentTypeString = formData.get('contentType') as string
    const title = formData.get('title') as string
    const lectureNumber = formData.get('lectureNumber')
    const assignmentNumber = formData.get('assignmentNumber')
    const description = formData.get('description') as string
    const file = formData.get('file') as File

    console.log('📤 Upload request from:', email)

    if (!email || !courseId || !title || !file) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    // Validate content type
    const validContentTypes: ContentType[] = [
      'COURSE_HANDOUT',
      'LECTURE_PPT',
      'ASSIGNMENT',
      'QUESTION_BANK',
      'QUESTION_PAPER',
      'LAB_MANUAL',
      'REFERENCE_MATERIAL'
    ]

    if (!validContentTypes.includes(contentTypeString as ContentType)) {
      return NextResponse.json({ success: false, error: 'Invalid content type' }, { status: 400 })
    }

    const contentType: ContentType = contentTypeString as ContentType

    // Find faculty
    const faculty = await prisma.faculty.findUnique({
      where: { email }
    })

    if (!faculty) {
      return NextResponse.json({ success: false, error: 'Faculty not found' }, { status: 404 })
    }

    // Generate clean file path
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = `${faculty.id}/${courseId}/${timestamp}-${sanitizedFileName}`

    console.log('📁 Uploading to:', filePath)

    // Upload to Supabase Storage
    const fileBuffer = await file.arrayBuffer()
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('teaching-content')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('❌ Upload error:', uploadError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to upload file',
        details: uploadError.message 
      }, { status: 500 })
    }

    console.log('✅ File uploaded:', uploadData.path)

    // Determine lecture/assignment number
    let finalLectureNumber = null
    if (lectureNumber) {
      finalLectureNumber = parseInt(lectureNumber as string)
    } else if (assignmentNumber && contentType === 'ASSIGNMENT') {
      finalLectureNumber = parseInt(assignmentNumber as string)
    }

    // Create database record
    const content = await prisma.teachingContent.create({
      data: {
        title,
        fileName: file.name,
        filePath: uploadData.path,
        contentType,
        lectureNumber: finalLectureNumber,
        description: description || null,
        fileSize: file.size,
        mimeType: file.type,
        approvalStatus: 'PENDING',
        courseId,
        facultyId: faculty.id
      },
      include: {
        course: {
          select: {
            courseCode: true,
            courseName: true
          }
        }
      }
    })

    console.log('✅ Database record created:', content.id)

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('teaching-content')
      .getPublicUrl(uploadData.path)

    return NextResponse.json({ 
      success: true, 
      content: {
        id: content.id,
        title: content.title,
        fileName: content.fileName,
        contentType: content.contentType,
        approvalStatus: content.approvalStatus,
        uploadDate: content.createdAt.toISOString(),
        fileUrl: urlData.publicUrl
      },
      message: 'Content uploaded successfully!'
    })
  } catch (error) {
    console.error('❌ Upload error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Error uploading content',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
