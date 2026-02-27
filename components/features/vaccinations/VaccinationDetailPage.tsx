"use client"

import { useParams, useRouter } from "next/navigation"
import { DetailShell } from "@/components/layout/detail-shell"
import { VaccinationDetail } from "@/components/features/vaccinations/VaccinationDetail"
import { useVaccination } from "@/lib/react-query/hooks/vaccinations"
import { CardSkeleton } from "@/components/skeletons"

export interface VaccinationDetailPageProps {
	listHref: string
	listLabel: string
}

export function VaccinationDetailPage({ listHref, listLabel }: VaccinationDetailPageProps) {
	const params = useParams()
	const id = params?.id as string
	const router = useRouter()
	const { data: vaccination, isLoading, error } = useVaccination(id)

	if (isLoading) {
		return (
			<DetailShell listHref={listHref} listLabel={listLabel} pageTitle="Loading…">
				<CardSkeleton />
			</DetailShell>
		)
	}

	if (error || !vaccination) {
		return (
			<DetailShell listHref={listHref} listLabel={listLabel} pageTitle="Vaccination not found">
				<div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
					<p className="text-destructive font-medium">This vaccination record could not be loaded.</p>
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

	return (
		<DetailShell
			listHref={listHref}
			listLabel={listLabel}
			pageTitle={vaccination.vaccineName}
			subtitle={vaccination.pet?.name ? `Pet: ${vaccination.pet.name}` : undefined}
		>
			<VaccinationDetail vaccination={vaccination} />
		</DetailShell>
	)
}
