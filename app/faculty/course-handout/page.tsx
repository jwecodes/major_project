'use client'
import { useState, useEffect } from 'react'
import { FileText, Download, Plus, Trash2, Loader, Save, Send } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel } from 'docx'
import { saveAs } from 'file-saver'

interface Course {
  id: string
  courseCode: string
  courseName: string
}

interface ProgramOutcome {
  id: string
  outcome: string
}

interface CourseOutcome {
  id: string
  coNumber: string
  outcome: string
  btl: string
}

interface SyllabusUnit {
  id: string
  unitNo: number
  unitName: string
  hours: number
  topics: string
}

interface AssessmentRow {
  id: string
  co: string
  quizzes: string
  assignment: string
  midTerm: string
  endTerm: string
}

interface CorrelationRow {
  id: string
  co: string
  po1: string
  po2: string
  po3: string
  po4: string
  po5: string
  pso1: string
  pso2: string
}

interface SessionPlan {
  id: string
  lectureNo: number
  topics: string
  component: string
  method: string
  datePlanned: string
  dateConducted: string
  outcomeMapping: string
}

interface CHOData {
  courseId: string
  schoolName: string
  programme: string
  courseTitle: string
  courseCode: string
  ltpStructure: string
  credits: string
  prerequisite: string
  totalSessions: string
  courseFaculty: string
  facultyEmail: string
  coursePerspective: string
  programOutcomes: ProgramOutcome[]
  programSpecificOutcomes: ProgramOutcome[]
  courseOutcomes: CourseOutcome[]
  syllabus: SyllabusUnit[]
  assessmentStrategy: AssessmentRow[]
  correlationMatrix: CorrelationRow[]
  sessionPlan: SessionPlan[]
}

export default function CourseHandoutPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState('')
  const [savedChoId, setSavedChoId] = useState<string | null>(null)
  const [choStatus, setChoStatus] = useState<string>('DRAFT')
  
  const [choData, setCHOData] = useState<CHOData>({
    courseId: '',
    schoolName: 'School of Engineering & Technology',
    programme: '',
    courseTitle: '',
    courseCode: '',
    ltpStructure: '',
    credits: '',
    prerequisite: '',
    totalSessions: '45',
    courseFaculty: '',
    facultyEmail: '',
    coursePerspective: '',
    programOutcomes: [{ id: '1', outcome: '' }],
    programSpecificOutcomes: [{ id: '1', outcome: '' }],
    courseOutcomes: [{ id: '1', coNumber: 'CO1', outcome: '', btl: 'L2' }],
    syllabus: [{ id: '1', unitNo: 1, unitName: '', hours: 0, topics: '' }],
    assessmentStrategy: [{ id: '1', co: 'CO1', quizzes: '', assignment: '', midTerm: '', endTerm: '' }],
    correlationMatrix: [{ id: '1', co: 'CO1', po1: '', po2: '', po3: '', po4: '', po5: '', pso1: '', pso2: '' }],
    sessionPlan: []
  })

  useEffect(() => {
    const email = localStorage.getItem('facultyEmail')
    if (!email) {
      router.push('/faculty/login')
      return
    }
    setCHOData(prev => ({ ...prev, facultyEmail: email }))
    loadCourses(email)
  }, [router])

  useEffect(() => {
    if (selectedCourse && choData.facultyEmail) {
      loadExistingCHO()
    }
  }, [selectedCourse])

  const loadCourses = async (email: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/faculty/courses?email=${encodeURIComponent(email)}`)
      const data = await res.json()
      if (data.success && Array.isArray(data.courses)) {
        setCourses(data.courses.map((c: any) => ({
          id: c.course?.id || c.id,
          courseCode: c.course?.courseCode || c.courseCode,
          courseName: c.course?.courseName || c.courseName
        })))
      }
    } catch (error) {
      toast.error('Error loading courses')
    } finally {
      setLoading(false)
    }
  }

  const handleCourseSelect = (courseId: string) => {
    const course = courses.find(c => c.id === courseId)
    if (course) {
      setSelectedCourse(courseId)
      setCHOData(prev => ({
        ...prev,
        courseId,
        courseTitle: course.courseName,
        courseCode: course.courseCode
      }))
    }
  }

  const loadExistingCHO = async () => {
    try {
      const res = await fetch(`/api/faculty/course-handout?email=${choData.facultyEmail}&courseId=${selectedCourse}`)
      const data = await res.json()
      
      if (data.success && data.cho) {
        setCHOData({
          courseId: data.cho.courseId,
          schoolName: data.cho.schoolName,
          programme: data.cho.programme,
          courseTitle: data.cho.courseTitle,
          courseCode: data.cho.courseCode,
          ltpStructure: data.cho.ltpStructure,
          credits: data.cho.credits,
          prerequisite: data.cho.prerequisite,
          totalSessions: data.cho.totalSessions,
          courseFaculty: data.cho.courseFaculty,
          facultyEmail: data.cho.facultyEmail,
          coursePerspective: data.cho.coursePerspective,
          programOutcomes: data.cho.programOutcomes,
          programSpecificOutcomes: data.cho.programSpecificOutcomes,
          courseOutcomes: data.cho.courseOutcomes,
          syllabus: data.cho.syllabus,
          assessmentStrategy: data.cho.assessmentStrategy,
          correlationMatrix: data.cho.correlationMatrix,
          sessionPlan: data.cho.sessionPlan
        })
        setSavedChoId(data.cho.id)
        setChoStatus(data.cho.status)
        toast.success(`Loaded ${data.cho.status} CHO`)
      }
    } catch (error) {
      console.error('Error loading CHO:', error)
    }
  }

  const saveDraft = async () => {
    if (!choData.courseTitle || !choData.courseCode) {
      toast.error('Please select a course first')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/faculty/course-handout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: choData.facultyEmail,
          courseId: selectedCourse,
          choData,
          status: 'DRAFT'
        })
      })

      const data = await res.json()
      if (data.success) {
        setSavedChoId(data.cho.id)
        setChoStatus('DRAFT')
        toast.success('Draft saved successfully!')
      } else {
        toast.error(data.error || 'Error saving draft')
      }
    } catch (error) {
      toast.error('Error saving draft')
    } finally {
      setSaving(false)
    }
  }

  const submitCHO = async () => {
    if (!choData.courseTitle || !choData.courseFaculty) {
      toast.error('Please fill Course Title and Faculty Name')
      return
    }

    if (!choData.coursePerspective) {
      toast.error('Please fill Course Perspective')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/faculty/course-handout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: choData.facultyEmail,
          courseId: selectedCourse,
          choData,
          status: 'SUBMITTED'
        })
      })

      const data = await res.json()
      if (data.success) {
        setSavedChoId(data.cho.id)
        setChoStatus('SUBMITTED')
        toast.success('CHO submitted successfully!')
      } else {
        toast.error(data.error || 'Error submitting CHO')
      }
    } catch (error) {
      toast.error('Error submitting CHO')
    } finally {
      setSaving(false)
    }
  }

  // Helper functions
  const addPO = () => {
    setCHOData(prev => ({
      ...prev,
      programOutcomes: [...prev.programOutcomes, { id: Date.now().toString(), outcome: '' }]
    }))
  }

  const removePO = (id: string) => {
    if (choData.programOutcomes.length > 1) {
      setCHOData(prev => ({
        ...prev,
        programOutcomes: prev.programOutcomes.filter(po => po.id !== id)
      }))
    }
  }

  const updatePO = (id: string, value: string) => {
    setCHOData(prev => ({
      ...prev,
      programOutcomes: prev.programOutcomes.map(po => po.id === id ? { ...po, outcome: value } : po)
    }))
  }

  const addPSO = () => {
    setCHOData(prev => ({
      ...prev,
      programSpecificOutcomes: [...prev.programSpecificOutcomes, { id: Date.now().toString(), outcome: '' }]
    }))
  }

  const removePSO = (id: string) => {
    if (choData.programSpecificOutcomes.length > 1) {
      setCHOData(prev => ({
        ...prev,
        programSpecificOutcomes: prev.programSpecificOutcomes.filter(pso => pso.id !== id)
      }))
    }
  }

  const updatePSO = (id: string, value: string) => {
    setCHOData(prev => ({
      ...prev,
      programSpecificOutcomes: prev.programSpecificOutcomes.map(pso => pso.id === id ? { ...pso, outcome: value } : pso)
    }))
  }

  const addCO = () => {
    const newCoNumber = `CO${choData.courseOutcomes.length + 1}`
    setCHOData(prev => ({
      ...prev,
      courseOutcomes: [...prev.courseOutcomes, { id: Date.now().toString(), coNumber: newCoNumber, outcome: '', btl: 'L2' }]
    }))
  }

  const removeCO = (id: string) => {
    if (choData.courseOutcomes.length > 1) {
      setCHOData(prev => ({
        ...prev,
        courseOutcomes: prev.courseOutcomes.filter(co => co.id !== id)
      }))
    }
  }

  const updateCO = (id: string, field: string, value: string) => {
    setCHOData(prev => ({
      ...prev,
      courseOutcomes: prev.courseOutcomes.map(co => co.id === id ? { ...co, [field]: value } : co)
    }))
  }

  const addUnit = () => {
    setCHOData(prev => ({
      ...prev,
      syllabus: [...prev.syllabus, { id: Date.now().toString(), unitNo: prev.syllabus.length + 1, unitName: '', hours: 0, topics: '' }]
    }))
  }

  const removeUnit = (id: string) => {
    if (choData.syllabus.length > 1) {
      setCHOData(prev => ({
        ...prev,
        syllabus: prev.syllabus.filter(u => u.id !== id).map((u, idx) => ({ ...u, unitNo: idx + 1 }))
      }))
    }
  }

  const updateUnit = (id: string, field: string, value: any) => {
    setCHOData(prev => ({
      ...prev,
      syllabus: prev.syllabus.map(u => u.id === id ? { ...u, [field]: value } : u)
    }))
  }

  const addAssessmentRow = () => {
    const newCO = `CO${choData.assessmentStrategy.length + 1}`
    setCHOData(prev => ({
      ...prev,
      assessmentStrategy: [...prev.assessmentStrategy, { id: Date.now().toString(), co: newCO, quizzes: '', assignment: '', midTerm: '', endTerm: '' }]
    }))
  }

  const removeAssessmentRow = (id: string) => {
    if (choData.assessmentStrategy.length > 1) {
      setCHOData(prev => ({
        ...prev,
        assessmentStrategy: prev.assessmentStrategy.filter(a => a.id !== id)
      }))
    }
  }

  const updateAssessmentRow = (id: string, field: string, value: string) => {
    setCHOData(prev => ({
      ...prev,
      assessmentStrategy: prev.assessmentStrategy.map(a => a.id === id ? { ...a, [field]: value } : a)
    }))
  }

  const addCorrelationRow = () => {
    const newCO = `CO${choData.correlationMatrix.length + 1}`
    setCHOData(prev => ({
      ...prev,
      correlationMatrix: [...prev.correlationMatrix, { id: Date.now().toString(), co: newCO, po1: '', po2: '', po3: '', po4: '', po5: '', pso1: '', pso2: '' }]
    }))
  }

  const removeCorrelationRow = (id: string) => {
    if (choData.correlationMatrix.length > 1) {
      setCHOData(prev => ({
        ...prev,
        correlationMatrix: prev.correlationMatrix.filter(c => c.id !== id)
      }))
    }
  }

  const updateCorrelationRow = (id: string, field: string, value: string) => {
    setCHOData(prev => ({
      ...prev,
      correlationMatrix: prev.correlationMatrix.map(c => c.id === id ? { ...c, [field]: value } : c)
    }))
  }

  const addSession = () => {
    setCHOData(prev => ({
      ...prev,
      sessionPlan: [...prev.sessionPlan, { 
        id: Date.now().toString(), 
        lectureNo: prev.sessionPlan.length + 1, 
        topics: '', 
        component: 'Lecture', 
        method: '', 
        datePlanned: '', 
        dateConducted: '', 
        outcomeMapping: '' 
      }]
    }))
  }

  const removeSession = (id: string) => {
    setCHOData(prev => ({
      ...prev,
      sessionPlan: prev.sessionPlan.filter(s => s.id !== id).map((s, idx) => ({ ...s, lectureNo: idx + 1 }))
    }))
  }

  const updateSession = (id: string, field: string, value: any) => {
    setCHOData(prev => ({
      ...prev,
      sessionPlan: prev.sessionPlan.map(s => s.id === id ? { ...s, [field]: value } : s)
    }))
  }

  const generateWordDocument = async () => {
    if (!choData.courseTitle || !choData.courseCode) {
      toast.error('Please fill course title and code')
      return
    }

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
              children: [new TextRun({ text: "1. Name of the School: ", bold: true }), new TextRun(choData.schoolName)],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [new TextRun({ text: "2. Program: ", bold: true }), new TextRun(choData.programme)],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [new TextRun({ text: "3. Course Title: ", bold: true }), new TextRun(choData.courseTitle)],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [new TextRun({ text: "4. Course Code: ", bold: true }), new TextRun(choData.courseCode)],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [new TextRun({ text: "5. L-T-P Structure: ", bold: true }), new TextRun(choData.ltpStructure)],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [new TextRun({ text: "6. Credits: ", bold: true }), new TextRun(choData.credits)],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [new TextRun({ text: "7. Pre-requisite: ", bold: true }), new TextRun(choData.prerequisite)],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [new TextRun({ text: "8. Total Sessions: ", bold: true }), new TextRun(choData.totalSessions)],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [new TextRun({ text: "9. Course Faculty: ", bold: true }), new TextRun(choData.courseFaculty)],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [new TextRun({ text: "10. E-mail: ", bold: true }), new TextRun(choData.facultyEmail)],
              spacing: { after: 300 }
            }),
            
            new Paragraph({
              text: "Course Perspective",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            }),
            new Paragraph({
              text: choData.coursePerspective || 'Not provided',
              spacing: { after: 300 }
            }),
            
            new Paragraph({
              text: "Program Outcomes (POs)",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            }),
            ...choData.programOutcomes.map((po, idx) => 
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
            ...choData.programSpecificOutcomes.map((pso, idx) => 
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
                ...choData.courseOutcomes.map(co =>
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
            }),
            
            new Paragraph({ text: "", spacing: { after: 300 } }),
            
            new Paragraph({
              text: "Syllabus",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            }),
            new Table({
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: "Unit No.", alignment: AlignmentType.CENTER })], shading: { fill: "CCCCCC" } }),
                    new TableCell({ children: [new Paragraph({ text: "Unit Name", alignment: AlignmentType.CENTER })], shading: { fill: "CCCCCC" } }),
                    new TableCell({ children: [new Paragraph({ text: "Hours", alignment: AlignmentType.CENTER })], shading: { fill: "CCCCCC" } }),
                    new TableCell({ children: [new Paragraph({ text: "Topics", alignment: AlignmentType.CENTER })], shading: { fill: "CCCCCC" } })
                  ]
                }),
                ...choData.syllabus.map(unit =>
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ text: unit.unitNo.toString(), alignment: AlignmentType.CENTER })] }),
                      new TableCell({ children: [new Paragraph(unit.unitName)] }),
                      new TableCell({ children: [new Paragraph({ text: unit.hours.toString(), alignment: AlignmentType.CENTER })] }),
                      new TableCell({ children: [new Paragraph(unit.topics)] })
                    ]
                  })
                )
              ],
              width: { size: 100, type: WidthType.PERCENTAGE }
            }),
            
            new Paragraph({ text: "", spacing: { after: 300 } }),
            
            new Paragraph({
              text: "Assessment Strategy",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            }),
            new Table({
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: "CO", alignment: AlignmentType.CENTER })], shading: { fill: "CCCCCC" } }),
                    new TableCell({ children: [new Paragraph({ text: "Quizzes/Tests", alignment: AlignmentType.CENTER })], shading: { fill: "CCCCCC" } }),
                    new TableCell({ children: [new Paragraph({ text: "Assignment", alignment: AlignmentType.CENTER })], shading: { fill: "CCCCCC" } }),
                    new TableCell({ children: [new Paragraph({ text: "Mid Term", alignment: AlignmentType.CENTER })], shading: { fill: "CCCCCC" } }),
                    new TableCell({ children: [new Paragraph({ text: "End Term", alignment: AlignmentType.CENTER })], shading: { fill: "CCCCCC" } })
                  ]
                }),
                ...choData.assessmentStrategy.map(row =>
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph(row.co)] }),
                      new TableCell({ children: [new Paragraph(row.quizzes)] }),
                      new TableCell({ children: [new Paragraph(row.assignment)] }),
                      new TableCell({ children: [new Paragraph(row.midTerm)] }),
                      new TableCell({ children: [new Paragraph(row.endTerm)] })
                    ]
                  })
                )
              ],
              width: { size: 100, type: WidthType.PERCENTAGE }
            }),
            
            new Paragraph({ text: "", spacing: { after: 300 } }),
            
            new Paragraph({
              text: "Correlation Matrix (COs with POs/PSOs)",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            }),
            new Table({
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: "CO", alignment: AlignmentType.CENTER })], shading: { fill: "CCCCCC" } }),
                    new TableCell({ children: [new Paragraph({ text: "PO1", alignment: AlignmentType.CENTER })], shading: { fill: "CCCCCC" } }),
                    new TableCell({ children: [new Paragraph({ text: "PO2", alignment: AlignmentType.CENTER })], shading: { fill: "CCCCCC" } }),
                    new TableCell({ children: [new Paragraph({ text: "PO3", alignment: AlignmentType.CENTER })], shading: { fill: "CCCCCC" } }),
                    new TableCell({ children: [new Paragraph({ text: "PO4", alignment: AlignmentType.CENTER })], shading: { fill: "CCCCCC" } }),
                    new TableCell({ children: [new Paragraph({ text: "PO5", alignment: AlignmentType.CENTER })], shading: { fill: "CCCCCC" } }),
                    new TableCell({ children: [new Paragraph({ text: "PSO1", alignment: AlignmentType.CENTER })], shading: { fill: "CCCCCC" } }),
                    new TableCell({ children: [new Paragraph({ text: "PSO2", alignment: AlignmentType.CENTER })], shading: { fill: "CCCCCC" } })
                  ]
                }),
                ...choData.correlationMatrix.map(row =>
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph(row.co)] }),
                      new TableCell({ children: [new Paragraph(row.po1)] }),
                      new TableCell({ children: [new Paragraph(row.po2)] }),
                      new TableCell({ children: [new Paragraph(row.po3)] }),
                      new TableCell({ children: [new Paragraph(row.po4)] }),
                      new TableCell({ children: [new Paragraph(row.po5)] }),
                      new TableCell({ children: [new Paragraph(row.pso1)] }),
                      new TableCell({ children: [new Paragraph(row.pso2)] })
                    ]
                  })
                )
              ],
              width: { size: 100, type: WidthType.PERCENTAGE }
            }),
            
            new Paragraph({ text: "", spacing: { after: 300 } }),
            
            new Paragraph({
              text: "Session Plan",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            }),
            new Table({
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: "Lec No.", alignment: AlignmentType.CENTER })], shading: { fill: "CCCCCC" } }),
                    new TableCell({ children: [new Paragraph({ text: "Topics", alignment: AlignmentType.CENTER })], shading: { fill: "CCCCCC" } }),
                    new TableCell({ children: [new Paragraph({ text: "Component", alignment: AlignmentType.CENTER })], shading: { fill: "CCCCCC" } }),
                    new TableCell({ children: [new Paragraph({ text: "Method", alignment: AlignmentType.CENTER })], shading: { fill: "CCCCCC" } }),
                    new TableCell({ children: [new Paragraph({ text: "Date Planned", alignment: AlignmentType.CENTER })], shading: { fill: "CCCCCC" } }),
                    new TableCell({ children: [new Paragraph({ text: "Date Conducted", alignment: AlignmentType.CENTER })], shading: { fill: "CCCCCC" } }),
                    new TableCell({ children: [new Paragraph({ text: "Outcome Mapping", alignment: AlignmentType.CENTER })], shading: { fill: "CCCCCC" } })
                  ]
                }),
                ...choData.sessionPlan.map(session =>
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ text: session.lectureNo.toString(), alignment: AlignmentType.CENTER })] }),
                      new TableCell({ children: [new Paragraph(session.topics)] }),
                      new TableCell({ children: [new Paragraph(session.component)] }),
                      new TableCell({ children: [new Paragraph(session.method)] }),
                      new TableCell({ children: [new Paragraph(session.datePlanned)] }),
                      new TableCell({ children: [new Paragraph(session.dateConducted)] }),
                      new TableCell({ children: [new Paragraph(session.outcomeMapping)] })
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
      saveAs(blob, `${choData.courseCode}-CHO.docx`)
      toast.success('Course Handout generated successfully!')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error generating document')
    } finally {
      setGenerating(false)
    }
  }

  const isDisabled = choStatus === 'SUBMITTED' || choStatus === 'APPROVED'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Toaster position="top-right" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <FileText className="h-8 w-8 text-blue-600" />
          Course Handout (CHO)
        </h1>
        <p className="text-gray-600">Create comprehensive course handout for your course</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
        <label className="block text-sm font-bold text-gray-900 mb-3">
          Select Course *
        </label>
        <select
          value={selectedCourse}
          onChange={(e) => handleCourseSelect(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white text-lg"
        >
          <option value="">Choose a course...</option>
          {courses.map(course => (
            <option key={course.id} value={course.id}>
              {course.courseCode} - {course.courseName}
            </option>
          ))}
        </select>
        
        {choStatus && selectedCourse && (
          <div className="mt-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              choStatus === 'DRAFT' ? 'bg-gray-100 text-gray-700' :
              choStatus === 'SUBMITTED' ? 'bg-yellow-100 text-yellow-700' :
              choStatus === 'APPROVED' ? 'bg-green-100 text-green-700' :
              'bg-red-100 text-red-700'
            }`}>
              Status: {choStatus}
            </span>
          </div>
        )}
      </div>

      {selectedCourse && (
        <>
          <div className="flex gap-3 mb-6">
            <button
              onClick={saveDraft}
              disabled={saving || isDisabled}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2 disabled:bg-gray-400 transition-colors shadow-md"
            >
              {saving ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Save Draft
                </>
              )}
            </button>

            <button
              onClick={submitCHO}
              disabled={saving || isDisabled}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold flex items-center gap-2 disabled:bg-gray-400 transition-colors shadow-md"
            >
              {saving ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Submit CHO
                </>
              )}
            </button>

            <button
              onClick={generateWordDocument}
              disabled={generating}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center gap-2 disabled:bg-gray-400 transition-colors shadow-md"
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

          {isDisabled && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 font-medium">
                ℹ️ This CHO has been {choStatus.toLowerCase()}. You cannot edit it anymore.
              </p>
            </div>
          )}

          <div className="space-y-6">
            
            {/* 1. Course Details */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Course Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">1. School Name</label>
                  <input
                    type="text"
                    value={choData.schoolName}
                    onChange={(e) => setCHOData({...choData, schoolName: e.target.value})}
                    disabled={isDisabled}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">2. Programme (Class, Semester, Batch)</label>
                  <input
                    type="text"
                    value={choData.programme}
                    onChange={(e) => setCHOData({...choData, programme: e.target.value})}
                    placeholder="e.g., BCA (AI&DS), VI"
                    disabled={isDisabled}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">3. Course Title</label>
                  <input
                    type="text"
                    value={choData.courseTitle}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">4. Course Code</label>
                  <input
                    type="text"
                    value={choData.courseCode}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">5. L-T-P Structure</label>
                  <input
                    type="text"
                    value={choData.ltpStructure}
                    onChange={(e) => setCHOData({...choData, ltpStructure: e.target.value})}
                    placeholder="e.g., 3-1-0"
                    disabled={isDisabled}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">6. Credits</label>
                  <input
                    type="text"
                    value={choData.credits}
                    onChange={(e) => setCHOData({...choData, credits: e.target.value})}
                    placeholder="e.g., 4"
                    disabled={isDisabled}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:bg-gray-100"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-900 mb-2">7. Pre-requisite (In terms of knowledge & skills)</label>
                  <input
                    type="text"
                    value={choData.prerequisite}
                    onChange={(e) => setCHOData({...choData, prerequisite: e.target.value})}
                    placeholder="e.g., Data Structures"
                    disabled={isDisabled}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">8. Total Sessions (Each session of 50 mins)</label>
                  <input
                    type="text"
                    value={choData.totalSessions}
                    onChange={(e) => setCHOData({...choData, totalSessions: e.target.value})}
                    disabled={isDisabled}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">9. Course Faculty</label>
                  <input
                    type="text"
                    value={choData.courseFaculty}
                    onChange={(e) => setCHOData({...choData, courseFaculty: e.target.value})}
                    placeholder="Enter your name"
                    disabled={isDisabled}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:bg-gray-100"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-900 mb-2">10. E-mail</label>
                  <input
                    type="email"
                    value={choData.facultyEmail}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* 2. Course Perspective */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Course Perspective</h2>
              <textarea
                value={choData.coursePerspective}
                onChange={(e) => setCHOData({...choData, coursePerspective: e.target.value})}
                rows={5}
                placeholder="Write course rationale..."
                disabled={isDisabled}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none text-gray-900 disabled:bg-gray-100"
              />
            </div>

            {/* 3. Program Outcomes */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Program Outcomes (POs)</h2>
              <div className="space-y-3">
                {choData.programOutcomes.map((po, idx) => (
                  <div key={po.id} className="flex gap-2">
                    <span className="flex-shrink-0 mt-2 font-bold text-gray-900">{idx + 1}.</span>
                    <input
                      type="text"
                      value={po.outcome}
                      onChange={(e) => updatePO(po.id, e.target.value)}
                      placeholder="Enter program outcome..."
                      disabled={isDisabled}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:bg-gray-100"
                    />
                    {choData.programOutcomes.length > 1 && !isDisabled && (
                      <button onClick={() => removePO(po.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
                {!isDisabled && (
                  <button onClick={addPO} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Add PO
                  </button>
                )}
              </div>
            </div>

            {/* 4. Program Specific Outcomes */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Program Specific Outcomes (PSOs)</h2>
              <div className="space-y-3">
                {choData.programSpecificOutcomes.map((pso, idx) => (
                  <div key={pso.id} className="flex gap-2">
                    <span className="flex-shrink-0 mt-2 font-bold text-gray-900">{idx + 1}.</span>
                    <input
                      type="text"
                      value={pso.outcome}
                      onChange={(e) => updatePSO(pso.id, e.target.value)}
                      placeholder="Enter program specific outcome..."
                      disabled={isDisabled}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:bg-gray-100"
                    />
                    {choData.programSpecificOutcomes.length > 1 && !isDisabled && (
                      <button onClick={() => removePSO(pso.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
                {!isDisabled && (
                  <button onClick={addPSO} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Add PSO
                  </button>
                )}
              </div>
            </div>

            {/* 5. Course Outcomes Table */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Course Outcomes (COs)</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-800">
                      <th className="border border-gray-300 px-4 py-2 text-white font-bold">CO No.</th>
                      <th className="border border-gray-300 px-4 py-2 text-white font-bold">Course Outcomes</th>
                      <th className="border border-gray-300 px-4 py-2 text-white font-bold">BTL (1-6)</th>
                      <th className="border border-gray-300 px-4 py-2 text-white font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {choData.courseOutcomes.map((co) => (
                      <tr key={co.id}>
                        <td className="border border-gray-300 px-4 py-2">
                          <input
                            type="text"
                            value={co.coNumber}
                            onChange={(e) => updateCO(co.id, 'coNumber', e.target.value)}
                            disabled={isDisabled}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 disabled:bg-gray-100"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <input
                            type="text"
                            value={co.outcome}
                            onChange={(e) => updateCO(co.id, 'outcome', e.target.value)}
                            placeholder="Enter outcome..."
                            disabled={isDisabled}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 disabled:bg-gray-100"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <select
                            value={co.btl}
                            onChange={(e) => updateCO(co.id, 'btl', e.target.value)}
                            disabled={isDisabled}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 disabled:bg-gray-100"
                          >
                            <option value="L1">L1</option>
                            <option value="L2">L2</option>
                            <option value="L3">L3</option>
                            <option value="L4">L4</option>
                            <option value="L5">L5</option>
                            <option value="L6">L6</option>
                          </select>
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          {choData.courseOutcomes.length > 1 && !isDisabled && (
                            <button onClick={() => removeCO(co.id)} className="text-red-600 hover:text-red-800">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!isDisabled && (
                <button onClick={addCO} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Add CO
                </button>
              )}
            </div>

            {/* 6. Syllabus Table */}
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
                      <th className="border border-gray-300 px-4 py-2 text-white font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {choData.syllabus.map((unit) => (
                      <tr key={unit.id}>
                        <td className="border border-gray-300 px-4 py-2 text-center text-gray-900 font-semibold">{unit.unitNo}</td>
                        <td className="border border-gray-300 px-4 py-2">
                          <input
                            type="text"
                            value={unit.unitName}
                            onChange={(e) => updateUnit(unit.id, 'unitName', e.target.value)}
                            placeholder="Unit name..."
                            disabled={isDisabled}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 disabled:bg-gray-100"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <input
                            type="number"
                            value={unit.hours}
                            onChange={(e) => updateUnit(unit.id, 'hours', parseInt(e.target.value) || 0)}
                            disabled={isDisabled}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 disabled:bg-gray-100"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <textarea
                            value={unit.topics}
                            onChange={(e) => updateUnit(unit.id, 'topics', e.target.value)}
                            placeholder="Topics..."
                            rows={2}
                            disabled={isDisabled}
                            className="w-full px-2 py-1 border border-gray-300 rounded resize-none text-gray-900 disabled:bg-gray-100"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          {choData.syllabus.length > 1 && !isDisabled && (
                            <button onClick={() => removeUnit(unit.id)} className="text-red-600 hover:text-red-800">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!isDisabled && (
                <button onClick={addUnit} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Add Unit
                </button>
              )}
            </div>

            {/* 7. Assessment Strategy Table */}
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
                      <th className="border border-gray-300 px-4 py-2 text-white font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {choData.assessmentStrategy.map((row) => (
                      <tr key={row.id}>
                        <td className="border border-gray-300 px-4 py-2">
                          <input
                            type="text"
                            value={row.co}
                            onChange={(e) => updateAssessmentRow(row.id, 'co', e.target.value)}
                            disabled={isDisabled}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 disabled:bg-gray-100"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <input
                            type="text"
                            value={row.quizzes}
                            onChange={(e) => updateAssessmentRow(row.id, 'quizzes', e.target.value)}
                            placeholder="✓ or blank"
                            disabled={isDisabled}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 disabled:bg-gray-100"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <input
                            type="text"
                            value={row.assignment}
                            onChange={(e) => updateAssessmentRow(row.id, 'assignment', e.target.value)}
                            placeholder="✓ or blank"
                            disabled={isDisabled}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 disabled:bg-gray-100"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <input
                            type="text"
                            value={row.midTerm}
                            onChange={(e) => updateAssessmentRow(row.id, 'midTerm', e.target.value)}
                            placeholder="✓ or blank"
                            disabled={isDisabled}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 disabled:bg-gray-100"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <input
                            type="text"
                            value={row.endTerm}
                            onChange={(e) => updateAssessmentRow(row.id, 'endTerm', e.target.value)}
                            placeholder="✓ or blank"
                            disabled={isDisabled}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 disabled:bg-gray-100"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          {choData.assessmentStrategy.length > 1 && !isDisabled && (
                            <button onClick={() => removeAssessmentRow(row.id)} className="text-red-600 hover:text-red-800">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!isDisabled && (
                <button onClick={addAssessmentRow} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Add Row
                </button>
              )}
            </div>

            {/* 8. Correlation Matrix Table */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Correlation Matrix (COs with POs/PSOs)</h2>
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
                      <th className="border border-gray-300 px-4 py-2 text-white font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {choData.correlationMatrix.map((row) => (
                      <tr key={row.id}>
                        <td className="border border-gray-300 px-4 py-2">
                          <input
                            type="text"
                            value={row.co}
                            onChange={(e) => updateCorrelationRow(row.id, 'co', e.target.value)}
                            disabled={isDisabled}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 disabled:bg-gray-100"
                          />
                        </td>
                        {['po1', 'po2', 'po3', 'po4', 'po5', 'pso1', 'pso2'].map((field) => (
                          <td key={field} className="border border-gray-300 px-4 py-2">
                            <input
                              type="text"
                              value={row[field as keyof CorrelationRow] as string}
                              onChange={(e) => updateCorrelationRow(row.id, field, e.target.value)}
                              placeholder="1-3"
                              disabled={isDisabled}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 disabled:bg-gray-100"
                            />
                          </td>
                        ))}
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          {choData.correlationMatrix.length > 1 && !isDisabled && (
                            <button onClick={() => removeCorrelationRow(row.id)} className="text-red-600 hover:text-red-800">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!isDisabled && (
                <button onClick={addCorrelationRow} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Add Row
                </button>
              )}
            </div>

            {/* 9. Session Plan Table */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Session Plan</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-800">
                      <th className="border border-gray-300 px-4 py-2 text-white font-bold">Lec No.</th>
                      <th className="border border-gray-300 px-4 py-2 text-white font-bold">Topics to be Covered</th>
                      <th className="border border-gray-300 px-4 py-2 text-white font-bold">Component</th>
                      <th className="border border-gray-300 px-4 py-2 text-white font-bold">Method</th>
                      <th className="border border-gray-300 px-4 py-2 text-white font-bold">Date Planned</th>
                      <th className="border border-gray-300 px-4 py-2 text-white font-bold">Date Conducted</th>
                      <th className="border border-gray-300 px-4 py-2 text-white font-bold">Outcome Mapping</th>
                      <th className="border border-gray-300 px-4 py-2 text-white font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {choData.sessionPlan.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                          No sessions added yet. Click "Add Session" to begin.
                        </td>
                      </tr>
                    ) : (
                      choData.sessionPlan.map((session) => (
                        <tr key={session.id}>
                          <td className="border border-gray-300 px-4 py-2 text-center text-gray-900 font-semibold">{session.lectureNo}</td>
                          <td className="border border-gray-300 px-4 py-2">
                            <input
                              type="text"
                              value={session.topics}
                              onChange={(e) => updateSession(session.id, 'topics', e.target.value)}
                              placeholder="Topics..."
                              disabled={isDisabled}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 disabled:bg-gray-100"
                            />
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <select
                              value={session.component}
                              onChange={(e) => updateSession(session.id, 'component', e.target.value)}
                              disabled={isDisabled}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 disabled:bg-gray-100"
                            >
                              <option value="Lecture">Lecture</option>
                              <option value="Lab">Lab</option>
                              <option value="Hands-on">Hands-on</option>
                            </select>
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <input
                              type="text"
                              value={session.method}
                              onChange={(e) => updateSession(session.id, 'method', e.target.value)}
                              placeholder="Method..."
                              disabled={isDisabled}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 disabled:bg-gray-100"
                            />
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <input
                              type="date"
                              value={session.datePlanned}
                              onChange={(e) => updateSession(session.id, 'datePlanned', e.target.value)}
                              disabled={isDisabled}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 disabled:bg-gray-100"
                            />
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <input
                              type="date"
                              value={session.dateConducted}
                              onChange={(e) => updateSession(session.id, 'dateConducted', e.target.value)}
                              disabled={isDisabled}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 disabled:bg-gray-100"
                            />
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <input
                              type="text"
                              value={session.outcomeMapping}
                              onChange={(e) => updateSession(session.id, 'outcomeMapping', e.target.value)}
                              placeholder="CO1, CO2..."
                              disabled={isDisabled}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 disabled:bg-gray-100"
                            />
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            {!isDisabled && (
                              <button onClick={() => removeSession(session.id)} className="text-red-600 hover:text-red-800">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {!isDisabled && (
                <button onClick={addSession} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Add Session
                </button>
              )}
            </div>

          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={generateWordDocument}
              disabled={generating}
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-bold text-lg flex items-center gap-3 disabled:bg-gray-400 transition-all shadow-lg"
            >
              {generating ? (
                <>
                  <Loader className="h-6 w-6 animate-spin" />
                  Generating Document...
                </>
              ) : (
                <>
                  <Download className="h-6 w-6" />
                  Generate & Download Course Handout
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
