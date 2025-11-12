'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// ============================================
// PROGRAMME ACTIONS
// ============================================

export async function createProgramme(data: {
  session: string
  programmeCode: string
  programmeName: string
  duration: number
  currentSemester: number
  section?: string
  noOfStudents: number
}) {
  try {
    const cleanData = {
      session: data.session,
      programmeCode: data.programmeCode,
      programmeName: data.programmeName,
      duration: data.duration,
      currentSemester: data.currentSemester,
      section: data.section || null,
      noOfStudents: data.noOfStudents
    }
    
    const result = await prisma.programme.create({ data: cleanData })
    console.log('Programme created:', result)
    revalidatePath('/admin/programmes')
    return { success: true }
  } catch (error: any) {
    console.error('Create programme error:', error)
    
    if (error.code === 'P2002') {
      const section = data.section ? ` Section ${data.section}` : ''
      return { 
        success: false, 
        error: `Programme "${data.programmeCode}"${section} already exists in session "${data.session}".` 
      }
    }
    
    return { success: false, error: error.message || 'Failed to create programme' }
  }
}

export async function getProgrammes() {
  try {
    return await prisma.programme.findMany({
      orderBy: { createdAt: 'desc' }
    })
  } catch (error) {
    console.error('Get programmes error:', error)
    return []
  }
}

export async function updateProgramme(id: string, data: any) {
  try {
    const cleanData = {
      session: data.session,
      programmeCode: data.programmeCode,
      programmeName: data.programmeName,
      duration: data.duration,
      currentSemester: data.currentSemester,
      section: data.section || null,
      noOfStudents: data.noOfStudents
    }
    
    await prisma.programme.update({ where: { id }, data: cleanData })
    revalidatePath('/admin/programmes')
    return { success: true }
  } catch (error: any) {
    console.error('Update programme error:', error)
    
    if (error.code === 'P2002') {
      const section = data.section ? ` Section ${data.section}` : ''
      return { 
        success: false, 
        error: `Programme "${data.programmeCode}"${section} already exists in session "${data.session}".` 
      }
    }
    
    return { success: false, error: error.message || 'Failed to update programme' }
  }
}

export async function deleteProgramme(id: string) {
  try {
    await prisma.programme.delete({ where: { id } })
    revalidatePath('/admin/programmes')
    return { success: true }
  } catch (error: any) {
    console.error('Delete programme error:', error)
    return { success: false, error: error.message || 'Failed to delete programme' }
  }
}

// ============================================
// COURSE ACTIONS
// ============================================

export async function createCourse(data: {
  session: string
  programmeId: string
  semester: number
  courseCode: string
  courseName: string
  l: number
  t: number
  p: number
  s: number
  credits: number
  totalHours: number
  courseType: string
  deliveryMode: string
  roomNo: string | null
  attendance: boolean
  category: string
}) {
  try {
    const cleanData = {
      session: data.session,
      programmeId: data.programmeId,
      semester: data.semester,
      courseCode: data.courseCode,
      courseName: data.courseName,
      l: data.l,
      t: data.t,
      p: data.p,
      s: data.s,
      credits: data.credits,
      totalHours: data.totalHours,
      courseType: (data.courseType || 'CORE') as any,
      deliveryMode: (data.deliveryMode || 'THEORY') as any,
      roomNo: data.roomNo || null,
      attendance: data.attendance,
      category: (data.category || 'MANDATORY') as any
    }
    
    await prisma.course.create({ data: cleanData })
    revalidatePath('/admin/courses')
    return { success: true }
  } catch (error: any) {
    console.error('Create course error:', error)
    
    if (error.code === 'P2002') {
      return { 
        success: false, 
        error: `Course "${data.courseCode}" already exists in session "${data.session}".` 
      }
    }
    
    return { success: false, error: error.message || 'Failed to create course' }
  }
}

export async function getCourses() {
  try {
    return await prisma.course.findMany({
      include: { programme: true },
      orderBy: { createdAt: 'desc' }
    })
  } catch (error) {
    console.error('Get courses error:', error)
    return []
  }
}

export async function updateCourse(id: string, data: any) {
  try {
    const cleanData = {
      session: data.session,
      semester: data.semester,
      courseCode: data.courseCode,
      courseName: data.courseName,
      l: data.l,
      t: data.t,
      p: data.p,
      s: data.s,
      credits: data.credits,
      totalHours: data.totalHours,
      courseType: (data.courseType || 'CORE') as any,
      deliveryMode: (data.deliveryMode || 'THEORY') as any,
      roomNo: data.roomNo || null,
      attendance: data.attendance,
      category: (data.category || 'MANDATORY') as any
    }
    
    await prisma.course.update({ where: { id }, data: cleanData })
    revalidatePath('/admin/courses')
    return { success: true }
  } catch (error: any) {
    console.error('Update course error:', error)
    
    if (error.code === 'P2002') {
      return { 
        success: false, 
        error: `Course "${data.courseCode}" already exists in session "${data.session}".` 
      }
    }
    
    return { success: false, error: error.message || 'Failed to update course' }
  }
}

export async function deleteCourse(id: string) {
  try {
    await prisma.course.delete({ where: { id } })
    revalidatePath('/admin/courses')
    return { success: true }
  } catch (error: any) {
    console.error('Delete course error:', error)
    return { success: false, error: error.message || 'Failed to delete course' }
  }
}

export async function syncCoursesAcrossSections() {
  try {
    const programmes = await prisma.programme.findMany({
      select: { id: true, session: true, programmeCode: true, section: true }
    })

    const grouped = new Map<string, any[]>()
    programmes.forEach(p => {
      const key = `${p.session}|${p.programmeCode}`
      if (!grouped.has(key)) {
        grouped.set(key, [])
      }
      grouped.get(key)!.push(p)
    })

    let totalSynced = 0

    for (const [key, progs] of grouped.entries()) {
      if (progs.length <= 1) continue

      const sourceSection = progs.sort((a, b) => 
        (a.section || 'ZZ').localeCompare(b.section || 'ZZ')
      )[0]

      const sourceCourses = await prisma.course.findMany({
        where: { programmeId: sourceSection.id },
        select: {
          semester: true,
          courseCode: true,
          courseName: true,
          l: true,
          t: true,
          p: true,
          s: true,
          credits: true,
          totalHours: true,
          courseType: true,
          deliveryMode: true,
          roomNo: true,
          attendance: true,
          category: true
        }
      })

      for (const targetProg of progs) {
        if (targetProg.id === sourceSection.id) continue

        for (const course of sourceCourses) {
          try {
            await prisma.course.create({
              data: {
                session: targetProg.session,
                programmeId: targetProg.id,
                ...course
              }
            })
            totalSynced++
          } catch (e) {
            // Silently skip duplicates
          }
        }
      }
    }

    revalidatePath('/admin/courses')
    return { success: true, message: `Successfully synced ${totalSynced} courses across sections!` }
  } catch (error: any) {
    console.error('Sync courses error:', error)
    return { success: false, error: error.message || 'Failed to sync courses' }
  }
}

// ============================================
// FACULTY ACTIONS
// ============================================

export async function createFaculty(data: {
  facultyId: string
  name: string
  designation: string
  email: string
  contactNo: string | null
  department?: string
  programmeId?: string
}) {
  try {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        role: 'FACULTY' as any
      }
    })

    await prisma.faculty.create({
      data: {
        userId: user.id,
        facultyId: data.facultyId,
        name: data.name,
        designation: data.designation,
        email: data.email,
        contactNo: data.contactNo || null,
        department: data.department || null,
        programmeId: data.programmeId || null
      }
    })
    
    revalidatePath('/admin/faculty')
    return { success: true }
  } catch (error: any) {
    console.error('Create faculty error:', error)
    
    if (error.code === 'P2002') {
      if (error.meta?.target?.includes('email')) {
        return { success: false, error: `Email "${data.email}" already exists.` }
      }
      return { 
        success: false, 
        error: `Faculty ID "${data.facultyId}" already exists.` 
      }
    }
    
    return { success: false, error: error.message || 'Failed to create faculty' }
  }
}

export async function getFaculty() {
  try {
    return await prisma.faculty.findMany({
      include: { user: true, programme: true },
      orderBy: { createdAt: 'desc' }
    })
  } catch (error) {
    console.error('Get faculty error:', error)
    return []
  }
}

export async function updateFaculty(id: string, data: any) {
  try {
    const cleanData = {
      facultyId: data.facultyId,
      name: data.name,
      designation: data.designation,
      email: data.email,
      contactNo: data.contactNo || null,
      department: data.department || null,
      programmeId: data.programmeId || null
    }
    
    await prisma.faculty.update({ where: { id }, data: cleanData })
    revalidatePath('/admin/faculty')
    return { success: true }
  } catch (error: any) {
    console.error('Update faculty error:', error)
    
    if (error.code === 'P2002') {
      if (error.meta?.target?.includes('email')) {
        return { success: false, error: `Email "${data.email}" already exists.` }
      }
      return { 
        success: false, 
        error: `Faculty ID "${data.facultyId}" already exists.` 
      }
    }
    
    return { success: false, error: error.message || 'Failed to update faculty' }
  }
}

export async function deleteFaculty(id: string) {
  try {
    const faculty = await prisma.faculty.findUnique({ where: { id } })
    if (faculty) {
      await prisma.user.delete({ where: { id: faculty.userId } })
    }
    revalidatePath('/admin/faculty')
    return { success: true }
  } catch (error: any) {
    console.error('Delete faculty error:', error)
    return { success: false, error: error.message || 'Failed to delete faculty' }
  }
}

// ============================================
// COURSE ALLOCATION ACTIONS
// ============================================

export async function allocateFaculty(courseId: string, facultyId: string, role: 'COORDINATOR' | 'CONTRIBUTOR') {
  try {
    await prisma.courseAllocation.create({
      data: { courseId, facultyId, role }
    })
    revalidatePath('/admin/course-coordination')
    revalidatePath('/admin/faculty')
    return { success: true }
  } catch (error: any) {
    console.error('Allocate faculty error:', error)
    
    if (error.code === 'P2002') {
      return { success: false, error: 'This faculty is already allocated to this course.' }
    }
    
    return { success: false, error: error.message || 'Failed to allocate faculty' }
  }
}

export async function getCourseAllocations(courseId: string) {
  try {
    return await prisma.courseAllocation.findMany({
      where: { courseId },
      include: { faculty: true }
    })
  } catch (error) {
    console.error('Get course allocations error:', error)
    return []
  }
}

export async function setCoordinator(courseId: string, allocationId: string) {
  try {
    await prisma.courseAllocation.updateMany({
      where: { courseId },
      data: { role: 'CONTRIBUTOR' }
    })
    
    await prisma.courseAllocation.update({
      where: { id: allocationId },
      data: { role: 'COORDINATOR' }
    })
    
    revalidatePath('/admin/course-coordination')
    return { success: true }
  } catch (error: any) {
    console.error('Set coordinator error:', error)
    return { success: false, error: error.message || 'Failed to set coordinator' }
  }
}

export async function removeAllocation(id: string) {
  try {
    await prisma.courseAllocation.delete({ where: { id } })
    revalidatePath('/admin/course-coordination')
    revalidatePath('/admin/faculty')
    return { success: true }
  } catch (error: any) {
    console.error('Remove allocation error:', error)
    return { success: false, error: error.message || 'Failed to remove allocation' }
  }
}

// ============================================
// BULK UPLOAD ACTIONS
// ============================================

export async function bulkUploadProgrammes(data: any[]) {
  try {
    const programmes = data.map(row => ({
      session: row.session || row.Session || '',
      programmeCode: row.programmeCode || row['Programme Code'] || '',
      programmeName: row.programmeName || row['Programme Name'] || '',
      duration: parseInt(row.duration || row.Duration || 4),
      currentSemester: parseInt(row.currentSemester || row['Current Semester'] || 1),
      section: row.section || row.Section || null,
      noOfStudents: parseInt(row.noOfStudents || row['No of Students'] || 0)
    }))

    const validProgrammes = programmes.filter(p => 
      p.session && p.programmeCode && p.programmeName
    )

    if (validProgrammes.length === 0) {
      return { success: false, error: 'No valid programme data found. Please check your Excel file.' }
    }

    const result = await prisma.programme.createMany({
      data: validProgrammes,
      skipDuplicates: true
    })

    revalidatePath('/admin/programmes')
    return { success: true, count: result.count }
  } catch (error: any) {
    console.error('Bulk upload programmes error:', error)
    return { success: false, error: error.message || 'Failed to upload programmes. Check your data format.' }
  }
}

export async function bulkUploadCourses(data: any[]) {
  try {
    const allProgrammes = await prisma.programme.findMany({
      select: { id: true, session: true, programmeCode: true }
    })

    interface ValidCourse {
      session: string
      programmeId: string
      semester: number
      courseCode: string
      courseName: string
      l: number
      t: number
      p: number
      s: number
      credits: number
      totalHours: number
      courseType: any
      deliveryMode: any
      roomNo: string | null
      attendance: boolean
      category: any
    }

    const validCourses: ValidCourse[] = []
    const failedCourses: { row: number; courseCode: string; reason: string }[] = []

    data.forEach((row, index) => {
      const session = row.session || row.Session || ''
      const programmeCode = row.programmeCode || row['Programme Code'] || ''
      const courseCode = row.courseCode || row['Course Code'] || ''
      const courseName = row.courseName || row['Course Name'] || ''

      if (!session) {
        failedCourses.push({ row: index + 1, courseCode, reason: 'Missing Session' })
        return
      }

      if (!programmeCode) {
        failedCourses.push({ row: index + 1, courseCode, reason: 'Missing Programme Code' })
        return
      }

      if (!courseCode) {
        failedCourses.push({ row: index + 1, courseCode: '[Empty]', reason: 'Missing Course Code' })
        return
      }

      if (!courseName) {
        failedCourses.push({ row: index + 1, courseCode, reason: 'Missing Course Name' })
        return
      }

      const programme = allProgrammes.find(
        p => p.session === session && p.programmeCode === programmeCode
      )

      if (!programme) {
        failedCourses.push({ 
          row: index + 1, 
          courseCode, 
          reason: `Programme "${programmeCode}" not found in session "${session}"` 
        })
        return
      }

      validCourses.push({
        session,
        programmeId: programme.id,
        semester: parseInt(row.semester || row.Semester || 1),
        courseCode,
        courseName,
        l: parseInt(row.l || row.L || 0),
        t: parseInt(row.t || row.T || 0),
        p: parseInt(row.p || row.P || 0),
        s: parseInt(row.s || row.S || 0),
        credits: parseInt(row.credits || row.Credits || 0),
        totalHours: parseInt(row.totalHours || row['Total Hours'] || 0),
        courseType: (row.courseType || row['Course Type'] || 'CORE') as any,
        deliveryMode: (row.deliveryMode || row['Delivery Mode'] || 'THEORY') as any,
        roomNo: row.roomNo || row['Room No'] || null,
        attendance: row.attendance === 'Yes' || row.Attendance === 'Yes',
        category: (row.category || row.Category || 'MANDATORY') as any
      })
    })

    if (validCourses.length === 0) {
      const errorList = failedCourses.map(f => `Row ${f.row} (${f.courseCode}): ${f.reason}`).join('\n')
      return { 
        success: false, 
        error: `All courses failed validation:\n${errorList}` 
      }
    }

    const result = await prisma.course.createMany({
      data: validCourses,
      skipDuplicates: true
    })

    revalidatePath('/admin/courses')

    let message = `Successfully uploaded ${result.count} out of ${validCourses.length} valid courses.`
    if (failedCourses.length > 0) {
      const errorList = failedCourses
        .slice(0, 10)
        .map(f => `Row ${f.row} (${f.courseCode}): ${f.reason}`)
        .join('\n')
      const moreText = failedCourses.length > 10 ? `\n... and ${failedCourses.length - 10} more errors` : ''
      message += `\n\nFailed to validate ${failedCourses.length} rows:\n${errorList}${moreText}`
    }

    return { 
      success: true, 
      count: result.count,
      message,
      failedCount: failedCourses.length
    }
  } catch (error: any) {
    console.error('Bulk upload courses error:', error)
    return { success: false, error: error.message || 'Failed to upload courses.' }
  }
}

export async function bulkUploadFaculty(data: any[]) {
  try {
    const facultyData = await Promise.all(
      data.map(async (row) => {
        const email = row.email || row.Email || ''
        
        let user = await prisma.user.findUnique({
          where: { email }
        })

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: row.name || row.Name || '',
              role: 'FACULTY' as any
            }
          })
        }

        return {
          userId: user.id,
          facultyId: row.facultyId || row['Faculty ID'] || '',
          name: row.name || row.Name || '',
          designation: row.designation || row.Designation || '',
          email,
          contactNo: row.contactNo || row['Contact No'] || '',
          department: row.department || row.Department || null,
          programmeId: null
        }
      })
    )

    await prisma.faculty.createMany({
      data: facultyData,
      skipDuplicates: true
    })

    revalidatePath('/admin/faculty')
    return { success: true, count: facultyData.length }
  } catch (error: any) {
    console.error('Bulk upload faculty error:', error)
    return { success: false, error: error.message || 'Failed to upload faculty. Check your data format.' }
  }
}

// ✅ NEW: Bulk upload faculty allocations with programme code
export async function bulkUploadFacultyAllocations(data: any[]) {
  try {
    const allFaculty = await prisma.faculty.findMany({
      select: { id: true, facultyId: true }
    })

    const allCourses = await prisma.course.findMany({
      select: { 
        id: true, 
        courseCode: true, 
        programme: { select: { programmeCode: true } } 
      }
    })

    interface ValidAllocation {
      courseId: string
      facultyId: string
      role: any
    }

    const validAllocations: ValidAllocation[] = []
    const failedAllocations: { row: number; reason: string }[] = []

    data.forEach((row, index) => {
      const facultyId = row['Faculty ID'] || ''
      const courseCode = row['Course Code'] || ''
      const programmeCode = row['Programme Code'] || ''
      const role = row['Role'] || 'CONTRIBUTOR'

      if (!facultyId) {
        failedAllocations.push({ row: index + 1, reason: 'Missing Faculty ID' })
        return
      }

      if (!courseCode) {
        failedAllocations.push({ row: index + 1, reason: 'Missing Course Code' })
        return
      }

      if (!programmeCode) {
        failedAllocations.push({ row: index + 1, reason: 'Missing Programme Code' })
        return
      }

      if (role !== 'COORDINATOR' && role !== 'CONTRIBUTOR') {
        failedAllocations.push({ row: index + 1, reason: `Invalid role: "${role}" (must be COORDINATOR or CONTRIBUTOR)` })
        return
      }

      const faculty = allFaculty.find(f => f.facultyId === facultyId)
      if (!faculty) {
        failedAllocations.push({ row: index + 1, reason: `Faculty ID "${facultyId}" not found` })
        return
      }

      const course = allCourses.find(c => 
        c.courseCode === courseCode && c.programme.programmeCode === programmeCode
      )
      if (!course) {
        failedAllocations.push({ row: index + 1, reason: `Course "${courseCode}" not found in "${programmeCode}"` })
        return
      }

      validAllocations.push({
        courseId: course.id,
        facultyId: faculty.id,
        role: role as any
      })
    })

    if (validAllocations.length === 0) {
      const errorList = failedAllocations.map(f => `Row ${f.row}: ${f.reason}`).join('\n')
      return { 
        success: false, 
        error: `All allocations failed validation:\n${errorList}` 
      }
    }

    const result = await prisma.courseAllocation.createMany({
      data: validAllocations,
      skipDuplicates: true
    })

    revalidatePath('/admin/faculty')

    let message = `Successfully allocated ${result.count} out of ${validAllocations.length} faculty to courses.`
    if (failedAllocations.length > 0) {
      const errorList = failedAllocations
        .slice(0, 10)
        .map(f => `Row ${f.row}: ${f.reason}`)
        .join('\n')
      const moreText = failedAllocations.length > 10 ? `\n... and ${failedAllocations.length - 10} more errors` : ''
      message += `\n\nFailed to validate ${failedAllocations.length} rows:\n${errorList}${moreText}`
    }

    return { 
      success: true, 
      count: result.count,
      message,
      failedCount: failedAllocations.length
    }
  } catch (error: any) {
    console.error('Bulk upload faculty allocations error:', error)
    return { success: false, error: error.message || 'Failed to upload allocations.' }
  }
}
