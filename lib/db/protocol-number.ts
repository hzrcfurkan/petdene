import { prisma } from "./prisma"

/**
 * Generate sequential Protocol Number for Visit
 */
export async function generateProtocolNumber(): Promise<number> {
	const max = await prisma.visit.aggregate({
		_max: { protocolNumber: true },
	})
	return (max._max.protocolNumber ?? 0) + 1
}
