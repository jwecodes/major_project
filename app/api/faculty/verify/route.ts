import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email')

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 })
    }

    const faculty = await prisma.faculty.findUnique({
      where: { email }
    })

    if (!faculty) {
      return NextResponse.json({ success: false, error: 'Faculty not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      facultyId: faculty.id 
    })
  } catch (error) {
    console.error('Error verifying faculty:', error)
    return NextResponse.json({ success: false, error: 'Error verifying' }, { status: 500 })
  }
}
