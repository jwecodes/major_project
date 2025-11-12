import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      return NextResponse.json({ success: false, error: 'CSV file is empty' }, { status: 400 })
    }

    const headers = lines[0].split(',').map(h => h.trim())
    const requiredHeaders = ['facultyId', 'name', 'designation', 'email']
    
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
    if (missingHeaders.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: `Missing required columns: ${missingHeaders.join(', ')}` 
      }, { status: 400 })
    }

    let count = 0
    const errors: string[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      
      if (values.length !== headers.length) {
        errors.push(`Line ${i + 1}: Column count mismatch`)
        continue
      }

      const facultyData: any = {}
      headers.forEach((header, index) => {
        facultyData[header] = values[index] || null
      })

      try {
        // Create user first
        const user = await prisma.user.create({
          data: {
            email: facultyData.email,
            name: facultyData.name,
            role: 'FACULTY'
          }
        })

        // Create faculty
        await prisma.faculty.create({
          data: {
            userId: user.id,
            facultyId: facultyData.facultyId,
            name: facultyData.name,
            designation: facultyData.designation,
            email: facultyData.email,
            contactNo: facultyData.contactNo,
            department: facultyData.department
          }
        })

        count++
      } catch (error: any) {
        if (error.code === 'P2002') {
          errors.push(`Line ${i + 1}: Duplicate entry (${facultyData.facultyId} or ${facultyData.email})`)
        } else {
          errors.push(`Line ${i + 1}: ${error.message}`)
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      count,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Bulk upload error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Error processing file' 
    }, { status: 500 })
  }
}
