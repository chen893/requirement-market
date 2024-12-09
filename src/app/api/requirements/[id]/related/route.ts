import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

// 获取相关需求
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params

    // 获取当前需求的标签
    const currentRequirement = await prisma.requirement.findUnique({
      where: { id },
      include: {
        tags: true,
      },
    })

    if (!currentRequirement) {
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

    // 获取具有相同标签的其他需求
    const relatedRequirements = await prisma.requirement.findMany({
      where: {
        id: { not: id }, // 排除当前需求
        tags: {
          some: {
            id: {
              in: currentRequirement.tags.map((tag) => tag.id),
            },
          },
        },
      },
      take: 5, // 最多返回5个相关需求
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        status: true,
        budget: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: relatedRequirements,
    })
  } catch (error) {
    console.error('Get related requirements error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '获取相关需求失败，请稍后重试',
        },
      },
      { status: 500 },
    )
  }
}
