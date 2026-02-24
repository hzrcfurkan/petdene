"use client"

import { useMedicalRecords } from "@/lib/react-query/hooks/medical-records"
import { useVaccinations } from "@/lib/react-query/hooks/vaccinations"
import { usePrescriptions } from "@/lib/react-query/hooks/prescriptions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Stethoscope, Syringe, Pill, Calendar, FileText } from "lucide-react"
import { useMemo } from "react"

interface PetTimelineProps {
	petId?: string
}

type TimelineItem = {
	id: string
	type: "medical" | "vaccination" | "prescription"
	date: string
	title: string
	description?: string
	data: any
}

export function PetTimeline({ petId }: PetTimelineProps) {
	const { data: medicalData } = useMedicalRecords({
		petId,
		limit: 1000,
		sort: "date-desc",
	})
	const { data: vaccinationData } = useVaccinations({
		petId,
		limit: 1000,
		sort: "date-desc",
	})
	const { data: prescriptionData } = usePrescriptions({
		petId,
		limit: 1000,
		sort: "date-desc",
	})

	const timelineItems = useMemo(() => {
		const items: TimelineItem[] = []

		// Add medical records
		if (medicalData?.records) {
			medicalData.records.forEach((record) => {
				items.push({
					id: record.id,
					type: "medical",
					date: record.date,
					title: record.title,
					description: record.diagnosis || record.description || undefined,
					data: record,
				})
			})
		}

		// Add vaccinations
		if (vaccinationData?.vaccinations) {
			vaccinationData.vaccinations.forEach((vaccination) => {
				items.push({
					id: vaccination.id,
					type: "vaccination",
					date: vaccination.dateGiven,
					title: vaccination.vaccineName,
					description: vaccination.notes || undefined,
					data: vaccination,
				})
			})
		}

		// Add prescriptions
		if (prescriptionData?.prescriptions) {
			prescriptionData.prescriptions.forEach((prescription) => {
				items.push({
					id: prescription.id,
					type: "prescription",
					date: prescription.dateIssued,
					title: prescription.medicineName,
					description: prescription.dosage || prescription.instructions || undefined,
					data: prescription,
				})
			})
		}

		// Sort by date (newest first)
		return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
	}, [medicalData, vaccinationData, prescriptionData])

	const getIcon = (type: string) => {
		switch (type) {
			case "medical":
				return <Stethoscope className="h-4 w-4" />
			case "vaccination":
				return <Syringe className="h-4 w-4" />
			case "prescription":
				return <Pill className="h-4 w-4" />
			default:
				return <FileText className="h-4 w-4" />
		}
	}

	const getBadgeColor = (type: string) => {
		switch (type) {
			case "medical":
				return "bg-blue-100 text-blue-800"
			case "vaccination":
				return "bg-green-100 text-green-800"
			case "prescription":
				return "bg-purple-100 text-purple-800"
			default:
				return ""
		}
	}

	const getTypeLabel = (type: string) => {
		switch (type) {
			case "medical":
				return "Medical Record"
			case "vaccination":
				return "Vaccination"
			case "prescription":
				return "Prescription"
			default:
				return "Record"
		}
	}

	if (timelineItems.length === 0) {
		return (
			<div className="py-8">
				<div className="flex flex-col items-center gap-2 text-center">
					<Calendar className="h-8 w-8 text-muted-foreground" />
					<p className="text-sm text-muted-foreground">No records found</p>
					<p className="text-xs text-muted-foreground">
						{petId ? "This pet has no medical history yet" : "No medical records, vaccinations, or prescriptions found"}
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-4">
			<div className="relative">
				{/* Timeline line */}
				<div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

				{/* Timeline items */}
				<div className="space-y-6">
					{timelineItems.map((item, index) => (
						<div key={item.id} className="relative flex gap-4">
							{/* Icon */}
							<div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-background border-2 border-border">
								<div className={`${getBadgeColor(item.type)} p-2 rounded-full`}>
									{getIcon(item.type)}
								</div>
							</div>

							{/* Content */}
							<div className="flex-1 pb-6">
								<Card>
									<CardHeader className="pb-3">
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<div className="flex items-center gap-2 mb-1">
													<CardTitle className="text-base">{item.title}</CardTitle>
													<Badge className={getBadgeColor(item.type)} variant="outline">
														{getTypeLabel(item.type)}
													</Badge>
												</div>
												<p className="text-xs text-muted-foreground flex items-center gap-1">
													<Calendar className="h-3 w-3" />
													{format(new Date(item.date), "MMMM dd, yyyy 'at' h:mm a")}
												</p>
											</div>
										</div>
									</CardHeader>
									<CardContent>
										{item.type === "medical" && (
											<div className="space-y-2 text-sm">
												{item.data.description && (
													<div>
														<p className="font-medium text-muted-foreground">Description:</p>
														<p className="whitespace-pre-wrap">{item.data.description}</p>
													</div>
												)}
												{item.data.diagnosis && (
													<div>
														<p className="font-medium text-muted-foreground">Diagnosis:</p>
														<p>{item.data.diagnosis}</p>
													</div>
												)}
												{item.data.treatment && (
													<div>
														<p className="font-medium text-muted-foreground">Treatment:</p>
														<p className="whitespace-pre-wrap">{item.data.treatment}</p>
													</div>
												)}
											</div>
										)}

										{item.type === "vaccination" && (
											<div className="space-y-2 text-sm">
												<div>
													<p className="font-medium text-muted-foreground">Vaccine:</p>
													<p>{item.data.vaccineName}</p>
												</div>
												{item.data.nextDue && (
													<div>
														<p className="font-medium text-muted-foreground">Next Due:</p>
														<p>{format(new Date(item.data.nextDue), "MMMM dd, yyyy")}</p>
													</div>
												)}
												{item.data.notes && (
													<div>
														<p className="font-medium text-muted-foreground">Notes:</p>
														<p className="whitespace-pre-wrap">{item.data.notes}</p>
													</div>
												)}
											</div>
										)}

										{item.type === "prescription" && (
											<div className="space-y-2 text-sm">
												<div>
													<p className="font-medium text-muted-foreground">Medicine:</p>
													<p>{item.data.medicineName}</p>
												</div>
												{item.data.dosage && (
													<div>
														<p className="font-medium text-muted-foreground">Dosage:</p>
														<p>{item.data.dosage}</p>
													</div>
												)}
												{item.data.instructions && (
													<div>
														<p className="font-medium text-muted-foreground">Instructions:</p>
														<p className="whitespace-pre-wrap">{item.data.instructions}</p>
													</div>
												)}
												{item.data.issuedBy && (
													<div>
														<p className="font-medium text-muted-foreground">Issued By:</p>
														<p>{item.data.issuedBy.name || item.data.issuedBy.email}</p>
													</div>
												)}
											</div>
										)}

										{item.description && !item.data.description && !item.data.notes && !item.data.instructions && (
											<div className="mt-2 text-sm text-muted-foreground">
												<p>{item.description}</p>
											</div>
										)}
									</CardContent>
								</Card>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

