import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { validateToken } from '@/lib/jwt'

// 获取需求详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params

    const requirement = await prisma.requirement.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        tags: true,
        comments: {
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
            created_at: 'desc',
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
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

    return NextResponse.json({
      success: true,
      data: requirement,
    })
  } catch (error) {
    console.error('Get requirement error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '获取需求详情失败，请稍后重试',
        },
      },
      { status: 500 },
    )
  }
}

// 更新需求
export async function PUT(
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
    const existingRequirement = await prisma.requirement.findUnique({
      where: { id },
    })

    if (!existingRequirement) {
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

    // 检查是否是需求的创建者
    if (existingRequirement.user_id !== payload.userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: '无权修改此需求',
          },
        },
        { status: 403 },
      )
    }

    // 解析请求数据
    const body = await request.json()
    const { title, description, budget, deadline, status, tags } = body

    // 验证必填字段
    if (!title || !description) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_FIELDS',
            message: '请填写所有必填字段',
          },
        },
        { status: 400 },
      )
    }

    // 验证标题长度
    if (title.length < 5 || title.length > 100) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TITLE',
            message: '标题长度必须在 5-100 个字符之间',
          },
        },
        { status: 400 },
      )
    }

    // 验证描述长度
    if (description.length < 20 || description.length > 5000) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_DESCRIPTION',
            message: '描述长度必须在 20-5000 个字符之间',
          },
        },
        { status: 400 },
      )
    }

    // 验证预算
    if (budget && (isNaN(budget) || budget < 0)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_BUDGET',
            message: '预算必须是大于等于 0 的数字',
          },
        },
        { status: 400 },
      )
    }

    // 验证截止日期
    if (deadline) {
      const deadlineDate = new Date(deadline)
      if (isNaN(deadlineDate.getTime()) || deadlineDate < new Date()) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_DEADLINE',
              message: '截止日期必须是未来的日期',
            },
          },
          { status: 400 },
        )
      }
    }

    // 验证状态
    const validStatuses = ['open', 'in_progress', 'completed', 'cancelled']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: '无效的状态',
          },
        },
        { status: 400 },
      )
    }

    // 更新需求
    const requirement = await prisma.requirement.update({
      where: { id },
      data: {
        title,
        description,
        budget: budget ? parseFloat(budget) : null,
        deadline: deadline ? new Date(deadline) : null,
        status: status || undefined,
        // 如果提供了标签，更新标签
        tags: tags
          ? {
              set: [], // 先清除所有标签
              connectOrCreate: tags.map((tag: string) => ({
                where: { name: tag },
                create: { name: tag },
              })),
            }
          : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        tags: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: requirement,
    })
  } catch (error) {
    console.error('Update requirement error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '更新需求失败，请稍后重试',
        },
      },
      { status: 500 },
    )
  }
}

// 删除需求
export async function DELETE(
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
    const existingRequirement = await prisma.requirement.findUnique({
      where: { id },
    })

    if (!existingRequirement) {
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

    // 检查是否是需求的创建者
    if (existingRequirement.user_id !== payload.userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: '无权删除此需求',
          },
        },
        { status: 403 },
      )
    }

    // 删除需求
    await prisma.requirement.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: '需求已删除',
    })
  } catch (error) {
    console.error('Delete requirement error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '删除需求失败，请稍后重试',
        },
      },
      { status: 500 },
    )
  }
}
