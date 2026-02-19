"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Eye, Edit, Trash2, Pill } from "lucide-react"
import { useState } from "react"
import { usePrescriptions, useDeletePrescription, type Prescription } from "@/lib/react-query/hooks/prescriptions"
import { toast } from "sonner"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PrescriptionForm } from "./PrescriptionForm"
import { PrescriptionDetail } from "./PrescriptionDetail"
import { currentUserClient } from "@/lib/auth/client"

interface PrescriptionListProps {
	petId?: string
	issuedById?: string
	dateFrom?: string
	dateTo?: string
	showActions?: boolean
}

export function PrescriptionList({ petId, issuedById, dateFrom, dateTo, showActions = true }: PrescriptionListProps) {
	const [page, setPage] = useState(1)
	const [sortBy, setSortBy] = useState<string>("date-desc")
	const [medicineNameFilter, setMedicineNameFilter] = useState<string>("")
	const [dateFromFilter, setDateFromFilter] = useState(dateFrom || "")
	const [dateToFilter, setDateToFilter] = useState(dateTo || "")
	const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null)
	const [viewingPrescription, setViewingPrescription] = useState<Prescription | null>(null)
	const [isFormOpen, setIsFormOpen] = useState(false)

	const currentUser = currentUserClient()

	const { data, refetch, isLoading } = usePrescriptions({
		page,
		limit: 10,
		sort: sortBy,
		petId,
		issuedById,
		medicineName: medicineNameFilter || undefined,
		dateFrom: dateFrom || dateFromFilter || undefined,
		dateTo: dateTo || dateToFilter || undefined,
	})

	const prescriptions = data?.prescriptions || []
	const pagination = data?.pagination
	const { mutate: deletePrescription } = useDeletePrescription()

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this prescription?")) return

		try {
			await deletePrescription(id)
			toast.success("Prescription deleted successfully")
			refetch()
		} catch (error: any) {
			toast.error(error?.info?.error || "Failed to delete prescription")
		}
	}

	const handleEdit = (prescription: Prescription) => {
		setEditingPrescription(prescription)
		setIsFormOpen(true)
	}

	const handleView = (prescription: Prescription) => {
		setViewingPrescription(prescription)
	}

	const handleFormSuccess = () => {
		setIsFormOpen(false)
		setEditingPrescription(null)
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
							<Pill className="w-5 h-5" />
							Prescriptions
						</CardTitle>
						<CardDescription>Manage and view prescription records</CardDescription>
					</div>
					{showActions && canEdit && (
						<Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
							<DialogTrigger asChild>
								<Button onClick={() => setEditingPrescription(null)}>
									<Plus className="w-4 h-4 mr-2" />
									New Prescription
								</Button>
							</DialogTrigger>
							<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
								<DialogHeader>
									<DialogTitle>{editingPrescription ? "Edit Prescription" : "Add Prescription"}</DialogTitle>
									<DialogDescription>
										{editingPrescription ? "Update prescription record" : "Create a new prescription"}
									</DialogDescription>
								</DialogHeader>
								<PrescriptionForm
									prescription={editingPrescription}
									onSuccess={handleFormSuccess}
									onCancel={() => {
										setIsFormOpen(false)
										setEditingPrescription(null)
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
								placeholder="Search by medicine name..."
								value={medicineNameFilter}
								onChange={(e) => setMedicineNameFilter(e.target.value)}
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
							<SelectItem value="medicine-asc">Medicine (A-Z)</SelectItem>
							<SelectItem value="medicine-desc">Medicine (Z-A)</SelectItem>
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
					/>
					<DatePicker
						value={dateToFilter}
						onChange={setDateToFilter}
						placeholder="To Date"
						className="w-[180px]"
					/>
					{(dateFromFilter || dateToFilter || medicineNameFilter) && (
						<Button variant="outline" onClick={() => {
							setDateFromFilter("")
							setDateToFilter("")
							setMedicineNameFilter("")
						}}>
							Clear Filters
						</Button>
					)}
				</div>

				{/* Table */}
				{isLoading ? (
					<div className="text-center py-8">Loading prescriptions...</div>
				) : prescriptions.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">No prescriptions found</div>
				) : (
					<>
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Medicine Name</TableHead>
										<TableHead>Pet</TableHead>
										<TableHead>Dosage</TableHead>
										<TableHead>Date Issued</TableHead>
										<TableHead>Issued By</TableHead>
										<TableHead>Owner</TableHead>
										{showActions && <TableHead className="text-right">Actions</TableHead>}
									</TableRow>
								</TableHeader>
								<TableBody>
									{prescriptions.map((prescription) => (
										<TableRow key={prescription.id}>
											<TableCell>
												<div className="font-medium">{prescription.medicineName}</div>
												{prescription.instructions && (
													<div className="text-sm text-muted-foreground line-clamp-1">
														{prescription.instructions}
													</div>
												)}
											</TableCell>
											<TableCell>
												<div>
													<div className="font-medium">{prescription.pet?.name}</div>
													<div className="text-sm text-muted-foreground">{prescription.pet?.species}</div>
												</div>
											</TableCell>
											<TableCell>
												{prescription.dosage || <span className="text-muted-foreground">N/A</span>}
											</TableCell>
											<TableCell>
												{format(new Date(prescription.dateIssued), "MMM dd, yyyy")}
											</TableCell>
											<TableCell>
												{prescription.issuedBy?.name || prescription.issuedBy?.email || "N/A"}
											</TableCell>
											<TableCell>
												{prescription.pet?.owner?.name || prescription.pet?.owner?.email || "N/A"}
											</TableCell>
											{showActions && (
												<TableCell className="text-right">
													<div className="flex justify-end gap-2">
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleView(prescription)}
														>
															<Eye className="w-4 h-4" />
														</Button>
														{canEdit && (
															<Button
																variant="ghost"
																size="sm"
																onClick={() => handleEdit(prescription)}
															>
																<Edit className="w-4 h-4" />
															</Button>
														)}
														{canDelete && (
															<Button
																variant="ghost"
																size="sm"
																onClick={() => handleDelete(prescription.id)}
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
									Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, pagination.total)} of {pagination.total} prescriptions
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
			{viewingPrescription && (
				<Dialog open={!!viewingPrescription} onOpenChange={() => setViewingPrescription(null)}>
					<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
						<PrescriptionDetail prescription={viewingPrescription} />
					</DialogContent>
				</Dialog>
			)}
		</Card>
	)
}

