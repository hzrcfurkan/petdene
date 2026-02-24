"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Syringe, Calendar, PawPrint, User, Mail, FileText } from "lucide-react"
import { format, isAfter } from "date-fns"
import { type Vaccination } from "@/lib/react-query/hooks/vaccinations"

interface VaccinationDetailProps {
	vaccination: Vaccination
}

export function VaccinationDetail({ vaccination }: VaccinationDetailProps) {
	const isDue = vaccination.nextDue
		? isAfter(new Date(), new Date(vaccination.nextDue))
		: false
	const isUpcoming = vaccination.nextDue
		? isAfter(new Date(vaccination.nextDue), new Date()) &&
		  !isAfter(new Date(vaccination.nextDue), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
		: false

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<CardTitle className="text-2xl">{vaccination.vaccineName}</CardTitle>
					<CardDescription className="flex items-center gap-2 mt-1">
						<Syringe className="w-4 h-4" />
						Vaccination Record
					</CardDescription>
				</div>
				{vaccination.nextDue && (
					<Badge className={isDue ? "bg-red-100 text-red-800" : isUpcoming ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}>
						{isDue ? "Due" : isUpcoming ? "Upcoming" : "Scheduled"}
					</Badge>
				)}
			</div>

			<Separator />

			<div className="grid gap-4 md:grid-cols-2">
				{/* Date Given */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium flex items-center gap-2">
							<Calendar className="w-4 h-4" />
							Date Given
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-lg font-semibold">
							{format(new Date(vaccination.dateGiven), "EEEE, MMMM dd, yyyy")}
						</div>
						<div className="text-sm text-muted-foreground mt-1">
							{format(new Date(vaccination.dateGiven), "h:mm a")}
						</div>
					</CardContent>
				</Card>

				{/* Next Due */}
				{vaccination.nextDue ? (
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium">Next Due Date</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-lg font-semibold">
								{format(new Date(vaccination.nextDue), "EEEE, MMMM dd, yyyy")}
							</div>
							{isDue && (
								<Badge className="mt-2 bg-red-100 text-red-800">Overdue</Badge>
							)}
							{isUpcoming && !isDue && (
								<Badge className="mt-2 bg-yellow-100 text-yellow-800">Due Soon</Badge>
							)}
						</CardContent>
					</Card>
				) : (
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium">Next Due Date</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-lg font-semibold text-muted-foreground">Not scheduled</div>
						</CardContent>
					</Card>
				)}

				{/* Pet Information */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium flex items-center gap-2">
							<PawPrint className="w-4 h-4" />
							Pet Information
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-lg font-semibold">{vaccination.pet?.name}</div>
						<div className="text-sm text-muted-foreground mt-1">
							{vaccination.pet?.species}
							{vaccination.pet?.breed && ` • ${vaccination.pet.breed}`}
						</div>
					</CardContent>
				</Card>

				{/* Owner Information */}
				{vaccination.pet?.owner && (
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium flex items-center gap-2">
								<User className="w-4 h-4" />
								Owner
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-lg font-semibold">{vaccination.pet.owner.name || "N/A"}</div>
							<div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
								<Mail className="w-3 h-3" />
								{vaccination.pet.owner.email}
							</div>
						</CardContent>
					</Card>
				)}
			</div>

			{/* Notes */}
			{vaccination.notes && (
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium flex items-center gap-2">
							<FileText className="w-4 h-4" />
							Notes
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm whitespace-pre-wrap">{vaccination.notes}</p>
					</CardContent>
				</Card>
			)}
		</div>
	)
}

