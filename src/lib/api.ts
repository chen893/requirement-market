import axios from 'axios'
import type {
  ApiResponse,
  AuthResponse,
  LoginCredentials,
  PaginatedResponse,
  RegisterData,
  Requirement,
  RequirementFilters,
  User,
} from '@/types'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  },
)

// 认证相关 API
export const auth = {
  async login(
    credentials: LoginCredentials,
  ): Promise<ApiResponse<AuthResponse>> {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  async logout(): Promise<void> {
    localStorage.removeItem('token')
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await api.get('/auth/me')
    return response.data
  },
}

// 需求相关 API
export const requirements = {
  async getAll(
    filters?: RequirementFilters,
  ): Promise<ApiResponse<PaginatedResponse<Requirement>>> {
    const response = await api.get('/requirements', { params: filters })
    return response.data
  },

  async getById(id: string): Promise<ApiResponse<Requirement>> {
    const response = await api.get(`/requirements/${id}`)
    return response.data
  },

  async create(data: Partial<Requirement>): Promise<ApiResponse<Requirement>> {
    const response = await api.post('/requirements', data)
    return response.data
  },

  async update(
    id: string,
    data: Partial<Requirement>,
  ): Promise<ApiResponse<Requirement>> {
    const response = await api.put(`/requirements/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/requirements/${id}`)
    return response.data
  },
}

// AI 分析相关 API
export const ai = {
  async analyzeRequirement(id: string): Promise<ApiResponse<Requirement>> {
    const response = await api.post(`/ai/analyze/${id}`)
    return response.data
  },
}

// 用户相关 API
export const users = {
  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await api.put('/users/profile', data)
    return response.data
  },

  async updatePassword(data: {
    currentPassword: string
    newPassword: string
  }): Promise<ApiResponse<void>> {
    const response = await api.put('/users/password', data)
    return response.data
  },
}

export default api
