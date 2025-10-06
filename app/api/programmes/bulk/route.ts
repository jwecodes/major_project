import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { programmes } = body

    if (!programmes || !Array.isArray(programmes)) {
      return NextResponse.json(
        { message: 'Invalid programmes data' },
        { status: 400 }
      )
    }

    // Validate all programmes first
    const errors = []
    for (let i = 0; i < programmes.length; i++) {
      const prog = programmes[i]
      if (!prog.session || !prog.programmeCode || !prog.programmeName || !prog.duration || !prog.semester) {
        errors.push(`Row ${i + 1}: Missing required fields`)
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { message: 'Validation errors', errors },
        { status: 400 }
      )
    }

    // Check for duplicate programme codes
    const programmeCodes = programmes.map(p => p.programmeCode)
    const existingProgrammes = await prisma.programme.findMany({
      where: {
        programmeCode: {
          in: programmeCodes
        }
      },
      select: {
        programmeCode: true
      }
    })

    const existingCodes = existingProgrammes.map(p => p.programmeCode)
    const duplicates = programmeCodes.filter(code => existingCodes.includes(code))

    if (duplicates.length > 0) {
      return NextResponse.json(
        { 
          message: 'Duplicate programme codes found',
          duplicates: duplicates
        },
        { status: 400 }
      )
    }

    // Process and create programmes
    const processedProgrammes = programmes.map(prog => ({
      session: prog.session,
      programmeCode: prog.programmeCode,
      programmeName: prog.programmeName,
      duration: parseInt(prog.duration),
      semester: parseInt(prog.semester),
      section: prog.section && prog.section.toString().trim() ? prog.section.toString() : null,
      noOfStudents: parseInt(prog.noOfStudents) || 0
    }))

    // Use transaction for bulk insert
    const result = await prisma.$transaction(async (tx) => {
      const createdProgrammes = []
      for (const progData of processedProgrammes) {
        const created = await tx.programme.create({
          data: progData
        })
        createdProgrammes.push(created)
      }
      return createdProgrammes
    })

    return NextResponse.json({
      message: `Successfully created ${result.length} programmes`,
      programmes: result
    }, { status: 201 })
  } catch (error) {
    console.error('Error bulk creating programmes:', error)
    return NextResponse.json(
      { message: 'Failed to bulk create programmes' },
      { status: 500 }
    )
  }
}
