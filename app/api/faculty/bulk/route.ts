import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { faculty } = body

    if (!faculty || !Array.isArray(faculty)) {
      return NextResponse.json(
        { message: 'Invalid faculty data' },
        { status: 400 }
      )
    }

    // Validate all faculty first
    const errors = []
    for (let i = 0; i < faculty.length; i++) {
      const f = faculty[i]
      if (!f.facultyId || !f.facultyName || !f.designation || !f.email) {
        errors.push(`Row ${i + 1}: Missing required fields`)
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { message: 'Validation errors', errors },
        { status: 400 }
      )
    }

    // Check for duplicate faculty IDs
    const facultyIds = faculty.map(f => f.facultyId)
    const existingFacultyIds = await prisma.faculty.findMany({
      where: {
        facultyId: {
          in: facultyIds
        }
      },
      select: {
        facultyId: true
      }
    })

    const existingIds = existingFacultyIds.map(f => f.facultyId)
    const duplicateIds = facultyIds.filter(id => existingIds.includes(id))

    if (duplicateIds.length > 0) {
      return NextResponse.json(
        { 
          message: 'Duplicate faculty IDs found',
          duplicates: duplicateIds
        },
        { status: 400 }
      )
    }

    // Check for duplicate emails
    const emails = faculty.map(f => f.email)
    const existingEmails = await prisma.faculty.findMany({
      where: {
        email: {
          in: emails
        }
      },
      select: {
        email: true
      }
    })

    const existingEmailList = existingEmails.map(f => f.email)
    const duplicateEmails = emails.filter(email => existingEmailList.includes(email))

    if (duplicateEmails.length > 0) {
      return NextResponse.json(
        { 
          message: 'Duplicate emails found',
          duplicates: duplicateEmails
        },
        { status: 400 }
      )
    }

    // Process and create faculty
    const processedFaculty = faculty.map(f => ({
      facultyId: f.facultyId,
      facultyName: f.facultyName,
      designation: f.designation,
      email: f.email,
      contactNo: f.contactNo || ''
    }))

    // Use transaction for bulk insert
    const result = await prisma.$transaction(async (tx) => {
      const createdFaculty = []
      for (const facultyData of processedFaculty) {
        const created = await tx.faculty.create({
          data: facultyData
        })
        createdFaculty.push(created)
      }
      return createdFaculty
    })

    return NextResponse.json({
      message: `Successfully created ${result.length} faculty members`,
      faculty: result
    }, { status: 201 })
  } catch (error) {
    console.error('Error bulk creating faculty:', error)
    return NextResponse.json(
      { message: 'Failed to bulk create faculty' },
      { status: 500 }
    )
  }
}
