// import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const studentId = searchParams.get('studentId')

//     if (!studentId) {
//       return NextResponse.json(
//         { success: false, error: 'Student ID required' },
//         { status: 400 }
//       )
//     }

//     // Get student info
//     const student = await prisma.student.findUnique({
//       where: { id: studentId },
//       include: { programme: true }
//     })

//     if (!student) {
//       return NextResponse.json(
//         { success: false, error: 'Student not found' },
//         { status: 404 }
//       )
//     }

//     // Get courses matching student's programme, semester, and session
//     const courses = await prisma.course.findMany({
//       where: {
//         programmeId: student.programmeId,
//         semester: student.currentSemester,
//         session: student.programme.session
//       },
//       include: {
//         programme: true
//       }
//     })

//     const courseIds = courses.map((c: any) => c.id)

//     // If no courses found, return empty data
//     if (courseIds.length === 0) {
//       return NextResponse.json({
//         success: true,
//         stats: {
//           totalCourses: 0,
//           totalMaterials: 0,
//           recentUploads: 0
//         },
//         courses: [],
//         recentMaterials: []
//       })
//     }

//     // Get approved materials for these courses
//     const allMaterials = await prisma.teachingContent.findMany({
//       where: {
//         courseId: { in: courseIds },
//         approvalStatus: 'APPROVED'
//       },
//       include: {
//         course: true
//       },
//       orderBy: { createdAt: 'desc' }
//     })

//     // Get recent materials (last 7 days)
//     const weekAgo = new Date()
//     weekAgo.setDate(weekAgo.getDate() - 7)
    
//     const recentMaterials = await prisma.teachingContent.findMany({
//       where: {
//         courseId: { in: courseIds },
//         approvalStatus: 'APPROVED',
//         createdAt: { gte: weekAgo }
//       },
//       include: {
//         course: true
//       },
//       orderBy: { createdAt: 'desc' },
//       take: 5
//     })

//     // Add material count to each course
//     const coursesWithCount = courses.map((course: any) => ({
//       ...course,
//       materialCount: allMaterials.filter((m: any) => m.courseId === course.id).length
//     }))

//     return NextResponse.json({
//       success: true,
//       stats: {
//         totalCourses: courses.length,
//         totalMaterials: allMaterials.length,
//         recentUploads: recentMaterials.length
//       },
//       courses: coursesWithCount,
//       recentMaterials
//     })
//   } catch (error) {
//     console.error('Student dashboard error:', error)
//     return NextResponse.json(
//       { success: false, error: 'Failed to load dashboard' },
//       { status: 500 }
//     )
//   }
// }
