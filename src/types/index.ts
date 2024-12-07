// 用户相关类型
export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

// 需求相关类型
export interface Requirement {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  author: User
  status: RequirementStatus
  aiAnalysis?: AIAnalysis
  createdAt: string
  updatedAt: string
}

export enum RequirementStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ANALYZING = 'analyzing',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

// AI 分析相关类型
export interface AIAnalysis {
  id: string
  requirementId: string
  feasibility: string
  techStack: string[]
  timeline: string
  suggestions: string[]
  createdAt: string
}

// API 响应类型
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

// 分页相关类型
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

// 过滤和搜索相关类型
export interface RequirementFilters {
  category?: string
  tags?: string[]
  status?: RequirementStatus
  author?: string
  searchQuery?: string
  dateRange?: {
    start: string
    end: string
  }
}

// 认证相关类型
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData extends LoginCredentials {
  username: string
  passwordConfirmation: string
}

export interface AuthResponse {
  user: User
  token: string
} 