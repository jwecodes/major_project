// import { createClient } from '@supabase/supabase-js'

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// export const supabase = createClient(supabaseUrl, supabaseKey)

// export const getPublicUrl = (filePath: string) => {
//   const { data } = supabase.storage
//     .from('teaching-content')
//     .getPublicUrl(filePath)
  
//   return data.publicUrl
// }

// import { createClient } from '@supabase/supabase-js'

// // Validate environment variables
// if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
//   throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
// }

// if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
//   throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
// }

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// // Create Supabase client
// export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
//   auth: {
//     persistSession: false
//   }
// })

// // Helper function to get public URL
// export const getPublicUrl = (filePath: string): string => {
//   const { data } = supabase.storage
//     .from('teaching-content')
//     .getPublicUrl(filePath)
  
//   return data.publicUrl
// }

// // Helper function to check if bucket exists
// export const checkBucket = async () => {
//   try {
//     const { data, error } = await supabase.storage.listBuckets()
//     if (error) {
//       console.error('Error listing buckets:', error)
//       return false
//     }
//     const bucketExists = data.some(bucket => bucket.name === 'teaching-content')
//     console.log('Bucket exists:', bucketExists)
//     return bucketExists
//   } catch (error) {
//     console.error('Error checking bucket:', error)
//     return false
//   }
// }

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export const getPublicUrl = (filePath: string) => {
  const { data } = supabase.storage
    .from('teaching-content')
    .getPublicUrl(filePath)
  
  return data.publicUrl
}
