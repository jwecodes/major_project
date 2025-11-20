// // 'use client'

// // import React, { createContext, useContext, useEffect, useState } from 'react'
// // import supabase from '@/lib/supabase'

// // interface User {
// //   id: string
// //   email: string
// //   role: 'ADMIN' | 'FACULTY' | 'STUDENT' | null
// // }

// // interface AuthContextType {
// //   user: User | null
// //   loading: boolean
// //   signInWithOtp: (email: string) => Promise<void>
// //   verifyOtp: (email: string, token: string) => Promise<boolean>
// //   signOut: () => Promise<void>
// // }

// // const AuthContext = createContext<AuthContextType | undefined>(undefined)

// // export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
// //   const [user, setUser] = useState<User | null>(null)
// //   const [loading, setLoading] = useState(true)

// //   useEffect(() => {
// //     const session = supabase.auth.session()
// //     if (session?.user) fetchUser(session.user.id)
// //     setLoading(false)

// //     const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
// //       if (session?.user) fetchUser(session.user.id)
// //       else setUser(null)
// //     })

// //     return () => {
// //       listener?.unsubscribe()
// //     }
// //   }, [])

// //   async function fetchUser(userId: string) {
// //     // Query your backend for user & role info, or Supabase custom claims if any
// //     // For example fetch from your API or Prisma
// //     try {
// //       const response = await fetch('/api/auth/role', {
// //         method: 'GET',
// //         credentials: 'include',
// //       })
// //       if (response.ok) {
// //         const userData = await response.json()
// //         setUser(userData)
// //       }
// //     } catch {
// //       setUser(null)
// //     }
// //   }

// //   async function signInWithOtp(email: string) {
// //     const { error } = await supabase.auth.signInWithOtp({ email })
// //     if (error) throw error
// //   }

// //   async function verifyOtp(email: string, token: string) {
// //     const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
// //     if (error) throw error
// //     return true
// //   }

// //   async function signOut() {
// //     await supabase.auth.signOut()
// //     setUser(null)
// //   }

// //   return (
// //     <AuthContext.Provider
// //       value={{ user, loading, signInWithOtp, verifyOtp, signOut }}
// //     >
// //       {children}
// //     </AuthContext.Provider>
// //   )
// // }

// // export function useAuth() {
// //   const ctx = useContext(AuthContext)
// //   if (!ctx) throw new Error('useAuth must be used within AuthProvider')
// //   return ctx
// // }

// // contexts/AuthContext.tsx
// 'use client'

// import {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   ReactNode,
// } from 'react'
// import { supabase } from '@/lib/supabase'
// import type { User } from '@supabase/supabase-js'

// type Role = 'ADMIN' | 'FACULTY' | 'STUDENT' | null

// interface AuthContextType {
//   user: User | null
//   loading: boolean
//   role: Role
//   signInWithOtp: (email: string) => Promise<void>
//   verifyOtp: (email: string, token: string) => Promise<void>
//   signOut: () => Promise<void>
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined)

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<User | null>(null)
//   const [role, setRole] = useState<Role>(null)
//   const [loading, setLoading] = useState(true)

//   // Initial session + listener
//   useEffect(() => {
//     const init = async () => {
//       const { data, error } = await supabase.auth.getSession()
//       if (!error && data.session) {
//         setUser(data.session.user)
//         await fetchRole()
//       } else {
//         setUser(null)
//         setRole(null)
//       }
//       setLoading(false)
//     }

//     init()

//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange(async (_event, session) => {
//       const newUser = session?.user ?? null
//       setUser(newUser)
//       if (newUser) {
//         await fetchRole()
//       } else {
//         setRole(null)
//       }
//     })

//     return () => {
//       subscription.unsubscribe()
//     }
//   }, [])

//   // Fetch role from your API (backed by Prisma)
//   async function fetchRole() {
//     try {
//       const res = await fetch('/api/auth/role', { credentials: 'include' })
//       if (!res.ok) {
//         setRole(null)
//         return
//       }
//       const data = await res.json()
//       // Expecting something like { role: 'ADMIN' }
//       setRole(data.role as Role)
//     } catch {
//       setRole(null)
//     }
//   }

//   async function signInWithOtp(email: string) {
//     const { error } = await supabase.auth.signInWithOtp({
//       email,
//       options: {
//         shouldCreateUser: false,
//       },
//     })
//     if (error) throw error
//   }

//   async function verifyOtp(email: string, token: string) {
//     const { error } = await supabase.auth.verifyOtp({
//       email,
//       token,
//       type: 'email',
//     })
//     if (error) throw error
//     await fetchRole()
//   }

//   async function signOut() {
//     await supabase.auth.signOut()
//     setUser(null)
//     setRole(null)
//   }

//   return (
//     <AuthContext.Provider
//       value={{ user, loading, role, signInWithOtp, verifyOtp, signOut }}
//     >
//       {children}
//     </AuthContext.Provider>
//   )
// }

// export function useAuth() {
//   const ctx = useContext(AuthContext)
//   if (!ctx) throw new Error('useAuth must be used within AuthProvider')
//   return ctx
// }

'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

type Role = 'ADMIN' | 'FACULTY' | 'STUDENT'

interface AuthContextType {
  user: User | null
  loading: boolean
  currentRole: Role | null
  availableRoles: Role[]
  isMultiRole: boolean
  signInWithOtp: (email: string) => Promise<void>
  verifyOtp: (email: string, token: string) => Promise<void>
  signOut: () => Promise<void>
  switchRole: (role: Role) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [currentRole, setCurrentRole] = useState<Role | null>(null)
  const [availableRoles, setAvailableRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)

  const isMultiRole = availableRoles.length > 1

  useEffect(() => {
    const init = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (!error && data.session) {
        setUser(data.session.user)
        await fetchRoles()
      }
      setLoading(false)
    }
    init()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchRoles()
      } else {
        setCurrentRole(null)
        setAvailableRoles([])
      }
    })
    return () => subscription?.unsubscribe()
  }, [])

  async function fetchRoles() {
    try {
      const res = await fetch('/api/auth/role', { credentials: 'include' })
      if (!res.ok) {
        setCurrentRole(null)
        setAvailableRoles([])
        return
      }
      const data = await res.json()
      setAvailableRoles(data.roles || [])
      const savedRole = localStorage.getItem('selectedRole')
      if (savedRole && data.roles.includes(savedRole)) {
        setCurrentRole(savedRole as Role)
      } else {
        setCurrentRole(data.currentRole)
      }
    } catch {
      setCurrentRole(null)
      setAvailableRoles([])
    }
  }

  async function signInWithOtp(email: string) {
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } })
    if (error) throw error
  }

  async function verifyOtp(email: string, token: string) {
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
    if (error) throw error
    await fetchRoles()
  }

  async function signOut() {
    await supabase.auth.signOut()
    localStorage.removeItem('selectedRole')
    setUser(null)
    setCurrentRole(null)
    setAvailableRoles([])
  }

  function switchRole(role: Role) {
    if (availableRoles.includes(role)) {
      setCurrentRole(role)
      localStorage.setItem('selectedRole', role)
    }
  }

  return (
    <AuthContext.Provider value={{
      user, loading, currentRole, availableRoles, isMultiRole,
      signInWithOtp, verifyOtp, signOut, switchRole
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
