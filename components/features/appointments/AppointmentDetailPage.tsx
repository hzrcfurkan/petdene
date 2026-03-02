"use client"

import { useParams, useRouter } from "next/navigation"
import { DetailShell } from "@/components/layout/detail-shell"
import { AppointmentDetail } from "@/components/features/appointments/AppointmentDetail"
import { useAppointment } from "@/lib/react-query/hooks/appointments"
import { CardSkeleton } from "@/components/skeletons"
import { format } from "date-fns"

export interface AppointmentDetailPageProps {
	listHref: string
	listLabel: string
}

export function AppointmentDetailPage({ listHref, listLabel }: AppointmentDetailPageProps) {
	const params = useParams()
	const id = params?.id as string
	const router = useRouter()
	const { data: appointment, isLoading, error } = useAppointment(id)

	if (isLoading) {
		return (
			<DetailShell listHref={listHref} listLabel={listLabel} pageTitle="Loading…">
				<CardSkeleton />
			</DetailShell>
		)
	}

	if (error || !appointment) {
		return (
			<DetailShell listHref={listHref} listLabel={listLabel} pageTitle="Randevu bulunamadı">
				<div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
					<p className="text-destructive font-medium">This appointment could not be loaded.</p>
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

	const pageTitle = appointment.pet?.name
		? `${appointment.pet.name} – ${format(new Date(appointment.date), "MMM d, yyyy")}`
		: `Appointment ${format(new Date(appointment.date), "MMM d, yyyy")}`

	return (
		<DetailShell
			listHref={listHref}
			listLabel={listLabel}
			pageTitle={pageTitle}
			subtitle={appointment.service?.title}
		>
			<AppointmentDetail appointment={appointment} />
		</DetailShell>
	)
}
