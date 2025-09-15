// lib/api.ts
export const programmeApi = {
  getAll: async (session?: string) => {
    const url = session 
      ? `/api/programmes?session=${encodeURIComponent(session)}`
      : '/api/programmes'
    
    const response = await fetch(url, {
      cache: 'no-store' // Always fetch fresh data
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch programmes')
    }
    
    return response.json()
  },

  create: async (data: {
    name: string
    code: string
    duration: number
    session: string
  }) => {
    const response = await fetch('/api/programmes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create programme')
    }

    return response.json()
  }
}
