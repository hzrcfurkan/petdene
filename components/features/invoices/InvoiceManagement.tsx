"use client"

import { InvoiceList } from "./InvoiceList"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useInvoices } from "@/lib/react-query/hooks/invoices"
import { FileText, DollarSign, CheckCircle, XCircle } from "lucide-react"
import { useMemo } from "react"

export function InvoiceManagement() {
	const { data: allData, isLoading: isLoadingAll } = useInvoices({ limit: 1000, sort: "date-desc" })
	const { data: unpaidData, isLoading: isLoadingUnpaid } = useInvoices({ status: "UNPAID", limit: 100, sort: "date-asc" })
	const { data: paidData, isLoading: isLoadingPaid } = useInvoices({ status: "PAID", limit: 100, sort: "date-desc" })

	const allInvoices = allData?.invoices || []
	const unpaidInvoices = unpaidData?.invoices || []
	const paidInvoices = paidData?.invoices || []

	// Calculate stats with useMemo to prevent unnecessary recalculations
	const stats = useMemo(() => ({
		total: allInvoices.length,
		unpaid: unpaidInvoices.length,
		paid: paidInvoices.length,
		cancelled: allInvoices.filter((i) => i.status === "CANCELLED").length,
		totalAmount: allInvoices.reduce((sum, invoice) => sum + invoice.amount, 0),
		unpaidAmount: unpaidInvoices.reduce((sum, invoice) => sum + invoice.amount, 0),
		paidAmount: paidInvoices.reduce((sum, invoice) => sum + invoice.amount, 0),
	}), [allInvoices, unpaidInvoices, paidInvoices])

	return (
		<div className="space-y-6">
			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
						<FileText className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.total}</div>
						<p className="text-xs text-muted-foreground">All invoices</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Unpaid</CardTitle>
						<XCircle className="h-4 w-4 text-yellow-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.unpaid}</div>
						<p className="text-xs text-muted-foreground">
							${stats.unpaidAmount.toFixed(2)} pending
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Paid</CardTitle>
						<CheckCircle className="h-4 w-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.paid}</div>
						<p className="text-xs text-muted-foreground">
							${stats.paidAmount.toFixed(2)} collected
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
						<DollarSign className="h-4 w-4 text-blue-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">${stats.totalAmount.toFixed(2)}</div>
						<p className="text-xs text-muted-foreground">All invoices</p>
					</CardContent>
				</Card>
			</div>

			{/* Tabs */}
			<Tabs defaultValue="all" className="space-y-4">
				<TabsList>
					<TabsTrigger value="all">All Invoices</TabsTrigger>
					<TabsTrigger value="unpaid">Unpaid</TabsTrigger>
					<TabsTrigger value="paid">Paid</TabsTrigger>
				</TabsList>

				<TabsContent value="all" className="space-y-4">
					<InvoiceList showActions={true} />
				</TabsContent>

				<TabsContent value="unpaid" className="space-y-4">
					<InvoiceList status="UNPAID" showActions={true} />
				</TabsContent>

				<TabsContent value="paid" className="space-y-4">
					<InvoiceList status="PAID" showActions={true} />
				</TabsContent>
			</Tabs>
		</div>
	)
}

