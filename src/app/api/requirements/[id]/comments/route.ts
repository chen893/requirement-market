import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { validateToken } from '@/lib/jwt'

// 获取评论列表
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params

    const comments = await prisma.comment.findMany({
      where: { requirementId: id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: comments,
    })
  } catch (error) {
    console.error('Get comments error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '获取评论列表失败，请稍后重试',
        },
      },
      { status: 500 },
    )
  }
}

// 发布评论
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
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
        { status: 401 },
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
        { status: 401 },
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
        { status: 404 },
      )
    }

    // 解析请求数据
    const body = await request.json()
    const { content } = body

    // 验证评论内容
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CONTENT',
            message: '评论内容不能为空',
          },
        },
        { status: 400 },
      )
    }

    if (content.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CONTENT',
            message: '评论内容不能超过1000个字符',
          },
        },
        { status: 400 },
      )
    }

    // 创建评论
    const comment = await prisma.comment.create({
      data: {
        content,
        userId: payload.userId,
        requirementId: id,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: comment,
    })
  } catch (error) {
    console.error('Create comment error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '发布评论失败，请稍后重试',
        },
      },
      { status: 500 },
    )
  }
}
