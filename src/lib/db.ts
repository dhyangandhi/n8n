import { PrismaClient } from "@prisma/client"
import { PrismaClient as GeneratedPrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

interface GlobalPrisma {
  prisma?: GeneratedPrismaClient
  pool?: Pool
}

const globalForPrisma = globalThis as unknown as GlobalPrisma

const pool = globalForPrisma.pool ?? new Pool({
  connectionString: process.env.DATABASE_URL ?? "",
})

globalForPrisma.pool = pool

const adapter = new PrismaPg(pool)

const prisma = globalForPrisma.prisma ?? new PrismaClient({ 
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : [],
})

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

export default prisma

