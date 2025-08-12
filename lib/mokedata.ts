export interface Programme {
  id: string
  name: string
  department: string
  duration: number
  totalStudents: number
}

export interface Faculty {
  id: string
  name: string
  employeeId: string
  department: string
  email: string
  courses: string[]
}

export interface Student {
  id: string
  name: string
  rollNumber: string
  programme: string
  year: number
  email: string
}

export interface Course {
  id: string
  name: string
  code: string
  credits: number
  semester: number
  programme: string
  faculty: string
  facultyId: string | null  // Added facultyId property
}

export interface CourseAssignment {
  courseId: string
  facultyId: string
  assignedDate: string
}

export interface TimeSlot {
  id: string
  day: string
  startTime: string
  endTime: string
  courseId: string
  facultyId: string
  room: string
  programmeId: string
  semester: number
  section?: string
}

export interface Room {
  id: string
  name: string
  capacity: number
  type: 'Lecture Hall' | 'Lab' | 'Tutorial Room' | 'Seminar Room'
  building: string
}

export interface AcademicContent {
  id: string
  title: string
  description: string
  type: 'assignment' | 'ppt' | 'handbook' | 'question_paper' | 'notes' | 'video' | 'other'
  courseId: string
  facultyId: string
  fileUrl: string
  fileName: string
  fileSize: string
  uploadedAt: string
  isPublished: boolean
  downloadCount: number
  // New fields for approval workflow
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'needs_revision'
  reviewedBy?: string // Admin ID who reviewed
  reviewedAt?: string
  reviewComments?: string
  submittedAt: string
}

export const programmes: Programme[] = [
  { id: '1', name: 'Computer Science Engineering', department: 'Engineering', duration: 4, totalStudents: 120 },
  { id: '2', name: 'Mechanical Engineering', department: 'Engineering', duration: 4, totalStudents: 95 },
  { id: '3', name: 'Business Administration', department: 'Management', duration: 3, totalStudents: 80 },
  { id: '4', name: 'English Literature', department: 'Arts', duration: 3, totalStudents: 60 }
]

export const faculties: Faculty[] = [
  { 
    id: '1', 
    name: 'Dr. John Smith', 
    employeeId: 'FAC001', 
    department: 'Engineering', 
    email: 'john.smith@university.edu',
    courses: ['Data Structures', 'Algorithms', 'Database Systems']
  },
  { 
    id: '2', 
    name: 'Prof. Sarah Johnson', 
    employeeId: 'FAC002', 
    department: 'Engineering', 
    email: 'sarah.johnson@university.edu',
    courses: ['Thermodynamics', 'Fluid Mechanics']
  },
  { 
    id: '3', 
    name: 'Dr. Michael Brown', 
    employeeId: 'FAC003', 
    department: 'Management', 
    email: 'michael.brown@university.edu',
    courses: ['Marketing', 'Finance']
  }
]

export const students: Student[] = [
  { id: '1', name: 'Alice Wilson', rollNumber: 'CS2021001', programme: 'Computer Science Engineering', year: 3, email: 'alice@student.university.edu' },
  { id: '2', name: 'Bob Davis', rollNumber: 'CS2021002', programme: 'Computer Science Engineering', year: 3, email: 'bob@student.university.edu' },
  { id: '3', name: 'Charlie Miller', rollNumber: 'ME2022001', programme: 'Mechanical Engineering', year: 2, email: 'charlie@student.university.edu' },
  { id: '4', name: 'Diana Garcia', rollNumber: 'BA2020001', programme: 'Business Administration', year: 4, email: 'diana@student.university.edu' }
]

export const courses: Course[] = [
  { id: '1', name: 'Data Structures', code: 'CS301', credits: 4, semester: 5, programme: 'Computer Science Engineering', faculty: 'Dr. John Smith', facultyId: '1' },
  { id: '2', name: 'Algorithms', code: 'CS302', credits: 4, semester: 5, programme: 'Computer Science Engineering', faculty: 'Dr. John Smith', facultyId: '1' },
  { id: '3', name: 'Database Systems', code: 'CS401', credits: 3, semester: 7, programme: 'Computer Science Engineering', faculty: 'Dr. John Smith', facultyId: '1' },
  { id: '4', name: 'Thermodynamics', code: 'ME201', credits: 4, semester: 3, programme: 'Mechanical Engineering', faculty: 'Prof. Sarah Johnson', facultyId: '2' },
  { id: '5', name: 'Marketing', code: 'BA301', credits: 3, semester: 5, programme: 'Business Administration', faculty: 'Dr. Michael Brown', facultyId: '3' },
  { id: '6', name: 'Fluid Mechanics', code: 'ME301', credits: 4, semester: 5, programme: 'Mechanical Engineering', faculty: 'Prof. Sarah Johnson', facultyId: '2' },
  { id: '7', name: 'Finance', code: 'BA201', credits: 3, semester: 3, programme: 'Business Administration', faculty: 'Dr. Michael Brown', facultyId: '3' },
  { id: '8', name: 'Operating Systems', code: 'CS501', credits: 4, semester: 9, programme: 'Computer Science Engineering', faculty: 'Unassigned', facultyId: null }
]

// Add these to your existing exports
export const timeSlots: TimeSlot[] = [
  {
    id: '1',
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:30',
    courseId: '1', // Data Structures
    facultyId: '1', // Dr. John Smith
    room: 'LH-101',
    programmeId: '1', // Computer Science Engineering
    semester: 5,
    section: 'A'
  },
  {
    id: '2',
    day: 'Monday',
    startTime: '10:45',
    endTime: '12:15',
    courseId: '2', // Algorithms
    facultyId: '1', // Dr. John Smith
    room: 'LH-102',
    programmeId: '1',
    semester: 5,
    section: 'A'
  },
  {
    id: '3',
    day: 'Tuesday',
    startTime: '09:00',
    endTime: '10:30',
    courseId: '4', // Thermodynamics
    facultyId: '2', // Prof. Sarah Johnson
    room: 'LH-201',
    programmeId: '2', // Mechanical Engineering
    semester: 3,
    section: 'A'
  },
  {
    id: '4',
    day: 'Wednesday',
    startTime: '14:00',
    endTime: '15:30',
    courseId: '5', // Marketing
    facultyId: '3', // Dr. Michael Brown
    room: 'SR-301',
    programmeId: '3', // Business Administration
    semester: 5,
    section: 'A'
  }
]

export const rooms: Room[] = [
  { id: '1', name: 'LH-101', capacity: 120, type: 'Lecture Hall', building: 'Main Block' },
  { id: '2', name: 'LH-102', capacity: 120, type: 'Lecture Hall', building: 'Main Block' },
  { id: '3', name: 'LH-201', capacity: 80, type: 'Lecture Hall', building: 'Engineering Block' },
  { id: '4', name: 'LAB-301', capacity: 40, type: 'Lab', building: 'Engineering Block' },
  { id: '5', name: 'SR-301', capacity: 50, type: 'Seminar Room', building: 'Management Block' },
  { id: '6', name: 'TR-401', capacity: 30, type: 'Tutorial Room', building: 'Arts Block' }
]

export const timeSlotOptions = [
  { start: '09:00', end: '10:30' },
  { start: '10:45', end: '12:15' },
  { start: '13:00', end: '14:30' },
  { start: '14:45', end: '16:15' },
  { start: '16:30', end: '18:00' }
]

export const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Update your existing academicContent array with approval status
export const academicContent: AcademicContent[] = [
  {
    id: '1',
    title: 'Introduction to Data Structures',
    description: 'Basic concepts and fundamentals of data structures',
    type: 'ppt',
    courseId: '1',
    facultyId: '1',
    fileUrl: '/content/ds-intro.pptx',
    fileName: 'DS_Introduction.pptx',
    fileSize: '2.5 MB',
    uploadedAt: '2024-01-15',
    submittedAt: '2024-01-14',
    isPublished: true,
    downloadCount: 45,
    approvalStatus: 'approved',
    reviewedBy: 'admin1',
    reviewedAt: '2024-01-15',
    reviewComments: 'Good content, approved for publication'
  },
  {
    id: '2',
    title: 'Assignment 1: Arrays and Linked Lists',
    description: 'Programming assignment on basic data structures',
    type: 'assignment',
    courseId: '1',
    facultyId: '1',
    fileUrl: '/content/assignment1.pdf',
    fileName: 'Assignment_1.pdf',
    fileSize: '1.2 MB',
    uploadedAt: '2024-01-20',
    submittedAt: '2024-01-20',
    isPublished: false,
    downloadCount: 0,
    approvalStatus: 'pending',
  },
  {
    id: '3',
    title: 'Advanced Algorithms Presentation',
    description: 'Complex algorithms and their implementations',
    type: 'ppt',
    courseId: '2',
    facultyId: '1',
    fileUrl: '/content/advanced-algo.pptx',
    fileName: 'Advanced_Algorithms.pptx',
    fileSize: '3.8 MB',
    uploadedAt: '',
    submittedAt: '2024-02-05',
    isPublished: false,
    downloadCount: 0,
    approvalStatus: 'rejected',
    reviewedBy: 'admin1',
    reviewedAt: '2024-02-06',
    reviewComments: 'Please include more practical examples and reduce theoretical content'
  },
  {
    id: '4',
    title: 'Database Design Handbook',
    description: 'Comprehensive guide to database design principles',
    type: 'handbook',
    courseId: '3',
    facultyId: '1',
    fileUrl: '/content/db-handbook.pdf',
    fileName: 'DB_Handbook.pdf',
    fileSize: '4.2 MB',
    uploadedAt: '',
    submittedAt: '2024-02-08',
    isPublished: false,
    downloadCount: 0,
    approvalStatus: 'needs_revision',
    reviewedBy: 'admin1',
    reviewedAt: '2024-02-09',
    reviewComments: 'Good content but needs formatting improvements and more diagrams'
  }
]

export const approvalStatuses = [
  { value: 'pending', label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
  { value: 'needs_revision', label: 'Needs Revision', color: 'bg-orange-100 text-orange-800' }
]

export const contentTypes = [
  { value: 'assignment', label: 'Assignment', icon: '📄' },
  { value: 'ppt', label: 'Presentation', icon: '📊' },
  { value: 'handbook', label: 'Course Handbook', icon: '📚' },
  { value: 'question_paper', label: 'Question Paper', icon: '❓' },
  { value: 'notes', label: 'Lecture Notes', icon: '📝' },
  { value: 'video', label: 'Video Content', icon: '🎥' },
  { value: 'other', label: 'Other', icon: '📎' }
]