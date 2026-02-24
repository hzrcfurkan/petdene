"use client"

import { InlinePaymentForm } from "@/components/features/payments/InlinePaymentForm"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { currentUserClient } from "@/lib/auth/client"
import { useDeleteInvoice, useInvoices, type Invoice } from "@/lib/react-query/hooks/invoices"
import { generateInvoicePDF } from "@/lib/utils/invoice-pdf"
import { format } from "date-fns"
import { Download, Edit, Eye, FileText, MoreHorizontal, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { InvoiceDetail } from "./InvoiceDetail"
import { InvoiceForm } from "./InvoiceForm"

const statusColors: Record<string, string> = {
	UNPAID: "bg-yellow-100 text-yellow-800",
	PAID: "bg-green-100 text-green-800",
	CANCELLED: "bg-red-100 text-red-800",
}

interface InvoiceListProps {
	appointmentId?: string
	status?: string
	ownerId?: string
	dateFrom?: string
	dateTo?: string
	showActions?: boolean
}

export function InvoiceList({ appointmentId, status, ownerId, dateFrom, dateTo, showActions = true }: InvoiceListProps) {
	const [page, setPage] = useState(1)
	const [sortBy, setSortBy] = useState<string>("date-desc")
	const [statusFilter, setStatusFilter] = useState<string>(status || "ALL")
	const [dateFromFilter, setDateFromFilter] = useState(dateFrom || "")
	const [dateToFilter, setDateToFilter] = useState(dateTo || "")
	const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
	const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null)
	const [isFormOpen, setIsFormOpen] = useState(false)

	const currentUser = currentUserClient()

	const { data, refetch, isLoading } = useInvoices({
		page,
		limit: 10,
		sort: sortBy,
		appointmentId,
		status: statusFilter === "ALL" ? undefined : statusFilter,
		ownerId,
		dateFrom: dateFrom || dateFromFilter || undefined,
		dateTo: dateTo || dateToFilter || undefined,
	})

	const invoices = data?.invoices || []
	const pagination = data?.pagination
	const { mutate: deleteInvoice } = useDeleteInvoice()

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this invoice?")) return

		try {
			await deleteInvoice(id)
			toast.success("Invoice deleted successfully")
			refetch()
		} catch (error: any) {
			toast.error(error?.info?.error || "Failed to delete invoice")
		}
	}

	const handleEdit = (invoice: Invoice) => {
		setEditingInvoice(invoice)
		setIsFormOpen(true)
	}

	const handleView = (invoice: Invoice) => {
		setViewingInvoice(invoice)
	}

	const handleDownloadPDF = (invoice: Invoice, e?: React.MouseEvent) => {
		e?.preventDefault()
		e?.stopPropagation()

		try {
			// Check if invoice has required data
			if (!invoice.appointment) {
				toast.error("Invoice data is incomplete. Please refresh the page and try again.")
				return
			}

			generateInvoicePDF(invoice)
			toast.success("Invoice PDF downloaded")
		} catch (error: any) {
			console.error("Error generating PDF:", error)
			toast.error(error?.message || "Failed to generate PDF. Please try again.")
		}
	}

	const handleFormSuccess = () => {
		setIsFormOpen(false)
		setEditingInvoice(null)
		refetch()
	}

	const canEdit = currentUser && (currentUser.isAdmin || currentUser.isSuperAdmin || currentUser.isStaff)
	const canDelete = currentUser && (currentUser.isAdmin || currentUser.isSuperAdmin || currentUser.isStaff)
	const canPay = currentUser && currentUser.isCustomer

	const handlePaymentSuccess = async () => {
		// Refetch to update invoice status and hide payment option
		await refetch()
		toast.success("Payment processed successfully!")
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<FileText className="w-5 h-5" />
							Invoices
						</CardTitle>
						<CardDescription>Manage and view invoice records</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Filters */}
				<div className="flex gap-2 flex-wrap">
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ALL">All Status</SelectItem>
							<SelectItem value="UNPAID">Unpaid</SelectItem>
							<SelectItem value="PAID">Paid</SelectItem>
							<SelectItem value="CANCELLED">Cancelled</SelectItem>
						</SelectContent>
					</Select>
					<Select value={sortBy} onValueChange={setSortBy}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Sort by" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="date-asc">Date (Oldest)</SelectItem>
							<SelectItem value="date-desc">Date (Newest)</SelectItem>
							<SelectItem value="amount-asc">Amount (Lowest)</SelectItem>
							<SelectItem value="amount-desc">Amount (Highest)</SelectItem>
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
					{(dateFromFilter || dateToFilter || statusFilter !== "ALL") && (
						<Button variant="outline" onClick={() => {
							setDateFromFilter("")
							setDateToFilter("")
							setStatusFilter("ALL")
						}}>
							Clear Filters
						</Button>
					)}
				</div>

				{/* Table */}
				{isLoading ? (
					<div className="text-center py-8">Loading invoices...</div>
				) : invoices.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">No invoices found</div>
				) : (
					<>
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Invoice ID</TableHead>
										<TableHead>Pet</TableHead>
										<TableHead>Service</TableHead>
										<TableHead>Amount</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Date</TableHead>
										<TableHead>Owner</TableHead>
										{showActions && canPay && <TableHead>Payment</TableHead>}
										{showActions && <TableHead className="text-right">Actions</TableHead>}
									</TableRow>
								</TableHeader>
								<TableBody>
									{invoices.map((invoice) => (
										<TableRow key={invoice.id}>
											<TableCell className="font-mono text-sm">
												{invoice.id.slice(0, 8)}...
											</TableCell>
											<TableCell>
												<div>
													<div className="font-medium">{invoice.appointment?.pet?.name}</div>
													<div className="text-sm text-muted-foreground">{invoice.appointment?.pet?.species}</div>
												</div>
											</TableCell>
											<TableCell>
												{invoice.appointment?.service?.title || "N/A"}
											</TableCell>
											<TableCell>
												${invoice.amount.toFixed(2)}
											</TableCell>
											<TableCell>
												<Badge className={statusColors[invoice.status]}>
													{invoice.status}
												</Badge>
											</TableCell>
											<TableCell>
												{format(new Date(invoice.createdAt), "MMM dd, yyyy")}
											</TableCell>
											<TableCell>
												{invoice.appointment?.pet?.owner?.name || invoice.appointment?.pet?.owner?.email || "N/A"}
											</TableCell>
											{showActions && canPay && (
												<TableCell>
													{invoice.status === "UNPAID" ? (
														<InlinePaymentForm
															invoice={invoice}
															onSuccess={handlePaymentSuccess}
														/>
													) : (
														<span className="text-sm text-muted-foreground">Done</span>
													)}
												</TableCell>
											)}
											{showActions && (
												<TableCell className="text-right">
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button variant="ghost" size="sm" title="Actions">
																<MoreHorizontal className="w-4 h-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end" className="w-48">
															<DropdownMenuItem onClick={() => handleView(invoice)}>
																<Eye className="w-4 h-4 mr-2" />
																View Details
															</DropdownMenuItem>
															<DropdownMenuItem onClick={(e) => handleDownloadPDF(invoice, e)}>
																<Download className="w-4 h-4 mr-2" />
																Download PDF
															</DropdownMenuItem>
															{canEdit && (
																<>
																	<DropdownMenuSeparator />
																	<DropdownMenuItem onClick={() => handleEdit(invoice)}>
																		<Edit className="w-4 h-4 mr-2" />
																		Edit Invoice
																	</DropdownMenuItem>
																</>
															)}
															{canDelete && (
																<>
																	<DropdownMenuSeparator />
																	<DropdownMenuItem
																		onClick={() => handleDelete(invoice.id)}
																		variant="destructive"
																	>
																		<Trash2 className="w-4 h-4 mr-2" />
																		Delete Invoice
																	</DropdownMenuItem>
																</>
															)}
														</DropdownMenuContent>
													</DropdownMenu>
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
									Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, pagination.total)} of {pagination.total} invoices
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
			{viewingInvoice && (
				<Dialog open={!!viewingInvoice} onOpenChange={() => setViewingInvoice(null)}>
					<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
						<InvoiceDetail invoice={viewingInvoice} />
					</DialogContent>
				</Dialog>
			)}

			{/* Edit Invoice Dialog */}
			{editingInvoice && (
				<Dialog open={isFormOpen} onOpenChange={(open) => {
					if (!open) {
						setIsFormOpen(false)
						setEditingInvoice(null)
					}
				}}>
					<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>Edit Invoice</DialogTitle>
							<DialogDescription>Update invoice record</DialogDescription>
						</DialogHeader>
						<InvoiceForm
							invoice={editingInvoice}
							onSuccess={handleFormSuccess}
							onCancel={() => {
								setIsFormOpen(false)
								setEditingInvoice(null)
							}}
						/>
					</DialogContent>
				</Dialog>
			)}
		</Card>
	)
}

