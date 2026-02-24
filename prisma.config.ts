import { defineConfig } from "@prisma/config"

// Load environment variables from .env file
try {
	require("dotenv/config")
} catch {
	// dotenv not available, environment variables should be set externally
}

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
	throw new Error(
		"DATABASE_URL environment variable is not set.\n\n" +
		"Please create a .env file in your project root with:\n" +
		'DATABASE_URL="postgresql://user:password@host:port/database"'
	)
}

export default defineConfig({
	schema: "prisma/schema.prisma",
	datasource: {
		url: databaseUrl,
	},
})
