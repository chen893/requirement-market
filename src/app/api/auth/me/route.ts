import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { validateToken } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    // 从请求头中获取 token
    const authorization = request.headers.get('Authorization')

    if (!authorization) {
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

    // 验证 token
    const payload = await validateToken(authorization)

    if (!payload || !payload.userId) {
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

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: '用户不存在',
          },
        },
        { status: 404 },
      )
    }

    // 返回用户信息
    return NextResponse.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error('Get current user error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '获取用户信息失败，请稍后重试',
        },
      },
      { status: 500 },
    )
  }
}
