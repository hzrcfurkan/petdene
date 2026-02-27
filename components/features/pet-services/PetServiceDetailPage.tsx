"use client"

import { useParams, useRouter } from "next/navigation"
import { DetailShell } from "@/components/layout/detail-shell"
import { PetServiceDetail } from "@/components/features/pet-services/PetServiceDetail"
import { usePetService } from "@/lib/react-query/hooks/pet-services"
import { CardSkeleton } from "@/components/skeletons"

export interface PetServiceDetailPageProps {
	listHref: string
	listLabel: string
}

export function PetServiceDetailPage({ listHref, listLabel }: PetServiceDetailPageProps) {
	const params = useParams()
	const id = params?.id as string
	const router = useRouter()
	const { data: service, isLoading, error } = usePetService(id)

	if (isLoading) {
		return (
			<DetailShell listHref={listHref} listLabel={listLabel} pageTitle="Loading…">
				<CardSkeleton />
			</DetailShell>
		)
	}

	if (error || !service) {
		return (
			<DetailShell listHref={listHref} listLabel={listLabel} pageTitle="Service not found">
				<div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
					<p className="text-destructive font-medium">This service could not be loaded.</p>
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

	const subtitle = service.type ? service.type.charAt(0).toUpperCase() + service.type.slice(1).replace("-", " ") : undefined

	return (
		<DetailShell
			listHref={listHref}
			listLabel={listLabel}
			pageTitle={service.title}
			subtitle={subtitle}
		>
			<PetServiceDetail service={service} />
		</DetailShell>
	)
}
