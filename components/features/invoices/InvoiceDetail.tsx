"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { FileText, Calendar, PawPrint, User, Mail, DollarSign, CreditCard, Download, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"
import { type Invoice } from "@/lib/react-query/hooks/invoices"
import { useMarkInvoicePaid } from "@/lib/react-query/hooks/invoices"
import { generateInvoicePDF } from "@/lib/utils/invoice-pdf"
import { toast } from "sonner"
import { currentUserClient } from "@/lib/auth/client"
import { useCurrency } from "@/components/providers/CurrencyProvider"

interface InvoiceDetailProps {
	invoice: Invoice
}

const statusColors: Record<string, string> = {
	UNPAID: "bg-yellow-100 text-yellow-800",
	PAID: "bg-green-100 text-green-800",
	CANCELLED: "bg-red-100 text-red-800",
}

export function InvoiceDetail({ invoice }: InvoiceDetailProps) {
	const { formatCurrency, currency } = useCurrency()
	const [markPaidOpen, setMarkPaidOpen] = useState(false)
	const [paymentMethod, setPaymentMethod] = useState("cash")

	const currentUser = currentUserClient()
	const canMarkPaid =
		currentUser &&
		(currentUser.isAdmin || currentUser.isSuperAdmin || currentUser.isStaff) &&
		invoice.status === "UNPAID"

	const markPaid = useMarkInvoicePaid(invoice.id)

	const handleMarkAsPaid = async () => {
		try {
			await markPaid.mutateAsync({ method: paymentMethod })
			toast.success("Invoice marked as paid")
			setMarkPaidOpen(false)
		} catch (err: any) {
			toast.error(err?.info?.error || "Failed to mark as paid")
		}
	}

	const handleDownloadPDF = () => {
		generateInvoicePDF(invoice, currency)
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<CardTitle className="text-2xl">Invoice #{invoice.id.slice(0, 8)}</CardTitle>
					<CardDescription className="flex items-center gap-2 mt-1">
						<FileText className="w-4 h-4" />
						Invoice Details
					</CardDescription>
				</div>
				<div className="flex items-center gap-2">
					{canMarkPaid && (
						<Dialog open={markPaidOpen} onOpenChange={setMarkPaidOpen}>
							<Button onClick={() => setMarkPaidOpen(true)} size="sm">
								<CheckCircle className="w-4 h-4 mr-2" />
								Mark as Paid
							</Button>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Mark Invoice as Paid</DialogTitle>
									<DialogDescription>
										Record payment of {formatCurrency(invoice.amount)}. This will create a payment record and update the invoice status.
									</DialogDescription>
								</DialogHeader>
								<div className="space-y-4 py-4">
									<div>
										<label className="text-sm font-medium">Payment method</label>
										<Select value={paymentMethod} onValueChange={setPaymentMethod}>
											<SelectTrigger className="mt-2">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="cash">Cash</SelectItem>
												<SelectItem value="card">Card</SelectItem>
												<SelectItem value="stripe">Stripe</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div className="flex gap-2 justify-end">
										<Button variant="outline" onClick={() => setMarkPaidOpen(false)}>
											Cancel
										</Button>
										<Button onClick={handleMarkAsPaid} disabled={markPaid.isPending}>
											{markPaid.isPending ? "Processing..." : "Mark as Paid"}
										</Button>
									</div>
								</div>
							</DialogContent>
						</Dialog>
					)}
					<Button onClick={handleDownloadPDF} variant="outline" size="sm">
						<Download className="w-4 h-4 mr-2" />
						Download PDF
					</Button>
					<Badge className={statusColors[invoice.status]}>
						{invoice.status}
					</Badge>
				</div>
			</div>

			<Separator />

			<div className="grid gap-4 md:grid-cols-2">
				{/* Amount */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium flex items-center gap-2">
							<DollarSign className="w-4 h-4" />
							Amount
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatCurrency(invoice.amount)}
						</div>
					</CardContent>
				</Card>

				{/* Created Date */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium flex items-center gap-2">
							<Calendar className="w-4 h-4" />
							Created Date
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-lg font-semibold">
							{format(new Date(invoice.createdAt), "EEEE, MMMM dd, yyyy")}
						</div>
						<div className="text-sm text-muted-foreground mt-1">
							{format(new Date(invoice.createdAt), "h:mm a")}
						</div>
					</CardContent>
				</Card>

				{/* Pet Information */}
				{(invoice.visit?.pet ?? invoice.appointment?.pet) && (
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium flex items-center gap-2">
								<PawPrint className="w-4 h-4" />
								Pet Information
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-lg font-semibold">
								{(invoice.visit?.pet ?? invoice.appointment?.pet)?.name}
							</div>
							<div className="text-sm text-muted-foreground mt-1">
								{(invoice.visit?.pet ?? invoice.appointment?.pet)?.species}
							</div>
						</CardContent>
					</Card>
				)}

				{/* Service / Protocol Information */}
				{invoice.visit ? (
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium">Protocol</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-lg font-semibold">PRO-{invoice.visit.protocolNumber}</div>
							<div className="text-sm text-muted-foreground mt-1">
								Visit Date: {format(new Date(invoice.visit.visitDate), "EEEE, MMMM dd, yyyy")}
							</div>
							<div className="text-sm text-muted-foreground mt-1">
								Status: <Badge variant="outline" className="ml-1">{invoice.visit.status}</Badge>
							</div>
						</CardContent>
					</Card>
				) : invoice.appointment?.service ? (
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium">Service</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-lg font-semibold">{invoice.appointment.service.title}</div>
							<div className="text-sm text-muted-foreground mt-1">
								Service Price: {formatCurrency(invoice.appointment.service.price)}
							</div>
						</CardContent>
					</Card>
				) : null}

				{/* Owner Information */}
				{(invoice.visit?.pet?.owner ?? invoice.appointment?.pet?.owner) && (
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium flex items-center gap-2">
								<User className="w-4 h-4" />
								Owner
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-lg font-semibold">
								{(invoice.visit?.pet?.owner ?? invoice.appointment?.pet?.owner)?.name || "N/A"}
							</div>
							<div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
								<Mail className="w-3 h-3" />
								{(invoice.visit?.pet?.owner ?? invoice.appointment?.pet?.owner)?.email}
							</div>
						</CardContent>
					</Card>
				)}

				{/* Visit / Appointment Date */}
				{(invoice.visit ?? invoice.appointment) && (
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium">
								{invoice.visit ? "Visit Date" : "Appointment Date"}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-lg font-semibold">
								{format(
									new Date(invoice.visit?.visitDate ?? invoice.appointment?.date ?? ""),
									"EEEE, MMMM dd, yyyy"
								)}
							</div>
							<div className="text-sm text-muted-foreground mt-1">
								Status:{" "}
								<Badge variant="outline" className="ml-1">
									{invoice.visit?.status ?? invoice.appointment?.status}
								</Badge>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Payment Information */}
				{invoice.payment && (
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium flex items-center gap-2">
								<CreditCard className="w-4 h-4" />
								Payment Information
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<div>
									<span className="text-sm text-muted-foreground">Method: </span>
									<span className="font-semibold">{invoice.payment.method}</span>
								</div>
								<div>
									<span className="text-sm text-muted-foreground">Amount: </span>
									<span className="font-semibold">{formatCurrency(invoice.payment.amount)}</span>
								</div>
								{invoice.payment.paidAt && (
									<div>
										<span className="text-sm text-muted-foreground">Paid At: </span>
										<span className="font-semibold">
											{format(new Date(invoice.payment.paidAt), "MMM dd, yyyy h:mm a")}
										</span>
									</div>
								)}
								{invoice.payment.transactionId && (
									<div>
										<span className="text-sm text-muted-foreground">Transaction ID: </span>
										<span className="font-mono text-sm">{invoice.payment.transactionId}</span>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	)
}

