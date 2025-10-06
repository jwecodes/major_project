const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('📚 Starting course data import...')

  // First, let's get all programmes from database to map names to IDs
  const programmes = await prisma.programme.findMany({
    where: { session: '2024-2025' }
  })

  // Create mapping from programme names to IDs
  const programmeMap = {
    'B.Sc. (H) CS': programmes.find(p => p.code === 'BSC_CS')?.id,
    'B.Sc. (H) Cyber Security': programmes.find(p => p.code === 'BSC_CYBER')?.id,
    'B.Sc. (H) DS': programmes.find(p => p.code === 'BSC_DS')?.id,
    'B.Tech CSE': programmes.find(p => p.code === 'BTECH_CSE')?.id,
    'B.Tech CSE (AI & ML) Samatrix': programmes.find(p => p.code === 'BTECH_CSE_AI_ML')?.id,
    'B.Tech CSE (Cyber Security) EC-Council': programmes.find(p => p.code === 'BTECH_CSE_CYBER')?.id,
    'B.Tech CSE (DS) IBM': programmes.find(p => p.code === 'BTECH_CSE_DS')?.id,
    'B.Tech CSE (Full Stack)': programmes.find(p => p.code === 'BTECH_CSE_FS')?.id,
    'B.Tech CSE (UX OR UI) ImaginXP': programmes.find(p => p.code === 'BTECH_CSE_UX_UI')?.id,
    'BCA (H) (Sp AI & DS) (Research)': programmes.find(p => p.code === 'BCA_AI_DS')?.id,
    'MCA': programmes.find(p => p.code === 'MCA')?.id
  }

  console.log('Found programmes:', Object.keys(programmeMap).length)

  // Helper function to extract semester number
  const getSemesterNumber = (semesterStr) => {
    if (semesterStr.includes('I')) return 1
    if (semesterStr.includes('III')) return 3
    if (semesterStr.includes('V')) return 5
    if (semesterStr.includes('VII')) return 7
    return parseInt(semesterStr.match(/\d+/)?.[0]) || 1
  }

  // Helper function to clean course type
  const getCourseType = (type) => {
    if (type.includes('Core')) return 'Core'
    if (type.includes('SEC') || type.includes('Skill Enhancement')) return 'SEC'
    if (type.includes('VAC')) return 'VAC'
    if (type.includes('AECC')) return 'AECC'
    if (type.includes('Open Elective')) return 'Open Elective'
    if (type.includes('Department Specific')) return 'Department Elective'
    return 'Core'
  }

  // Your real course data from Excel
  const courseData = [
    // B.Sc. (H) CS - Semester I
    { programme: 'B.Sc. (H) CS', semester: 1, code: 'ETCCCS101', name: 'Mathematical Foundations for Computer Science', L: 3, T: 0, S: 0, P: 0, C: 3, totalHours: 3, courseType: 'Core', type: 'Theory' },
    { programme: 'B.Sc. (H) CS', semester: 1, code: 'ETCCWD102', name: 'Web Development Essentials', L: 3, T: 0, S: 0, P: 2, C: 4, totalHours: 5, courseType: 'Core', type: 'Theory and Practical' },
    { programme: 'B.Sc. (H) CS', semester: 1, code: 'ETCCPP103', name: 'Foundations of Programming using Python', L: 3, T: 0, S: 0, P: 2, C: 4, totalHours: 5, courseType: 'Core', type: 'Theory and Practical' },
    { programme: 'B.Sc. (H) CS', semester: 1, code: 'SEC-DT101', name: 'Introduction to Design Thinking and Prototyping', L: 1, T: 0, S: 0, P: 2, C: 2, totalHours: 3, courseType: 'SEC', type: 'Theory and Practical' },
    { programme: 'B.Sc. (H) CS', semester: 1, code: 'VAC-I', name: 'Environmental Studies & Disaster Management', L: 2, T: 0, S: 0, P: 0, C: 2, totalHours: 2, courseType: 'VAC', type: 'Theory' },
    { programme: 'B.Sc. (H) CS', semester: 1, code: 'SEC-ADM101', name: 'Analytics for Decision Making', L: 2, T: 0, S: 0, P: 0, C: 2, totalHours: 2, courseType: 'SEC', type: 'Theory' },
    { programme: 'B.Sc. (H) CS', semester: 1, code: 'ETCCCR104', name: 'Foundations of Computing and Career Readiness', L: 4, T: 0, S: 0, P: 0, C: 3, totalHours: 4, courseType: 'Core', type: 'Theory' },

    // B.Sc. (H) CS - Semester III
    { programme: 'B.Sc. (H) CS', semester: 3, code: 'AEC006', name: 'Verbal Ability', L: 3, T: 0, S: 0, P: 0, C: 3, totalHours: 3, courseType: 'AECC', type: 'Theory' },
    { programme: 'B.Sc. (H) CS', semester: 3, code: 'ENSP209', name: 'Advanced Programming Concepts', L: 4, T: 0, S: 0, P: 0, C: 4, totalHours: 4, courseType: 'Core', type: 'Theory' },
    { programme: 'B.Sc. (H) CS', semester: 3, code: 'AUC002', name: 'Competitive Coding - II', L: 2, T: 0, S: 0, P: 0, C: 0, totalHours: 4, courseType: 'Core', type: 'Theory' },
    { programme: 'B.Sc. (H) CS', semester: 3, code: 'ENBC201', name: 'Computer Networks', L: 4, T: 0, S: 0, P: 0, C: 4, totalHours: 4, courseType: 'Core', type: 'Theory' },
    { programme: 'B.Sc. (H) CS', semester: 3, code: 'ENBC203', name: 'Database Management Systems', L: 4, T: 0, S: 0, P: 0, C: 4, totalHours: 4, courseType: 'Core', type: 'Theory' },
    { programme: 'B.Sc. (H) CS', semester: 3, code: 'ENBC205', name: 'Software Engineering', L: 4, T: 0, S: 0, P: 0, C: 4, totalHours: 4, courseType: 'Core', type: 'Theory' },

    // B.Tech CSE - Semester I
    { programme: 'B.Tech CSE', semester: 1, code: 'ETCCCM101', name: 'Computational Mathematics - I', L: 4, T: 0, S: 0, P: 0, C: 4, totalHours: 4, courseType: 'Core', type: 'Theory' },
    { programme: 'B.Tech CSE', semester: 1, code: 'ETCCPP102', name: 'Programming for Problem Solving Using Python', L: 3, T: 0, S: 0, P: 2, C: 4, totalHours: 5, courseType: 'Core', type: 'Theory and Practical' },
    { programme: 'B.Tech CSE', semester: 1, code: 'ETCCWD103', name: 'Web Dev - I (HTML, CSS, JS Basics)', L: 3, T: 0, S: 0, P: 2, C: 4, totalHours: 5, courseType: 'Core', type: 'Theory and Practical' },
    { programme: 'B.Tech CSE', semester: 1, code: 'SEC-DT101', name: 'Design Thinking & Prototyping', L: 1, T: 0, S: 0, P: 2, C: 2, totalHours: 3, courseType: 'SEC', type: 'Theory and Practical' },
    { programme: 'B.Tech CSE', semester: 1, code: 'VAC-I', name: 'Environmental Studies & Disaster Management', L: 2, T: 0, S: 0, P: 0, C: 2, totalHours: 2, courseType: 'VAC', type: 'Theory' },
    { programme: 'B.Tech CSE', semester: 1, code: 'ETCCCP105', name: 'Computer Science Fundamentals & Career Pathways', L: 4, T: 0, S: 0, P: 0, C: 4, totalHours: 4, courseType: 'Core', type: 'Theory' },
    { programme: 'B.Tech CSE', semester: 1, code: 'ETCCPH104', name: 'Engineering Physics', L: 2, T: 0, S: 0, P: 2, C: 2, totalHours: 4, courseType: 'Core', type: 'Theory and Practical' },

    // B.Tech CSE - Semester III
    { programme: 'B.Tech CSE', semester: 3, code: 'AEC006', name: 'Verbal Ability', L: 3, T: 0, S: 0, P: 0, C: 3, totalHours: 3, courseType: 'AECC', type: 'Theory' },
    { programme: 'B.Tech CSE', semester: 3, code: 'AUC001', name: 'Competitive Coding - I', L: 2, T: 0, S: 0, P: 0, C: 0, totalHours: 4, courseType: 'Core', type: 'Theory' },
    { programme: 'B.Tech CSE', semester: 3, code: 'ENCS203', name: 'Data Structures and Algorithms', L: 4, T: 0, S: 0, P: 0, C: 4, totalHours: 4, courseType: 'Core', type: 'Theory' },
    { programme: 'B.Tech CSE', semester: 3, code: 'ENCS201', name: 'Computer Organization and Architecture', L: 4, T: 0, S: 0, P: 0, C: 4, totalHours: 4, courseType: 'Core', type: 'Theory' },
    { programme: 'B.Tech CSE', semester: 3, code: 'ENCS205', name: 'Discrete Mathematics', L: 4, T: 0, S: 0, P: 0, C: 4, totalHours: 4, courseType: 'Core', type: 'Theory' },
    { programme: 'B.Tech CSE', semester: 3, code: 'CS002', name: 'Community Service', L: 1, T: 0, S: 0, P: 0, C: 1, totalHours: 1, courseType: 'Core', type: 'Theory' },

    // B.Tech CSE - Semester V
    { programme: 'B.Tech CSE', semester: 5, code: 'AUC003', name: 'Competitive Coding - III', L: 2, T: 0, S: 0, P: 0, C: 0, totalHours: 4, courseType: 'Core', type: 'Theory' },
    { programme: 'B.Tech CSE', semester: 5, code: 'ENCS301', name: 'Theory of Computation', L: 4, T: 0, S: 0, P: 0, C: 4, totalHours: 4, courseType: 'Core', type: 'Theory' },
    { programme: 'B.Tech CSE', semester: 5, code: 'ENCS303', name: 'Operating Systems', L: 4, T: 0, S: 0, P: 0, C: 4, totalHours: 4, courseType: 'Core', type: 'Theory' },
    { programme: 'B.Tech CSE', semester: 5, code: 'ENCS305', name: 'Software Engineering', L: 4, T: 0, S: 0, P: 0, C: 4, totalHours: 4, courseType: 'Core', type: 'Theory' },
    { programme: 'B.Tech CSE', semester: 5, code: 'AEC013', name: 'Life Skills for Professionals - III', L: 3, T: 0, S: 0, P: 0, C: 3, totalHours: 0, courseType: 'AECC', type: 'Theory' },
    { programme: 'B.Tech CSE', semester: 5, code: 'VAC-IV', name: 'Clubs & Society Engagement', L: 1, T: 0, S: 0, P: 0, C: 1, totalHours: 1, courseType: 'VAC', type: 'Theory' },

    // B.Tech CSE - Semester VII
    { programme: 'B.Tech CSE', semester: 7, code: 'ETCS423A', name: 'Neural Network', L: 4, T: 0, S: 0, P: 0, C: 4, totalHours: 4, courseType: 'Core', type: 'Theory' },
    { programme: 'B.Tech CSE', semester: 7, code: 'ETCS425A', name: 'Machine Learning', L: 4, T: 0, S: 0, P: 0, C: 4, totalHours: 4, courseType: 'Core', type: 'Theory' },
    { programme: 'B.Tech CSE', semester: 7, code: 'ETCS426A', name: 'Natural Language Processing', L: 4, T: 0, S: 0, P: 0, C: 4, totalHours: 4, courseType: 'Core', type: 'Theory' },
    { programme: 'B.Tech CSE', semester: 7, code: 'ETCS421A', name: 'Internet of Things', L: 4, T: 0, S: 0, P: 0, C: 4, totalHours: 4, courseType: 'Core', type: 'Theory' },
    { programme: 'B.Tech CSE', semester: 7, code: 'ETCS422A', name: 'Cloud Computing', L: 4, T: 0, S: 0, P: 0, C: 4, totalHours: 4, courseType: 'Core', type: 'Theory' },
    { programme: 'B.Tech CSE', semester: 7, code: 'ETCS424A', name: 'Data Warehousing and Data Mining', L: 4, T: 0, S: 0, P: 0, C: 4, totalHours: 4, courseType: 'Core', type: 'Theory' },
    { programme: 'B.Tech CSE', semester: 7, code: 'ETCS464A', name: 'Major Project', L: 0, T: 0, S: 0, P: 0, C: 6, totalHours: 0, courseType: 'Core', type: 'Practical' },

    // B.Tech CSE (AI & ML) Samatrix - Semester I
    { programme: 'B.Tech CSE (AI & ML) Samatrix', semester: 1, code: 'ETCCCM101', name: 'Computational Mathematics - I', L: 4, T: 0, S: 0, P: 0, C: 4, totalHours: 4, courseType: 'Core', type: 'Theory' },
    { programme: 'B.Tech CSE (AI & ML) Samatrix', semester: 1, code: 'ETCCPP102', name: 'Programming for Problem Solving Using Python', L: 3, T: 0, S: 0, P: 2, C: 4, totalHours: 5, courseType: 'Core', type: 'Theory and Practical' },
    { programme: 'B.Tech CSE (AI & ML) Samatrix', semester: 1, code: 'ETCCWD103', name: 'Web Dev - I (HTML, CSS, JS Basics)', L: 3, T: 0, S: 0, P: 2, C: 4, totalHours: 5, courseType: 'Core', type: 'Theory and Practical' },
    { programme: 'B.Tech CSE (AI & ML) Samatrix', semester: 1, code: 'ETCCCP105', name: 'Computer Science Fundamentals & Career Pathways', L: 4, T: 0, S: 0, P: 0, C: 4, totalHours: 4, courseType: 'Core', type: 'Theory' },
    { programme: 'B.Tech CSE (AI & ML) Samatrix', semester: 1, code: 'ETCCCH104', name: 'Engineering Chemistry', L: 2, T: 0, S: 0, P: 2, C: 2, totalHours: 4, courseType: 'Core', type: 'Theory and Practical' },
    { programme: 'B.Tech CSE (AI & ML) Samatrix', semester: 1, code: 'VAC-I', name: 'Environmental Studies & Disaster Management', L: 2, T: 0, S: 0, P: 0, C: 2, totalHours: 2, courseType: 'VAC', type: 'Theory' },
    { programme: 'B.Tech CSE (AI & ML) Samatrix', semester: 1, code: 'SEC-MT101', name: 'Maker Lab: Tinkering with Technology', L: 1, T: 0, S: 0, P: 2, C: 2, totalHours: 3, courseType: 'SEC', type: 'Theory and Practical' },

    // MCA - Semester I
    { programme: 'MCA', semester: 1, code: 'ETCCAD173', name: 'Advanced Database Management Systems', L: 3, T: 0, S: 0, P: 2, C: 4, totalHours: 5, courseType: 'Core', type: 'Theory and Practical' },
    { programme: 'MCA', semester: 1, code: 'ETCCDS172', name: 'Data Structures and Algorithms', L: 3, T: 0, S: 0, P: 2, C: 4, totalHours: 5, courseType: 'Core', type: 'Theory and Practical' },
    { programme: 'MCA', semester: 1, code: 'ETCCWD175', name: 'Full Stack Web Development', L: 3, T: 0, S: 0, P: 2, C: 4, totalHours: 5, courseType: 'Core', type: 'Theory and Practical' },
    { programme: 'MCA', semester: 1, code: 'ETCCPP171', name: 'Problem Solving and Advanced Programming Concepts', L: 3, T: 0, S: 0, P: 2, C: 4, totalHours: 5, courseType: 'Core', type: 'Theory and Practical' },
    { programme: 'MCA', semester: 1, code: 'ETMCEH174', name: 'Information Security and Ethical Hacking', L: 3, T: 0, S: 0, P: 2, C: 4, totalHours: 5, courseType: 'Core', type: 'Theory and Practical' },
    { programme: 'MCA', semester: 1, code: 'SEC-CC101', name: 'Competitive Coding - I', L: 2, T: 0, S: 0, P: 0, C: 2, totalHours: 2, courseType: 'SEC', type: 'Theory' },
    { programme: 'MCA', semester: 1, code: 'SEC-DA101', name: 'Data Analysis with Power BI & KNIME', L: 2, T: 0, S: 0, P: 0, C: 2, totalHours: 2, courseType: 'SEC', type: 'Theory' },
    { programme: 'MCA', semester: 1, code: 'AEC006', name: 'Verbal Ability', L: 2, T: 0, S: 0, P: 0, C: 2, totalHours: 2, courseType: 'AECC', type: 'Theory' },

    // BCA (H) (Sp AI & DS) (Research) - Semester I
    { programme: 'BCA (H) (Sp AI & DS) (Research)', semester: 1, code: 'ETCCCPP103', name: 'Problem Solving with Python', L: 3, T: 0, S: 0, P: 2, C: 4, totalHours: 5, courseType: 'Core', type: 'Theory and Practical' },
    { programme: 'BCA (H) (Sp AI & DS) (Research)', semester: 1, code: 'ETCCCA101', name: 'Mathematics for Modern Computing Applications', L: 4, T: 0, S: 0, P: 0, C: 4, totalHours: 4, courseType: 'Core', type: 'Theory' },
    { programme: 'BCA (H) (Sp AI & DS) (Research)', semester: 1, code: 'ETCCWD102', name: 'Foundations of Web Development', L: 3, T: 0, S: 0, P: 2, C: 4, totalHours: 5, courseType: 'Core', type: 'Theory and Practical' },
    { programme: 'BCA (H) (Sp AI & DS) (Research)', semester: 1, code: 'ETCCCS104', name: 'Essentials of Computer Science and Career Skills', L: 4, T: 0, S: 0, P: 0, C: 4, totalHours: 4, courseType: 'Core', type: 'Theory' },
    { programme: 'BCA (H) (Sp AI & DS) (Research)', semester: 1, code: 'SEC-DV101', name: 'Data Visualization with Power BI', L: 2, T: 0, S: 0, P: 0, C: 2, totalHours: 2, courseType: 'SEC', type: 'Theory' },
    { programme: 'BCA (H) (Sp AI & DS) (Research)', semester: 1, code: 'SEC-DDM101', name: 'Foundations of Data-Driven Decision Making', L: 2, T: 0, S: 0, P: 0, C: 2, totalHours: 2, courseType: 'SEC', type: 'Theory' },
    { programme: 'BCA (H) (Sp AI & DS) (Research)', semester: 1, code: 'VAC-I', name: 'Environmental Studies & Disaster Management', L: 2, T: 0, S: 0, P: 0, C: 2, totalHours: 2, courseType: 'VAC', type: 'Theory' }
  ]

  console.log('Total courses to add:', courseData.length)

  let addedCount = 0
  let skippedCount = 0

  // Add courses to database
  for (const course of courseData) {
    try {
      const programmeId = programmeMap[course.programme]
      
      if (!programmeId) {
        console.log(`⚠️ Programme not found: ${course.programme}`)
        skippedCount++
        continue
      }

      // Check if course already exists
      const existingCourse = await prisma.course.findFirst({
        where: {
          code: course.code,
          programmeId: programmeId,
          session: '2024-2025'
        }
      })

      if (existingCourse) {
        console.log(`⚠️ Course already exists: ${course.code}`)
        skippedCount++
        continue
      }

      await prisma.course.create({
        data: {
          session: '2024-2025',
          programmeId: programmeId,
          semester: course.semester,
          code: course.code,
          name: course.name,
          L: course.L,
          T: course.T,
          S: course.S,
          P: course.P,
          C: course.C,
          totalHours: course.totalHours,
          courseType: getCourseType(course.courseType),
          type: course.type,
          isAttendanceMandatory: true,
          isMandatory: true
        }
      })

      addedCount++
      console.log(`✅ Added: ${course.code} - ${course.name}`)
    } catch (error) {
      console.error(`❌ Error adding ${course.code}:`, error.message)
      skippedCount++
    }
  }

  console.log('\n📊 Course Import Summary:')
  console.log(`   ✅ Added: ${addedCount} courses`)
  console.log(`   ⚠️ Skipped: ${skippedCount} courses`)
  console.log(`   📚 Total: ${courseData.length} courses processed`)
  console.log('\n🎉 Course data import completed!')
}

main()
  .catch((e) => {
    console.error('❌ Import failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
