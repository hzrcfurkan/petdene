"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { FileText, Calendar, PawPrint, User, Mail, DollarSign, CreditCard, Download } from "lucide-react"
import { format } from "date-fns"
import { type Invoice } from "@/lib/react-query/hooks/invoices"
import { generateInvoicePDF } from "@/lib/utils/invoice-pdf"

interface InvoiceDetailProps {
	invoice: Invoice
}

const statusColors: Record<string, string> = {
	UNPAID: "bg-yellow-100 text-yellow-800",
	PAID: "bg-green-100 text-green-800",
	CANCELLED: "bg-red-100 text-red-800",
}

export function InvoiceDetail({ invoice }: InvoiceDetailProps) {
	const handleDownloadPDF = () => {
		generateInvoicePDF(invoice)
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
							${invoice.amount.toFixed(2)}
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
				{invoice.appointment?.pet && (
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium flex items-center gap-2">
								<PawPrint className="w-4 h-4" />
								Pet Information
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-lg font-semibold">{invoice.appointment.pet.name}</div>
							<div className="text-sm text-muted-foreground mt-1">
								{invoice.appointment.pet.species}
							</div>
						</CardContent>
					</Card>
				)}

				{/* Service Information */}
				{invoice.appointment?.service && (
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium">Service</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-lg font-semibold">{invoice.appointment.service.title}</div>
							<div className="text-sm text-muted-foreground mt-1">
								Service Price: ${invoice.appointment.service.price.toFixed(2)}
							</div>
						</CardContent>
					</Card>
				)}

				{/* Owner Information */}
				{invoice.appointment?.pet?.owner && (
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium flex items-center gap-2">
								<User className="w-4 h-4" />
								Owner
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-lg font-semibold">{invoice.appointment.pet.owner.name || "N/A"}</div>
							<div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
								<Mail className="w-3 h-3" />
								{invoice.appointment.pet.owner.email}
							</div>
						</CardContent>
					</Card>
				)}

				{/* Appointment Date */}
				{invoice.appointment && (
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium">Appointment Date</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-lg font-semibold">
								{format(new Date(invoice.appointment.date), "EEEE, MMMM dd, yyyy")}
							</div>
							<div className="text-sm text-muted-foreground mt-1">
								Status: <Badge variant="outline" className="ml-1">{invoice.appointment.status}</Badge>
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
									<span className="font-semibold">${invoice.payment.amount.toFixed(2)}</span>
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

