"use client"

import { useParams, useRouter } from "next/navigation"
import { DetailShell } from "@/components/layout/detail-shell"
import { PrescriptionDetail } from "@/components/features/prescriptions/PrescriptionDetail"
import { usePrescription } from "@/lib/react-query/hooks/prescriptions"
import { CardSkeleton } from "@/components/skeletons"

export interface PrescriptionDetailPageProps {
	listHref: string
	listLabel: string
}

export function PrescriptionDetailPage({ listHref, listLabel }: PrescriptionDetailPageProps) {
	const params = useParams()
	const id = params?.id as string
	const router = useRouter()
	const { data: prescription, isLoading, error } = usePrescription(id)

	if (isLoading) {
		return (
			<DetailShell listHref={listHref} listLabel={listLabel} pageTitle="Loading…">
				<CardSkeleton />
			</DetailShell>
		)
	}

	if (error || !prescription) {
		return (
			<DetailShell listHref={listHref} listLabel={listLabel} pageTitle="Prescription not found">
				<div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
					<p className="text-destructive font-medium">This prescription could not be loaded.</p>
					<button
						type="button"
						onClick={() => router.push(listHref)}
						className="mt-2 text-sm text-primary hover:underline"
					>
						Back to {listLabel}
					</button>
				</div>
			</DetailShell>
		)
	}

	const subtitle = prescription.pet?.name ? `Pet: ${prescription.pet.name}` : undefined

	return (
		<DetailShell
			listHref={listHref}
			listLabel={listLabel}
			pageTitle={prescription.medicineName}
			subtitle={subtitle}
		>
			<PrescriptionDetail prescription={prescription} />
		</DetailShell>
	)
}
