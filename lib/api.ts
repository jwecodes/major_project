const API_BASE_URL = '/api'

export const api = {
  programmes: {
    async getAll(session: string) {
      const response = await fetch(`${API_BASE_URL}/programmes?session=${encodeURIComponent(session)}`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch programmes')
      }
      
      return response.json()
    },

    async create(data: {
      session: string
      programmeCode: string  // Keep this field name
      programmeName: string  // Keep this field name
      duration: number
      noOfStudents?: number
    }) {
      const response = await fetch(`${API_BASE_URL}/programmes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create programme')
      }

      return response.json()
    },

    async update(id: number, data: any) {
      const response = await fetch(`${API_BASE_URL}/programmes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update programme')
      }

      return response.json()
    },

    async delete(id: number) {
      const response = await fetch(`${API_BASE_URL}/programmes/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete programme')
      }

      return response.json()
    },

    async createBulk(programmes: any[]) {
      const response = await fetch(`${API_BASE_URL}/programmes/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programmes })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload programmes')
      }
      
      return response.json()
    }
  },

  courses: {
    async getAll(programmeCode: string) {
      const response = await fetch(`${API_BASE_URL}/courses?programmeCode=${encodeURIComponent(programmeCode)}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch courses')
      }
      return response.json()
    },

    async create(data: any) {
      const response = await fetch(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create course')
      }
      return response.json()
    },

    async createBulk(courses: any[]) {
      try {
        const response = await fetch(`${API_BASE_URL}/courses/bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courses })
        })
        
        if (!response.ok) {
          let errorMessage = 'Failed to upload courses'
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          } catch {
            const errorText = await response.text()
            console.error('Non-JSON error response:', errorText)
            errorMessage = `Server error (${response.status}): ${response.statusText}`
          }
          throw new Error(errorMessage)
        }
        
        return await response.json()
      } catch (error: any) {
        console.error('Bulk upload error:', error)
        throw error
      }
    },

    async getAllBasic() {
      const response = await fetch(`${API_BASE_URL}/courses/basic`)
      if (!response.ok) throw new Error('Failed to fetch courses')
      return response.json()
    }
  },

  // Updated Faculty Assignment API
  facultyAssignments: {
    async getAll(session?: string, programmeCode?: string) {
      const params = new URLSearchParams()
      if (session) params.set('session', session)
      if (programmeCode) params.set('programmeCode', programmeCode)

      const response = await fetch(`${API_BASE_URL}/faculty-assignments?${params}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch faculty assignments')
      }
      return response.json()
    },

    async create(data: {
      session: string
      programmeId: number
      courseId: number
      facultyId: number
      role: 'coordinator' | 'contributor'
      assignedBy: string
    }) {
      const response = await fetch(`${API_BASE_URL}/faculty-assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create assignment')
      }
      return response.json()
    },

    async delete(id: number) {
      const response = await fetch(`${API_BASE_URL}/faculty-assignments/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete assignment')
      }
      return response.json()
    }
  },

  courseCoordination: {
    async getCoursesWithAssignments(params: { session?: string, programmeCode?: string }) {
      const queryParams = new URLSearchParams()
      if (params.session) queryParams.set('session', params.session)
      if (params.programmeCode) queryParams.set('programmeCode', params.programmeCode)

      const response = await fetch(`${API_BASE_URL}/course-coordination?${queryParams}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch course coordination data')
      }
      return response.json()
    },

    async assignFaculty(data: {
      courseId: number
      facultyId: number
      role: 'coordinator' | 'contributor'
      assignedBy: string
    }) {
      const response = await fetch(`${API_BASE_URL}/course-coordination`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to assign faculty')
      }
      return response.json()
    },

    async removeAssignment(assignmentId: number) {
      const response = await fetch(`${API_BASE_URL}/course-coordination/${assignmentId}`, {
        method: 'DELETE'
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to remove assignment')
      }
      return response.json()
    }
  },

  documents: {
    async getAll(filters: { courseId?: string, fileType?: string, search?: string } = {}) {
      const queryParams = new URLSearchParams()
      if (filters.courseId) queryParams.set('courseId', filters.courseId)
      if (filters.fileType) queryParams.set('fileType', filters.fileType)
      if (filters.search) queryParams.set('search', filters.search)

      const response = await fetch(`${API_BASE_URL}/documents?${queryParams}`)
      if (!response.ok) throw new Error('Failed to fetch documents')
      return response.json()
    },

    async upload(formData: FormData) {
      const response = await fetch(`${API_BASE_URL}/documents`, {
        method: 'POST',
        body: formData
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload document')
      }
      return response.json()
    },

    async download(documentId: number) {
      const response = await fetch(`${API_BASE_URL}/documents/${documentId}/download`)
      if (!response.ok) throw new Error('Failed to download document')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `document-${documentId}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    },

    async delete(documentId: number) {
      const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete document')
      return response.json()
    }
  },

  faculty: {
    async getAll(department?: string, designation?: string) {
      const params = new URLSearchParams()
      if (department) params.append('department', department)
      if (designation) params.append('designation', designation)
      
      const response = await fetch(`${API_BASE_URL}/faculties?${params}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch faculty')
      }
      return response.json()
    },

    async getById(id: number) {
      const response = await fetch(`${API_BASE_URL}/faculties/${id}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch faculty details')
      }
      return response.json()
    },

    async create(data: any) {
      const response = await fetch(`${API_BASE_URL}/faculties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create faculty')
      }
      return response.json()
    },

    async update(id: number, data: any) {
      const response = await fetch(`${API_BASE_URL}/faculties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update faculty')
      }
      return response.json()
    },

    async delete(id: number) {
      const response = await fetch(`${API_BASE_URL}/faculties/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete faculty')
      }
      return response.json()
    },

    async getCourseAssignments(facultyId: number) {
      const response = await fetch(`${API_BASE_URL}/faculties/${facultyId}/courses`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch course assignments')
      }
      return response.json()
    },

    async createBulk(faculty: any[]) {
      const response = await fetch(`${API_BASE_URL}/faculties/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faculty })
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to bulk import faculty')
      }
      return response.json()
    }
  },

  academicSessions: {
    async getAll() {
      const response = await fetch(`${API_BASE_URL}/academic-sessions`)
      if (!response.ok) throw new Error('Failed to fetch academic sessions')
      return response.json()
    },

    async create(data: {
      sessionCode: string
      sessionName: string
      startDate: string
      endDate: string
    }) {
      const response = await fetch(`${API_BASE_URL}/academic-sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create academic session')
      }
      return response.json()
    }
  },

  utils: {
    async healthCheck() {
      const response = await fetch(`${API_BASE_URL}/health`)
      if (!response.ok) throw new Error('API health check failed')
      return response.json()
    },

    async getStats() {
      const response = await fetch(`${API_BASE_URL}/stats`)
      if (!response.ok) throw new Error('Failed to fetch stats')
      return response.json()
    }
  },

  bulk: {
    async importData(type: string, data: any[]) {
      const response = await fetch(`${API_BASE_URL}/bulk/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data })
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `Failed to import ${type}`)
      }
      return response.json()
    }
  }
}
