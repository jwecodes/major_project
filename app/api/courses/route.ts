// app/api/courses/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const programmeId = searchParams.get('programmeId')
    
    const courses = await prisma.course.findMany({
      where: programmeId ? { programmeId } : {},
      include: {
        programme: {
          select: {
            name: true,
            code: true
          }
        },
        faculty: {
          select: {
            name: true,
            employeeId: true
          }
        }
      },
      orderBy: [
        { semester: 'asc' },
        { code: 'asc' }
      ]
    })

    return NextResponse.json(courses)
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    const course = await prisma.course.create({
      data: {
        code: data.code,
        name: data.name,
        semester: data.semester,
        credits: data.credits,
        lecture: data.lecture,
        tutorial: data.tutorial,
        practical: data.practical,
        type: data.type,
        roomNo: data.roomNo,
        hours: data.hours,
        studentCount: data.studentCount,
        programmeId: data.programmeId,
        facultyId: data.facultyId
      }
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    )
  }
}
