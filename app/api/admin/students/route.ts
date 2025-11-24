import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const students = await prisma.student.findMany({
      include: {
        programme: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      students
    })
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { studentId, name, email, contactNo, programmeId, currentSemester, section } = body

    // Check if user exists
    let userRecord = await prisma.user.findUnique({
      where: { email }
    })

    // Create user if doesn't exist
    if (!userRecord) {
      userRecord = await prisma.user.create({
        data: {
          email,
          name,
        }
      })

      // Assign STUDENT role
      await prisma.userRole.create({
        data: {
          userId: userRecord.id,
          role: 'STUDENT',
          isActive: true
        }
      })
    }

    // Create student record
    const student = await prisma.student.create({
      data: {
        userId: userRecord.id,
        studentId,
        name,
        email,
        contactNo: contactNo || null,
        programmeId,
        currentSemester,
        section: section || null
      },
      include: {
        programme: true
      }
    })

    return NextResponse.json({
      success: true,
      student
    })
  } catch (error: any) {
    console.error('Error creating student:', error)
    
    if (error.code === 'P2002') {
      return { 
        success: false, 
        error: `Student with this email or ID already exists.` 
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, studentId, name, email, contactNo, programmeId, currentSemester, section } = body

    const student = await prisma.student.update({
      where: { id },
      data: {
        studentId,
        name,
        email,
        contactNo: contactNo || null,
        programmeId,
        currentSemester,
        section: section || null
      },
      include: {
        programme: true
      }
    })

    return NextResponse.json({
      success: true,
      student
    })
  } catch (error) {
    console.error('Error updating student:', error)
    return NextResponse.json(
      { error: 'Failed to update student' },
      { status: 500 }
    )
  }
}
