interface FetchOptions extends RequestInit {
  requireAuth?: boolean
}

interface ApiError {
  code: string
  message: string
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
}

class ApiClient {
  private baseUrl: string
  private defaultOptions: FetchOptions

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl
    this.defaultOptions = {
      requireAuth: true,
    }
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('token')
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data: ApiResponse<T> = await response.json()

    if (!response.ok) {
      // 如果是 401 错误，清除 token 并刷新页面
      if (response.status === 401) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
      throw new Error(data.error?.message || '请求失败')
    }

    return data.data as T
  }

  async fetch<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const url = this.baseUrl + endpoint
    const token = this.getToken()
    const requireAuth = options.requireAuth ?? this.defaultOptions.requireAuth

    const headers = new Headers(options.headers)
    headers.set('Content-Type', 'application/json')

    // 如果需要认证且有 token，添加到请求头
    if (requireAuth && token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    return this.handleResponse<T>(response)
  }

  // GET 请求
  async get<T>(endpoint: string, options: FetchOptions = {}) {
    return this.fetch<T>(endpoint, {
      ...options,
      method: 'GET',
    })
  }

  // POST 请求
  async post<T>(endpoint: string, data?: any, options: FetchOptions = {}) {
    return this.fetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // PUT 请求
  async put<T>(endpoint: string, data?: any, options: FetchOptions = {}) {
    return this.fetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // DELETE 请求
  async delete<T>(endpoint: string, options: FetchOptions = {}) {
    return this.fetch<T>(endpoint, {
      ...options,
      method: 'DELETE',
    })
  }
}

// 创建一个单例实例
const apiClient = new ApiClient('/api')

export default apiClient 