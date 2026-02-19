"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Plus, Eye, Edit, Trash2, Syringe } from "lucide-react"
import { useState } from "react"
import { useVaccinations, useDeleteVaccination, type Vaccination } from "@/lib/react-query/hooks/vaccinations"
import { toast } from "sonner"
import { format, isAfter } from "date-fns"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { VaccinationForm } from "./VaccinationForm"
import { VaccinationDetail } from "./VaccinationDetail"
import { currentUserClient } from "@/lib/auth/client"

interface VaccinationListProps {
	petId?: string
	upcoming?: boolean
	showActions?: boolean
}

export function VaccinationList({ petId, upcoming, showActions = true }: VaccinationListProps) {
	const [page, setPage] = useState(1)
	const [sortBy, setSortBy] = useState<string>("date-desc")
	const [vaccineNameFilter, setVaccineNameFilter] = useState<string>("")
	const [dateFrom, setDateFrom] = useState("")
	const [dateTo, setDateTo] = useState("")
	const [editingVaccination, setEditingVaccination] = useState<Vaccination | null>(null)
	const [viewingVaccination, setViewingVaccination] = useState<Vaccination | null>(null)
	const [isFormOpen, setIsFormOpen] = useState(false)

	const currentUser = currentUserClient()

	const { data, refetch, isLoading } = useVaccinations({
		page,
		limit: 10,
		sort: sortBy,
		petId,
		vaccineName: vaccineNameFilter || undefined,
		dateFrom: dateFrom || undefined,
		dateTo: dateTo || undefined,
		upcoming: upcoming || undefined,
	})

	const vaccinations = data?.vaccinations || []
	const pagination = data?.pagination
	const { mutate: deleteVaccination } = useDeleteVaccination()

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this vaccination record?")) return

		try {
			await deleteVaccination(id)
			toast.success("Vaccination deleted successfully")
			refetch()
		} catch (error: any) {
			toast.error(error?.info?.error || "Failed to delete vaccination")
		}
	}

	const handleEdit = (vaccination: Vaccination) => {
		setEditingVaccination(vaccination)
		setIsFormOpen(true)
	}

	const handleView = (vaccination: Vaccination) => {
		setViewingVaccination(vaccination)
	}

	const handleFormSuccess = () => {
		setIsFormOpen(false)
		setEditingVaccination(null)
		refetch()
	}

	const canEdit = currentUser && (currentUser.isAdmin || currentUser.isSuperAdmin || currentUser.isStaff)
	const canDelete = currentUser && (currentUser.isAdmin || currentUser.isSuperAdmin || currentUser.isStaff)

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<Syringe className="w-5 h-5" />
							Vaccinations
						</CardTitle>
						<CardDescription>Manage and view vaccination records</CardDescription>
					</div>
					{showActions && canEdit && (
						<Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
							<DialogTrigger asChild>
								<Button onClick={() => setEditingVaccination(null)}>
									<Plus className="w-4 h-4 mr-2" />
									New Vaccination
								</Button>
							</DialogTrigger>
							<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
								<DialogHeader>
									<DialogTitle>{editingVaccination ? "Edit Vaccination" : "Add Vaccination"}</DialogTitle>
									<DialogDescription>
										{editingVaccination ? "Update vaccination record" : "Record a new vaccination"}
									</DialogDescription>
								</DialogHeader>
								<VaccinationForm
									vaccination={editingVaccination}
									onSuccess={handleFormSuccess}
									onCancel={() => {
										setIsFormOpen(false)
										setEditingVaccination(null)
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
								placeholder="Search by vaccine name..."
								value={vaccineNameFilter}
								onChange={(e) => setVaccineNameFilter(e.target.value)}
								className="pl-8"
							/>
						</div>
					</div>
					<Select value={sortBy} onValueChange={setSortBy}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Sort by" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="date-asc">Date (Oldest)</SelectItem>
							<SelectItem value="date-desc">Date (Newest)</SelectItem>
							<SelectItem value="nextdue-asc">Next Due (Earliest)</SelectItem>
							<SelectItem value="nextdue-desc">Next Due (Latest)</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Date Range Filters */}
				<div className="flex gap-2 flex-wrap">
					<DatePicker
						value={dateFrom}
						onChange={setDateFrom}
						placeholder="From Date"
						className="w-[180px]"
					/>
					<DatePicker
						value={dateTo}
						onChange={setDateTo}
						placeholder="To Date"
						className="w-[180px]"
					/>
					{(dateFrom || dateTo || vaccineNameFilter) && (
						<Button variant="outline" onClick={() => {
							setDateFrom("")
							setDateTo("")
							setVaccineNameFilter("")
						}}>
							Clear Filters
						</Button>
					)}
				</div>

				{/* Table */}
				{isLoading ? (
					<div className="text-center py-8">Loading vaccinations...</div>
				) : vaccinations.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">No vaccinations found</div>
				) : (
					<>
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Vaccine Name</TableHead>
										<TableHead>Pet</TableHead>
										<TableHead>Date Given</TableHead>
										<TableHead>Next Due</TableHead>
										<TableHead>Owner</TableHead>
										{showActions && <TableHead className="text-right">Actions</TableHead>}
									</TableRow>
								</TableHeader>
								<TableBody>
									{vaccinations.map((vaccination) => {
										const isDue = vaccination.nextDue
											? isAfter(new Date(), new Date(vaccination.nextDue))
											: false
										const isUpcoming = vaccination.nextDue
											? isAfter(new Date(vaccination.nextDue), new Date()) &&
											  !isAfter(new Date(vaccination.nextDue), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
											: false

										return (
											<TableRow key={vaccination.id}>
												<TableCell>
													<div className="font-medium">{vaccination.vaccineName}</div>
													{vaccination.notes && (
														<div className="text-sm text-muted-foreground line-clamp-1">
															{vaccination.notes}
														</div>
													)}
												</TableCell>
												<TableCell>
													<div>
														<div className="font-medium">{vaccination.pet?.name}</div>
														<div className="text-sm text-muted-foreground">{vaccination.pet?.species}</div>
													</div>
												</TableCell>
												<TableCell>
													{format(new Date(vaccination.dateGiven), "MMM dd, yyyy")}
												</TableCell>
												<TableCell>
													{vaccination.nextDue ? (
														<div className="flex items-center gap-2">
															<span>{format(new Date(vaccination.nextDue), "MMM dd, yyyy")}</span>
															{isDue && (
																<Badge className="bg-red-100 text-red-800">Due</Badge>
															)}
															{isUpcoming && !isDue && (
																<Badge className="bg-yellow-100 text-yellow-800">Upcoming</Badge>
															)}
														</div>
													) : (
														<span className="text-muted-foreground">N/A</span>
													)}
												</TableCell>
												<TableCell>
													{vaccination.pet?.owner?.name || vaccination.pet?.owner?.email || "N/A"}
												</TableCell>
												{showActions && (
													<TableCell className="text-right">
														<div className="flex justify-end gap-2">
															<Button
																variant="ghost"
																size="sm"
																onClick={() => handleView(vaccination)}
															>
																<Eye className="w-4 h-4" />
															</Button>
															{canEdit && (
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() => handleEdit(vaccination)}
																>
																	<Edit className="w-4 h-4" />
																</Button>
															)}
															{canDelete && (
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() => handleDelete(vaccination.id)}
																>
																	<Trash2 className="w-4 h-4" />
																</Button>
															)}
														</div>
													</TableCell>
												)}
											</TableRow>
										)
									})}
								</TableBody>
							</Table>
						</div>

						{/* Pagination */}
						{pagination && pagination.pages > 1 && (
							<div className="flex items-center justify-between">
								<div className="text-sm text-muted-foreground">
									Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, pagination.total)} of {pagination.total} vaccinations
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
			{viewingVaccination && (
				<Dialog open={!!viewingVaccination} onOpenChange={() => setViewingVaccination(null)}>
					<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
						<VaccinationDetail vaccination={viewingVaccination} />
					</DialogContent>
				</Dialog>
			)}
		</Card>
	)
}

