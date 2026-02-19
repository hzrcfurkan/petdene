import "server-only"

import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
	throw new Error("DATABASE_URL environment variable is not set")
}

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
	const pool = new Pool({ connectionString: databaseUrl })
	const adapter = new PrismaPg(pool)

	return new PrismaClient({
		adapter,
		log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
	})
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
	globalForPrisma.prisma = prisma
}
