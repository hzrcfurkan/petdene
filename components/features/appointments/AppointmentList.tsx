"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Search, Filter, Plus, Eye, Edit, Trash2 } from "lucide-react"
import { useState } from "react"
import { useAppointments, useDeleteAppointment, useUpdateAppointment, type Appointment } from "@/lib/react-query/hooks/appointments"
import { toast } from "sonner"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AppointmentForm } from "./AppointmentForm"
import { AppointmentDetail } from "./AppointmentDetail"
import { currentUserClient } from "@/lib/auth/client"

const statusColors: Record<string, string> = {
	PENDING: "bg-yellow-100 text-yellow-800",
	CONFIRMED: "bg-blue-100 text-blue-800",
	COMPLETED: "bg-green-100 text-green-800",
	CANCELLED: "bg-red-100 text-red-800",
}

interface AppointmentListProps {
	petId?: string
	serviceId?: string
	staffId?: string
	status?: string
	dateFrom?: string
	dateTo?: string
	showActions?: boolean
}

export function AppointmentList({ petId, serviceId, staffId, status, dateFrom, dateTo, showActions = true }: AppointmentListProps) {
	const [page, setPage] = useState(1)
	const [sortBy, setSortBy] = useState<string>("date-desc")
	const [statusFilter, setStatusFilter] = useState<string>(status || "ALL")
	const [searchQuery, setSearchQuery] = useState("")
	const [dateFromFilter, setDateFromFilter] = useState(dateFrom || "")
	const [dateToFilter, setDateToFilter] = useState(dateTo || "")
	const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
	const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null)
	const [isFormOpen, setIsFormOpen] = useState(false)

	const currentUser = currentUserClient()

	const { data, refetch, isLoading } = useAppointments({
		page,
		limit: 10,
		sort: sortBy,
		petId,
		serviceId,
		staffId,
		status: statusFilter === "ALL" ? undefined : statusFilter,
		dateFrom: dateFrom || dateFromFilter || undefined,
		dateTo: dateTo || dateToFilter || undefined,
	})

	const appointments = data?.appointments || []
	const pagination = data?.pagination
	const { mutate: deleteAppointment } = useDeleteAppointment()
	const { mutate: updateAppointment } = useUpdateAppointment()

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this appointment?")) return

		try {
			await deleteAppointment(id)
			toast.success("Appointment deleted successfully")
			refetch()
		} catch (error: any) {
			toast.error(error?.info?.error || "Failed to delete appointment")
		}
	}

	const handleEdit = (appointment: Appointment) => {
		setEditingAppointment(appointment)
		setIsFormOpen(true)
	}

	const handleView = (appointment: Appointment) => {
		setViewingAppointment(appointment)
	}

	const handleFormSuccess = () => {
		setIsFormOpen(false)
		setEditingAppointment(null)
		refetch()
	}

	const canCreate = currentUser && (currentUser.isAdmin || currentUser.isSuperAdmin || currentUser.isStaff || currentUser.isCustomer)
	const canEdit = currentUser && (currentUser.isAdmin || currentUser.isSuperAdmin || currentUser.isStaff)
	const canDelete = currentUser && (currentUser.isAdmin || currentUser.isSuperAdmin)

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<Calendar className="w-5 h-5" />
							Appointments
						</CardTitle>
						<CardDescription>Manage and view appointments</CardDescription>
					</div>
					{showActions && canCreate && (
						<Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
							<DialogTrigger asChild>
								<Button onClick={() => setEditingAppointment(null)}>
									<Plus className="w-4 h-4 mr-2" />
									New Appointment
								</Button>
							</DialogTrigger>
							<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
								<DialogHeader>
									<DialogTitle>{editingAppointment ? "Edit Appointment" : "Create Appointment"}</DialogTitle>
									<DialogDescription>
										{editingAppointment ? "Update appointment details" : "Schedule a new appointment"}
									</DialogDescription>
								</DialogHeader>
								<AppointmentForm
									appointment={editingAppointment}
									onSuccess={handleFormSuccess}
									onCancel={() => {
										setIsFormOpen(false)
										setEditingAppointment(null)
									}}
								/>
							</DialogContent>
						</Dialog>
					)}
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Filters */}
				<div className="flex gap-2 flex-wrap">
					<div className="flex-1 min-w-[200px]">
						<div className="relative">
							<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search by pet name..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-8"
							/>
						</div>
					</div>
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-[180px]">
							<Filter className="w-4 h-4 mr-2" />
							<SelectValue placeholder="Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ALL">All Status</SelectItem>
							<SelectItem value="PENDING">Pending</SelectItem>
							<SelectItem value="CONFIRMED">Confirmed</SelectItem>
							<SelectItem value="COMPLETED">Completed</SelectItem>
							<SelectItem value="CANCELLED">Cancelled</SelectItem>
						</SelectContent>
					</Select>
					<Select value={sortBy} onValueChange={setSortBy}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Sort by" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="date-desc">Date (Newest)</SelectItem>
							<SelectItem value="date-asc">Date (Oldest)</SelectItem>
							<SelectItem value="status-asc">Status (A-Z)</SelectItem>
							<SelectItem value="status-desc">Status (Z-A)</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Date Range Filters */}
				<div className="flex gap-2 flex-wrap">
					<DatePicker
						value={dateFromFilter}
						onChange={setDateFromFilter}
						placeholder="From Date"
						className="w-[180px]"
						disabled={!!dateFrom}
					/>
					<DatePicker
						value={dateToFilter}
						onChange={setDateToFilter}
						placeholder="To Date"
						className="w-[180px]"
						disabled={!!dateTo}
					/>
					{(dateFromFilter || dateToFilter || statusFilter !== "ALL" || searchQuery) && !dateFrom && !dateTo && (
						<Button variant="outline" onClick={() => {
							setDateFromFilter("")
							setDateToFilter("")
							setStatusFilter("ALL")
							setSearchQuery("")
						}}>
							Clear Filters
						</Button>
					)}
				</div>

				{/* Table */}
				{isLoading ? (
					<div className="text-center py-8">Loading appointments...</div>
				) : appointments.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">No appointments found</div>
				) : (
					<>
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Date & Time</TableHead>
										<TableHead>Pet</TableHead>
										<TableHead>Service</TableHead>
										<TableHead>Owner</TableHead>
										<TableHead>Staff</TableHead>
										<TableHead>Status</TableHead>
										{showActions && <TableHead className="text-right">Actions</TableHead>}
									</TableRow>
								</TableHeader>
								<TableBody>
									{appointments.map((appointment) => (
										<TableRow key={appointment.id}>
											<TableCell>
												{format(new Date(appointment.date), "MMM dd, yyyy HH:mm")}
											</TableCell>
											<TableCell>
												<div>
													<div className="font-medium">{appointment.pet?.name}</div>
													<div className="text-sm text-muted-foreground">{appointment.pet?.species}</div>
												</div>
											</TableCell>
											<TableCell>
												<div>
													<div className="font-medium">{appointment.service?.title}</div>
													<div className="text-sm text-muted-foreground">{appointment.service?.type}</div>
												</div>
											</TableCell>
											<TableCell>
												{appointment.pet?.owner?.name || appointment.pet?.owner?.email || "N/A"}
											</TableCell>
											<TableCell>
												{appointment.staff?.name || appointment.staff?.email || "Unassigned"}
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<Badge className={statusColors[appointment.status] || ""}>
														{appointment.status}
													</Badge>
													{canEdit && appointment.status === "PENDING" && (
														<Button
															variant="outline"
															size="sm"
															onClick={() => {
																updateAppointment(
																	{
																		id: appointment.id,
																		data: { status: "CONFIRMED" },
																	},
																	{
																		onSuccess: () => {
																			toast.success("Appointment approved")
																			refetch()
																		},
																		onError: (error: any) => {
																			toast.error(error?.info?.error || "Failed to approve appointment")
																		},
																	}
																)
															}}
															className="h-6 px-2 text-xs"
														>
															Approve
														</Button>
													)}
													{canEdit && appointment.status === "CONFIRMED" && (
														<Button
															variant="outline"
															size="sm"
															onClick={() => {
																updateAppointment(
																	{
																		id: appointment.id,
																		data: { status: "COMPLETED" },
																	},
																	{
																		onSuccess: () => {
																			toast.success("Appointment marked as completed")
																			refetch()
																		},
																		onError: (error: any) => {
																			toast.error(error?.info?.error || "Failed to update appointment")
																		},
																	}
																)
															}}
															className="h-6 px-2 text-xs"
														>
															Complete
														</Button>
													)}
												</div>
											</TableCell>
											{showActions && (
												<TableCell className="text-right">
													<div className="flex justify-end gap-2">
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleView(appointment)}
														>
															<Eye className="w-4 h-4" />
														</Button>
														{canEdit && (
															<Button
																variant="ghost"
																size="sm"
																onClick={() => handleEdit(appointment)}
															>
																<Edit className="w-4 h-4" />
															</Button>
														)}
														{canDelete && (
															<Button
																variant="ghost"
																size="sm"
																onClick={() => handleDelete(appointment.id)}
															>
																<Trash2 className="w-4 h-4" />
															</Button>
														)}
													</div>
												</TableCell>
											)}
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>

						{/* Pagination */}
						{pagination && pagination.pages > 1 && (
							<div className="flex items-center justify-between">
								<div className="text-sm text-muted-foreground">
									Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, pagination.total)} of {pagination.total} appointments
								</div>
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setPage(page - 1)}
										disabled={page === 1}
									>
										Previous
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setPage(page + 1)}
										disabled={page >= pagination.pages}
									>
										Next
									</Button>
								</div>
							</div>
						)}
					</>
				)}
			</CardContent>

			{/* View Detail Dialog */}
			{viewingAppointment && (
				<Dialog open={!!viewingAppointment} onOpenChange={() => setViewingAppointment(null)}>
					<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
						<AppointmentDetail 
							appointment={viewingAppointment} 
							onStatusChange={() => {
								refetch()
								// Close dialog to show updated list
								setTimeout(() => setViewingAppointment(null), 500)
							}}
						/>
					</DialogContent>
				</Dialog>
			)}
		</Card>
	)
}

