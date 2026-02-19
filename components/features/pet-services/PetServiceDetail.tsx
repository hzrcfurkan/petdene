"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sparkles, DollarSign, Clock, FileText, Calendar } from "lucide-react"
import { format } from "date-fns"
import { type PetService } from "@/lib/react-query/hooks/pet-services"

interface PetServiceDetailProps {
	service: PetService
}

export function PetServiceDetail({ service }: PetServiceDetailProps) {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					{service.image && (
						<img
							src={service.image}
							alt={service.title}
							className="w-16 h-16 rounded object-cover"
						/>
					)}
					<div>
						<CardTitle className="text-2xl">{service.title}</CardTitle>
						<CardDescription className="flex items-center gap-2 mt-1">
							<Sparkles className="w-4 h-4" />
							{service.type.charAt(0).toUpperCase() + service.type.slice(1).replace("-", " ")}
						</CardDescription>
					</div>
				</div>
				<Badge className={service.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
					{service.active ? "Active" : "Inactive"}
				</Badge>
			</div>

			<Separator />

			<div className="grid gap-4 md:grid-cols-2">
				{/* Pricing */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium flex items-center gap-2">
							<DollarSign className="w-4 h-4" />
							Pricing
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">${service.price.toFixed(2)}</div>
						<div className="text-sm text-muted-foreground mt-1">Service price</div>
					</CardContent>
				</Card>

				{/* Duration */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium flex items-center gap-2">
							<Clock className="w-4 h-4" />
							Duration
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{service.duration ? `${service.duration} min` : "N/A"}
						</div>
						<div className="text-sm text-muted-foreground mt-1">Estimated duration</div>
					</CardContent>
				</Card>

				{/* Appointments */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium flex items-center gap-2">
							<Calendar className="w-4 h-4" />
							Appointments
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{service._count?.appointments || 0}</div>
						<div className="text-sm text-muted-foreground mt-1">Total bookings</div>
					</CardContent>
				</Card>
			</div>

			{/* Description */}
			{service.description && (
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium flex items-center gap-2">
							<FileText className="w-4 h-4" />
							Description
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm whitespace-pre-wrap">{service.description}</p>
					</CardContent>
				</Card>
			)}

			{/* Timestamps */}
			<div className="text-xs text-muted-foreground pt-2">
				Created: {format(new Date(service.createdAt), "MMM dd, yyyy HH:mm")}
				{service.updatedAt !== service.createdAt && (
					<> • Updated: {format(new Date(service.updatedAt), "MMM dd, yyyy HH:mm")}</>
				)}
			</div>
		</div>
	)
}

