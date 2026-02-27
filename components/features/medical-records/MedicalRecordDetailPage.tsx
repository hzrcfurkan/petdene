"use client"

import { useParams, useRouter } from "next/navigation"
import { DetailShell } from "@/components/layout/detail-shell"
import { MedicalRecordDetail } from "@/components/features/medical-records/MedicalRecordDetail"
import { useMedicalRecord } from "@/lib/react-query/hooks/medical-records"
import { CardSkeleton } from "@/components/skeletons"

export interface MedicalRecordDetailPageProps {
	listHref: string
	listLabel: string
}

export function MedicalRecordDetailPage({ listHref, listLabel }: MedicalRecordDetailPageProps) {
	const params = useParams()
	const id = params?.id as string
	const router = useRouter()
	const { data: record, isLoading, error } = useMedicalRecord(id)

	if (isLoading) {
		return (
			<DetailShell listHref={listHref} listLabel={listLabel} pageTitle="Loading…">
				<CardSkeleton />
			</DetailShell>
		)
	}

	if (error || !record) {
		return (
			<DetailShell listHref={listHref} listLabel={listLabel} pageTitle="Record not found">
				<div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
					<p className="text-destructive font-medium">This medical record could not be loaded.</p>
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

	const subtitle = record.pet?.name ? `Pet: ${record.pet.name}` : undefined

	return (
		<DetailShell
			listHref={listHref}
			listLabel={listLabel}
			pageTitle={record.title}
			subtitle={subtitle}
		>
			<MedicalRecordDetail record={record} />
		</DetailShell>
	)
}
