"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Pill, Calendar, PawPrint, User, Mail, FileText, Stethoscope } from "lucide-react"
import { format } from "date-fns"
import { type Prescription } from "@/lib/react-query/hooks/prescriptions"

interface PrescriptionDetailProps {
	prescription: Prescription
}

export function PrescriptionDetail({ prescription }: PrescriptionDetailProps) {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<CardTitle className="text-2xl">{prescription.medicineName}</CardTitle>
					<CardDescription className="flex items-center gap-2 mt-1">
						<Pill className="w-4 h-4" />
						Prescription Record
					</CardDescription>
				</div>
			</div>

			<Separator />

			<div className="grid gap-4 md:grid-cols-2">
				{/* Date Issued */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium flex items-center gap-2">
							<Calendar className="w-4 h-4" />
							Date Issued
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-lg font-semibold">
							{format(new Date(prescription.dateIssued), "EEEE, MMMM dd, yyyy")}
						</div>
					</CardContent>
				</Card>

				{/* Dosage */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium">Dosage</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-lg font-semibold">
							{prescription.dosage || <span className="text-muted-foreground">Not specified</span>}
						</div>
					</CardContent>
				</Card>

				{/* Pet Information */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium flex items-center gap-2">
							<PawPrint className="w-4 h-4" />
							Pet Information
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-lg font-semibold">{prescription.pet?.name}</div>
						<div className="text-sm text-muted-foreground mt-1">
							{prescription.pet?.species}
							{prescription.pet?.breed && ` • ${prescription.pet.breed}`}
						</div>
					</CardContent>
				</Card>

				{/* Issued By */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium flex items-center gap-2">
							<Stethoscope className="w-4 h-4" />
							Issued By
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-lg font-semibold">{prescription.issuedBy?.name || "N/A"}</div>
						<div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
							<Mail className="w-3 h-3" />
							{prescription.issuedBy?.email || "N/A"}
						</div>
					</CardContent>
				</Card>

				{/* Owner Information */}
				{prescription.pet?.owner && (
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium flex items-center gap-2">
								<User className="w-4 h-4" />
								Owner
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-lg font-semibold">{prescription.pet.owner.name || "N/A"}</div>
							<div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
								<Mail className="w-3 h-3" />
								{prescription.pet.owner.email}
							</div>
						</CardContent>
					</Card>
				)}
			</div>

			{/* Instructions */}
			{prescription.instructions && (
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium flex items-center gap-2">
							<FileText className="w-4 h-4" />
							Instructions
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm whitespace-pre-wrap">{prescription.instructions}</p>
					</CardContent>
				</Card>
			)}
		</div>
	)
}

