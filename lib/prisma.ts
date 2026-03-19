/**
 * Cliente Prisma singleton
 * Evita crear múltiples instancias de Prisma
 */

import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  // En desarrollo, reutilizar la instancia existente
  let globalWithPrisma = global as unknown as { prisma: PrismaClient }

  if (!globalWithPrisma.prisma) {
    globalWithPrisma.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    })
  }

  prisma = globalWithPrisma.prisma
}

export default prisma
