'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { FileText, Download, CheckCircle, XCircle, ArrowLeft, Loader } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel } from 'docx'
import { saveAs } from 'file-saver'

interface CHOData {
  id: string
  courseCode: string
  courseName: string
  facultyName: string
  facultyEmail: string
  facultyDesignation: string
  status: string
  schoolName: string
  programme: string
  courseTitle: string
  ltpStructure: string
  credits: string
  prerequisite: string
  totalSessions: string
  courseFaculty: string
  coursePerspective: string
  programOutcomes: any[]
  programSpecificOutcomes: any[]
  courseOutcomes: any[]
  syllabus: any[]
  assessmentStrategy: any[]
  correlationMatrix: any[]
  sessionPlan: any[]
  updatedAt: string
}

export default function AdminCHODetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [cho, setCHO] = useState<CHOData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (id) {
      loadCHO()
    }
  }, [id])

  const loadCHO = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/course-handouts/${id}`)
      const data = await res.json()

      if (data.success) {
        setCHO({
          id: data.cho.id,
          courseCode: data.cho.course.courseCode,
          courseName: data.cho.course.courseName,
          facultyName: data.cho.faculty.name,
          facultyEmail: data.cho.faculty.email,
          facultyDesignation: data.cho.faculty.designation,
          status: data.cho.status,
          schoolName: data.cho.schoolName,
          programme: data.cho.programme,
          courseTitle: data.cho.courseTitle,
          ltpStructure: data.cho.ltpStructure,
          credits: data.cho.credits,
          prerequisite: data.cho.prerequisite,
          totalSessions: data.cho.totalSessions,
          courseFaculty: data.cho.courseFaculty,
          coursePerspective: data.cho.coursePerspective,
          programOutcomes: data.cho.programOutcomes,
          programSpecificOutcomes: data.cho.programSpecificOutcomes,
          courseOutcomes: data.cho.courseOutcomes,
          syllabus: data.cho.syllabus,
          assessmentStrategy: data.cho.assessmentStrategy,
          correlationMatrix: data.cho.correlationMatrix,
          sessionPlan: data.cho.sessionPlan,
          updatedAt: data.cho.updatedAt
        })
      } else {
        toast.error('CHO not found')
        router.push('/admin/course-handouts')
      }
    } catch (error) {
      toast.error('Error loading CHO')
      router.push('/admin/course-handouts')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (newStatus: 'APPROVED' | 'REJECTED') => {
    if (!cho) return

    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/course-handouts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      const data = await res.json()
      if (data.success) {
        toast.success(`CHO ${newStatus.toLowerCase()} successfully!`)
        setCHO({ ...cho, status: newStatus })
      } else {
        toast.error(data.error || 'Error updating status')
      }
    } catch (error) {
      toast.error('Error updating status')
    } finally {
      setUpdating(false)
    }
  }

  const generateWordDocument = async () => {
    if (!cho) return

    setGenerating(true)
    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: "COURSE HANDOUT",
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { before: 200, after: 400 }
            }),
            
            new Paragraph({
              text: "Course Details",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            }),
            new Paragraph({
              children: [new TextRun({ text: "1. Name of the School: ", bold: true }), new TextRun(cho.schoolName)],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [new TextRun({ text: "2. Program: ", bold: true }), new TextRun(cho.programme)],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [new TextRun({ text: "3. Course Title: ", bold: true }), new TextRun(cho.courseTitle)],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [new TextRun({ text: "4. Course Code: ", bold: true }), new TextRun(cho.courseCode)],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [new TextRun({ text: "5. L-T-P Structure: ", bold: true }), new TextRun(cho.ltpStructure)],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [new TextRun({ text: "6. Credits: ", bold: true }), new TextRun(cho.credits)],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [new TextRun({ text: "7. Pre-requisite: ", bold: true }), new TextRun(cho.prerequisite)],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [new TextRun({ text: "8. Total Sessions: ", bold: true }), new TextRun(cho.totalSessions)],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [new TextRun({ text: "9. Course Faculty: ", bold: true }), new TextRun(cho.courseFaculty)],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [new TextRun({ text: "10. E-mail: ", bold: true }), new TextRun(cho.facultyEmail)],
              spacing: { after: 300 }
            }),
            
            new Paragraph({
              text: "Course Perspective",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            }),
            new Paragraph({
              text: cho.coursePerspective || 'Not provided',
              spacing: { after: 300 }
            }),
            
            new Paragraph({
              text: "Program Outcomes (POs)",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            }),
            ...cho.programOutcomes.map((po: any, idx: number) => 
              new Paragraph({
                text: `${idx + 1}. ${po.outcome}`,
                spacing: { after: 100 }
              })
            ),
            
            new Paragraph({ text: "", spacing: { after: 200 } }),
            
            new Paragraph({
              text: "Program Specific Outcomes (PSOs)",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            }),
            ...cho.programSpecificOutcomes.map((pso: any, idx: number) => 
              new Paragraph({
                text: `${idx + 1}. ${pso.outcome}`,
                spacing: { after: 100 }
              })
            ),
            
            new Paragraph({ text: "", spacing: { after: 300 } }),
            
            new Paragraph({
              text: "Course Outcomes (COs)",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            }),
            new Table({
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ text: "CO No.", alignment: AlignmentType.CENTER })],
                      shading: { fill: "CCCCCC" }
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: "Course Outcomes", alignment: AlignmentType.CENTER })],
                      shading: { fill: "CCCCCC" }
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: "BTL (1-6)", alignment: AlignmentType.CENTER })],
                      shading: { fill: "CCCCCC" }
                    })
                  ]
                }),
                ...cho.courseOutcomes.map((co: any) =>
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph(co.coNumber)] }),
                      new TableCell({ children: [new Paragraph(co.outcome)] }),
                      new TableCell({ children: [new Paragraph({ text: co.btl, alignment: AlignmentType.CENTER })] })
                    ]
                  })
                )
              ],
              width: { size: 100, type: WidthType.PERCENTAGE }
            })
          ]
        }]
      })

      const blob = await Packer.toBlob(doc)
      saveAs(blob, `${cho.courseCode}-CHO.docx`)
      toast.success('CHO document downloaded successfully!')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error generating document')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!cho) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">CHO not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/course-handouts')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to CHO List
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-600" />
              Course Handout Details
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{cho.courseCode} - {cho.courseName}</span>
              <span>•</span>
              <span>Faculty: {cho.facultyName}</span>
              <span>•</span>
              <span>Updated: {new Date(cho.updatedAt).toLocaleDateString('en-IN')}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              cho.status === 'DRAFT' ? 'bg-gray-100 text-gray-700' :
              cho.status === 'SUBMITTED' ? 'bg-yellow-100 text-yellow-700' :
              cho.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
              'bg-red-100 text-red-700'
            }`}>
              {cho.status}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        {cho.status === 'SUBMITTED' && (
          <>
            <button
              onClick={() => updateStatus('APPROVED')}
              disabled={updating}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center gap-2 disabled:bg-gray-400 transition-colors shadow-md"
            >
              {updating ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Approve CHO
                </>
              )}
            </button>

            <button
              onClick={() => updateStatus('REJECTED')}
              disabled={updating}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold flex items-center gap-2 disabled:bg-gray-400 transition-colors shadow-md"
            >
              {updating ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <XCircle className="h-5 w-5" />
                  Reject CHO
                </>
              )}
            </button>
          </>
        )}

        <button
          onClick={generateWordDocument}
          disabled={generating}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2 disabled:bg-gray-400 transition-colors shadow-md"
        >
          {generating ? (
            <>
              <Loader className="h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              Download as Word
            </>
          )}
        </button>
      </div>

      {/* Faculty Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">Faculty Information</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-blue-700">Name:</span>
            <span className="ml-2 font-medium text-blue-900">{cho.facultyName}</span>
          </div>
          <div>
            <span className="text-blue-700">Designation:</span>
            <span className="ml-2 font-medium text-blue-900">{cho.facultyDesignation}</span>
          </div>
          <div>
            <span className="text-blue-700">Email:</span>
            <span className="ml-2 font-medium text-blue-900">{cho.facultyEmail}</span>
          </div>
        </div>
      </div>

      {/* CHO Content */}
      <div className="space-y-6">
        
        {/* Course Details */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Course Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold text-gray-700">School:</span>
              <p className="text-gray-900">{cho.schoolName}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Programme:</span>
              <p className="text-gray-900">{cho.programme}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Course Title:</span>
              <p className="text-gray-900">{cho.courseTitle}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Course Code:</span>
              <p className="text-gray-900">{cho.courseCode}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">L-T-P Structure:</span>
              <p className="text-gray-900">{cho.ltpStructure}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Credits:</span>
              <p className="text-gray-900">{cho.credits}</p>
            </div>
            <div className="col-span-2">
              <span className="font-semibold text-gray-700">Pre-requisite:</span>
              <p className="text-gray-900">{cho.prerequisite}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Total Sessions:</span>
              <p className="text-gray-900">{cho.totalSessions}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Course Faculty:</span>
              <p className="text-gray-900">{cho.courseFaculty}</p>
            </div>
          </div>
        </div>

        {/* Course Perspective */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Course Perspective</h2>
          <p className="text-gray-900 whitespace-pre-wrap">{cho.coursePerspective || 'Not provided'}</p>
        </div>

        {/* Program Outcomes */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Program Outcomes (POs)</h2>
          <ol className="list-decimal list-inside space-y-2">
            {cho.programOutcomes.map((po: any, idx: number) => (
              <li key={idx} className="text-gray-900">{po.outcome}</li>
            ))}
          </ol>
        </div>

        {/* Program Specific Outcomes */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Program Specific Outcomes (PSOs)</h2>
          <ol className="list-decimal list-inside space-y-2">
            {cho.programSpecificOutcomes.map((pso: any, idx: number) => (
              <li key={idx} className="text-gray-900">{pso.outcome}</li>
            ))}
          </ol>
        </div>

        {/* Course Outcomes Table */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Course Outcomes (COs)</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-800">
                  <th className="border border-gray-300 px-4 py-2 text-white font-bold">CO No.</th>
                  <th className="border border-gray-300 px-4 py-2 text-white font-bold">Course Outcomes</th>
                  <th className="border border-gray-300 px-4 py-2 text-white font-bold">BTL</th>
                </tr>
              </thead>
              <tbody>
                {cho.courseOutcomes.map((co: any, idx: number) => (
                  <tr key={idx}>
                    <td className="border border-gray-300 px-4 py-2 text-gray-900 font-semibold">{co.coNumber}</td>
                    <td className="border border-gray-300 px-4 py-2 text-gray-900">{co.outcome}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center text-gray-900">{co.btl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Syllabus Table */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Syllabus</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-800">
                  <th className="border border-gray-300 px-4 py-2 text-white font-bold">Unit No.</th>
                  <th className="border border-gray-300 px-4 py-2 text-white font-bold">Unit Name</th>
                  <th className="border border-gray-300 px-4 py-2 text-white font-bold">Hours</th>
                  <th className="border border-gray-300 px-4 py-2 text-white font-bold">Topics</th>
                </tr>
              </thead>
              <tbody>
                {cho.syllabus.map((unit: any, idx: number) => (
                  <tr key={idx}>
                    <td className="border border-gray-300 px-4 py-2 text-center text-gray-900 font-semibold">{unit.unitNo}</td>
                    <td className="border border-gray-300 px-4 py-2 text-gray-900">{unit.unitName}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center text-gray-900">{unit.hours}</td>
                    <td className="border border-gray-300 px-4 py-2 text-gray-900">{unit.topics}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Assessment Strategy Table */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Assessment Strategy</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-800">
                  <th className="border border-gray-300 px-4 py-2 text-white font-bold">CO</th>
                  <th className="border border-gray-300 px-4 py-2 text-white font-bold">Quizzes/Tests</th>
                  <th className="border border-gray-300 px-4 py-2 text-white font-bold">Assignment</th>
                  <th className="border border-gray-300 px-4 py-2 text-white font-bold">Mid Term</th>
                  <th className="border border-gray-300 px-4 py-2 text-white font-bold">End Term</th>
                </tr>
              </thead>
              <tbody>
                {cho.assessmentStrategy.map((row: any, idx: number) => (
                  <tr key={idx}>
                    <td className="border border-gray-300 px-4 py-2 text-gray-900 font-semibold">{row.co}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center text-gray-900">{row.quizzes}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center text-gray-900">{row.assignment}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center text-gray-900">{row.midTerm}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center text-gray-900">{row.endTerm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Correlation Matrix Table */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Correlation Matrix</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-800">
                  <th className="border border-gray-300 px-4 py-2 text-white font-bold">CO</th>
                  <th className="border border-gray-300 px-4 py-2 text-white font-bold">PO1</th>
                  <th className="border border-gray-300 px-4 py-2 text-white font-bold">PO2</th>
                  <th className="border border-gray-300 px-4 py-2 text-white font-bold">PO3</th>
                  <th className="border border-gray-300 px-4 py-2 text-white font-bold">PO4</th>
                  <th className="border border-gray-300 px-4 py-2 text-white font-bold">PO5</th>
                  <th className="border border-gray-300 px-4 py-2 text-white font-bold">PSO1</th>
                  <th className="border border-gray-300 px-4 py-2 text-white font-bold">PSO2</th>
                </tr>
              </thead>
              <tbody>
                {cho.correlationMatrix.map((row: any, idx: number) => (
                  <tr key={idx}>
                    <td className="border border-gray-300 px-4 py-2 text-gray-900 font-semibold">{row.co}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center text-gray-900">{row.po1}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center text-gray-900">{row.po2}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center text-gray-900">{row.po3}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center text-gray-900">{row.po4}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center text-gray-900">{row.po5}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center text-gray-900">{row.pso1}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center text-gray-900">{row.pso2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Session Plan Table */}
        {cho.sessionPlan && cho.sessionPlan.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Session Plan</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="border border-gray-300 px-4 py-2 text-white font-bold">Lec No.</th>
                    <th className="border border-gray-300 px-4 py-2 text-white font-bold">Topics</th>
                    <th className="border border-gray-300 px-4 py-2 text-white font-bold">Component</th>
                    <th className="border border-gray-300 px-4 py-2 text-white font-bold">Method</th>
                    <th className="border border-gray-300 px-4 py-2 text-white font-bold">Date Planned</th>
                    <th className="border border-gray-300 px-4 py-2 text-white font-bold">Date Conducted</th>
                    <th className="border border-gray-300 px-4 py-2 text-white font-bold">Outcome Mapping</th>
                  </tr>
                </thead>
                <tbody>
                  {cho.sessionPlan.map((session: any, idx: number) => (
                    <tr key={idx}>
                      <td className="border border-gray-300 px-4 py-2 text-center text-gray-900 font-semibold">{session.lectureNo}</td>
                      <td className="border border-gray-300 px-4 py-2 text-gray-900">{session.topics}</td>
                      <td className="border border-gray-300 px-4 py-2 text-gray-900">{session.component}</td>
                      <td className="border border-gray-300 px-4 py-2 text-gray-900">{session.method}</td>
                      <td className="border border-gray-300 px-4 py-2 text-gray-900">{session.datePlanned}</td>
                      <td className="border border-gray-300 px-4 py-2 text-gray-900">{session.dateConducted}</td>
                      <td className="border border-gray-300 px-4 py-2 text-gray-900">{session.outcomeMapping}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Bottom Action Buttons */}
      <div className="mt-8 flex justify-center gap-3">
        {cho.status === 'SUBMITTED' && (
          <>
            <button
              onClick={() => updateStatus('APPROVED')}
              disabled={updating}
              className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-lg flex items-center gap-3 disabled:bg-gray-400 transition-all shadow-lg"
            >
              {updating ? (
                <Loader className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="h-6 w-6" />
                  Approve CHO
                </>
              )}
            </button>

            <button
              onClick={() => updateStatus('REJECTED')}
              disabled={updating}
              className="px-8 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold text-lg flex items-center gap-3 disabled:bg-gray-400 transition-all shadow-lg"
            >
              {updating ? (
                <Loader className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <XCircle className="h-6 w-6" />
                  Reject CHO
                </>
              )}
            </button>
          </>
        )}

        <button
          onClick={generateWordDocument}
          disabled={generating}
          className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-lg flex items-center gap-3 disabled:bg-gray-400 transition-all shadow-lg"
        >
          {generating ? (
            <>
              <Loader className="h-6 w-6 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="h-6 w-6" />
              Download Word Document
            </>
          )}
        </button>
      </div>
    </div>
  )
}
