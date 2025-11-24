import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'   // ✅ keep consistent with other files

// must match Prisma enum ContentType
const VALID_CONTENT_TYPES = [
  'COURSE_HANDOUT',
  'LECTURE_PPT',
  'ASSIGNMENT',
  'QUESTION_BANK',
  'QUESTION_PAPER',
  'LAB_MANUAL',
  'LAB_ASSIGNMENT',
  'REFERENCE_MATERIAL',
] as const

type ContentTypeEnum = (typeof VALID_CONTENT_TYPES)[number]

export async function POST(request: NextRequest) {
  try {
    const facultyId = request.headers.get('x-faculty-id')

    console.log('=== UPLOAD API START ===')
    console.log('Faculty ID:', facultyId)

    if (!facultyId) {
      console.log('No faculty ID')
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const title = (formData.get('title') as string)?.trim()
    const courseId = (formData.get('courseId') as string)?.trim()
    const rawContentType = (formData.get('contentType') as string)?.trim().toUpperCase()
    const description = (formData.get('description') as string)?.trim() || ''
    const fileUrl = formData.get('fileUrl') as string
    const updatedFromId = (formData.get('updatedFromId') as string)?.trim() || null

    console.log('Form Data:')
    console.log('  - Title:', title)
    console.log('  - Course ID:', courseId)
    console.log('  - Content Type:', rawContentType)
    console.log('  - File URL:', fileUrl?.substring(0, 50) + '...')

    if (!courseId || !title || !rawContentType || !fileUrl) {
      console.log('Missing required fields')
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          received: {
            courseId,
            title,
            contentType: rawContentType,
            fileUrl: fileUrl ? 'present' : 'missing',
          },
        },
        { status: 400 }
      )
    }

    if (!VALID_CONTENT_TYPES.includes(rawContentType as ContentTypeEnum)) {
      console.log('Invalid content type:', rawContentType)
      return NextResponse.json(
        {
          success: false,
          error: `Invalid content type. Must be one of: ${VALID_CONTENT_TYPES.join(', ')}`,
        },
        { status: 400 }
      )
    }

    console.log('Checking course allocation...')

    const assignment = await prisma.courseAllocation.findFirst({
      where: {
        facultyId,
        courseId,
      },
    })

    console.log('Assignment found:', assignment ? assignment.role : 'NOT FOUND')

    if (!assignment) {
      console.log('Faculty not assigned to course')
      return NextResponse.json(
        {
          success: false,
          error: 'Not assigned to this course',
        },
        { status: 403 }
      )
    }

    console.log('Creating content record...')

    const urlParts = fileUrl.split('/')
    const fileName = urlParts[urlParts.length - 1] || 'file'

    const content = await prisma.teachingContent.create({
      data: {
        title,
        contentType: rawContentType as ContentTypeEnum,
        description,
        filePath: fileUrl,   // you’re storing full URL here, that’s fine
        fileName,
        courseId,
        facultyId,
        approvalStatus: 'PENDING',
        updatedFromId,       // 👈 now upload route also supports revisions
      },
      include: {
        faculty: { select: { name: true, designation: true } },
        course: { select: { courseCode: true, courseName: true } },
      },
    })

    console.log('Content created successfully:', content.id)
    console.log('=== UPLOAD API END ===')

    return NextResponse.json({
      success: true,
      content,
    })
  } catch (error: any) {
    console.error('=== UPLOAD API ERROR ===')
    console.error('Error:', error.message)

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Upload failed',
      },
      { status: 500 }
    )
  }
}
