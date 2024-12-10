import { Requirement } from './requirement'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
}

export interface ApiError {
  code: string
  message: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface FetchOptions extends RequestInit {
  requireAuth?: boolean
}

export interface RequirementListResponse {
  items: Requirement[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
