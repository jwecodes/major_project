
import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const prisma = new PrismaClient()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function syncAllUsers() {
  try {
    console.log('🔄 Starting sync of ALL users to Supabase Auth...\n')

    let totalCreated = 0
    let totalExisting = 0
    let totalFailed = 0

    // ========== SYNC ADMINS ==========
    console.log('👑 Syncing Admin users...')
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || []
    
    for (const email of adminEmails) {
      try {
        const { error } = await supabaseAdmin.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: { role: 'ADMIN' }
        })

        if (error) {
          if (error.message.includes('already exists')) {
            console.log(`⏭️  ${email} - Already exists`)
            totalExisting++
          } else {
            console.error(`❌ ${email} - Error: ${error.message}`)
            totalFailed++
          }
        } else {
          console.log(`✅ ${email} - Created`)
          totalCreated++
        }
      } catch (err: any) {
        console.error(`❌ ${email} - Exception: ${err.message}`)
        totalFailed++
      }
    }

    // ========== SYNC FACULTY ==========
    console.log('\n👨‍🏫 Syncing Faculty users...')
    const allFaculty = await prisma.faculty.findMany({
      select: { email: true, name: true, facultyId: true }
    })
    
    console.log(`Found ${allFaculty.length} faculty members`)
    
    for (const faculty of allFaculty) {
      try {
        const { error } = await supabaseAdmin.auth.admin.createUser({
          email: faculty.email,
          email_confirm: true,
          user_metadata: {
            name: faculty.name,
            role: 'FACULTY',
            facultyId: faculty.facultyId
          }
        })

        if (error) {
          if (error.message.includes('already exists')) {
            totalExisting++
          } else {
            console.error(`❌ ${faculty.email} - ${error.message}`)
            totalFailed++
          }
        } else {
          console.log(`✅ ${faculty.email} - Created`)
          totalCreated++
        }
      } catch (err: any) {
        console.error(`❌ ${faculty.email} - ${err.message}`)
        totalFailed++
      }
    }

    // ========== SYNC STUDENTS ==========
    console.log('\n🎓 Syncing Student users...')
    const allStudents = await prisma.student.findMany({
      select: { email: true, name: true, studentId: true }
    })
    
    console.log(`Found ${allStudents.length} students`)
    
    for (const student of allStudents) {
      try {
        const { error } = await supabaseAdmin.auth.admin.createUser({
          email: student.email,
          email_confirm: true,
          user_metadata: {
            name: student.name,
            role: 'STUDENT',
            studentId: student.studentId
          }
        })

        if (error) {
          if (error.message.includes('already exists')) {
            totalExisting++
          } else {
            console.error(`❌ ${student.email} - ${error.message}`)
            totalFailed++
          }
        } else {
          console.log(`✅ ${student.email} - Created`)
          totalCreated++
        }
      } catch (err: any) {
        console.error(`❌ ${student.email} - ${err.message}`)
        totalFailed++
      }
    }

    // ========== FINAL SUMMARY ==========
    console.log('\n' + '='.repeat(50))
    console.log('📈 FINAL SUMMARY')
    console.log('='.repeat(50))
    console.log(`✅ Created: ${totalCreated}`)
    console.log(`⏭️  Already existed: ${totalExisting}`)
    console.log(`❌ Failed: ${totalFailed}`)
    console.log(`📊 Total processed: ${adminEmails.length + allFaculty.length + allStudents.length}`)
    console.log('='.repeat(50))
    console.log('\n✅ All users synced to Supabase Auth!')
  } catch (error) {
    console.error('💥 Fatal error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

syncAllUsers()
