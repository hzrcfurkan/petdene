"use client"

import { useParams, useRouter } from "next/navigation"
import { DetailShell } from "@/components/layout/detail-shell"
import { VisitDetail } from "@/components/features/visits/VisitDetail"
import { useVisit } from "@/lib/react-query/hooks/visits"
import { CardSkeleton } from "@/components/skeletons"

export function VisitDetailPage({
	listHref,
	listLabel,
}: {
	listHref: string
	listLabel: string
}) {
	const params = useParams()
	const id = params?.id as string
	const router = useRouter()
	const { data: visit, isLoading, error } = useVisit(id)

	if (isLoading) {
		return (
			<DetailShell listHref={listHref} listLabel={listLabel} pageTitle="Loading…">
				<CardSkeleton />
			</DetailShell>
		)
	}

	if (error || !visit) {
		return (
			<DetailShell listHref={listHref} listLabel={listLabel} pageTitle="Visit not found">
				<div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
					<p className="text-destructive font-medium">This visit could not be loaded.</p>
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
			pageTitle={`Visit PRO-${visit.protocolNumber}`}
			subtitle={visit.pet?.name}
		>
			<VisitDetail visit={visit} />
		</DetailShell>
	)
}
