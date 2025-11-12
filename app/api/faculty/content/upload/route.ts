import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const VALID_CONTENT_TYPES = [
  'LECTURE_PPT',
  'ASSIGNMENT',
  'QUESTION_BANK',
  'LAB_MANUAL',
  'COURSE_HANDBOOK',
  'SYLLABUS',
  'NOTES',
  'REFERENCE_MATERIAL'
]

export async function POST(request: NextRequest) {
  try {
    const facultyId = request.headers.get('x-faculty-id')
    
    console.log('=== UPLOAD API START ===')
    console.log('Faculty ID:', facultyId)

    if (!facultyId) {
      console.log('No faculty ID')
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const title = (formData.get('title') as string)?.trim()
    const courseId = (formData.get('courseId') as string)?.trim()
    const contentType = (formData.get('contentType') as string)?.trim().toUpperCase()
    const description = (formData.get('description') as string)?.trim() || ''
    const fileUrl = formData.get('fileUrl') as string

    console.log('Form Data:')
    console.log('  - Title:', title)
    console.log('  - Course ID:', courseId)
    console.log('  - Content Type:', contentType)
    console.log('  - File URL:', fileUrl?.substring(0, 50) + '...')

    if (!courseId || !title || !contentType || !fileUrl) {
      console.log('Missing required fields')
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields',
        received: { courseId, title, contentType, fileUrl: fileUrl ? 'present' : 'missing' }
      }, { status: 400 })
    }

    if (!VALID_CONTENT_TYPES.includes(contentType)) {
      console.log('Invalid content type:', contentType)
      return NextResponse.json({ 
        success: false, 
        error: `Invalid content type. Must be one of: ${VALID_CONTENT_TYPES.join(', ')}`
      }, { status: 400 })
    }

    console.log('Checking course allocation...')
    
    const assignment = await prisma.courseAllocation.findFirst({
      where: {
        facultyId: facultyId,
        courseId: courseId
      }
    })

    console.log('Assignment found:', assignment ? assignment.role : 'NOT FOUND')

    if (!assignment) {
      console.log('Faculty not assigned to course')
      return NextResponse.json({ 
        success: false, 
        error: 'Not assigned to this course'
      }, { status: 403 })
    }

    console.log('Creating content record...')

    const urlParts = fileUrl.split('/')
    const fileName = urlParts[urlParts.length - 1] || 'file'

    const content = await prisma.teachingContent.create({
      data: {
        title,
        contentType: contentType as any,
        description,
        filePath: fileUrl,
        fileName: fileName,
        courseId,
        facultyId,
        approvalStatus: 'PENDING'
      },
      include: {
        faculty: { select: { name: true, designation: true } },
        course: { select: { courseCode: true, courseName: true } }
      }
    })

    console.log('Content created successfully:', content.id)
    console.log('=== UPLOAD API END ===')

    return NextResponse.json({ 
      success: true, 
      content
    })

  } catch (error: any) {
    console.error('=== UPLOAD API ERROR ===')
    console.error('Error:', error.message)

    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Upload failed'
    }, { status: 500 })
  }
}
