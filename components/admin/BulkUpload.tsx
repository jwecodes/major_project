// 'use client'
// import { useState } from 'react'
// import { X, Upload, Download, AlertCircle } from 'lucide-react'
// import toast from 'react-hot-toast'

// interface BulkUploadProps {
//   onClose: () => void
//   onSuccess: () => void
// }

// export default function BulkUpload({ onClose, onSuccess }: BulkUploadProps) {
//   const [file, setFile] = useState<File | null>(null)
//   const [uploading, setUploading] = useState(false)

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files?.[0]) {
//       const selectedFile = e.target.files[0]
//       if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
//         toast.error('Please select a CSV file')
//         return
//       }
//       setFile(selectedFile)
//     }
//   }

//   const handleUpload = async () => {
//     if (!file) {
//       toast.error('Please select a file')
//       return
//     }

//     setUploading(true)
//     try {
//       const formData = new FormData()
//       formData.append('file', file)

//       const res = await fetch('/api/admin/faculty/bulk-upload', {
//         method: 'POST',
//         body: formData
//       })

//       const data = await res.json()

//       if (data.success) {
//         toast.success(`Successfully uploaded ${data.count} faculty members!`)
//         onSuccess()
//       } else {
//         toast.error(data.error || 'Error uploading file')
//       }
//     } catch (error) {
//       toast.error('Error uploading file')
//     } finally {
//       setUploading(false)
//     }
//   }

//   const downloadTemplate = () => {
//     const csvContent = 'facultyId,name,designation,email,contactNo,department\nFAC001,John Doe,Professor,john@example.com,1234567890,Computer Science\nFAC002,Jane Smith,Assistant Professor,jane@example.com,0987654321,Mathematics'
//     const blob = new Blob([csvContent], { type: 'text/csv' })
//     const url = window.URL.createObjectURL(blob)
//     const a = document.createElement('a')
//     a.href = url
//     a.download = 'faculty-template.csv'
//     a.click()
//     window.URL.revokeObjectURL(url)
//   }

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl">
//         <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-lg">
//           <div className="flex justify-between items-center">
//             <h2 className="text-2xl font-bold">Bulk Upload Faculty</h2>
//             <button
//               onClick={onClose}
//               className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
//             >
//               <X className="h-6 w-6" />
//             </button>
//           </div>
//         </div>

//         <div className="p-6 space-y-6">
//           {/* Instructions */}
//           <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//             <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
//               <AlertCircle className="h-5 w-5" />
//               Instructions
//             </h3>
//             <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
//               <li>Download the CSV template below</li>
//               <li>Fill in faculty details in the template</li>
//               <li>Upload the completed CSV file</li>
//               <li>All faculty members will be added to the system</li>
//             </ol>
//           </div>

//           {/* Download Template */}
//           <div>
//             <button
//               onClick={downloadTemplate}
//               className="w-full bg-blue-100 text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-200 transition-colors font-medium flex items-center justify-center gap-2"
//             >
//               <Download className="h-5 w-5" />
//               Download CSV Template
//             </button>
//           </div>

//           {/* File Upload */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Upload CSV File
//             </label>
//             <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 hover:bg-green-50 transition-colors">
//               <input
//                 type="file"
//                 accept=".csv"
//                 onChange={handleFileChange}
//                 className="hidden"
//                 id="bulk-upload-file"
//               />
//               <label htmlFor="bulk-upload-file" className="cursor-pointer block">
//                 <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
//                 <p className="text-sm text-gray-600 font-medium">
//                   <span className="text-green-600">Click to upload</span> or drag and drop
//                 </p>
//                 <p className="text-xs text-gray-500 mt-2">CSV files only</p>
//                 {file && (
//                   <div className="mt-4 p-3 bg-green-50 border border-green-300 rounded-lg">
//                     <p className="text-sm text-green-700 font-medium">✓ {file.name}</p>
//                   </div>
//                 )}
//               </label>
//             </div>
//           </div>

//           {/* CSV Format Example */}
//           <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
//             <h4 className="font-semibold text-gray-900 text-sm mb-2">CSV Format:</h4>
//             <pre className="text-xs text-gray-600 overflow-x-auto">
//               facultyId,name,designation,email,contactNo,department{'\n'}
//               FAC001,John Doe,Professor,john@example.com,1234567890,CS
//             </pre>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex gap-3 pt-4">
//             <button
//               onClick={handleUpload}
//               disabled={!file || uploading}
//               className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
//             >
//               {uploading ? 'Uploading...' : 'Upload Faculty'}
//             </button>
//             <button
//               onClick={onClose}
//               className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 font-semibold transition-colors"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

'use client'
import { useState } from 'react'
import { X, Upload, Download, AlertCircle, CheckCircle } from 'lucide-react'
import * as XLSX from 'xlsx'
import toast from 'react-hot-toast'

interface BulkUploadProps {
  type: 'faculty' | 'courses' | 'programmes'
  onUpload: (data: any[]) => Promise<{ success: boolean; error?: string; message?: string }>
  onClose: () => void
}

export default function BulkUpload({ type, onUpload, onClose }: BulkUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<any[]>([])

  const getTypeLabel = () => {
    switch (type) {
      case 'faculty': return 'Faculty'
      case 'courses': return 'Courses'
      case 'programmes': return 'Programmes'
      default: return 'Data'
    }
  }

  const downloadTemplate = () => {
    let template: any[] = []
    let filename = ''

    if (type === 'faculty') {
      template = [
        {
          'Faculty ID': 'FAC001',
          'Name': 'John Doe',
          'Email': 'john.doe@example.com',
          'Designation': 'Assistant Professor',
          'Contact Number': '9876543210',
          'Department': 'Computer Science',
          'Programme Code': 'BTECH-CSE',
          'Section': 'A',
          'Semester': 3,
          'Course Code': 'CS101',
          'Role': 'COORDINATOR'
        },
        {
          'Faculty ID': 'FAC001',
          'Name': 'John Doe',
          'Email': 'john.doe@example.com',
          'Designation': 'Assistant Professor',
          'Contact Number': '9876543210',
          'Department': 'Computer Science',
          'Programme Code': 'BTECH-CSE',
          'Section': 'A',
          'Semester': 3,
          'Course Code': 'CS201',
          'Role': 'CONTRIBUTOR'
        },
        {
          'Faculty ID': 'FAC002',
          'Name': 'Jane Smith',
          'Email': 'jane.smith@example.com',
          'Designation': 'Professor',
          'Contact Number': '9876543211',
          'Department': 'Mathematics',
          'Programme Code': 'BTECH-CSE',
          'Section': 'B',
          'Semester': 5,
          'Course Code': 'MATH101',
          'Role': 'COORDINATOR'
        },
        {
          'Faculty ID': 'FAC003',
          'Name': 'Robert Brown',
          'Email': 'robert.brown@example.com',
          'Designation': 'Associate Professor',
          'Contact Number': '9876543212',
          'Department': 'Physics',
          'Programme Code': '',
          'Section': '',
          'Semester': '',
          'Course Code': '',
          'Role': ''
        }
      ]
      filename = 'faculty_template.xlsx'
    } else if (type === 'courses') {
      template = [
        {
          'Session': '2024-2025',
          'Programme Code': 'BTECH-CSE',
          'Course Code': 'CS101',
          'Course Name': 'Data Structures',
          'Semester': 3,
          'Credits': 3,
          'L': 3,
          'T': 0,
          'P': 0,
          'S': 0,
          'Total Hours': 3,
          'Course Type': 'CORE',
          'Delivery Mode': 'THEORY',
          'Category': 'MANDATORY',
          'Room No': 'A-101',
          'Attendance': 'Yes'
        }
      ]
      filename = 'courses_template.xlsx'
    } else if (type === 'programmes') {
      template = [
        {
          'Session': '2024-2025',
          'Programme Code': 'BTECH-CSE',
          'Programme Name': 'B.Tech Computer Science',
          'Duration': 4,
          'Current Semester': 1,
          'Section': 'A',
          'No Of Students': 60
        }
      ]
      filename = 'programmes_template.xlsx'
    }

    const ws = XLSX.utils.json_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, getTypeLabel())
    XLSX.writeFile(wb, filename)
    
    toast.success('Template downloaded!')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      parseExcel(selectedFile)
    }
  }

  const parseExcel = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        setPreview(jsonData.slice(0, 5))
      } catch (error) {
        toast.error('Error parsing Excel file')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file')
      return
    }

    setUploading(true)
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet)

          const result = await onUpload(jsonData)
          
          if (result.success) {
            toast.success(result.message || `${getTypeLabel()} uploaded successfully!`)
            onClose()
          } else {
            toast.error(result.error || 'Upload failed')
          }
        } catch (error) {
          toast.error('Error processing file')
        } finally {
          setUploading(false)
        }
      }
      reader.readAsArrayBuffer(file)
    } catch (error) {
      toast.error('Error uploading file')
      setUploading(false)
    }
  }

  const getInstructions = () => {
    switch (type) {
      case 'faculty':
        return (
          <ul className="text-sm text-blue-800 space-y-1 mt-2">
            <li>• Faculty ID must be unique</li>
            <li>• Email must be valid and unique</li>
            <li>• Designation is required</li>
            <li>• Contact Number and Department are optional</li>
            <li>• <strong>For course assignments:</strong> Repeat faculty info in multiple rows with different courses</li>
            <li>• Course assignment requires: Programme Code, Section (optional), Semester, Course Code, Role</li>
            <li>• Valid Roles: COORDINATOR, CONTRIBUTOR</li>
            <li>• Leave course fields empty if no courses to assign</li>
          </ul>
        )
      case 'courses':
        return (
          <ul className="text-sm text-blue-800 space-y-1 mt-2">
            <li>• Session format: YYYY-YYYY (e.g., 2024-2025)</li>
            <li>• Programme Code must exist in system</li>
            <li>• Course Code must be unique per programme</li>
            <li>• Valid Course Types: CORE, SEC, INDUSTRY, SKILL, VAC, OPEN_ELECTIVE, AEC, DSE, INTERNSHIP, PROJECT, MOOC, CS, OTHER</li>
            <li>• Valid Delivery Modes: THEORY, PRACTICAL, BOTH</li>
            <li>• Valid Categories: MANDATORY, ELECTIVE</li>
            <li>• Attendance: Yes or No</li>
          </ul>
        )
      case 'programmes':
        return (
          <ul className="text-sm text-blue-800 space-y-1 mt-2">
            <li>• Session format: YYYY-YYYY (e.g., 2024-2025)</li>
            <li>• Programme Code must be unique per session and section</li>
            <li>• Duration in years (typically 3-4 years)</li>
            <li>• Current Semester: 1 to (Duration × 2)</li>
            <li>• Section is optional (A, B, C, etc.)</li>
            <li>• No Of Students must be a number</li>
          </ul>
        )
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-lg flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-2xl font-bold">
            Bulk Upload {getTypeLabel()}
          </h2>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Download Template */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">Step 1: Download Template</h3>
                <p className="text-sm text-blue-800 mb-3">
                  Download the Excel template, fill in your {getTypeLabel().toLowerCase()} data, and upload it back.
                </p>
                {getInstructions()}
                <button
                  onClick={downloadTemplate}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download {getTypeLabel()} Template
                </button>
              </div>
            </div>
          </div>

          {/* Upload File */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Step 2: Upload Filled Template</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="bulk-upload-file"
              />
              <label htmlFor="bulk-upload-file" className="cursor-pointer block">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 font-medium">
                  <span className="text-blue-600 hover:text-blue-700">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-2">Excel files (.xlsx, .xls) only</p>
                {file && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-300 rounded-lg inline-block">
                    <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      {file.name}
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Preview (First 5 rows)</h3>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(preview[0]).map((key) => (
                        <th key={key} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        {Object.values(row).map((value: any, i) => (
                          <td key={i} className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Showing first 5 rows. Upload to process all rows.
              </p>
            </div>
          )}

          {/* Important Notes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">Important Notes</h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Make sure all required fields are filled</li>
                  <li>• Follow the exact column names from the template</li>
                  <li>• Remove the example rows before uploading</li>
                  <li>• Duplicate entries will be skipped</li>
                  <li>• Processing may take a few seconds for large files</li>
                  {type === 'faculty' && (
                    <li>• <strong>For faculty:</strong> Each row represents one course assignment. Repeat faculty info for multiple courses.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Upload Button */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Uploading {getTypeLabel()}...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  Upload {getTypeLabel()}
                </>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={uploading}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold transition-colors disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
