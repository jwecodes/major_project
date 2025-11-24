import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const courseIdsParam = searchParams.get('courseIds')
    
    if (!courseIdsParam) {
      return NextResponse.json({ error: 'courseIds required' }, { status: 400 })
    }

    const courseIds = courseIdsParam.split(',')

    const content = await prisma.teachingContent.findMany({
      where: {
        facultyId: params.id,
        courseId: {
          in: courseIds
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Add file URLs (you'll need to implement your file storage logic)
    const contentWithUrls = content.map(item => ({
      ...item,
      fileUrl: `/api/files/${item.filePath}` // Adjust based on your file storage
    }))

    return NextResponse.json({
      success: true,
      content: contentWithUrls
    })
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    )
  }
}
