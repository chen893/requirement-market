// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'], // 可选的日志配置
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
// 添加中间件处理重复连接问题
prisma.$use(async (params, next) => {
  try {
    const result = await next(params)
    return result
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('prepared statement already exists')
    ) {
      // 可以尝试重置连接
      await prisma.$disconnect()
      await prisma.$connect()
    }
    throw error
  }
})
export default prisma
