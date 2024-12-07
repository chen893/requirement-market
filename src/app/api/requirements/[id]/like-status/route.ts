import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { validateToken } from '@/lib/jwt'

// 获取点赞状态
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // 验证用户身份
    const authorization = request.headers.get('Authorization')
    if (!authorization) {
      return NextResponse.json({
        success: true,
        data: { liked: false },
      })
    }

    const payload = await validateToken(authorization)
    if (!payload || !payload.userId) {
      return NextResponse.json({
        success: true,
        data: { liked: false },
      })
    }

    // 检查是否已点赞
    const like = await prisma.like.findUnique({
      where: {
        userId_requirementId: {
          userId: payload.userId,
          requirementId: id,
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: { liked: !!like },
    })
  } catch (error) {
    console.error('Get like status error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '获取点赞状态失败，请稍后重试',
        },
      },
      { status: 500 }
    )
  }
}

// 切换点赞状态
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // 验证用户身份
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
        { status: 401 }
      )
    }

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
        { status: 401 }
      )
    }

    // 检查需求是否存在
    const requirement = await prisma.requirement.findUnique({
      where: { id },
    })

    if (!requirement) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '需求不存在',
          },
        },
        { status: 404 }
      )
    }

    // 检查是否已点赞
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_requirementId: {
          userId: payload.userId,
          requirementId: id,
        },
      },
    })

    if (existingLike) {
      // 取消点赞
      await prisma.like.delete({
        where: {
          userId_requirementId: {
            userId: payload.userId,
            requirementId: id,
          },
        },
      })

      return NextResponse.json({
        success: true,
        data: { liked: false },
      })
    } else {
      // 添加点赞
      await prisma.like.create({
        data: {
          userId: payload.userId,
          requirementId: id,
        },
      })

      return NextResponse.json({
        success: true,
        data: { liked: true },
      })
    }
  } catch (error) {
    console.error('Toggle like error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '操作失败，请稍后重试',
        },
      },
      { status: 500 }
    )
  }
} 