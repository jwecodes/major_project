// app/api/programmes/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const session = searchParams.get('session')
    
    const programmes = await prisma.programme.findMany({
      where: session ? { session } : {},
      include: {
        courses: true,
        _count: {
          select: {
            courses: true,
            students: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(programmes)
  } catch (error) {
    console.error('Error fetching programmes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch programmes' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    const programme = await prisma.programme.create({
      data: {
        name: data.name,
        code: data.code,
        duration: data.duration,
        session: data.session,
        totalStudents: data.totalStudents || 0
      }
    })

    return NextResponse.json(programme, { status: 201 })
  } catch (error) {
    console.error('Error creating programme:', error)
    return NextResponse.json(
      { error: 'Failed to create programme' },
      { status: 500 }
    )
  }
}
