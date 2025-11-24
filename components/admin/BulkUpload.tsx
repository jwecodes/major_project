// 'use client'

// import { useState } from 'react'
// import { X, Upload, Download, AlertCircle, CheckCircle } from 'lucide-react'
// import * as XLSX from 'xlsx'
// import toast from 'react-hot-toast'

// interface BulkUploadProps {
//   type: 'faculty' | 'courses' | 'programmes'
//   onUpload: (data: any[]) => Promise<{ 
//     success: boolean
//     error?: string
//     message?: string
//     stats?: {
//       total: number
//       created?: number
//       updated?: number
//       allocated?: number
//       success?: number
//       skipped?: number
//       errors: number
//     }
//     errors?: string[]
//   }>
//   onClose: () => void
// }

// export default function BulkUpload({ type, onUpload, onClose }: BulkUploadProps) {
//   const [file, setFile] = useState<File | null>(null)
//   const [uploading, setUploading] = useState(false)
//   const [preview, setPreview] = useState<any[]>([])
//   const [result, setResult] = useState<any>(null)

//   const getTypeLabel = () => {
//     switch (type) {
//       case 'faculty': return 'Faculty'
//       case 'courses': return 'Courses'
//       case 'programmes': return 'Programmes'
//       default: return 'Data'
//     }
//   }

//   const downloadTemplate = () => {
//     const templates: Record<string, string> = {
//       faculty: '/templates/faculty-template.csv',
//       courses: '/templates/courses-template.csv',
//       programmes: '/templates/programmes-template.csv'
//     }
    
//     const link = document.createElement('a')
//     link.href = templates[type]
//     link.download = `${type}-template.csv`
//     document.body.appendChild(link)
//     link.click()
//     document.body.removeChild(link)
    
//     toast.success('Template downloaded!')
//   }

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const selectedFile = e.target.files?.[0]
//     if (selectedFile) {
//       setFile(selectedFile)
//       setResult(null)
//       parseExcel(selectedFile)
//     }
//   }

//   const parseExcel = (file: File) => {
//     const reader = new FileReader()
//     reader.onload = (e) => {
//       try {
//         const data = new Uint8Array(e.target?.result as ArrayBuffer)
//         const workbook = XLSX.read(data, { type: 'array' })
//         const sheetName = workbook.SheetNames[0]
//         const worksheet = workbook.Sheets[sheetName]
//         const jsonData = XLSX.utils.sheet_to_json(worksheet)
//         setPreview(jsonData.slice(0, 5))
//       } catch (error) {
//         toast.error('Error parsing file')
//       }
//     }
//     reader.readAsArrayBuffer(file)
//   }

//   const handleUpload = async () => {
//     if (!file) {
//       toast.error('Please select a file')
//       return
//     }

//     setUploading(true)
//     setResult(null)

//     try {
//       const reader = new FileReader()
//       reader.onload = async (e) => {
//         try {
//           const data = new Uint8Array(e.target?.result as ArrayBuffer)
//           const workbook = XLSX.read(data, { type: 'array' })
//           const sheetName = workbook.SheetNames[0]
//           const worksheet = workbook.Sheets[sheetName]
//           const jsonData = XLSX.utils.sheet_to_json(worksheet)

//           const uploadResult = await onUpload(jsonData)
//           setResult(uploadResult)
          
//           if (uploadResult.success) {
//             toast.success(uploadResult.message || `${getTypeLabel()} uploaded successfully!`)
            
//             // Auto close after 3 seconds if no errors
//             if (!uploadResult.errors || uploadResult.errors.length === 0) {
//               setTimeout(() => {
//                 onClose()
//               }, 3000)
//             }
//           } else {
//             toast.error(uploadResult.error || 'Upload failed')
//           }
//         } catch (error) {
//           toast.error('Error processing file')
//           setResult({ success: false, error: 'Error processing file' })
//         } finally {
//           setUploading(false)
//         }
//       }
//       reader.readAsArrayBuffer(file)
//     } catch (error) {
//       toast.error('Error uploading file')
//       setResult({ success: false, error: 'Error uploading file' })
//       setUploading(false)
//     }
//   }

//   const getInstructions = () => {
//     switch (type) {
//       case 'faculty':
//         return (
//           <ul className="text-sm text-blue-800 space-y-1 mt-2">
//             <li>• Faculty ID must be unique</li>
//             <li>• Email must be valid and unique</li>
//             <li>• Name and Designation are required</li>
//             <li>• Contact Number and Department are optional</li>
//             <li>• <strong>For course assignments:</strong> Repeat faculty info in multiple rows with different courses</li>
//             <li>• Course assignment requires: Programme Code, Semester, Course Code, Role</li>
//             <li>• Section is optional (leave empty if no section)</li>
//             <li>• Valid Roles: COORDINATOR, CONTRIBUTOR</li>
//             <li>• Leave course fields empty if no courses to assign</li>
//           </ul>
//         )
//       case 'courses':
//         return (
//           <ul className="text-sm text-blue-800 space-y-1 mt-2">
//             <li>• Session format: YYYY-YYYY (e.g., 2024-2025)</li>
//             <li>• Programme Code must exist in system</li>
//             <li>• Course Code must be unique per programme</li>
//             <li>• Valid Course Types: CORE, SEC, INDUSTRY, SKILL, VAC, OPEN_ELECTIVE, AEC, DSE, INTERNSHIP, PROJECT, MOOC, CS, OTHER</li>
//             <li>• Valid Delivery Modes: THEORY, PRACTICAL, BOTH</li>
//             <li>• Valid Categories: MANDATORY, ELECTIVE</li>
//             <li>• Attendance: Yes or No</li>
//           </ul>
//         )
//       case 'programmes':
//         return (
//           <ul className="text-sm text-blue-800 space-y-1 mt-2">
//             <li>• Session format: YYYY-YYYY (e.g., 2024-2025)</li>
//             <li>• Programme Code must be unique per session and section</li>
//             <li>• Duration in years (typically 3-4 years)</li>
//             <li>• Current Semester: 1 to (Duration × 2)</li>
//             <li>• Section is optional (A, B, C, etc.)</li>
//             <li>• No Of Students must be a number</li>
//           </ul>
//         )
//       default:
//         return null
//     }
//   }

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
//       <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl my-8 max-h-[90vh] overflow-y-auto">
//         <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-lg flex justify-between items-center sticky top-0 z-10">
//           <h2 className="text-2xl font-bold">
//             Bulk Upload {getTypeLabel()}
//           </h2>
//           <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
//             <X className="h-6 w-6" />
//           </button>
//         </div>

//         <div className="p-6 space-y-6">
//           {/* Download Template */}
//           <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//             <div className="flex items-start gap-3">
//               <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
//               <div className="flex-1">
//                 <h3 className="font-semibold text-blue-900 mb-2">Step 1: Download Template</h3>
//                 <p className="text-sm text-blue-800 mb-3">
//                   Download the template, fill in your {getTypeLabel().toLowerCase()} data, and upload it back.
//                 </p>
//                 {getInstructions()}
//                 <button
//                   onClick={downloadTemplate}
//                   className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium transition-colors"
//                 >
//                   <Download className="h-4 w-4" />
//                   Download {getTypeLabel()} Template
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Upload File */}
//           <div>
//             <h3 className="font-semibold text-gray-900 mb-3">Step 2: Upload Filled Template</h3>
//             <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
//               <input
//                 type="file"
//                 accept=".xlsx,.xls,.csv"
//                 onChange={handleFileChange}
//                 className="hidden"
//                 id="bulk-upload-file"
//               />
//               <label htmlFor="bulk-upload-file" className="cursor-pointer block">
//                 <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
//                 <p className="text-sm text-gray-600 font-medium">
//                   <span className="text-blue-600 hover:text-blue-700">Click to upload</span> or drag and drop
//                 </p>
//                 <p className="text-xs text-gray-500 mt-2">Excel files (.xlsx, .xls) or CSV (.csv)</p>
//                 {file && (
//                   <div className="mt-4 p-3 bg-green-50 border border-green-300 rounded-lg inline-block">
//                     <p className="text-sm text-green-700 font-medium flex items-center gap-2">
//                       <CheckCircle className="h-4 w-4" />
//                       {file.name}
//                     </p>
//                   </div>
//                 )}
//               </label>
//             </div>
//           </div>

//           {/* Preview */}
//           {preview.length > 0 && (
//             <div>
//               <h3 className="font-semibold text-gray-900 mb-3">Preview (First 5 rows)</h3>
//               <div className="overflow-x-auto border border-gray-200 rounded-lg">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       {Object.keys(preview[0]).map((key) => (
//                         <th key={key} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
//                           {key}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {preview.map((row, idx) => (
//                       <tr key={idx} className="hover:bg-gray-50">
//                         {Object.values(row).map((value: any, i) => (
//                           <td key={i} className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">
//                             {String(value || '')}
//                           </td>
//                         ))}
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//               <p className="text-sm text-gray-600 mt-2">
//                 Showing first 5 rows. Upload to process all rows.
//               </p>
//             </div>
//           )}

//           {/* Result Display */}
//           {result && (
//             <div className={`rounded-lg p-4 ${
//               result.success 
//                 ? 'bg-green-50 border border-green-200' 
//                 : 'bg-red-50 border border-red-200'
//             }`}>
//               <div className="flex items-start gap-2">
//                 {result.success ? (
//                   <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
//                 ) : (
//                   <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
//                 )}
//                 <div className="flex-1">
//                   <p className={`font-semibold ${
//                     result.success ? 'text-green-900' : 'text-red-900'
//                   }`}>
//                     {result.success ? 'Upload Successful!' : 'Upload Failed'}
//                   </p>
//                   <p className={`text-sm mt-1 whitespace-pre-wrap ${
//                     result.success ? 'text-green-800' : 'text-red-800'
//                   }`}>
//                     {result.message || result.error}
//                   </p>

//                   {/* Stats */}
//                   {result.stats && (
//                     <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
//                       <div className="bg-white bg-opacity-50 rounded p-2">
//                         <div className="font-semibold text-gray-900">Total</div>
//                         <div className="text-lg font-bold">{result.stats.total}</div>
//                       </div>
//                       {result.stats.created !== undefined && (
//                         <div className="bg-white bg-opacity-50 rounded p-2">
//                           <div className="font-semibold text-green-700">Created</div>
//                           <div className="text-lg font-bold text-green-700">{result.stats.created}</div>
//                         </div>
//                       )}
//                       {result.stats.updated !== undefined && (
//                         <div className="bg-white bg-opacity-50 rounded p-2">
//                           <div className="font-semibold text-blue-700">Updated</div>
//                           <div className="text-lg font-bold text-blue-700">{result.stats.updated}</div>
//                         </div>
//                       )}
//                       {result.stats.allocated !== undefined && (
//                         <div className="bg-white bg-opacity-50 rounded p-2">
//                           <div className="font-semibold text-purple-700">Allocated</div>
//                           <div className="text-lg font-bold text-purple-700">{result.stats.allocated}</div>
//                         </div>
//                       )}
//                       {result.stats.errors > 0 && (
//                         <div className="bg-white bg-opacity-50 rounded p-2">
//                           <div className="font-semibold text-red-700">Errors</div>
//                           <div className="text-lg font-bold text-red-700">{result.stats.errors}</div>
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Important Notes */}
//           <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//             <div className="flex items-start gap-3">
//               <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
//               <div>
//                 <h3 className="font-semibold text-yellow-900 mb-2">Important Notes</h3>
//                 <ul className="text-sm text-yellow-800 space-y-1">
//                   <li>• Make sure all required fields are filled</li>
//                   <li>• Follow the exact column names from the template</li>
//                   <li>• Remove the example rows before uploading</li>
//                   <li>• Duplicate entries will be skipped or updated</li>
//                   <li>• Processing may take a few seconds for large files</li>
//                   {type === 'faculty' && (
//                     <li>• <strong>For faculty:</strong> Each row represents one course assignment. Repeat faculty info for multiple courses.</li>
//                   )}
//                 </ul>
//               </div>
//             </div>
//           </div>

//           {/* Upload Button */}
//           <div className="flex gap-3 pt-4 border-t">
//             <button
//               onClick={handleUpload}
//               disabled={!file || uploading}
//               className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 transition-colors"
//             >
//               {uploading ? (
//                 <>
//                   <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                   Uploading {getTypeLabel()}...
//                 </>
//               ) : (
//                 <>
//                   <Upload className="h-5 w-5" />
//                   Upload {getTypeLabel()}
//                 </>
//               )}
//             </button>
//             <button
//               onClick={onClose}
//               disabled={uploading}
//               className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold transition-colors disabled:cursor-not-allowed"
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

interface BulkUploadResult {
  success: boolean
  error?: string
  message?: string
  stats?: {
    total: number
    created?: number
    updated?: number
    allocated?: number
    success?: number
    skipped?: number
    errors: number
  }
  errors?: string[]
}

interface BulkUploadProps {
  type: 'faculty' | 'courses' | 'programmes'
  onUpload: (data: any[]) => Promise<BulkUploadResult>
  onClose: () => void
}

export default function BulkUpload({ type, onUpload, onClose }: BulkUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<any[]>([])
  const [result, setResult] = useState<BulkUploadResult | null>(null)

  const getTypeLabel = () => {
    switch (type) {
      case 'faculty': return 'Faculty'
      case 'courses': return 'Courses'
      case 'programmes': return 'Programmes'
      default: return 'Data'
    }
  }

  // ✅ Excel template generator (single place for all three types)
  const generateExcelTemplate = () => {
    const workbook = XLSX.utils.book_new()

    let columns: string[] = []
    let exampleRow: Record<string, any> = {}

    if (type === 'faculty') {
      columns = [
        'facultyId',
        'name',
        'email',
        'designation',
        'contactNumber',
        'department',
        'programmeCode',
        'semester',
        'courseCode',
        'role',
        'section'
      ]
      exampleRow = {
        facultyId: 'F1001',
        name: 'Dr. Jane Doe',
        email: 'jane.doe@university.edu',
        designation: 'Assistant Professor',
        contactNumber: '9876543210',
        department: 'CSE',
        programmeCode: 'BTECH-CSE',
        semester: 3,
        courseCode: 'CS101',
        role: 'COORDINATOR',
        section: 'A'
      }
    } else if (type === 'courses') {
      columns = [
        'session',
        'programmeCode',
        'semester',
        'courseCode',
        'courseName',
        'l',
        't',
        'p',
        's',
        'credits',
        'totalHours',
        'courseType',
        'deliveryMode',
        'attendance',
        'category'
      ]
      exampleRow = {
        session: '2024-2025',
        programmeCode: 'BTECH-CSE',
        semester: 3,
        courseCode: 'CS201',
        courseName: 'Data Structures',
        l: 3,
        t: 1,
        p: 2,
        s: 0,
        credits: 4,
        totalHours: 40,
        courseType: 'CORE',
        deliveryMode: 'THEORY',
        attendance: 'YES',
        category: 'MANDATORY'
      }
    } else if (type === 'programmes') {
      columns = [
        'session',
        'programmeCode',
        'programmeName',
        'duration',
        'currentSemester',
        'section',
        'noOfStudents'
      ]
      exampleRow = {
        session: '2024-2025',
        programmeCode: 'BTECH-CSE',
        programmeName: 'Computer Science & Engineering',
        duration: 4,
        currentSemester: 1,
        section: 'A',
        noOfStudents: 60
      }
    }

    const wsData: any[][] = [columns, columns.map(c => exampleRow[c] ?? '')]
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    XLSX.utils.book_append_sheet(workbook, ws, 'Template')

    XLSX.writeFile(workbook, `${type}-template.xlsx`)
    toast.success('Excel template downloaded!')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResult(null)
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
        console.error(error)
        toast.error('Error parsing file')
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
    setResult(null)

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet)

          const uploadResult = await onUpload(jsonData as any[])
          setResult(uploadResult)

          if (uploadResult.success) {
            toast.success(uploadResult.message || `${getTypeLabel()} uploaded successfully!`)

            if (!uploadResult.errors || uploadResult.errors.length === 0) {
              setTimeout(() => {
                onClose()
              }, 3000)
            }
          } else {
            toast.error(uploadResult.error || 'Upload failed')
          }
        } catch (error) {
          console.error(error)
          toast.error('Error processing file')
          setResult({ success: false, error: 'Error processing file', stats: { total: 0, errors: 1 } })
        } finally {
          setUploading(false)
        }
      }
      reader.readAsArrayBuffer(file)
    } catch (error) {
      console.error(error)
      toast.error('Error uploading file')
      setResult({ success: false, error: 'Error uploading file', stats: { total: 0, errors: 1 } })
      setUploading(false)
    }
  }

  const getInstructions = () => {
    switch (type) {
      case 'faculty':
        return (
          <ul className="text-sm text-blue-800 space-y-1 mt-2">
            <li>• Faculty ID must be unique.</li>
            <li>• Email must be valid and unique.</li>
            <li>• Name and Designation are required.</li>
            <li>• Contact Number and Department are optional.</li>
            <li>• For course assignments: repeat faculty info in multiple rows with different courses.</li>
            <li>• Course assignment requires: Programme Code, Semester, Course Code, Role.</li>
            <li>• Section is optional (leave empty if no section).</li>
            <li>• Valid Roles: COORDINATOR, CONTRIBUTOR.</li>
            <li>• Leave course fields empty if no courses to assign.</li>
          </ul>
        )
      case 'courses':
        return (
          <ul className="text-sm text-blue-800 space-y-1 mt-2">
            <li>• Session format: YYYY-YYYY (e.g., 2024-2025).</li>
            <li>• Programme Code must exist in system.</li>
            <li>• Course Code must be unique per programme.</li>
            <li>• Valid Course Types: CORE, SEC, INDUSTRY, SKILL, VAC, OPEN_ELECTIVE, AEC, DSE, INTERNSHIP, PROJECT, MOOC, CS, OTHER.</li>
            <li>• Valid Delivery Modes: THEORY, PRACTICAL, BOTH.</li>
            <li>• Valid Categories: MANDATORY, ELECTIVE.</li>
            <li>• Attendance: YES or NO.</li>
          </ul>
        )
      case 'programmes':
        return (
          <ul className="text-sm text-blue-800 space-y-1 mt-2">
            <li>• Session format: YYYY-YYYY (e.g., 2024-2025).</li>
            <li>• Programme Code must be unique per session and section.</li>
            <li>• Duration in years (typically 3–4 years).</li>
            <li>• Current Semester: 1 to (Duration × 2).</li>
            <li>• Section is optional (A, B, C, etc.).</li>
            <li>• No Of Students must be a number.</li>
          </ul>
        )
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-lg flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-2xl font-bold">
            Bulk Upload {getTypeLabel()}
          </h2>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Step 1: Download template */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Step 1: Download Excel Template
                </h3>
                <p className="text-sm text-blue-800 mb-3">
                  Download the Excel template, fill in your {getTypeLabel().toLowerCase()} data, and upload it back.
                </p>
                {getInstructions()}
                <button
                  onClick={generateExcelTemplate}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download {getTypeLabel()} Excel Template
                </button>
              </div>
            </div>
          </div>

          {/* Step 2: Upload file */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Step 2: Upload Filled Template</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
                id="bulk-upload-file"
              />
              <label htmlFor="bulk-upload-file" className="cursor-pointer block">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 font-medium">
                  <span className="text-blue-600 hover:text-blue-700">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Excel files (.xlsx, .xls) or CSV (.csv)
                </p>
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
              <h3 className="font-semibold text-gray-900 mb-3">
                Preview (First 5 rows)
              </h3>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(preview[0]).map((key) => (
                        <th
                          key={key}
                          className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        {Object.values(row).map((value: any, i) => (
                          <td
                            key={i}
                            className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap"
                          >
                            {String(value ?? '')}
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

          {/* Result */}
          {result && (
            <div
              className={`rounded-lg p-4 ${
                result.success
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className="flex items-start gap-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p
                    className={`font-semibold ${
                      result.success ? 'text-green-900' : 'text-red-900'
                    }`}
                  >
                    {result.success ? 'Upload Successful!' : 'Upload Failed'}
                  </p>
                  <p
                    className={`text-sm mt-1 whitespace-pre-wrap ${
                      result.success ? 'text-green-800' : 'text-red-800'
                    }`}
                  >
                    {result.message || result.error}
                  </p>

                  {result.stats && (
                    <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
                      <div className="bg-white bg-opacity-50 rounded p-2">
                        <div className="font-semibold text-gray-900">Total</div>
                        <div className="text-lg font-bold">
                          {result.stats.total}
                        </div>
                      </div>
                      {result.stats.created !== undefined && (
                        <div className="bg-white bg-opacity-50 rounded p-2">
                          <div className="font-semibold text-green-700">
                            Created
                          </div>
                          <div className="text-lg font-bold text-green-700">
                            {result.stats.created}
                          </div>
                        </div>
                      )}
                      {result.stats.updated !== undefined && (
                        <div className="bg-white bg-opacity-50 rounded p-2">
                          <div className="font-semibold text-blue-700">
                            Updated
                          </div>
                          <div className="text-lg font-bold text-blue-700">
                            {result.stats.updated}
                          </div>
                        </div>
                      )}
                      {result.stats.allocated !== undefined && (
                        <div className="bg-white bg-opacity-50 rounded p-2">
                          <div className="font-semibold text-purple-700">
                            Allocated
                          </div>
                          <div className="text-lg font-bold text-purple-700">
                            {result.stats.allocated}
                          </div>
                        </div>
                      )}
                      {result.stats.errors > 0 && (
                        <div className="bg-white bg-opacity-50 rounded p-2">
                          <div className="font-semibold text-red-700">
                            Errors
                          </div>
                          <div className="text-lg font-bold text-red-700">
                            {result.stats.errors}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notes + Actions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">
                  Important Notes
                </h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Make sure all required fields are filled.</li>
                  <li>• Follow the exact column names from the template.</li>
                  <li>• Remove the example row before uploading.</li>
                  <li>• Duplicate entries will be skipped or updated.</li>
                  <li>• Processing may take a few seconds for large files.</li>
                  {type === 'faculty' && (
                    <li>
                      • For faculty: each row represents one course assignment.
                      Repeat faculty info for multiple courses.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
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
