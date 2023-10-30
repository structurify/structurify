import type { PrismaClient } from '@prisma/client';

export type PrismaModels = keyof Omit<
  PrismaClient,
  'disconnect' | 'connect' | 'executeRaw' | 'queryRaw' | 'transaction' | 'on'
>
