// import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'
// import { supabase } from '@/lib/supabase'

// export async function GET(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const facultyId = params.id

//     console.log('📄 Admin fetching content for faculty ID:', facultyId)

//     const content = await prisma.teachingContent.findMany({
//       where: { facultyId },
//       include: {
//         course: {
//           select: {
//             courseCode: true,
//             courseName: true
//           }
//         }
//       },
//       orderBy: { createdAt: 'desc' }
//     })

//     console.log('✅ Found content items:', content.length)

//     // Generate public URLs for all content
//     const contentWithUrls = content.map(item => {
//       // Get public URL using supabase client
//       const { data } = supabase.storage
//         .from('teaching-content')
//         .getPublicUrl(item.filePath)

//       console.log(`📎 File: ${item.fileName} → URL: ${data.publicUrl}`)

//       return {
//         id: item.id,
//         title: item.title,
//         type: item.contentType,
//         uploadDate: item.createdAt.toISOString(),
//         status: item.approvalStatus,
//         courseCode: item.course.courseCode,
//         courseName: item.course.courseName,
//         fileName: item.fileName,
//         fileSize: item.fileSize,
//         fileUrl: data.publicUrl, // ✅ Now using supabase client
//         lectureNumber: item.lectureNumber,
//         description: item.description
//       }
//     })

//     return NextResponse.json({
//       success: true,
//       content: contentWithUrls
//     })
//   } catch (error) {
//     console.error('❌ Error fetching content:', error)
//     return NextResponse.json(
//       { 
//         success: false, 
//         error: 'Error fetching content',
//         details: error instanceof Error ? error.message : 'Unknown error'
//       },
//       { status: 500 }
//     )
//   }
// }

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const facultyId = params.id

    console.log('📄 Fetching content for faculty ID:', facultyId)

    const content = await prisma.teachingContent.findMany({
      where: { facultyId },
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

    console.log('✅ Found content items:', content.length)

    // Generate public URLs
    const contentWithUrls = content.map(item => {
      const { data } = supabase.storage
        .from('teaching-content')
        .getPublicUrl(item.filePath)

      return {
        id: item.id,
        title: item.title,
        type: item.contentType,
        uploadDate: item.createdAt.toISOString(),
        status: item.approvalStatus,
        courseCode: item.course.courseCode,
        courseName: item.course.courseName,
        fileName: item.fileName,
        fileSize: item.fileSize,
        fileUrl: data.publicUrl,
        lectureNumber: item.lectureNumber,
        description: item.description
      }
    })

    return NextResponse.json({
      success: true,
      content: contentWithUrls
    })
  } catch (error) {
    console.error('❌ Error fetching content:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error fetching content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
