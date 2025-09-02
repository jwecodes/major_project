// app/api/faculties/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const faculties = await prisma.faculty.findMany({
      include: {
        courses: {
          select: {
            id: true,
            name: true,
            code: true,
            credits: true
          }
        },
        _count: {
          select: {
            courses: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(faculties)
  } catch (error) {
    console.error('Error fetching faculties:', error)
    return NextResponse.json(
      { error: 'Failed to fetch faculties' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    const faculty = await prisma.faculty.create({
      data: {
        name: data.name,
        employeeId: data.employeeId,
        department: data.department,
        email: data.email,
        designation: data.designation,
        contactNo: data.contactNo
      }
    })

    return NextResponse.json(faculty, { status: 201 })
  } catch (error) {
    console.error('Error creating faculty:', error)
    return NextResponse.json(
      { error: 'Failed to create faculty' },
      { status: 500 }
    )
  }
}
