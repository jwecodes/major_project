const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🎯 Creating test course assignments...')

  // Get some courses and faculty
  const courses = await prisma.course.findMany({
    take: 5,
    include: { programme: true }
  })

  const faculties = await prisma.faculty.findMany({
    take: 10
  })

  if (courses.length === 0 || faculties.length === 0) {
    console.log('❌ No courses or faculty found. Import them first.')
    return
  }

  let assignedCount = 0

  for (let i = 0; i < courses.length; i++) {
    const course = courses[i]
    const coordinator = faculties[i * 2] // Every even faculty as coordinator
    const contributor = faculties[i * 2 + 1] // Every odd faculty as contributor

    try {
      // Assign coordinator
      if (coordinator) {
        await prisma.courseAssignment.create({
          data: {
            courseId: course.id,
            facultyId: coordinator.id,
            role: 'coordinator',
            assignedBy: 'Dean',
            session: '2024-2025',
            isActive: true
          }
        })
        assignedCount++
        console.log(`✅ Assigned ${coordinator.name} as coordinator for ${course.code}`)
      }

      // Assign contributor
      if (contributor) {
        await prisma.courseAssignment.create({
          data: {
            courseId: course.id,
            facultyId: contributor.id,
            role: 'contributor',
            assignedBy: 'Dean',
            session: '2024-2025',
            isActive: true
          }
        })
        assignedCount++
        console.log(`✅ Assigned ${contributor.name} as contributor for ${course.code}`)
      }
    } catch (error) {
      console.error(`❌ Error assigning for ${course.code}:`, error.message)
    }
  }

  console.log(`\n🎉 Created ${assignedCount} course assignments!`)
}

main()
  .catch((e) => {
    console.error('❌ Script failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
