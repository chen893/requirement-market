import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { validateToken } from '@/lib/jwt'

// 不需要认证的路径
const publicPaths = ['/login', '/register', '/forgot-password', '/']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 如果是公开路径，直接放行
  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  // 如果是 API 路由，检查 Authorization header
  if (pathname.startsWith('/api/')) {
    // 如果是 auth 相关的 API，直接放行
    if (pathname.startsWith('/api/auth/')) {
      return NextResponse.next()
    }

    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '未登录',
          },
        },
        { status: 401 },
      )
    }

    try {
      const payload = await validateToken(authHeader)
      if (!payload) {
        throw new Error('Invalid token')
      }
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: '登录已过期，请重新登录',
          },
        },
        { status: 401 },
      )
    }

    return NextResponse.next()
  }

  // 对于页面路由，检查 cookie ��的 token
  const token = request.cookies.get('token')?.value

  if (!token) {
    const url = new URL('/login', request.url)
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  try {
    const payload = await validateToken(`Bearer ${token}`)
    if (!payload) {
      throw new Error('Invalid token')
    }
  } catch (error) {
    const url = new URL('/login', request.url)
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// 配置需要进行认证检查的路径
export const config = {
  matcher: [
    /*
     * 匹配所有需要认证的路径
     * - /api/auth/login, /api/auth/register 等不需要认证
     * - /_next 静态文件不需要认证
     * - /favicon.ico 不需要认证
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}
