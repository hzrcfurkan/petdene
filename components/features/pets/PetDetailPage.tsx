"use client"

import { useParams, useRouter } from "next/navigation"
import { DetailShell } from "@/components/layout/detail-shell"
import { PetDetail } from "@/components/features/pets/PetDetail"
import { usePet } from "@/lib/react-query/hooks/pets"
import { CardSkeleton } from "@/components/skeletons"

export interface PetDetailPageProps {
	listHref: string
	listLabel: string
}

export function PetDetailPage({ listHref, listLabel }: PetDetailPageProps) {
	const params = useParams()
	const id = params?.id as string
	const router = useRouter()
	const { data: pet, isLoading, error } = usePet(id)

	if (isLoading) {
		return (
			<DetailShell listHref={listHref} listLabel={listLabel} pageTitle="Loading…">
				<CardSkeleton />
			</DetailShell>
		)
	}

	if (error || !pet) {
		return (
			<DetailShell listHref={listHref} listLabel={listLabel} pageTitle="Pet not found">
				<div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
					<p className="text-destructive font-medium">This pet could not be loaded.</p>
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

	const subtitle = [pet.species, pet.breed].filter(Boolean).join(" • ") || undefined

	return (
		<DetailShell
			listHref={listHref}
			listLabel={listLabel}
			pageTitle={pet.name}
			subtitle={subtitle}
		>
			<PetDetail pet={pet} />
		</DetailShell>
	)
}
