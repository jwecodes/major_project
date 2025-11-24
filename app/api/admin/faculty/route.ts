import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

// GET - List all faculty
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if admin
    const userRoles = await prisma.userRole.findMany({
      where: { userId: user.id, isActive: true },
      select: { role: true }
    })

    if (!userRoles.some(r => r.role === 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const faculty = await prisma.faculty.findMany({
      include: {
        _count: {
          select: {
            courseAllocations: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

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

// POST - Create new faculty
export async function POST(request: Request) {
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

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    let userId = existingUser?.id

    // If user doesn't exist, create them
    if (!existingUser) {
      const newUser = await prisma.user.create({
        data: {
          email,
          name,
        }
      })
      userId = newUser.id

      // Assign FACULTY role
      await prisma.userRole.create({
        data: {
          userId: newUser.id,
          role: 'FACULTY'
        }
      })
    }

    // Create faculty record
    const faculty = await prisma.faculty.create({
      data: {
        userId: userId!,
        facultyId,
        name,
        designation,
        email,
        contactNo: contactNo || null,
        department: department || null,
      }
    })

    // Create course allocations if provided
    if (courses && Array.isArray(courses) && courses.length > 0) {
      await prisma.courseAllocation.createMany({
        data: courses.map((c: any) => ({
          facultyId: faculty.id,
          courseId: c.courseId,
          role: c.role
        }))
      })
    }

    return NextResponse.json({
      success: true,
      faculty
    })
  } catch (error) {
    console.error('Error creating faculty:', error)
    return NextResponse.json(
      { error: 'Failed to create faculty' },
      { status: 500 }
    )
  }
}
