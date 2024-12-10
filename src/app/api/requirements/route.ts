import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { validateToken } from '@/lib/jwt'

// 创建需求
export async function POST(request: NextRequest) {
  try {
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

    // 解析请求数据
    const body = await request.json()
    const { title, description, budget, deadline, tags } = body

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
              message: '截止日期必须是未来的���期',
            },
          },
          { status: 400 },
        )
      }
    }

    // 创建需求
    const requirement = await prisma.requirement.create({
      data: {
        title,
        description,
        budget: budget ? parseFloat(budget) : null,
        deadline: deadline ? new Date(deadline) : null,
        userId: payload.userId,
        // 修改标签处理逻辑
        tags:
          tags && tags.length > 0
            ? {
                connectOrCreate: tags.map((tagName: string) => ({
                  where: { name: tagName },
                  create: { name: tagName },
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
    console.error('Create requirement error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '创建需求失败，请稍后重试',
        },
      },
      { status: 500 },
    )
  }
}

// 获取需求列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const tag = searchParams.get('tag')
    const search = searchParams.get('search')

    // 构建查询条件
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}
    if (status) {
      where.status = status
    }
    if (tag) {
      where.tags = {
        some: {
          name: tag,
        },
      }
    }
    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ]
    }

    // 获取总数
    const total = await prisma.requirement.count({ where })

    // 获取需求列表
    const requirements = await prisma.requirement.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
            createdAt: true,
          },
        },
        tags: true,
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    // 处理返回数据，将 tags 数组格式化
    const formattedRequirements = requirements.map((requirement) => {
      const { tags, ...rest } = requirement
      return {
        ...rest,
        tags: tags.map((tag) => tag.name),
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        items: formattedRequirements,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get requirements error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '获取需求列表失败，请稍后重试',
        },
      },
      { status: 500 },
    )
  }
}
