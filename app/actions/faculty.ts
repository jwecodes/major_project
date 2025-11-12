'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// For now, we'll use a hardcoded faculty ID (will be replaced with auth later)
const TEMP_FACULTY_ID = 'temp-faculty-id' // Replace with actual faculty ID from session

export async function getMyCourses(facultyId: string) {
  return await prisma.courseAllocation.findMany({
    where: { facultyId },
    include: {
      course: {
        include: {
          programme: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function uploadContent(data: {
  courseId: string
  facultyId: string
  contentType: string
  title: string
  description?: string
  lectureNumber?: number
  filePath: string
  fileName: string
  fileSize?: number
  mimeType?: string
}) {
  try {
    await prisma.teachingContent.create({
      data: {
        ...data,
        approvalStatus: 'PENDING'
      }
    })
    revalidatePath('/faculty/my-content')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Failed to upload content' }
  }
}

export async function getMyContent(facultyId: string) {
  return await prisma.teachingContent.findMany({
    where: { facultyId },
    include: {
      course: {
        include: { programme: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function deleteContent(id: string) {
  try {
    await prisma.teachingContent.delete({ where: { id } })
    revalidatePath('/faculty/my-content')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete content' }
  }
}

export async function updateContent(id: string, data: any) {
  try {
    await prisma.teachingContent.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })
    revalidatePath('/faculty/my-content')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to update content' }
  }
}

export async function getFacultyStats(facultyId: string) {
  const [totalCourses, totalContent, pendingApproval, approvedContent] = await Promise.all([
    prisma.courseAllocation.count({ where: { facultyId } }),
    prisma.teachingContent.count({ where: { facultyId } }),
    prisma.teachingContent.count({ 
      where: { 
        facultyId,
        approvalStatus: 'PENDING' 
      } 
    }),
    prisma.teachingContent.count({ 
      where: { 
        facultyId,
        approvalStatus: 'APPROVED' 
      } 
    })
  ])

  return {
    totalCourses,
    totalContent,
    pendingApproval,
    approvedContent
  }
}
