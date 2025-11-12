'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Upload } from 'lucide-react'
import toast from 'react-hot-toast'

interface FileUploadProps {
  courseId: string
  facultyId: string
  contentType: string
  onUploadSuccess: (filePath: string) => void
}

export default function FileUpload({ 
  courseId, 
  facultyId, 
  contentType,
  onUploadSuccess 
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${courseId}/${contentType}/${Date.now()}.${fileExt}`

    try {
      const { data, error } = await supabase.storage
        .from('teaching-content')
        .upload(fileName, file)

      if (error) throw error

      toast.success('File uploaded successfully')
      onUploadSuccess(data.path)
    } catch (error) {
      toast.error('Error uploading file')
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500">
        <Upload className="h-5 w-5 mr-2" />
        <span>{uploading ? 'Uploading...' : 'Choose File'}</span>
        <input
          type="file"
          onChange={handleFileUpload}
          className="hidden"
          disabled={uploading}
          accept=".pdf,.ppt,.pptx,.doc,.docx"
        />
      </label>
    </div>
  )
}
