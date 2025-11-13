// import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'

// export async function GET(request: NextRequest) {
//   try {
//     const courseIds = request.nextUrl.searchParams.get('courseIds')

//     if (!courseIds) {
//       return NextResponse.json({ 
//         success: false, 
//         error: 'Course IDs required' 
//       }, { status: 400 })
//     }

//     const courseIdArray = courseIds.split(',')

//     // Get all contributors (non-coordinators) for these courses
//     const allocations = await prisma.courseAllocation.findMany({
//       where: {
//         courseId: { in: courseIdArray },
//         role: 'CONTRIBUTOR'
//       },
//       include: {
//         faculty: true
//       },
//       distinct: ['facultyId']
//     })

//     // Get content count for each contributor
//     const contributors = await Promise.all(
//       allocations.map(async (alloc) => {
//         const contentCount = await prisma.teachingContent.count({
//           where: {
//             facultyId: alloc.facultyId,
//             courseId: { in: courseIdArray }
//           }
//         })

//         return {
//           id: alloc.faculty.id,
//           name: alloc.faculty.name,
//           email: alloc.faculty.email,
//           designation: alloc.faculty.designation,
//           contentCount
//         }
//       })
//     )

//     // Remove duplicates
//     const uniqueContributors = contributors.filter((contributor, index, self) =>
//       index === self.findIndex(c => c.id === contributor.id)
//     )

//     return NextResponse.json({
//       success: true,
//       contributors: uniqueContributors
//     })
//   } catch (error) {
//     console.error('Error fetching contributors:', error)
//     return NextResponse.json({ 
//       success: false, 
//       error: 'Error fetching contributors' 
//     }, { status: 500 })
//   }
// }

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const courseIds = request.nextUrl.searchParams.get('courseIds')

    console.log('📚 Received courseIds:', courseIds)

    if (!courseIds) {
      return NextResponse.json({ 
        success: false, 
        error: 'Course IDs required' 
      }, { status: 400 })
    }

    const courseIdArray = courseIds.split(',')
    console.log('📚 Course ID array:', courseIdArray)

    // Get all contributors (non-coordinators) for these courses
    const allocations = await prisma.courseAllocation.findMany({
      where: {
        courseId: { in: courseIdArray },
        role: 'CONTRIBUTOR'
      },
      include: {
        faculty: true
      }
    })

    console.log('📚 Found allocations:', allocations.length)
    console.log('📚 Allocations:', JSON.stringify(allocations, null, 2))

    if (allocations.length === 0) {
      return NextResponse.json({
        success: true,
        contributors: [],
        message: 'No contributors found for this course'
      })
    }

    // Get unique faculty IDs
    const uniqueFacultyIds = [...new Set(allocations.map(a => a.facultyId))]
    console.log('📚 Unique faculty IDs:', uniqueFacultyIds)

    // Get content count for each contributor
    const contributors = await Promise.all(
      uniqueFacultyIds.map(async (facultyId) => {
        const allocation = allocations.find(a => a.facultyId === facultyId)!
        
        const contentCount = await prisma.teachingContent.count({
          where: {
            facultyId,
            courseId: { in: courseIdArray }
          }
        })

        console.log(`📊 Faculty ${allocation.faculty.name}: ${contentCount} content items`)

        return {
          id: allocation.faculty.id,
          name: allocation.faculty.name,
          email: allocation.faculty.email,
          designation: allocation.faculty.designation,
          contentCount
        }
      })
    )

    console.log('✅ Returning contributors:', contributors)

    return NextResponse.json({
      success: true,
      contributors
    })
  } catch (error) {
    console.error('❌ Error fetching contributors:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Error fetching contributors',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
