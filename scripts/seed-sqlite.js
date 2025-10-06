const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Add Academic Session
  const session = await prisma.academicSession.create({
    data: {
      sessionCode: '2024-2025',
      sessionName: 'Academic Year 2024-2025',
      startDate: new Date('2024-07-01'),
      endDate: new Date('2025-06-30'),
      isActive: true,
      isCurrent: true
    }
  })
  console.log('✅ Created academic session')

  // Add all your programmes
  const programmes = []

  // B.Sc. Programs
  const bscCS = await prisma.programme.create({
    data: {
      session: '2024-2025',
      code: 'BSC_CS',
      name: 'Bachelor of Science (Honours) in Computer Science',
      shortName: 'B.Sc. (H) CS',
      duration: 3,
      semesters: 6,
      degree: 'B.Sc.',
      department: 'Computer Science',
      isActive: true
    }
  })
  programmes.push(bscCS)

  const bscCyber = await prisma.programme.create({
    data: {
      session: '2024-2025',
      code: 'BSC_CYBER',
      name: 'Bachelor of Science (Honours) in Cyber Security',
      shortName: 'B.Sc. (H) Cyber Security',
      duration: 3,
      semesters: 6,
      degree: 'B.Sc.',
      specialization: 'Cyber Security',
      department: 'Computer Science',
      isActive: true
    }
  })
  programmes.push(bscCyber)

  const bscDS = await prisma.programme.create({
    data: {
      session: '2024-2025',
      code: 'BSC_DS',
      name: 'Bachelor of Science (Honours) in Data Science',
      shortName: 'B.Sc. (H) DS',
      duration: 3,
      semesters: 6,
      degree: 'B.Sc.',
      specialization: 'Data Science',
      department: 'Computer Science',
      isActive: true
    }
  })
  programmes.push(bscDS)

  // BCA Program
  const bcaAI = await prisma.programme.create({
    data: {
      session: '2024-2025',
      code: 'BCA_AI_DS',
      name: 'Bachelor of Computer Applications (Honours) Specialization in AI & DS (Research)',
      shortName: 'BCA (H) (Sp AI & DS) (Research)',
      duration: 3,
      semesters: 6,
      degree: 'BCA',
      specialization: 'AI & Data Science',
      partnership: 'Research',
      department: 'Computer Science',
      isActive: true
    }
  })
  programmes.push(bcaAI)

  // B.Tech Programs
  const btechCSE = await prisma.programme.create({
    data: {
      session: '2024-2025',
      code: 'BTECH_CSE',
      name: 'Bachelor of Technology in Computer Science Engineering',
      shortName: 'B.Tech CSE',
      duration: 4,
      semesters: 8,
      degree: 'B.Tech',
      department: 'Computer Science',
      isActive: true
    }
  })
  programmes.push(btechCSE)

  const btechAI = await prisma.programme.create({
    data: {
      session: '2024-2025',
      code: 'BTECH_CSE_AI_ML',
      name: 'Bachelor of Technology in CSE (AI & ML)',
      shortName: 'B.Tech CSE (AI & ML) Samatrix',
      duration: 4,
      semesters: 8,
      degree: 'B.Tech',
      specialization: 'AI & ML',
      partnership: 'Samatrix',
      department: 'Computer Science',
      isActive: true
    }
  })
  programmes.push(btechAI)

  const btechCyber = await prisma.programme.create({
    data: {
      session: '2024-2025',
      code: 'BTECH_CSE_CYBER',
      name: 'Bachelor of Technology in CSE (Cyber Security)',
      shortName: 'B.Tech CSE (Cyber Security) EC-Council',
      duration: 4,
      semesters: 8,
      degree: 'B.Tech',
      specialization: 'Cyber Security',
      partnership: 'EC-Council',
      department: 'Computer Science',
      isActive: true
    }
  })
  programmes.push(btechCyber)

  const btechDS = await prisma.programme.create({
    data: {
      session: '2024-2025',
      code: 'BTECH_CSE_DS',
      name: 'Bachelor of Technology in CSE (Data Science)',
      shortName: 'B.Tech CSE (DS) IBM',
      duration: 4,
      semesters: 8,
      degree: 'B.Tech',
      specialization: 'Data Science',
      partnership: 'IBM',
      department: 'Computer Science',
      isActive: true
    }
  })
  programmes.push(btechDS)

  const btechFS = await prisma.programme.create({
    data: {
      session: '2024-2025',
      code: 'BTECH_CSE_FS',
      name: 'Bachelor of Technology in CSE (Full Stack)',
      shortName: 'B.Tech CSE (Full Stack)',
      duration: 4,
      semesters: 8,
      degree: 'B.Tech',
      specialization: 'Full Stack',
      department: 'Computer Science',
      isActive: true
    }
  })
  programmes.push(btechFS)

  const btechUX = await prisma.programme.create({
    data: {
      session: '2024-2025',
      code: 'BTECH_CSE_UX_UI',
      name: 'Bachelor of Technology in CSE (UX/UI)',
      shortName: 'B.Tech CSE (UX OR UI) ImaginXP',
      duration: 4,
      semesters: 8,
      degree: 'B.Tech',
      specialization: 'UX/UI',
      partnership: 'ImaginXP',
      department: 'Computer Science',
      isActive: true
    }
  })
  programmes.push(btechUX)

  const btechME = await prisma.programme.create({
    data: {
      session: '2024-2025',
      code: 'BTECH_ME',
      name: 'Bachelor of Technology in Mechanical Engineering',
      shortName: 'B.Tech ME',
      duration: 4,
      semesters: 8,
      degree: 'B.Tech',
      department: 'Mechanical Engineering',
      isActive: true
    }
  })
  programmes.push(btechME)

  // MCA Program
  const mca = await prisma.programme.create({
    data: {
      session: '2024-2025',
      code: 'MCA',
      name: 'Master of Computer Applications',
      shortName: 'MCA',
      duration: 2,
      semesters: 4,
      degree: 'MCA',
      department: 'Computer Science',
      isActive: true
    }
  })
  programmes.push(mca)

  console.log(`✅ Created ${programmes.length} programmes`)

  // Add Programme Sections with your actual student data
  const sections = [
    // B.Sc. (H) CS
    { programme: bscCS, semester: 3, studentCount: 11, sectionName: null },
    { programme: bscCS, semester: 5, studentCount: 15, sectionName: null },

    // B.Sc. (H) Cyber Security
    { programme: bscCyber, semester: 3, studentCount: 9, sectionName: null },
    { programme: bscCyber, semester: 5, studentCount: 8, sectionName: null },

    // B.Sc. (H) DS
    { programme: bscDS, semester: 3, studentCount: 9, sectionName: null },
    { programme: bscDS, semester: 5, studentCount: 13, sectionName: null },

    // B.Tech CSE (multiple sections)
    { programme: btechCSE, semester: 3, studentCount: 67, sectionName: 'A' },
    { programme: btechCSE, semester: 3, studentCount: 68, sectionName: 'B' },
    { programme: btechCSE, semester: 3, studentCount: 71, sectionName: 'C' },
    { programme: btechCSE, semester: 3, studentCount: 69, sectionName: 'D' },
    { programme: btechCSE, semester: 5, studentCount: 61, sectionName: 'A' },
    { programme: btechCSE, semester: 5, studentCount: 63, sectionName: 'B' },
    { programme: btechCSE, semester: 5, studentCount: 60, sectionName: 'C' },
    { programme: btechCSE, semester: 5, studentCount: 64, sectionName: 'D' },
    { programme: btechCSE, semester: 7, studentCount: 60, sectionName: 'A' },
    { programme: btechCSE, semester: 7, studentCount: 54, sectionName: 'B' },

    // B.Tech CSE (AI & ML) Samatrix
    { programme: btechAI, semester: 3, studentCount: 71, sectionName: 'A' },
    { programme: btechAI, semester: 3, studentCount: 71, sectionName: 'B' },
    { programme: btechAI, semester: 3, studentCount: 73, sectionName: 'C' },
    { programme: btechAI, semester: 3, studentCount: 73, sectionName: 'D' },

    // Other programmes with single sections
    { programme: btechCyber, semester: 3, studentCount: 58, sectionName: null },
    { programme: btechDS, semester: 3, studentCount: 59, sectionName: null },
    { programme: btechFS, semester: 3, studentCount: 17, sectionName: null },
    { programme: btechUX, semester: 3, studentCount: 30, sectionName: null },

    // BCA (H) (Sp AI & DS)
    { programme: bcaAI, semester: 3, studentCount: 68, sectionName: 'A' },
    { programme: bcaAI, semester: 3, studentCount: 69, sectionName: 'B' },
    { programme: bcaAI, semester: 3, studentCount: 68, sectionName: 'C' },

    // MCA
    { programme: mca, semester: 3, studentCount: 42, sectionName: 'A' },
    { programme: mca, semester: 3, studentCount: 41, sectionName: 'B' },

    // B.Tech ME
    { programme: btechME, semester: 7, studentCount: 5, sectionName: null }
  ]

  for (const section of sections) {
    await prisma.programmeSection.create({
      data: {
        programmeId: section.programme.id,
        semester: section.semester,
        studentCount: section.studentCount,
        sectionName: section.sectionName,
        session: '2024-2025'
      }
    })
  }

  console.log(`✅ Created ${sections.length} programme sections`)

  // Add sample faculty
  const faculties = [
    { facultyId: 'FAC001', name: 'Dr. John Smith', email: 'john.smith@college.edu', designation: 'Professor' },
    { facultyId: 'FAC002', name: 'Prof. Sarah Johnson', email: 'sarah.johnson@college.edu', designation: 'Associate Professor' },
    { facultyId: 'FAC003', name: 'Dr. Mike Wilson', email: 'mike.wilson@college.edu', designation: 'Assistant Professor' },
    { facultyId: 'FAC004', name: 'Dr. Emily Davis', email: 'emily.davis@college.edu', designation: 'Professor' },
    { facultyId: 'FAC005', name: 'Prof. Robert Brown', email: 'robert.brown@college.edu', designation: 'Associate Professor' }
  ]

  for (const faculty of faculties) {
    await prisma.faculty.create({
      data: {
        ...faculty,
        department: 'Computer Science',
        isActive: true
      }
    })
  }

  console.log(`✅ Created ${faculties.length} faculty members`)

  // Add sample courses from your Excel data
  const bscCSCourses = [
    { code: 'ETCCCS101', name: 'Mathematical Foundations for Computer Science', L: 3, T: 0, S: 0, P: 0, C: 3, totalHours: 3, courseType: 'Core', type: 'Theory' },
    { code: 'ETCCWD102', name: 'Web Development Essentials', L: 3, T: 0, S: 0, P: 2, C: 4, totalHours: 5, courseType: 'Core', type: 'Theory and Practical' },
    { code: 'ETCCPP103', name: 'Foundations of Programming using Python', L: 3, T: 0, S: 0, P: 2, C: 4, totalHours: 5, courseType: 'Core', type: 'Theory and Practical' }
  ]

  for (const course of bscCSCourses) {
    await prisma.course.create({
      data: {
        ...course,
        session: '2024-2025',
        programmeId: bscCS.id,
        semester: 1,
        isAttendanceMandatory: true,
        isMandatory: true
      }
    })
  }

  console.log(`✅ Created ${bscCSCourses.length} courses`)

  console.log('🎉 Database seeding completed!')
  console.log('📊 Summary:')
  console.log(`   - 1 Academic Session`)
  console.log(`   - ${programmes.length} Programmes`)
  console.log(`   - ${sections.length} Programme Sections`)
  console.log(`   - ${faculties.length} Faculty Members`)
  console.log(`   - ${bscCSCourses.length} Sample Courses`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
