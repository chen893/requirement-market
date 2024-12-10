// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  }).$extends({
    query: {
      $allModels: {
        async $allOperations({ query, args }) {
          try {
            return await query(args)
          } catch (error) {
            if (
              error instanceof Error &&
              error.message.includes('prepared statement')
            ) {
              await prisma.$disconnect()
              await prisma.$connect()
              return await query(args)
            }
            throw error
          }
        },
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
