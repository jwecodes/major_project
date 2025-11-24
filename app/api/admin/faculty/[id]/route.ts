import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

// GET single faculty
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const faculty = await prisma.faculty.findUnique({
      where: { id: params.id }
    })

    if (!faculty) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      faculty
    })
  } catch (error) {
    console.error('Error fetching faculty:', error)
    return NextResponse.json(
      { error: 'Failed to fetch faculty' },
      { status: 500 }
    )
  }
}

// ... PUT and DELETE methods you already have


// PUT - Update faculty
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRoles = await prisma.userRole.findMany({
      where: { userId: user.id, isActive: true },
      select: { role: true }
    })

    if (!userRoles.some(r => r.role === 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { facultyId, name, designation, email, contactNo, department, courses } = body

    // Update faculty
    const faculty = await prisma.faculty.update({
      where: { id: params.id },
      data: {
        facultyId,
        name,
        designation,
        email,
        contactNo: contactNo || null,
        department: department || null,
      }
    })

    // Update course allocations
    if (courses && Array.isArray(courses)) {
      // Delete existing allocations
      await prisma.courseAllocation.deleteMany({
        where: { facultyId: params.id }
      })

      // Create new allocations
      if (courses.length > 0) {
        await prisma.courseAllocation.createMany({
          data: courses.map((c: any) => ({
            facultyId: params.id,
            courseId: c.courseId,
            role: c.role
          }))
        })
      }
    }

    return NextResponse.json({
      success: true,
      faculty
    })
  } catch (error) {
    console.error('Error updating faculty:', error)
    return NextResponse.json(
      { error: 'Failed to update faculty' },
      { status: 500 }
    )
  }
}

// DELETE - Delete faculty
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRoles = await prisma.userRole.findMany({
      where: { userId: user.id, isActive: true },
      select: { role: true }
    })

    if (!userRoles.some(r => r.role === 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.faculty.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error('Error deleting faculty:', error)
    return NextResponse.json(
      { error: 'Failed to delete faculty' },
      { status: 500 }
    )
  }
}
