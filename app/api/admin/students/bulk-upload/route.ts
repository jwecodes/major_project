import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

const safeString = (value: any): string => {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

const safeInt = (value: any, defaultValue: number = 0): number => {
  const parsed = parseInt(String(value))
  return isNaN(parsed) ? defaultValue : parsed
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { students } = body

    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json(
        { error: 'No valid student data provided' },
        { status: 400 }
      )
    }

    // Get all programmes
    const programmes = await prisma.programme.findMany()

    let successCount = 0
    let skipCount = 0
    const errors: string[] = []

    for (const row of students) {
      try {
        const studentId = safeString(row['Student ID'] || row.studentId)
        const name = safeString(row['Name'] || row.name)
        const email = safeString(row['Email'] || row.email).toLowerCase()
        const contactNo = safeString(row['Contact No'] || row.contactNo)
        const programmeCode = safeString(row['Programme Code'] || row.programmeCode)
        const currentSemester = safeInt(row['Current Semester'] || row.currentSemester, 1)
        const section = safeString(row['Section'] || row.section)

        if (!studentId || !name || !email) {
          errors.push(`${studentId || 'Unknown'}: Missing required fields`)
          continue
        }

        const programme = programmes.find(p => p.programmeCode === programmeCode)
        if (!programme) {
          errors.push(`${studentId}: Programme "${programmeCode}" not found`)
          continue
        }

        // Check if student exists
        const existingStudent = await prisma.student.findFirst({
          where: {
            OR: [
              { studentId },
              { email }
            ]
          }
        })

        if (existingStudent) {
          skipCount++
          continue
        }

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

        // Create student
        await prisma.student.create({
          data: {
            userId: userRecord.id,
            studentId,
            name,
            email,
            contactNo: contactNo || null,
            programmeId: programme.id,
            currentSemester,
            section: section || null
          }
        })

        successCount++
      } catch (error: any) {
        const id = safeString(row['Student ID'] || row.studentId || 'Unknown')
        errors.push(`${id}: ${error.message}`)
      }
    }

    const message = `Successfully uploaded ${successCount} students. ${skipCount} skipped (already exist).`

    return NextResponse.json({
      success: true,
      count: successCount,
      message,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined
    })
  } catch (error) {
    console.error('Error bulk uploading students:', error)
    return NextResponse.json(
      { error: 'Failed to bulk upload students' },
      { status: 500 }
    )
  }
}
