import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// ======================================
// GET: List all teaching content for a faculty (for My Submissions)
// ======================================

export async function GET(request: NextRequest) {
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

    const contents = await prisma.teachingContent.findMany({
      where: {
        facultyId: faculty.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        course: {
          select: {
            courseCode: true,
            courseName: true,
          },
        },
      },
    })

    // Shape it to match your Submissions page ContentItem interface
    const mapped = contents.map(c => ({
      id: c.id,
      title: c.title,
      contentType: c.contentType,
      fileName: c.fileName,
      filePath: c.filePath,
      fileUrl: c.filePath,        // 👈 frontend uses this to view/download
      fileSize: c.fileSize,
      approvalStatus: c.approvalStatus,
      coordinatorNotes: c.coordinatorNotes,
      lectureNumber: c.lectureNumber,
      courseId: c.courseId,
      uploadDate: c.createdAt,    // 👈 frontend does new Date(uploadDate)
      course: c.course,
    }))

    return NextResponse.json({
      success: true,
      content: mapped,
    })
  } catch (error) {
    console.error('Error fetching faculty content:', error)
    return NextResponse.json(
      { success: false, error: 'Error fetching content' },
      { status: 500 }
    )
  }
}

// ======================================
// POST: Create new teaching content (Upload + Revisions)
// ======================================

export async function POST(request: Request) {
  try {
    const body = await request.json()
    let {
      title,
      contentType,
      fileName,
      filePath,
      fileSize,
      mimeType,
      courseId,
      facultyId,     // optional
      facultyEmail,  // optional – preferred in new code
      description,
      lectureNumber,
      updatedFromId,
    } = body

    // Basic required fields (faculty resolved below)
    if (!title || !contentType || !fileName || !filePath || !courseId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Resolve facultyId if not provided, using email
    if (!facultyId && facultyEmail) {
      const faculty = await prisma.faculty.findUnique({
        where: { email: facultyEmail.toLowerCase().trim() },
      })

      if (!faculty) {
        return NextResponse.json(
          { success: false, error: 'Faculty not found for this email' },
          { status: 404 }
        )
      }

      facultyId = faculty.id
    }

    if (!facultyId) {
      return NextResponse.json(
        { success: false, error: 'Faculty ID or faculty email is required' },
        { status: 400 }
      )
    }

    const content = await prisma.teachingContent.create({
      data: {
        title,
        contentType,
        fileName,
        filePath,
        fileSize: fileSize || null,
        mimeType: mimeType || null,
        courseId,
        facultyId, // ✅ now guaranteed to be a valid FK
        description: description || null,
        lectureNumber: lectureNumber || null,
        approvalStatus: 'PENDING',
        updatedFromId: updatedFromId || null,
      },
    })

    return NextResponse.json({ success: true, content })
  } catch (error) {
    console.error('Content creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create content' },
      { status: 500 }
    )
  }
}
