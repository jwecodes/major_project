import { NextResponse } from 'next/server'
import { supabase, checkBucket } from '@/lib/supabase'

export async function GET() {
  try {
    // Check if environment variables are set
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log('Supabase URL set:', hasUrl)
    console.log('Supabase Key set:', hasKey)

    // List all buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to list buckets',
        details: bucketsError.message,
        hasUrl,
        hasKey
      })
    }

    // Check if teaching-content bucket exists
    const bucketExists = buckets?.some(b => b.name === 'teaching-content')

    return NextResponse.json({
      success: true,
      hasUrl,
      hasKey,
      bucketsCount: buckets?.length || 0,
      bucketNames: buckets?.map(b => b.name) || [],
      teachingContentExists: bucketExists
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Exception occurred',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
