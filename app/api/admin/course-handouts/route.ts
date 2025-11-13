import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const chos = await prisma.courseHandout.findMany({
      include: {
        faculty: {
          select: {
            name: true,
            email: true,
            designation: true
          }
        },
        course: {
          select: {
            courseCode: true,
            courseName: true,
            semester: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      chos
    })
  } catch (error) {
    console.error('Error fetching CHOs:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Error fetching CHOs' 
    }, { status: 500 })
  }
}
