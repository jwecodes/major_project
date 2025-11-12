'use client'
import { useState } from 'react'
import { X, Upload, Download, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface BulkUploadProps {
  onClose: () => void
  onSuccess: () => void
}

export default function BulkUpload({ onClose, onSuccess }: BulkUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast.error('Please select a CSV file')
        return
      }
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/faculty/bulk-upload', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (data.success) {
        toast.success(`Successfully uploaded ${data.count} faculty members!`)
        onSuccess()
      } else {
        toast.error(data.error || 'Error uploading file')
      }
    } catch (error) {
      toast.error('Error uploading file')
    } finally {
      setUploading(false)
    }
  }

  const downloadTemplate = () => {
    const csvContent = 'facultyId,name,designation,email,contactNo,department\nFAC001,John Doe,Professor,john@example.com,1234567890,Computer Science\nFAC002,Jane Smith,Assistant Professor,jane@example.com,0987654321,Mathematics'
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'faculty-template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Bulk Upload Faculty</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Instructions
            </h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Download the CSV template below</li>
              <li>Fill in faculty details in the template</li>
              <li>Upload the completed CSV file</li>
              <li>All faculty members will be added to the system</li>
            </ol>
          </div>

          {/* Download Template */}
          <div>
            <button
              onClick={downloadTemplate}
              className="w-full bg-blue-100 text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-200 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Download className="h-5 w-5" />
              Download CSV Template
            </button>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Upload CSV File
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 hover:bg-green-50 transition-colors">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="bulk-upload-file"
              />
              <label htmlFor="bulk-upload-file" className="cursor-pointer block">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 font-medium">
                  <span className="text-green-600">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-2">CSV files only</p>
                {file && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-300 rounded-lg">
                    <p className="text-sm text-green-700 font-medium">✓ {file.name}</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* CSV Format Example */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 text-sm mb-2">CSV Format:</h4>
            <pre className="text-xs text-gray-600 overflow-x-auto">
              facultyId,name,designation,email,contactNo,department{'\n'}
              FAC001,John Doe,Professor,john@example.com,1234567890,CS
            </pre>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
            >
              {uploading ? 'Uploading...' : 'Upload Faculty'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
