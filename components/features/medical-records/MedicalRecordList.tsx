"use client"

import { useState } from "react"
import { useMedicalRecords, useDeleteMedicalRecord, type MedicalRecord } from "@/lib/react-query/hooks/medical-records"
import { Button } from "@/components/ui/button"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Eye, Stethoscope, Plus, Edit, Trash2 } from "lucide-react"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { MedicalRecordForm } from "./MedicalRecordForm"
import { PetTimeline } from "./PetTimeline"
import { CardSkeleton } from "@/components/skeletons"
import { toast } from "sonner"
import { currentUserClient } from "@/lib/auth/client"

interface MedicalRecordListProps {
	petId?: string
	title?: string
	dateFrom?: string
	dateTo?: string
	showActions?: boolean
}

export function MedicalRecordList({
	petId,
	title,
	dateFrom,
	dateTo,
	showActions = true,
}: MedicalRecordListProps) {
	const [page, setPage] = useState(1)
	const [viewingRecord, setViewingRecord] = useState<MedicalRecord | null>(null)
	const [isFormOpen, setIsFormOpen] = useState(false)
	const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null)

	const currentUser = currentUserClient()
	const { data, isLoading, refetch } = useMedicalRecords({
		page,
		limit: 10,
		sort: "date-desc",
		petId,
		title,
		dateFrom,
		dateTo,
	})

	const records = data?.records || []
	const pagination = data?.pagination
	const { mutate: deleteMedicalRecord } = useDeleteMedicalRecord()

	const canCreate = currentUser && (currentUser.isAdmin || currentUser.isSuperAdmin || currentUser.isStaff)
	const canEdit = currentUser && (currentUser.isAdmin || currentUser.isSuperAdmin || currentUser.isStaff)
	const canDelete = currentUser && (currentUser.isAdmin || currentUser.isSuperAdmin)

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this medical record?")) return

		try {
			deleteMedicalRecord(id, {
				onSuccess: () => {
					toast.success("Medical record deleted successfully")
					refetch()
				},
				onError: (error: any) => {
					toast.error(error?.info?.error || "Failed to delete medical record")
				},
			})
		} catch (error: any) {
			toast.error(error?.info?.error || "Failed to delete medical record")
		}
	}

	const handleEdit = (record: MedicalRecord) => {
		setEditingRecord(record)
		setIsFormOpen(true)
	}

	const handleFormSuccess = () => {
		setIsFormOpen(false)
		setEditingRecord(null)
		refetch()
	}

	if (isLoading) {
		return <CardSkeleton />
	}

	return (
		<>
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center gap-2">
								<Stethoscope className="w-5 h-5" />
								Medical Records
							</CardTitle>
							<CardDescription>View and manage medical records</CardDescription>
						</div>
						{showActions && canCreate && (
							<Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
								<DialogTrigger asChild>
									<Button onClick={() => setEditingRecord(null)}>
										<Plus className="w-4 h-4 mr-2" />
										New Record
									</Button>
								</DialogTrigger>
								<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
									<DialogHeader>
										<DialogTitle>{editingRecord ? "Edit Medical Record" : "Create Medical Record"}</DialogTitle>
										<DialogDescription>
											{editingRecord ? "Update medical record details" : "Add a new medical record for a pet"}
										</DialogDescription>
									</DialogHeader>
									<MedicalRecordForm
										medicalRecord={editingRecord}
										onSuccess={handleFormSuccess}
										onCancel={() => {
											setIsFormOpen(false)
											setEditingRecord(null)
										}}
									/>
								</DialogContent>
							</Dialog>
						)}
					</div>
				</CardHeader>
				<CardContent>
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Date</TableHead>
									<TableHead>Title</TableHead>
									<TableHead>Pet</TableHead>
									<TableHead>Diagnosis</TableHead>
									{showActions && <TableHead className="text-right">Actions</TableHead>}
								</TableRow>
							</TableHeader>
							<TableBody>
								{records.length === 0 ? (
									<TableRow>
										<TableCell colSpan={showActions ? 5 : 4} className="text-center py-8">
											<div className="flex flex-col items-center gap-2">
												<Stethoscope className="h-8 w-8 text-muted-foreground" />
												<p className="text-sm text-muted-foreground">No medical records found</p>
											</div>
										</TableCell>
									</TableRow>
								) : (
									records.map((record) => (
										<TableRow key={record.id}>
											<TableCell>
												{format(new Date(record.date), "MMM dd, yyyy")}
											</TableCell>
											<TableCell className="font-medium">{record.title}</TableCell>
											<TableCell>
												<div>
													<div className="font-medium">{record.pet.name}</div>
													<div className="text-sm text-muted-foreground">{record.pet.species}</div>
												</div>
											</TableCell>
											<TableCell>
												{record.diagnosis ? (
													<Badge variant="outline">{record.diagnosis}</Badge>
												) : (
													<span className="text-muted-foreground">-</span>
												)}
											</TableCell>
											{showActions && (
												<TableCell className="text-right">
													<div className="flex justify-end gap-2">
														<Button
															variant="ghost"
															size="sm"
															onClick={() => setViewingRecord(record)}
														>
															<Eye className="h-4 w-4" />
														</Button>
														{canEdit && (
															<Button
																variant="ghost"
																size="sm"
																onClick={() => handleEdit(record)}
															>
																<Edit className="h-4 w-4" />
															</Button>
														)}
														{canDelete && (
															<Button
																variant="ghost"
																size="sm"
																onClick={() => handleDelete(record.id)}
															>
																<Trash2 className="h-4 w-4" />
															</Button>
														)}
													</div>
												</TableCell>
											)}
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>

			{pagination && pagination.pages > 1 && (
				<div className="flex items-center justify-between">
					<p className="text-sm text-muted-foreground">
						Page {page} of {pagination.pages}
					</p>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							disabled={page === 1}
						>
							Previous
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
							disabled={page === pagination.pages}
						>
							Next
						</Button>
					</div>
				</div>
			)}

			{/* View Record Dialog */}
			<Dialog open={!!viewingRecord} onOpenChange={() => setViewingRecord(null)}>
				<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>{viewingRecord?.title}</DialogTitle>
						<DialogDescription>
							Medical record for {viewingRecord?.pet.name} - {viewingRecord?.pet.species}
						</DialogDescription>
					</DialogHeader>
					{viewingRecord && (
						<div className="space-y-6">
							{/* Medical Record Details */}
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">Record Details</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<p className="text-sm font-medium text-muted-foreground">Date</p>
										<p className="text-sm">{format(new Date(viewingRecord.date), "MMMM dd, yyyy 'at' h:mm a")}</p>
									</div>
									{viewingRecord.description && (
										<div>
											<p className="text-sm font-medium text-muted-foreground">Description</p>
											<p className="text-sm whitespace-pre-wrap">{viewingRecord.description}</p>
										</div>
									)}
									{viewingRecord.diagnosis && (
										<div>
											<p className="text-sm font-medium text-muted-foreground">Diagnosis</p>
											<p className="text-sm">{viewingRecord.diagnosis}</p>
										</div>
									)}
									{viewingRecord.treatment && (
										<div>
											<p className="text-sm font-medium text-muted-foreground">Treatment</p>
											<p className="text-sm whitespace-pre-wrap">{viewingRecord.treatment}</p>
										</div>
									)}
								</CardContent>
							</Card>

							{/* Related Records Timeline */}
							<div>
								<h3 className="text-lg font-semibold mb-4">Complete History for {viewingRecord.pet.name}</h3>
								<PetTimeline petId={viewingRecord.petId} />
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</>
	)
}

