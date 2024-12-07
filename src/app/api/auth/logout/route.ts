import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // 创建响应对象
    const response = NextResponse.json(
      {
        success: true,
        message: '注销成功',
      },
      { status: 200 }
    )

    // 删除 token cookie
    response.cookies.delete('token')

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '注销失败，请稍后重试',
        },
      },
      { status: 500 }
    )
  }
} 