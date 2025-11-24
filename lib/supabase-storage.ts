import { createClient } from '@/lib/supabase/client'

export async function uploadToSupabase(file: File, folder: string = 'content') {
  const supabase = createClient()
  
  // Generate unique filename
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)
  const fileExt = file.name.split('.').pop()
  const fileName = `${folder}/${timestamp}_${randomString}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('teaching-content')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    console.error('Upload error:', error)
    throw new Error(error.message)
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('teaching-content')
    .getPublicUrl(data.path)

  return {
    path: data.path,
    publicUrl,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type
  }
}

export async function deleteFromSupabase(filePath: string) {
  const supabase = createClient()
  const { error } = await supabase.storage
    .from('teaching-content')
    .remove([filePath])
  
  if (error) throw new Error(error.message)
  return true
}
