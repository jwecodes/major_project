import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const faculty = await prisma.faculty.findMany({
      include: {
        facultyCourses: {
          include: {
            course: {
              select: {
                id: true,
                session: true,
                courseCode: true,
                courseName: true,
                programmeCode: true,
                programmeName: true,
                semester: true,
                credits: true
              }
            }
          }
        },
        _count: {
          select: {
            facultyCourses: true,
            uploadedContent: true
          }
        }
      },
      orderBy: [
        { facultyName: 'asc' }
      ]
    })

    return NextResponse.json(faculty)
  } catch (error) {
    console.error('Error fetching faculty:', error)
    return NextResponse.json(
      { message: 'Failed to fetch faculty' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      facultyId,
      facultyName,
      designation,
      email,
      contactNo
    } = body

    // Validate required fields
    if (!facultyId || !facultyName || !designation || !email) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if faculty ID already exists
    const existingFacultyId = await prisma.faculty.findUnique({
      where: { facultyId }
    })

    if (existingFacultyId) {
      return NextResponse.json(
        { message: 'Faculty ID already exists' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingEmail = await prisma.faculty.findUnique({
      where: { email }
    })

    if (existingEmail) {
      return NextResponse.json(
        { message: 'Email already exists' },
        { status: 400 }
      )
    }

    const faculty = await prisma.faculty.create({
      data: {
        facultyId,
        facultyName,
        designation,
        email,
        contactNo: contactNo || ''
      }
    })

    return NextResponse.json(faculty, { status: 201 })
  } catch (error) {
    console.error('Error creating faculty:', error)
    return NextResponse.json(
      { message: 'Failed to create faculty' },
      { status: 500 }
    )
  }
}
