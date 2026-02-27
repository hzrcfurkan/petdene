import { prisma } from "./prisma"

/**
 * Generate unique Patient Number (PAT-000001, PAT-000002, ...)
 */
export async function generatePatientNumber(): Promise<string> {
	const result = await prisma.$queryRaw<[{ max: string | null }]>`
		SELECT MAX("patientNumber") as max FROM "Pet"
	`
	const maxVal = result[0]?.max
	if (!maxVal) return "PAT-000001"
	const match = maxVal.match(/PAT-(\d+)/)
	const num = match ? parseInt(match[1], 10) + 1 : 1
	return `PAT-${String(num).padStart(6, "0")}`
}
