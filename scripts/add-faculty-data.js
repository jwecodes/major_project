const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🎓 Starting faculty data import...')

  // Extract unique faculty from your data
  const facultyData = [
    // Regular Faculty
    { facultyId: '2043', name: 'Manju', department: 'Computer Science', designation: 'Assistant Professor', specialization: 'Mathematics' },
    { facultyId: '2017', name: 'Jyoti Yadav', department: 'Computer Science', designation: 'Assistant Professor', specialization: 'Programming' },
    { facultyId: '1628', name: 'Ritika Khatri', department: 'Physics', designation: 'Assistant Professor', specialization: 'Engineering Physics' },
    { facultyId: '1094', name: 'Pawan', department: 'Physics', designation: 'Lab Assistant', specialization: 'Physics Lab' },
    { facultyId: '1911', name: 'Mohabbat Ali', department: 'Mathematics', designation: 'Associate Professor', specialization: 'Mathematics' },
    { facultyId: '1692', name: 'Ferooj', department: 'Computer Science', designation: 'Assistant Professor', specialization: 'Programming', employmentType: 'New Faculty' },
    { facultyId: '2009', name: 'New Faculty', department: 'Environmental Studies', designation: 'Assistant Professor', specialization: 'Environmental Studies' },
    { facultyId: '1954', name: 'Faculty', department: 'Mathematics', designation: 'Assistant Professor', specialization: 'Mathematics' },
    { facultyId: '1724', name: 'Physics Faculty', department: 'Physics', designation: 'Assistant Professor', specialization: 'Physics' },
    { facultyId: '1509', name: 'CSE Faculty', department: 'Computer Science', designation: 'Assistant Professor', specialization: 'Computer Science' },
    { facultyId: '1905', name: 'Chemistry Faculty', department: 'Chemistry', designation: 'Assistant Professor', specialization: 'Chemistry' },
    { facultyId: '1949', name: 'Lab Faculty', department: 'Computer Science', designation: 'Lab Assistant', specialization: 'Maker Lab' },
    { facultyId: '1916', name: 'Faculty Member', department: 'Computer Science', designation: 'Assistant Professor', specialization: 'Programming' },
    { facultyId: '1908', name: 'CSE Professor', department: 'Computer Science', designation: 'Associate Professor', specialization: 'Data Structures' },
    { facultyId: '1506', name: 'Senior Faculty', department: 'Computer Science', designation: 'Professor', specialization: 'Computer Architecture' },
    { facultyId: '1530', name: 'OS Expert', department: 'Computer Science', designation: 'Associate Professor', specialization: 'Operating Systems' },
    { facultyId: '1779', name: 'Theory Faculty', department: 'Computer Science', designation: 'Professor', specialization: 'Theory of Computation' },
    { facultyId: '1524', name: 'ML Expert', department: 'Computer Science', designation: 'Associate Professor', specialization: 'Machine Learning' },
    { facultyId: '1491', name: 'NLP Faculty', department: 'Computer Science', designation: 'Assistant Professor', specialization: 'Natural Language Processing' },
    { facultyId: '1893', name: 'Cloud Expert', department: 'Computer Science', designation: 'Assistant Professor', specialization: 'Cloud Computing' },
    { facultyId: '1672', name: 'Suman', department: 'Computer Science', designation: 'Assistant Professor', specialization: 'Programming' },
    { facultyId: '1995', name: 'Lucky Verma', department: 'Computer Science', designation: 'Associate Professor', specialization: 'Computer Architecture' },
    { facultyId: '1762', name: 'DSA Expert', department: 'Computer Science', designation: 'Professor', specialization: 'Data Structures' },
    { facultyId: '1899', name: 'SE Faculty', department: 'Computer Science', designation: 'Associate Professor', specialization: 'Software Engineering' },
    
    // Trainers and Industry Partners
    { facultyId: 'TR001', name: 'Rajesh (Trainer)', department: 'Computer Science', designation: 'Trainer', specialization: 'Web Development', employmentType: 'Trainer' },
    { facultyId: 'TR002', name: 'Rishab', department: 'Computer Science', designation: 'Trainer', specialization: 'Design Thinking', employmentType: 'Trainer' },
    { facultyId: 'TR003', name: 'Megha', department: 'Computer Science', designation: 'Assistant Professor', specialization: 'Data Analytics', employmentType: 'New Faculty' },
    { facultyId: 'TR004', name: 'Swati Jain', department: 'Computer Science', designation: 'Assistant Professor', specialization: 'Career Development', employmentType: 'New Faculty' },
    { facultyId: 'TR005', name: 'Arun Yadav', department: 'Mathematics', designation: 'Associate Professor', specialization: 'Mathematics' },
    { facultyId: 'TR006', name: 'Ravinder Beniwal', department: 'Computer Science', designation: 'Associate Professor', specialization: 'Computer Fundamentals' },
    { facultyId: 'TR007', name: 'Prateek (Trainer)', department: 'Computer Science', designation: 'Trainer', specialization: 'Web Development', employmentType: 'Trainer' },
    { facultyId: 'TR008', name: 'Rashmi Malik (Trainer)', department: 'Computer Science', designation: 'Trainer', specialization: 'Design Thinking', employmentType: 'Trainer' },
    { facultyId: 'TR009', name: 'Rajesh Yadav', department: 'Computer Science', designation: 'Assistant Professor', specialization: 'Computer Science', employmentType: 'New Faculty' },
    { facultyId: 'TR010', name: 'Sameer', department: 'Computer Science', designation: 'Assistant Professor', specialization: 'Programming' },
    { facultyId: 'TR011', name: 'Shadab (Trainer)', department: 'Computer Science', designation: 'Trainer', specialization: 'Web Development', employmentType: 'Trainer' },
    { facultyId: 'TR012', name: 'Bhavesh', department: 'Computer Science', designation: 'Assistant Professor', specialization: 'Competitive Programming' },
    { facultyId: 'TR013', name: 'Ashutosh', department: 'Computer Science', designation: 'Associate Professor', specialization: 'Programming' },
    { facultyId: 'TR014', name: 'Nandan', department: 'Computer Science', designation: 'Assistant Professor', specialization: 'Competitive Programming' },
    { facultyId: 'TR015', name: 'Himanshu (Trainer)', department: 'Computer Science', designation: 'Trainer', specialization: 'Programming', employmentType: 'Trainer' },
    { facultyId: 'TR016', name: 'Vandna Batra', department: 'Computer Science', designation: 'Professor', specialization: 'Theory of Computation' },
    { facultyId: 'TR017', name: 'Abhishek', department: 'Computer Science', designation: 'Assistant Professor', specialization: 'Competitive Programming' },
    { facultyId: 'TR018', name: 'Rohit', department: 'Life Skills', designation: 'Assistant Professor', specialization: 'Life Skills' },
    { facultyId: 'TR019', name: 'Namit', department: 'Computer Science', designation: 'Trainer', specialization: 'Design Thinking', employmentType: 'Trainer' },
    { facultyId: 'TR020', name: 'Gaurav (ME)', department: 'Mechanical Engineering', designation: 'Assistant Professor', specialization: 'Mechanical Engineering' },
    
    // Industry Partners
    { facultyId: 'IND001', name: 'Priyanka (Samatrix)', department: 'Computer Science', designation: 'Industry Expert', specialization: 'AI & ML', employmentType: 'Industry Partner' },
    { facultyId: 'IND002', name: 'Aditya (Samatrix)', department: 'Computer Science', designation: 'Industry Expert', specialization: 'AI & ML', employmentType: 'Industry Partner' },
    { facultyId: 'IND003', name: 'Mitali (IBM)', department: 'Computer Science', designation: 'Industry Expert', specialization: 'Big Data', employmentType: 'Industry Partner' },
    { facultyId: 'IND004', name: 'Kunal (Samatrix)', department: 'Computer Science', designation: 'Industry Expert', specialization: 'Data Science', employmentType: 'Industry Partner' },
    { facultyId: 'IND005', name: 'Ishu (Samatrix)', department: 'Computer Science', designation: 'Industry Expert', specialization: 'Data Science', employmentType: 'Industry Partner' },
    { facultyId: 'IND006', name: 'Anoja (Samatrix)', department: 'Computer Science', designation: 'Industry Expert', specialization: 'AI & ML', employmentType: 'Industry Partner' },
    { facultyId: 'IND007', name: 'Nikhik Sharma (IBM)', department: 'Computer Science', designation: 'Industry Expert', specialization: 'Machine Learning', employmentType: 'Industry Partner' },
    
    // New Faculty and Specialized Staff
    { facultyId: 'NF001', name: 'Neha Kaushik', department: 'Computer Science', designation: 'Assistant Professor', specialization: 'Programming', employmentType: 'New Faculty' },
    { facultyId: 'NF002', name: 'Iflah', department: 'Computer Science', designation: 'Assistant Professor', specialization: 'Data Science', employmentType: 'New Faculty' },
    { facultyId: 'NF003', name: 'Rishika Mehta', department: 'Computer Science', designation: 'Assistant Professor', specialization: 'Data Visualization', employmentType: 'New Faculty' },
    { facultyId: 'NF004', name: 'Deepak Kumar', department: 'Computer Science', designation: 'Assistant Professor', specialization: 'Data Science', employmentType: 'New Faculty' },
    { facultyId: 'NF005', name: 'Suman Kumar Das', department: 'Computer Science', designation: 'Assistant Professor', specialization: 'Programming', employmentType: 'New Faculty' },
    { facultyId: 'NF006', name: 'SP Acharya', department: 'Computer Science', designation: 'Assistant Professor', specialization: 'Web Development', employmentType: 'New Faculty' },
    { facultyId: 'NF007', name: 'Surabhi Shankar', department: 'Computer Science', designation: 'Assistant Professor', specialization: 'Computer Science', employmentType: 'New Faculty' },
    { facultyId: 'NF008', name: 'Pankaj Agarwal', department: 'Computer Science', designation: 'Associate Professor', specialization: 'Data Structures' },
    { facultyId: 'NF009', name: 'Amar Saraswat', department: 'Computer Science', designation: 'Assistant Professor', specialization: 'Cyber Security', employmentType: 'New Faculty' },
    { facultyId: 'NF010', name: 'Devender', department: 'Computer Science', designation: 'Assistant Professor', specialization: 'Web Development' },
    { facultyId: 'NF011', name: 'Shajad', department: 'Computer Science', designation: 'Assistant Professor', specialization: 'Computer Science' },
    { facultyId: 'NF012', name: 'Radhika', department: 'Computer Science', designation: 'Assistant Professor', specialization: 'Data Visualization' },
    { facultyId: 'NF013', name: 'Rupesh Kumar', department: 'Computer Science', designation: 'Assistant Professor', specialization: 'Decision Making' },
    { facultyId: 'NF014', name: 'Aijaz', department: 'Computer Science', designation: 'Assistant Professor', specialization: 'Data Analysis' },
    
    // CDC and Support Staff
    { facultyId: 'CDC001', name: 'CDC Faculty', department: 'Languages', designation: 'Assistant Professor', specialization: 'Communication Skills', employmentType: 'CDC' },
    { facultyId: 'CHEM001', name: 'NF Chemistry', department: 'Chemistry', designation: 'Assistant Professor', specialization: 'Chemistry', employmentType: 'New Faculty' },
    { facultyId: 'CHEM002', name: 'Priya (IRF)', department: 'Chemistry', designation: 'Assistant Professor', specialization: 'Chemistry', employmentType: 'IRF Faculty' },
    
    // Senior Faculty and Professors
    { facultyId: '10167', name: 'Database Expert', department: 'Computer Science', designation: 'Professor', specialization: 'Database Systems' },
    { facultyId: '1919', name: 'SE Professor', department: 'Computer Science', designation: 'Professor', specialization: 'Software Engineering' },
    { facultyId: '1923', name: 'Network Expert', department: 'Computer Science', designation: 'Associate Professor', specialization: 'Computer Networks' },
    { facultyId: '2007', name: 'Madhu Yadav', department: 'Computer Science', designation: 'Assistant Professor', specialization: 'Programming' },
    { facultyId: '2014', name: 'Ritu Devi', department: 'Computer Science', designation: 'Assistant Professor', specialization: 'Cyber Security' },
    { facultyId: '2015', name: 'Azure Expert', department: 'Computer Science', designation: 'Associate Professor', specialization: 'Cloud Computing' },
    { facultyId: '1490', name: 'Ethical Hacking Expert', department: 'Computer Science', designation: 'Associate Professor', specialization: 'Ethical Hacking' },
    { facultyId: '1677', name: 'Theory Expert', department: 'Computer Science', designation: 'Professor', specialization: 'Theory of Computation' },
    { facultyId: '1958', name: 'Architecture Expert', department: 'Computer Science', designation: 'Professor', specialization: 'Computer Architecture' },
    { facultyId: 'AR001', name: 'Aryan Sharma', department: 'Computer Science', designation: 'Assistant Professor', specialization: 'Natural Language Processing', employmentType: 'New Faculty' },
    { facultyId: 'RD001', name: 'Rakhi Dua', department: 'Computer Science', designation: 'Associate Professor', specialization: 'Computer Organization' }
  ]

  console.log('Total faculty to add:', facultyData.length)

  let addedCount = 0
  let skippedCount = 0

  // Add faculty to database
  for (const faculty of facultyData) {
    try {
      // Check if faculty already exists
      const existingFaculty = await prisma.faculty.findFirst({
        where: {
          facultyId: faculty.facultyId
        }
      })

      if (existingFaculty) {
        console.log(`⚠️ Faculty already exists: ${faculty.name} (${faculty.facultyId})`)
        skippedCount++
        continue
      }

      // Generate email if not provided
      const email = faculty.name.toLowerCase().replace(/\s+/g, '.').replace(/[()]/g, '') + '@college.edu'

      await prisma.faculty.create({
        data: {
          facultyId: faculty.facultyId,
          name: faculty.name,
          email: email,
          department: faculty.department,
          designation: faculty.designation || 'Assistant Professor',
          specialization: faculty.specialization,
          employmentType: faculty.employmentType || 'Regular',
          isActive: true,
          experience: Math.floor(Math.random() * 15) + 1, // Random experience 1-15 years
          qualification: faculty.designation?.includes('Professor') ? 'Ph.D.' : 'M.Tech'
        }
      })

      addedCount++
      console.log(`✅ Added: ${faculty.name} (${faculty.facultyId})`)
    } catch (error) {
      console.error(`❌ Error adding ${faculty.name}:`, error.message)
      skippedCount++
    }
  }

  console.log('\n👨‍🏫 Faculty Import Summary:')
  console.log(`   ✅ Added: ${addedCount} faculty members`)
  console.log(`   ⚠️ Skipped: ${skippedCount} faculty members`)
  console.log(`   📋 Total: ${facultyData.length} faculty processed`)
  console.log('\n🎉 Faculty data import completed!')
}

main()
  .catch((e) => {
    console.error('❌ Import failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
