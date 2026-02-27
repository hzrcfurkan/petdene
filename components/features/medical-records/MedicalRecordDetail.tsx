"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Stethoscope, Calendar, PawPrint, User, Mail, FileText } from "lucide-react"
import { format } from "date-fns"
import { type MedicalRecord } from "@/lib/react-query/hooks/medical-records"

export interface MedicalRecordDetailProps {
	record: MedicalRecord
}

export function MedicalRecordDetail({ record }: MedicalRecordDetailProps) {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<CardTitle className="text-2xl">{record.title}</CardTitle>
					<p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
						<Stethoscope className="w-4 h-4" />
						Medical Record
					</p>
				</div>
				<div className="text-sm text-muted-foreground">
					{format(new Date(record.date), "MMM dd, yyyy")}
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				{/* Date */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium flex items-center gap-2">
							<Calendar className="w-4 h-4" />
							Visit Date
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-lg font-semibold">
							{format(new Date(record.date), "EEEE, MMMM dd, yyyy")}
						</div>
					</CardContent>
				</Card>

				{/* Pet Information */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium flex items-center gap-2">
							<PawPrint className="w-4 h-4" />
							Pet
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-lg font-semibold">{record.pet?.name}</div>
						<div className="text-sm text-muted-foreground mt-1">{record.pet?.species}</div>
					</CardContent>
				</Card>

				{/* Owner */}
				{record.pet?.owner && (
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium flex items-center gap-2">
								<User className="w-4 h-4" />
								Owner
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-lg font-semibold">{record.pet.owner.name || "N/A"}</div>
							<div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
								<Mail className="w-3 h-3" />
								{record.pet.owner.email}
							</div>
						</CardContent>
					</Card>
				)}
			</div>

			{/* Description */}
			{record.description && (
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium flex items-center gap-2">
							<FileText className="w-4 h-4" />
							Description
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm whitespace-pre-wrap">{record.description}</p>
					</CardContent>
				</Card>
			)}

			{/* Diagnosis */}
			{record.diagnosis && (
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium flex items-center gap-2">
							<Stethoscope className="w-4 h-4" />
							Diagnosis
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm whitespace-pre-wrap">{record.diagnosis}</p>
					</CardContent>
				</Card>
			)}

			{/* Treatment */}
			{record.treatment && (
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium flex items-center gap-2">
							<FileText className="w-4 h-4" />
							Treatment
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm whitespace-pre-wrap">{record.treatment}</p>
					</CardContent>
				</Card>
			)}
		</div>
	)
}
