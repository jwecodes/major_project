export interface Programme {
  id: string
  name: string
  code: string
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

// In lib/mockData.ts - Update the Course interface
export interface Course {
  id: string
  code: string
  name: string
  programme: string
  semester: number
  credits: number
  facultyId?: string // Remove null, keep only string | undefined
  lecture?: number
  tutorial?: number
  practical?: number
  type?: 'industrial' | 'skill' | 'vac' | 'oe' | 'core' | 'aec' | 'dse' | 'project' | 'int' | 'mooc' | 'other'
  roomNo?: string
  hours?: number
  studentCount?: number
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

// Update the programmes array
export const programmes: Programme[] = [
  {
    id: '1',
    name: 'Computer Science Engineering',
    code: 'CSE', // Add programme code
    duration: 4,
    totalStudents: 120
  },
  {
    id: '2',
    name: 'Mechanical Engineering',
    code: 'ME', // Add programme code
    duration: 4,
    totalStudents: 100
  },
  {
    id: '3',
    name: 'Business Administration',
    code: 'MBA', // Add programme code
    duration: 2,
    totalStudents: 80
  },
  {
    id: '4',
    name: 'Information Technology',
    code: 'IT', // Add new programme
    duration: 4,
    totalStudents: 90
  },
  {
    id: '5',
    name: 'Electronics Engineering',
    code: 'ECE', // Add new programme
    duration: 4,
    totalStudents: 85
  }
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
  {
    id: '1',
    code: 'CS301',
    name: 'Data Structures',
    programme: 'Computer Science Engineering',
    semester: 5,
    credits: 4,
    facultyId: '1',
    lecture: 3,
    tutorial: 1,
    practical: 2,
    type: 'core',
    roomNo: 'LH-101',
    hours: 6,
    studentCount: 60
  },
  {
    id: '2',
    code: 'CS302',
    name: 'Algorithms',
    programme: 'Computer Science Engineering',
    semester: 5,
    credits: 4,
    facultyId: '1',
    lecture: 3,
    tutorial: 1,
    practical: 2,
    type: 'core',
    roomNo: 'LH-102',
    hours: 6,
    studentCount: 55
  },
  {
    id: '3',
    code: 'CS401',
    name: 'Database Systems',
    programme: 'Computer Science Engineering',
    semester: 7,
    credits: 3,
    facultyId: undefined,
    lecture: 2,
    tutorial: 1,
    practical: 2,
    type: 'core',
    roomNo: 'LAB-201',
    hours: 5,
    studentCount: 50
  },
  {
    id: '4',
    code: 'ME301',
    name: 'Thermodynamics',
    programme: 'Mechanical Engineering',
    semester: 3,
    credits: 3,
    facultyId: '2',
    lecture: 3,
    tutorial: 1,
    practical: 0,
    type: 'core',
    roomNo: 'LH-201',
    hours: 4,
    studentCount: 70
  },
  {
    id: '5',
    code: 'MBA501',
    name: 'Marketing Management',
    programme: 'Business Administration',
    semester: 5,
    credits: 3,
    facultyId: '3',
    lecture: 3,
    tutorial: 1,
    practical: 0,
    type: 'core',
    roomNo: 'SR-301',
    hours: 4,
    studentCount: 40
  },
  {
    id: '6',
    code: 'CS501',
    name: 'Machine Learning',
    programme: 'Computer Science Engineering',
    semester: 7,
    credits: 3,
    facultyId: undefined,
    lecture: 2,
    tutorial: 0,
    practical: 2,
    type: 'dse',
    roomNo: 'LAB-301',
    hours: 4,
    studentCount: 45
  }
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