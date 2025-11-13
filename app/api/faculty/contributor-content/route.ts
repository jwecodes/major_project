import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const facultyId = request.nextUrl.searchParams.get('facultyId')
    const courseIds = request.nextUrl.searchParams.get('courseIds')

    if (!facultyId || !courseIds) {
      return NextResponse.json({ 
        success: false, 
        error: 'Faculty ID and Course IDs required' 
      }, { status: 400 })
    }

    const courseIdArray = courseIds.split(',')

    const content = await prisma.teachingContent.findMany({
      where: {
        facultyId,
        courseId: { in: courseIdArray }
      },
      include: {
        faculty: {
          select: {
            name: true,
            email: true
          }
        },
        course: {
          select: {
            courseCode: true,
            courseName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Generate public URLs
    const contentWithUrls = content.map(item => {
      const { data } = supabase.storage
        .from('teaching-content')
        .getPublicUrl(item.filePath)

      return {
        id: item.id,
        title: item.title,
        fileName: item.fileName,
        contentType: item.contentType,
        uploadDate: item.createdAt.toISOString(),
        approvalStatus: item.approvalStatus,
        fileUrl: data.publicUrl,
        filePath: item.filePath,
        contributor: {
          name: item.faculty.name,
          email: item.faculty.email
        },
        course: {
          courseCode: item.course.courseCode,
          courseName: item.course.courseName
        }
      }
    })

    return NextResponse.json({
      success: true,
      content: contentWithUrls
    })
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Error fetching content' 
    }, { status: 500 })
  }
}
