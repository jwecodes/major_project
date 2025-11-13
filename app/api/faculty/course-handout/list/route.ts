import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email')

    if (!email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email required' 
      }, { status: 400 })
    }

    const faculty = await prisma.faculty.findUnique({
      where: { email }
    })

    if (!faculty) {
      return NextResponse.json({ 
        success: false, 
        error: 'Faculty not found' 
      }, { status: 404 })
    }

    const chos = await prisma.courseHandout.findMany({
      where: {
        facultyId: faculty.id
      },
      orderBy: {
        updatedAt: 'desc'
      },
      select: {
        id: true,
        courseCode: true,
        courseTitle: true,
        status: true,
        updatedAt: true
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
