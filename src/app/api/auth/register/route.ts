import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword } from '@/lib/password'
import { isValidEmail } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, email, password } = body

    // 验证必填字段
    if (!username || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_FIELDS',
            message: '请填写所有必填字段',
          },
        },
        { status: 400 }
      )
    }

    // 验证邮箱格式
    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_EMAIL',
            message: '邮箱格式不正确',
          },
        },
        { status: 400 }
      )
    }

    // 验证用户名长度
    if (username.length < 2 || username.length > 20) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_USERNAME',
            message: '用户名长度必须在 2-20 个字符之间',
          },
        },
        { status: 400 }
      )
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PASSWORD',
            message: '密码长度不能少于 6 个字符',
          },
        },
        { status: 400 }
      )
    }

    // 检查邮箱是否已被注册
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUserByEmail) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: '该邮箱已被注册',
          },
        },
        { status: 400 }
      )
    }

    // 检查用户名是否已被使用
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUserByUsername) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USERNAME_EXISTS',
            message: '该用户名已被使用',
          },
        },
        { status: 400 }
      )
    }

    // 加密密码
    const hashedPassword = await hashPassword(password)

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '注册失败，请稍后重试',
        },
      },
      { status: 500 }
    )
  }
} 