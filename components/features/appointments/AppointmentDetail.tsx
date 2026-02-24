"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, User, Mail, Phone, DollarSign, FileText, CheckCircle2, XCircle } from "lucide-react"
import { format } from "date-fns"
import { type Appointment, useUpdateAppointment } from "@/lib/react-query/hooks/appointments"
import { currentUserClient } from "@/lib/auth/client"
import { toast } from "sonner"
import { useState, useEffect } from "react"

interface AppointmentDetailProps {
	appointment: Appointment
	onStatusChange?: () => void
}

const statusColors: Record<string, string> = {
	PENDING: "bg-yellow-100 text-yellow-800",
	CONFIRMED: "bg-blue-100 text-blue-800",
	COMPLETED: "bg-green-100 text-green-800",
	CANCELLED: "bg-red-100 text-red-800",
}

export function AppointmentDetail({ appointment, onStatusChange }: AppointmentDetailProps) {
	const currentUser = currentUserClient()
	const { mutate: updateAppointment, isPending } = useUpdateAppointment()
	const [selectedStatus, setSelectedStatus] = useState(appointment.status)
	const canChangeStatus = currentUser && (currentUser.isAdmin || currentUser.isSuperAdmin || currentUser.isStaff)

	// Update selectedStatus when appointment prop changes
	useEffect(() => {
		setSelectedStatus(appointment.status)
	}, [appointment.status])

	const handleStatusChange = (newStatus: string) => {
		if (newStatus === appointment.status) return

		updateAppointment(
			{
				id: appointment.id,
				data: { status: newStatus },
			},
			{
				onSuccess: () => {
					toast.success(`Appointment status updated to ${newStatus}`)
					setSelectedStatus(newStatus)
					onStatusChange?.()
				},
				onError: (error: any) => {
					toast.error(error?.info?.error || "Failed to update appointment status")
				},
			}
		)
	}

	const handleQuickApprove = () => {
		if (appointment.status === "PENDING") {
			handleStatusChange("CONFIRMED")
		}
	}

	const handleQuickComplete = () => {
		if (appointment.status === "CONFIRMED") {
			handleStatusChange("COMPLETED")
		}
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<CardTitle>Appointment Details</CardTitle>
				<div className="flex items-center gap-2">
					<Badge className={statusColors[appointment.status] || ""}>
						{appointment.status}
					</Badge>
					{canChangeStatus && appointment.status === "PENDING" && (
						<Button
							size="sm"
							onClick={handleQuickApprove}
							disabled={isPending}
							className="gap-2"
						>
							<CheckCircle2 className="h-4 w-4" />
							Approve
						</Button>
					)}
					{canChangeStatus && appointment.status === "CONFIRMED" && (
						<Button
							size="sm"
							variant="outline"
							onClick={handleQuickComplete}
							disabled={isPending}
							className="gap-2"
						>
							<CheckCircle2 className="h-4 w-4" />
							Mark Complete
						</Button>
					)}
				</div>
			</div>

			{canChangeStatus && (
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium">Change Status</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2">
							<Select
								value={selectedStatus}
								onValueChange={(value) => {
									setSelectedStatus(value)
									handleStatusChange(value)
								}}
								disabled={isPending}
							>
								<SelectTrigger className="w-[200px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="PENDING">PENDING</SelectItem>
									<SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
									<SelectItem value="COMPLETED">COMPLETED</SelectItem>
									<SelectItem value="CANCELLED">CANCELLED</SelectItem>
								</SelectContent>
							</Select>
							{isPending && <span className="text-sm text-muted-foreground">Updating...</span>}
						</div>
					</CardContent>
				</Card>
			)}

			<Separator />

			<div className="grid gap-4 md:grid-cols-2">
				{/* Date & Time */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium flex items-center gap-2">
							<Calendar className="w-4 h-4" />
							Date & Time
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-lg font-semibold">
							{format(new Date(appointment.date), "EEEE, MMMM dd, yyyy")}
						</div>
						<div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
							<Clock className="w-3 h-3" />
							{format(new Date(appointment.date), "h:mm a")}
						</div>
					</CardContent>
				</Card>

				{/* Service */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium">Service</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-lg font-semibold">{appointment.service?.title}</div>
						<div className="text-sm text-muted-foreground mt-1">
							{appointment.service?.type}
							{appointment.service?.duration && ` • ${appointment.service.duration} minutes`}
						</div>
						{appointment.service?.price && (
							<div className="text-sm font-medium mt-2 flex items-center gap-1">
								<DollarSign className="w-4 h-4" />
								{appointment.service.price.toFixed(2)}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Pet Information */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium flex items-center gap-2">
							<User className="w-4 h-4" />
							Pet Information
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-lg font-semibold">{appointment.pet?.name}</div>
						<div className="text-sm text-muted-foreground mt-1">
							{appointment.pet?.species}
							{appointment.pet?.breed && ` • ${appointment.pet.breed}`}
						</div>
					</CardContent>
				</Card>

				{/* Owner Information */}
				{appointment.pet?.owner && (
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium">Owner</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-lg font-semibold">{appointment.pet.owner.name || "N/A"}</div>
							<div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
								<Mail className="w-3 h-3" />
								{appointment.pet.owner.email}
							</div>
						</CardContent>
					</Card>
				)}

				{/* Staff Assignment */}
				{appointment.staff && (
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium">Assigned Staff</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-lg font-semibold">{appointment.staff.name || "N/A"}</div>
							<div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
								<Mail className="w-3 h-3" />
								{appointment.staff.email}
							</div>
						</CardContent>
					</Card>
				)}

				{/* Invoice Information */}
				{appointment.invoice && (
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium flex items-center gap-2">
								<DollarSign className="w-4 h-4" />
								Invoice
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-lg font-semibold">
								${appointment.invoice.amount.toFixed(2)}
							</div>
							<Badge className="mt-2" variant={appointment.invoice.status === "PAID" ? "default" : "secondary"}>
								{appointment.invoice.status}
							</Badge>
						</CardContent>
					</Card>
				)}
			</div>

			{/* Notes */}
			{appointment.notes && (
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium flex items-center gap-2">
							<FileText className="w-4 h-4" />
							Notes
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm whitespace-pre-wrap">{appointment.notes}</p>
					</CardContent>
				</Card>
			)}

			{/* Timestamps */}
			<div className="text-xs text-muted-foreground pt-2">
				Created: {format(new Date(appointment.createdAt), "MMM dd, yyyy HH:mm")}
				{appointment.updatedAt !== appointment.createdAt && (
					<> • Updated: {format(new Date(appointment.updatedAt), "MMM dd, yyyy HH:mm")}</>
				)}
			</div>
		</div>
	)
}

