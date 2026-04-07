import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// 1. Initialize the Postgres adapter with your URL
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});

// 2. Pass the adapter to the Prisma 7 Client
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;