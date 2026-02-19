/**
 * Shared type definitions
 */

import { UserRole } from "@/lib/constants"

// User types
export interface User {
  id: string
  name: string | null
  email: string
  phone: string | null
  image: string | null
  role: UserRole
  emailVerified: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface SessionUser {
  id: string
  name: string | null
  email: string
  image: string | null
  role: UserRole
}

// API Response types
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Form types
export interface FormError {
  field: string
  message: string
}

