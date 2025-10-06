import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
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

    // Check if faculty exists
    const existingFaculty = await prisma.faculty.findUnique({
      where: { id }
    })

    if (!existingFaculty) {
      return NextResponse.json(
        { message: 'Faculty not found' },
        { status: 404 }
      )
    }

    // Check if faculty ID already exists (excluding current faculty)
    const duplicateFacultyId = await prisma.faculty.findFirst({
      where: {
        AND: [
          { facultyId },
          { id: { not: id } }
        ]
      }
    })

    if (duplicateFacultyId) {
      return NextResponse.json(
        { message: 'Faculty ID already exists' },
        { status: 400 }
      )
    }

    // Check if email already exists (excluding current faculty)
    const duplicateEmail = await prisma.faculty.findFirst({
      where: {
        AND: [
          { email },
          { id: { not: id } }
        ]
      }
    })

    if (duplicateEmail) {
      return NextResponse.json(
        { message: 'Email already exists' },
        { status: 400 }
      )
    }

    const updatedFaculty = await prisma.faculty.update({
      where: { id },
      data: {
        facultyId,
        facultyName,
        designation,
        email,
        contactNo: contactNo || ''
      }
    })

    return NextResponse.json(updatedFaculty)
  } catch (error) {
    console.error('Error updating faculty:', error)
    return NextResponse.json(
      { message: 'Failed to update faculty' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if faculty exists
    const existingFaculty = await prisma.faculty.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            facultyCourses: true,
            uploadedContent: true
          }
        }
      }
    })

    if (!existingFaculty) {
      return NextResponse.json(
        { message: 'Faculty not found' },
        { status: 404 }
      )
    }

    // Check if faculty has related data
    if (existingFaculty._count.facultyCourses > 0 || existingFaculty._count.uploadedContent > 0) {
      return NextResponse.json(
        { 
          message: `Cannot delete faculty with ${existingFaculty._count.facultyCourses} course assignments and ${existingFaculty._count.uploadedContent} uploaded content items. Remove related data first.` 
        },
        { status: 400 }
      )
    }

    await prisma.faculty.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Faculty deleted successfully' })
  } catch (error) {
    console.error('Error deleting faculty:', error)
    return NextResponse.json(
      { message: 'Failed to delete faculty' },
      { status: 500 }
    )
  }
}
